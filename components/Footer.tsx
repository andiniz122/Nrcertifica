import Link from 'next/link'
import { BookOpen, Mail, Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-400 py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-brand-red rounded-lg p-1.5">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white">NR Certifica</span>
          </div>
          <p className="text-sm leading-relaxed">
            Plataforma de treinamentos em Normas Regulamentadoras. Certificação válida,
            emitida por engenheiro responsável técnico.
          </p>
          <p className="text-xs mt-3 text-gray-500">CREA 254516/MG — Anderson Bicalho Diniz</p>
        </div>

        <div>
          <p className="font-semibold text-white mb-3 text-sm">Cursos</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/nr10" className="hover:text-white transition-colors">NR-10 — Eletricidade</Link></li>
            <li><span className="text-gray-600">NR-35 — Trabalho em Altura (em breve)</span></li>
            <li><span className="text-gray-600">NR-33 — Espaço Confinado (em breve)</span></li>
            <li><span className="text-gray-600">NR-06 — EPI (em breve)</span></li>
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
              <a href="mailto:contato@nrcertifica.com.br" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> contato@nrcertifica.com.br
              </a>
            </li>
            <li><Link href="/politica-privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-white/10 text-xs text-gray-500 text-center">
        © {new Date().getFullYear()} NR Certifica — Eletricom Manutenção Especializada.
        Todos os direitos reservados.
      </div>
    </footer>
  )
}
