import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile, unlink } from 'fs/promises'
import path from 'path'
import { connectDB } from '../../../../lib/db'
import Company from '../../../../models/Company'
import Seat from '../../../../models/Seat'
import Certificate from '../../../../models/Certificate'
import { getCompanyContext, resolverEmpresa } from '../../../../lib/b2b/auth'

const MIMES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

const LIMITE_BYTES = 800 * 1024 // 800 KB

/**
 * Remove do disco os PDFs ja gerados dos alunos desta empresa.
 *
 * Necessario porque o certificado e cacheado em disco na primeira geracao. Sem
 * isto, trocar a logo produziria um acervo inconsistente: quem ja baixou fica
 * com a logo antiga, quem baixar depois recebe a nova, sem criterio nenhum.
 * Apagando o cache, todos passam a refletir a logo vigente.
 */
async function limparCacheCertificados(empresaId: string): Promise<number> {
  const vagas = await Seat.find({ empresa_id: empresaId }).select('usuario_id').lean()
  const usuarios = vagas.map((v: any) => v.usuario_id).filter(Boolean)
  if (usuarios.length === 0) return 0

  const certs = await Certificate.find({ usuario_id: { $in: usuarios } })
    .select('codigo')
    .lean()

  const dir = path.join(process.cwd(), 'public', 'certificados')
  let removidos = 0

  for (const c of certs as any[]) {
    try {
      await unlink(path.join(dir, `${c.codigo}.pdf`))
      removidos++
    } catch {
      // arquivo ainda nao gerado — nada a fazer
    }
  }
  return removidos
}

/**
 * POST /api/empresa/logo
 * body: { data_url: "data:image/png;base64,..." }
 *
 * A logo aparece no certificado como identificacao do CONTRATANTE, em posicao
 * subordinada a marca emissora. O certificado continua sendo emitido pelo
 * responsavel tecnico registrado no CREA — a empresa nao e coemissora.
 */
export async function POST(req: NextRequest) {
  try {
    const ctx = await getCompanyContext()
    if (!ctx) return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })

    const body = await req.json()
    const { data_url, empresa_id } = body ?? {}

    const empresaId = resolverEmpresa(ctx, empresa_id)
    if (!empresaId) return NextResponse.json({ error: 'Empresa nao informada' }, { status: 400 })

    if (!data_url || typeof data_url !== 'string') {
      return NextResponse.json({ error: 'Envie a imagem' }, { status: 400 })
    }

    const m = data_url.match(/^data:([^;]+);base64,(.+)$/)
    if (!m) return NextResponse.json({ error: 'Formato de imagem invalido' }, { status: 400 })

    const ext = MIMES[m[1]]
    if (!ext) {
      return NextResponse.json({ error: 'Use PNG, JPG ou WEBP' }, { status: 400 })
    }

    const buffer = Buffer.from(m[2], 'base64')
    if (buffer.length > LIMITE_BYTES) {
      return NextResponse.json({ error: 'Imagem maior que 800 KB' }, { status: 400 })
    }

    await connectDB()

    const dir = path.join(process.cwd(), 'public', 'logos-empresa')
    await mkdir(dir, { recursive: true })

    const nome = `${empresaId}.${ext}`
    await writeFile(path.join(dir, nome), buffer)

    await Company.findByIdAndUpdate(empresaId, { logo_url: `/logos-empresa/${nome}` })

    const removidos = await limparCacheCertificados(empresaId)
    console.log(`[EMPRESA/LOGO] empresa ${empresaId}: logo atualizada, ${removidos} PDF(s) invalidados`)

    return NextResponse.json({
      ok: true,
      logo_url: `/logos-empresa/${nome}`,
      certificados_invalidados: removidos,
    })
  } catch (error: any) {
    console.error('[EMPRESA/LOGO] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

/** DELETE /api/empresa/logo — remove a logo e regera os certificados sem ela. */
export async function DELETE(req: NextRequest) {
  try {
    const ctx = await getCompanyContext()
    if (!ctx) return NextResponse.json({ error: 'Nao autorizado' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const empresaId = resolverEmpresa(ctx, searchParams.get('empresa_id'))
    if (!empresaId) return NextResponse.json({ error: 'Empresa nao informada' }, { status: 400 })

    await connectDB()

    const empresa = await Company.findById(empresaId).select('logo_url')
    if (empresa?.logo_url) {
      try {
        await unlink(path.join(process.cwd(), 'public', empresa.logo_url))
      } catch {
        // arquivo ja removido
      }
    }

    await Company.findByIdAndUpdate(empresaId, { $unset: { logo_url: 1 } })
    const removidos = await limparCacheCertificados(empresaId)

    return NextResponse.json({ ok: true, certificados_invalidados: removidos })
  } catch (error: any) {
    console.error('[EMPRESA/LOGO DELETE] Erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
