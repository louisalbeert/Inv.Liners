// app/entradas/page.tsx
'use client'
import { useEffect, useState } from 'react'
import type { Movimiento } from '@/types'

export default function EntradasPage() {
  const [items, setItems] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/movimientos?tipo=entrada&limit=100')
      .then(r => r.json())
      .then(j => { setItems(j.data ?? []); setLoading(false) })
  }, [])

  const total = items.reduce((s, i) => s + i.unidades_estibas, 0)
  const kilos = items.reduce((s, i) => s + Number(i.kilos_totales), 0)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left"><h1>Entradas</h1><p>Movimientos de entrada al inventario</p></div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-label">Entradas</div><div className="stat-value">{items.length}</div></div>
          <div className="stat-card"><div className="stat-label">Estibas ingresadas</div><div className="stat-value">{total}</div></div>
          <div className="stat-card"><div className="stat-label">Kilos ingresados</div><div className="stat-value">{kilos.toLocaleString('es-CO')}</div></div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando…</div> : (
              <table>
                <thead><tr><th>Código</th><th>Cliente</th><th>Pedido</th><th>Estibas</th><th>Kilos</th><th>Destino</th><th>Fecha</th></tr></thead>
                <tbody>
                  {items.map(m => (
                    <tr key={m.id}>
                      <td><span className="code-cell">{m.codigo_dynamics}</span></td>
                      <td>{m.nombre_cliente ?? '—'}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{m.numero_pedido ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>{m.unidades_estibas}</td>
                      <td>{Number(m.kilos_totales).toLocaleString('es-CO')}</td>
                      <td>{m.ubicacion_destino ?? '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(m.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
