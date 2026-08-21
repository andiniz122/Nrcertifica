'use client'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Printer, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  codigo: string
  nome: string
  cpf: string
  tituloCurso: string
  nr: string
  dataEmissao: string
  dataValidade: string
  fotoUrl?: string
  baseUrl: string
}

function maskCpf(cpf: string) {
  const d = cpf.replace(/\D/g, '')
  if (d.length === 11) return `***.${d.slice(3, 6)}.${d.slice(6, 9)}-**`
  return cpf
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

export function CarteirinhaCard({ codigo, nome, cpf, tituloCurso, nr, dataEmissao, dataValidade, fotoUrl, baseUrl }: Props) {
  const [qrUrl, setQrUrl] = useState('')
  const vencida = new Date(dataValidade) < new Date()

  useEffect(() => {
    QRCode.toDataURL(`${baseUrl}/verificar/${codigo}`, {
      width: 120,
      margin: 1,
      color: { dark: '#1A1A2E', light: '#ffffff' },
    }).then(setQrUrl).catch(() => {})
  }, [codigo, baseUrl])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card */}
      <div
        id="carteirinha-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          fontFamily: 'Inter, system-ui, sans-serif',
          background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)',
          position: 'relative',
        }}
      >
        {/* Decorative circle */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'rgba(200, 16, 46, 0.08)',
          pointerEvents: 'none',
        }} />

        {/* Header strip */}
        <div style={{
          background: '#C8102E',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <img src="/logo-branco-2x.png" alt="NR Certifica" style={{ height: '26px', width: 'auto' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Carteira de Habilitação
            </div>
            <div style={{ color: 'white', fontSize: '11px', fontWeight: '700', letterSpacing: '0.02em' }}>
              Profissional Certificado
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {/* Photo */}
          <div style={{
            width: '76px',
            height: '76px',
            borderRadius: '50%',
            border: '3px solid #C8102E',
            overflow: 'hidden',
            flexShrink: 0,
            background: '#0F3460',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {fotoUrl ? (
              <img src={fotoUrl} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'white', fontSize: '26px', fontWeight: 'bold' }}>
                {nome.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              marginBottom: '2px',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {nome}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginBottom: '10px' }}>
              CPF: {maskCpf(cpf)}
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '7px 10px',
              marginBottom: '10px',
              borderLeft: '3px solid #C8102E',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>
                Curso certificado
              </div>
              <div style={{ color: 'white', fontSize: '12px', fontWeight: '600', lineHeight: 1.3 }}>
                {tituloCurso}
              </div>
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: vencida ? 'rgba(220,38,38,0.15)' : 'rgba(34,197,94,0.15)',
              border: `1px solid ${vencida ? 'rgba(220,38,38,0.35)' : 'rgba(34,197,94,0.35)'}`,
              borderRadius: '100px',
              padding: '4px 10px',
            }}>
              <span style={{ fontSize: '9px', color: vencida ? '#FCA5A5' : '#86EFAC', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {vencida ? '✕ Vencida' : '✓ Apto — Válida'}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code de verificação" style={{ width: '76px', height: '76px', borderRadius: '6px' }} />
            ) : (
              <div style={{ width: '76px', height: '76px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px' }} />
            )}
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', textAlign: 'center' }}>
              Verificar
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Emissão</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px', fontWeight: '600' }}>{fmt(dataEmissao)}</div>
            </div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Válida até</div>
              <div style={{ color: vencida ? '#FCA5A5' : '#F5A623', fontSize: '11px', fontWeight: '600' }}>{fmt(dataValidade)}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Código</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{codigo}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 no-print">
        <button
          onClick={() => window.print()}
          className="btn-outline text-sm py-2.5 px-5"
        >
          <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
        </button>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #carteirinha-card, #carteirinha-card * { visibility: visible !important; }
          #carteirinha-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            width: 520px !important;
            box-shadow: none !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  )
}
