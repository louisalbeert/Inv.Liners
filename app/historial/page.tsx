'use client'
// app/historial/page.tsx
import { useEffect, useState } from 'react'
import { RefreshCw, Download } from 'lucide-react'
import type { Movimiento } from '@/types'

export default function HistorialPage() {
  const [items, setItems] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'todos' | 'entrada' | 'salida' | 'traslado'>('todos')

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '200' })
      if (filtro !== 'todos') params.set('tipo', filtro)
      const res = await fetch(`/api/movimientos?${params}`)
      const json = await res.json()
      setItems(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [filtro])

  const TABS = [
    { key: 'todos',    label: 'Todos' },
    { key: 'entrada',  label: 'Entradas' },
    { key: 'salida',   label: 'Salidas' },
    { key: 'traslado', label: 'Traslados' },
  ] as const

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Historial de Movimientos</h1>
          <p>Registro completo de entradas, salidas y traslados</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={fetchData}><RefreshCw size={13} /> Actualizar</button>
          <button className="btn btn-export" onClick={() => window.open('/api/exportar?tipo=movimientos')}>
            <Download size={14} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'white', padding: 4, borderRadius: 8, border: '1px solid var(--border)', width: 'fit-content' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFiltro(t.key)}
              className="btn"
              style={{
                height: 32, padding: '0 14px', fontSize: 12,
                background: filtro === t.key ? 'var(--green-btn)' : 'transparent',
                color: filtro === t.key ? 'white' : 'var(--text-secondary)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando historial…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Sin movimientos registrados.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Pedido</th>
                    <th>Estibas</th>
                    <th>Kilos</th>
                    <th>Ubicación Origen</th>
                    <th>Ubicación Destino</th>
                    <th>Observaciones</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <span className={`badge badge-${m.tipo}`}>
                          {m.tipo === 'entrada' ? '↓ Entrada' : m.tipo === 'salida' ? '↑ Salida' : '⇄ Traslado'}
                        </span>
                      </td>
                      <td><span className="code-cell">{m.codigo_dynamics}</span></td>
                      <td>{m.nombre_cliente ?? '—'}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{m.numero_pedido ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>{m.unidades_estibas}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                        {Number(m.kilos_totales).toLocaleString('es-CO')}
                      </td>
                      <td>{m.ubicacion_origen ?? '—'}</td>
                      <td>{m.ubicacion_destino ?? '—'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--text-muted)' }}>
                        {m.observaciones ?? '—'}
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(m.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
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
