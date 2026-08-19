import Link from 'next/link'
import { HardHat, Mail, Shield, MessageCircle, BadgeCheck } from 'lucide-react'
import { CURSOS, SITE, RESPONSAVEL } from '../lib/seo'

export function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-400 py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HardHat className="w-6 h-6 text-brand-gold" />
            <span className="font-display font-bold text-white tracking-wide">NR CERTIFICA</span>
          </div>
          <p className="text-sm leading-relaxed">
            Plataforma de treinamentos em Normas Regulamentadoras. Certificado emitido sob
            responsabilidade técnica de Engenheiro de Segurança do Trabalho.
          </p>
          <Link
            href={RESPONSAVEL.rota}
            className="text-xs mt-3 text-gray-500 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <BadgeCheck className="w-3.5 h-3.5" /> {RESPONSAVEL.crea} — {RESPONSAVEL.nome}
          </Link>
        </div>

        <div>
          <p className="font-semibold text-white mb-3 text-sm">Cursos</p>
          <ul className="space-y-2 text-sm">
            {CURSOS.map((curso) =>
              curso.ativo ? (
                <li key={curso.rota}>
                  <Link href={curso.rota} className="hover:text-white transition-colors">
                    {curso.nomeCurto}
                  </Link>
                </li>
              ) : (
                <li key={curso.rota}>
                  <span className="text-gray-600">{curso.nomeCurto} (em breve)</span>
                </li>
              ),
            )}
          </ul>
        </div>

        <div>
          <p className="font-semibold text-white mb-3 text-sm">Informações</p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/validar" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Validar certificado
              </Link>
            </li>
            <li>
              <Link href={RESPONSAVEL.rota} className="hover:text-white transition-colors flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5" /> Responsável técnico
              </Link>
            </li>
            <li>
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp {SITE.telefoneExibicao}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {SITE.email}
              </a>
            </li>
            <li><Link href="/politica-privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>
      {/* TODO(Anderson): incluir razão social, CNPJ e endereço aqui (Decreto 7.962/2013)
          assim que estiver definido qual empresa assina o site — ver EMPRESA em lib/seo.ts. */}
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/10 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} {SITE.nome} — Eletricom Manutenção Especializada.
        Todos os direitos reservados.
      </div>
    </footer>
  )
}
