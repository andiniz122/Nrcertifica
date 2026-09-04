'use client'
import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { SIMBOLOS, larguraSimbolo } from './simbolos'

/**
 * No do canvas. O desenho vem de SIMBOLOS e os terminais sao posicionados nas
 * coordenadas exatas dos bornes, de modo que o fio encoste no simbolo e nao
 * numa caixa em volta dele. Sem moldura: na prancha, o simbolo e o desenho.
 */
function NoSimbolo({ id, data, selected }: any) {
  const def = SIMBOLOS[data.tipo]
  if (!def) return <div className="text-[10px] text-red-700 font-mono">{data.tipo}?</div>

  const cfg = data.config ?? {}
  const est = data.estado ?? {}
  const w = larguraSimbolo(data.tipo, cfg)
  const h = def.h
  const M = 16   // margem para os rotulos de borne nao serem cortados

  const posicao = (lado: string) =>
    lado === 'top' ? Position.Top
    : lado === 'bottom' ? Position.Bottom
    : lado === 'left' ? Position.Left : Position.Right

  return (
    <div
      className="relative select-none"
      style={{ width: w + M * 2, height: h + M * 2, padding: M }}
      title={`${def.rotulo} · ${id}`}
    >
      {selected && (
        <div className="absolute inset-0 pointer-events-none"
             style={{ outline: '1px dashed #F5851F', outlineOffset: -2 }} />
      )}

      <div className="absolute font-mono text-[11px] text-slate-700"
           style={{ left: 2, top: M + h / 2, transform: 'translateY(-50%)' }}>
        -{id}
      </div>

      <svg width={w} height={h} style={{ overflow: 'visible', display: 'block' }}>
        {def.desenho(cfg, est)}
      </svg>

      {def.bornes(cfg).map((b) => (
        <Handle
          key={b.id} id={b.id} type="source" position={posicao(b.lado)}
          style={{
            left: b.x + M, top: b.y + M, transform: 'translate(-50%,-50%)',
            width: 12, height: 12, borderRadius: 6,
            background: '#FBFAF7', border: '1.5px solid #94A3B8',
          }}
        />
      ))}
    </div>
  )
}

export default memo(NoSimbolo)
