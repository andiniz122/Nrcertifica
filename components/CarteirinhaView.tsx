'use client'
import { Printer } from 'lucide-react'

interface Props {
  nome: string
  cpf: string
  dataNascimento?: string
  curso: string
  nr: string
  emissao: string
  validade: string
  codigo: string
  qrDataUrl: string
  fotoUrl?: string
}

export function CarteirinhaView({
  nome, cpf, dataNascimento, curso, nr,
  emissao, validade, codigo, qrDataUrl, fotoUrl,
}: Props) {
  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #carteirinha-wrap, #carteirinha-wrap * { visibility: visible !important; }
          #carteirinha-wrap {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
          }
          #carteirinha-card {
            box-shadow: none !important;
            width: 540px !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-[#F0F0EF] flex flex-col items-center justify-center px-4 py-10">
        {/* instrução */}
        <div className="max-w-[560px] w-full bg-white rounded-2xl px-6 py-4 text-center text-sm text-gray-600 mb-6 shadow-sm">
          Apresente esta carteirinha como comprovação de que você está apto a realizar as atividades do
          curso. Use o botão <strong>Imprimir</strong> para salvar em PDF ou imprimir em papel.
        </div>

        {/* card */}
        <div id="carteirinha-wrap" className="w-full flex justify-center">
          <div
            id="carteirinha-card"
            className="flex rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: 540, minHeight: 210 }}
          >
            {/* ── Painel esquerdo escuro ── */}
            <div
              className="flex flex-col items-center py-5 px-4 gap-4 flex-shrink-0"
              style={{ width: 175, background: '#141824' }}
            >
              {/* Logo */}
              <div className="flex items-center gap-1.5 self-start">
                {/* capacete inline SVG */}
                <svg width="22" height="18" viewBox="0 0 44 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2C13 2 6 9 6 18H38C38 9 31 2 22 2Z" fill="#F97316"/>
                  <rect x="4" y="20" width="36" height="5" rx="2.5" fill="#F97316"/>
                  <rect x="10" y="25" width="24" height="4" rx="2" fill="#EA6800"/>
                </svg>
                <span className="text-white text-[11px] font-bold tracking-wide leading-none">
                  NR <span className="text-orange-400">CERTIFICA</span>
                </span>
              </div>

              {/* Foto circular */}
              <div
                className="rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{
                  width: 90, height: 90,
                  border: '3px solid #F97316',
                  background: '#1e2535',
                }}
              >
                {fotoUrl ? (
                  <img src={fotoUrl} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-[11px]">foto</span>
                )}
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Badge APTO */}
              <div
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-[11px] font-bold"
                style={{ background: '#16a34a' }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                APTO — VÁLIDA
              </div>
            </div>

            {/* ── Divider laranja ── */}
            <div style={{ width: 3, background: '#F97316', flexShrink: 0 }} />

            {/* ── Painel direito claro ── */}
            <div className="flex-1 bg-white flex flex-col px-5 py-4 gap-3 min-w-0">

              {/* Topo: título + QR */}
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">
                    Carteira de Habilitação
                  </p>
                  <p className="text-sm font-bold text-[#141824] leading-tight">
                    Profissional Certificado
                  </p>
                </div>
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ width: 56, height: 56 }}>
                    <img src={qrDataUrl} alt="QR" className="w-full h-full" />
                  </div>
                  <span className="text-[9px] text-gray-400 mt-0.5">Verificar</span>
                </div>
              </div>

              {/* Nome + CPF + Nascimento */}
              <div>
                <p className="text-[17px] font-extrabold text-[#141824] leading-tight">{nome}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  CPF {cpf}
                  {dataNascimento && (
                    <span className="ml-3">Nascimento {dataNascimento}</span>
                  )}
                </p>
              </div>

              {/* Curso */}
              <div className="rounded-lg px-3 py-2" style={{ background: '#F4F4F2' }}>
                <p className="text-[8px] text-gray-400 uppercase tracking-widest font-medium mb-0.5">
                  Curso Certificado
                </p>
                <p className="text-[13px] font-semibold text-[#141824]">
                  {nr} — {curso}
                </p>
              </div>

              {/* Rodapé */}
              <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-100">
                <div>
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider">Emissão</p>
                  <p className="text-[11px] font-bold text-[#141824]">{emissao}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider">Válida Até</p>
                  <p className="text-[11px] font-bold text-orange-500">{validade}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-400 uppercase tracking-wider">Código</p>
                  <p className="text-[11px] font-bold text-[#141824] font-mono">{codigo}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão imprimir */}
        <button
          onClick={() => window.print()}
          className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full border-2 border-orange-500 text-orange-500 font-semibold text-sm hover:bg-orange-50 transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar PDF
        </button>
      </div>
    </>
  )
}
