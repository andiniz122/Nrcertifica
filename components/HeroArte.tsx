/**
 * Ilustração do hero: quadro elétrico estilizado com sinalização de segurança.
 * Vetorial de propósito — carrega junto com o HTML, sem peso de foto e sem
 * depender de banco de imagens.
 */
export function HeroArte({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 420" className={className} role="img" aria-label="Ilustração de quadro elétrico e sinalização de segurança">
      <defs>
        <radialGradient id="brilho" cx="72%" cy="18%" r="65%">
          <stop offset="0%" stopColor="#E97824" stopOpacity=".45" />
          <stop offset="100%" stopColor="#E97824" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="painel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16283E" />
          <stop offset="100%" stopColor="#0D1B2C" />
        </linearGradient>
        <pattern id="grade" width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0v26" fill="none" stroke="#FFFFFF" strokeOpacity=".05" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="480" height="420" rx="18" fill="#0A1524" />
      <rect width="480" height="420" rx="18" fill="url(#grade)" />
      <rect width="480" height="420" rx="18" fill="url(#brilho)" />

      {/* Cabos entrando no quadro */}
      <path d="M40 360c60-10 74-64 132-64" fill="none" stroke="#E97824" strokeOpacity=".55" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 386c86-6 100-62 176-62" fill="none" stroke="#FFC93C" strokeOpacity=".4" strokeWidth="5" strokeLinecap="round" />

      {/* Corpo do quadro */}
      <rect x="96" y="70" width="288" height="248" rx="16" fill="url(#painel)" stroke="#2B4360" strokeWidth="1.5" />
      <rect x="96" y="70" width="288" height="40" rx="16" fill="#1C324C" />
      <rect x="96" y="94" width="288" height="16" fill="#1C324C" />
      <circle cx="120" cy="90" r="5" fill="#25A16B" />
      <circle cx="138" cy="90" r="5" fill="#FFC93C" />
      <circle cx="156" cy="90" r="5" fill="#FFFFFF" fillOpacity=".2" />
      <rect x="300" y="83" width="66" height="14" rx="7" fill="#FFFFFF" fillOpacity=".08" />

      {/* Barramento */}
      <rect x="120" y="132" width="240" height="6" rx="3" fill="#FFFFFF" fillOpacity=".12" />
      <rect x="120" y="232" width="240" height="6" rx="3" fill="#FFFFFF" fillOpacity=".12" />

      {/* Disjuntores */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={`d1-${i}`}>
          <rect x={122 + i * 40} y="146" width="32" height="64" rx="5" fill="#0F2035" stroke="#2A3F5C" strokeWidth="1" />
          <rect x={128 + i * 40} y={i % 2 === 0 ? 154 : 182} width="20" height="20" rx="3" fill={i % 2 === 0 ? '#E97824' : '#39506E'} />
          <rect x={128 + i * 40} y="180" width="20" height="4" rx="2" fill="#FFFFFF" fillOpacity=".14" />
        </g>
      ))}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <g key={`d2-${i}`}>
          <rect x={122 + i * 40} y="246" width="32" height="56" rx="5" fill="#0F2035" stroke="#2A3F5C" strokeWidth="1" />
          <rect x={128 + i * 40} y={i % 3 === 0 ? 254 : 276} width="20" height="18" rx="3" fill={i % 3 === 0 ? '#FFC93C' : '#39506E'} />
        </g>
      ))}

      {/* Placa de advertência */}
      <g transform="translate(330 246)">
        <rect x="0" y="0" width="112" height="98" rx="12" fill="#0E1B2B" stroke="#E97824" strokeWidth="2" />
        <path d="M56 20 84 68H28L56 20Z" fill="#FFC93C" />
        <rect x="53.5" y="34" width="5" height="20" rx="2.5" fill="#0E1B2B" />
        <circle cx="56" cy="60" r="3" fill="#0E1B2B" />
        <rect x="24" y="78" width="64" height="6" rx="3" fill="#FFFFFF" fillOpacity=".18" />
      </g>

      {/* Capacete de segurança */}
      <g transform="translate(348 92)">
        <path d="M8 44a36 36 0 0 1 72 0Z" fill="#E97824" />
        <rect x="0" y="44" width="88" height="11" rx="5.5" fill="#FFB067" />
        <path d="M44 8v18" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  )
}
