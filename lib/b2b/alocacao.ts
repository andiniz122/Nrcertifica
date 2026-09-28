import crypto from 'crypto'
import mongoose from 'mongoose'
import SeatBatch from '../../models/SeatBatch'
import Seat from '../../models/Seat'
import User from '../../models/User'
import Enrollment from '../../models/Enrollment'
import {
  validarCPF,
  validarEmail,
  onlyDigits,
  emailPlaceholder,
  ehEmailPlaceholder,
  nomesCompativeis,
  mascararNome,
  LinhaFuncionario,
} from './validators'

/**
 * Senha provisoria de 6 digitos.
 *
 * Numerica de proposito: o RH imprime a lista e entrega em maos no canteiro, e
 * o funcionario digita no celular. Senha com maiuscula e minuscula ali e
 * chamado de suporte garantido.
 *
 * randomInt e CSPRNG — Math.random seria previsivel.
 */
export function senhaProvisoria(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0')
}

/** Token de convite: o claro vai no link, o banco guarda so o SHA-256. */
export function gerarTokenConvite() {
  const token = crypto.randomBytes(24).toString('base64url')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

export interface ResultadoAlocacao {
  ok: boolean
  nome: string
  cpf: string
  email?: string
  vaga_id?: string
  senha_provisoria?: string | null
  token_convite?: string | null
  conta_existente?: boolean
  sem_email?: boolean
  erro?: string
  /** preenchido quando o CPF ja tem conta e a decisao e do RH */
  conflito?: {
    tipo: 'nome_divergente' | 'conta_administrativa'
    nome_cadastrado: string
    mensagem: string
  }
}

/**
 * Aloca UMA vaga a um funcionario.
 *
 * Sem transacao de proposito: Mongo standalone nao suporta. O controle de
 * saldo usa findOneAndUpdate atomico que so incrementa se houver vaga, entao
 * dois RHs cadastrando ao mesmo tempo nao estouram o lote.
 */
export async function alocarVaga(
  empresaId: mongoose.Types.ObjectId | string,
  loteId: mongoose.Types.ObjectId | string,
  cursoId: mongoose.Types.ObjectId | string,
  f: LinhaFuncionario
): Promise<ResultadoAlocacao> {
  const base = { nome: f.nome, cpf: f.cpf, email: f.email }

  const cpf = onlyDigits(f.cpf)
  if (!validarCPF(cpf)) return { ...base, ok: false, erro: 'CPF invalido' }
  if (!f.nome || f.nome.trim().length < 3) return { ...base, ok: false, erro: 'Nome muito curto' }

  const temEmail = !!f.email && f.email.trim().length > 0
  if (temEmail && !validarEmail(f.email!)) return { ...base, ok: false, erro: 'E-mail invalido' }

  const emailInformado = temEmail ? f.email!.toLowerCase().trim() : null

  // vaga ja alocada para este CPF neste curso nesta empresa?
  const jaTem = await Seat.findOne({
    empresa_id: empresaId,
    curso_id: cursoId,
    cpf,
    status: { $in: ['convidado', 'ativo', 'concluido'] },
  })
  if (jaTem) return { ...base, ok: false, erro: 'Funcionario ja possui vaga neste curso' }

  // ---- conta existente: checagens ANTES de gastar o credito ----
  const existente = await User.findOne(
    emailInformado ? { $or: [{ cpf }, { email: emailInformado }] } : { cpf }
  )

  if (existente && !f.confirmarVinculo) {
    // Conta administrativa virando aluno e quase sempre erro de digitacao.
    if (existente.papel === 'admin' || existente.papel === 'empresa') {
      return {
        ...base,
        ok: false,
        erro: 'Este CPF pertence a uma conta administrativa',
        conflito: {
          tipo: 'conta_administrativa',
          nome_cadastrado: mascararNome(existente.nome),
          mensagem:
            'O CPF informado pertence a uma conta de administrador. Confira o numero. ' +
            'Se estiver correto e for realmente esta pessoa, confirme o vinculo.',
        },
      }
    }

    // Nome divergente: sem isso, erro de digitacao no CPF gasta vaga e emite
    // certificado no nome de outra pessoa.
    if (!nomesCompativeis(existente.nome, f.nome)) {
      return {
        ...base,
        ok: false,
        erro: 'CPF ja cadastrado em nome diferente',
        conflito: {
          tipo: 'nome_divergente',
          nome_cadastrado: mascararNome(existente.nome),
          mensagem:
            `O CPF ${cpf.slice(0, 3)}.***.***-${cpf.slice(9)} ja tem conta em nome de ` +
            `"${mascararNome(existente.nome)}". Confira o CPF digitado. Se for a mesma ` +
            'pessoa, confirme o vinculo.',
        },
      }
    }
  }

  // ---- consome o saldo de forma atomica ----
  const lote = await SeatBatch.findOneAndUpdate(
    {
      _id: loteId,
      empresa_id: empresaId,
      status: 'pago',
      $expr: { $lt: ['$vagas_alocadas', '$vagas_total'] },
    },
    { $inc: { vagas_alocadas: 1 } },
    { new: true }
  )
  if (!lote) return { ...base, ok: false, erro: 'Sem vagas disponiveis neste lote' }

  try {
    let usuario = existente
    let senha: string | null = null
    const contaExistente = !!usuario

    if (!usuario) {
      senha = senhaProvisoria()
      usuario = await User.create({
        nome: f.nome.trim(),
        cpf,
        // sem e-mail: endereco sintetico, identificavel pelo dominio
        email: emailInformado ?? emailPlaceholder(cpf),
        telefone: f.telefone || undefined,
        senha, // o pre('save') do User faz o hash
        papel: 'aluno',
        precisa_definir_senha: true,
      })
    } else if (emailInformado && ehEmailPlaceholder(usuario.email)) {
      // conta antiga sem e-mail e agora o RH informou um: completa o cadastro
      await User.findByIdAndUpdate(usuario._id, { email: emailInformado })
    }

    // ---- matricula ----
    const matriculaAtiva = await Enrollment.findOne({
      usuario_id: usuario._id,
      curso_id: cursoId,
      status: 'ativo',
    })
    if (matriculaAtiva) {
      await SeatBatch.findByIdAndUpdate(loteId, { $inc: { vagas_alocadas: -1 } })
      return { ...base, ok: false, erro: 'Funcionario ja possui matricula ativa neste curso' }
    }

    const matricula = await Enrollment.create({
      usuario_id: usuario._id,
      curso_id: cursoId,
      empresa_id: empresaId,
      status: 'ativo',
    })

    // ---- vaga ----
    const { token, hash } = gerarTokenConvite()
    const expira = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const vaga = await Seat.create({
      lote_id: loteId,
      empresa_id: empresaId,
      curso_id: cursoId,
      nome: f.nome.trim(),
      cpf,
      email: emailInformado ?? undefined,
      telefone: f.telefone,
      matricula_interna: f.matriculaInterna,
      funcao: f.funcao,
      setor: f.setor,
      usuario_id: usuario._id,
      matricula_id: matricula._id,
      status: 'convidado',
      convite_token_hash: emailInformado ? hash : undefined,
      convite_expira_em: emailInformado ? expira : undefined,
      convites_enviados: 0,
      vinculo_confirmado_em: contaExistente && f.confirmarVinculo ? new Date() : undefined,
    })

    await Enrollment.findByIdAndUpdate(matricula._id, { vaga_id: vaga._id })

    return {
      ...base,
      ok: true,
      vaga_id: String(vaga._id),
      // a senha aparece AQUI, uma unica vez: o banco guarda apenas o hash
      senha_provisoria: senha,
      token_convite: emailInformado ? token : null,
      conta_existente: contaExistente,
      sem_email: !emailInformado,
    }
  } catch (e: any) {
    // devolve o credito em qualquer falha apos o incremento
    await SeatBatch.findByIdAndUpdate(loteId, { $inc: { vagas_alocadas: -1 } })
    console.error('[ALOCACAO] Falha ao alocar vaga:', e?.message)
    return {
      ...base,
      ok: false,
      erro: e?.code === 11000 ? 'CPF ou e-mail ja cadastrado' : 'Falha ao alocar vaga',
    }
  }
}

/**
 * Lote a consumir: o mais antigo com saldo entre os pagos e nao expirados.
 * Gastar primeiro o que vence antes evita credito perdido.
 */
export async function loteComSaldo(empresaId: string, cursoId: string) {
  return SeatBatch.findOne({
    empresa_id: empresaId,
    curso_id: cursoId,
    status: 'pago',
    $expr: { $lt: ['$vagas_alocadas', '$vagas_total'] },
    $or: [{ expira_em: { $exists: false } }, { expira_em: { $gt: new Date() } }],
  }).sort({ expira_em: 1, criadoEm: 1 })
}
