import { getServerSession } from 'next-auth'
import { authOptions } from '../auth'
import { connectDB } from '../db'
import User from '../../models/User'
import Company from '../../models/Company'

export interface CompanyContext {
  usuarioId: string
  empresaIds: string[]
  papel: string
}

/**
 * Resolve o contexto da empresa a partir da sessao.
 *
 * REGRA DE ESCOPO: toda query de vaga/lote DEVE filtrar por empresa_id contido
 * em empresaIds. Sem isso, o RH da empresa A enxergaria os funcionarios da
 * empresa B trocando o id na URL.
 *
 * Admin da plataforma (papel 'admin') enxerga todas — empresaIds vem vazio e
 * ehAdminPlataforma vem true.
 */
export async function getCompanyContext(): Promise<
  (CompanyContext & { ehAdminPlataforma: boolean }) | null
> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  await connectDB()
  const usuario = await User.findById(session.user.id).select('papel empresas_admin ativo')
  if (!usuario || usuario.ativo === false) return null

  const ehAdminPlataforma = usuario.papel === 'admin'
  const empresaIds = (usuario.empresas_admin || []).map((id: any) => String(id))

  if (!ehAdminPlataforma && empresaIds.length === 0) return null

  return {
    usuarioId: String(usuario._id),
    empresaIds,
    papel: usuario.papel,
    ehAdminPlataforma,
  }
}

/**
 * Valida que o contexto pode operar sobre a empresa informada.
 * Quando nenhuma empresa e informada, devolve a primeira do usuario — o caso
 * comum, ja que quase todo RH administra uma so.
 */
export function resolverEmpresa(
  ctx: CompanyContext & { ehAdminPlataforma: boolean },
  empresaIdSolicitada?: string | null
): string | null {
  if (empresaIdSolicitada) {
    if (ctx.ehAdminPlataforma) return empresaIdSolicitada
    return ctx.empresaIds.includes(empresaIdSolicitada) ? empresaIdSolicitada : null
  }
  return ctx.empresaIds[0] ?? null
}

/** Carrega a empresa ja com a checagem de escopo aplicada. */
export async function carregarEmpresaAutorizada(
  ctx: CompanyContext & { ehAdminPlataforma: boolean },
  empresaIdSolicitada?: string | null
) {
  const empresaId = resolverEmpresa(ctx, empresaIdSolicitada)
  if (!empresaId) return null
  return Company.findById(empresaId)
}
