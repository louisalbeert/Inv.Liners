'use client'
// app/inventario/page.tsx
import { useEffect, useState } from 'react'
import { Download, Search, RefreshCw } from 'lucide-react'
import type { InventarioItem } from '@/types'

export default function InventarioPage() {
  const [items, setItems] = useState<InventarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('cliente', search)
      const res = await fetch(`/api/liners?${params}`)
      const json = await res.json()
      setItems(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const totalEstibas = items.reduce((s, i) => s + i.unidades_estibas, 0)
  const totalKilos   = items.reduce((s, i) => s + Number(i.kilos_totales), 0)

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Inventario</h1>
          <p>Planta Conversión → Inventario</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={fetchData}>
            <RefreshCw size={13} /> Actualizar
          </button>
          <button className="btn btn-export" onClick={() => window.open('/api/exportar?tipo=inventario')}>
            <Download size={14} /> Exportar Excel
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Registros</div>
            <div className="stat-value">{items.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Estibas</div>
            <div className="stat-value">{totalEstibas}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Kilos</div>
            <div className="stat-value">{totalKilos.toLocaleString('es-CO', { minimumFractionDigits: 0 })}</div>
            <div className="stat-sub">kg en inventario</div>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: 30, height: 36 }}
                placeholder="Buscar por cliente o código…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
            </div>
            <button className="btn btn-secondary" style={{ height: 36, padding: '0 14px', fontSize: 12 }} onClick={fetchData}>
              Buscar
            </button>
          </div>

          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando inventario…</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay registros en el inventario.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th>Cliente</th>
                    <th>Pedido</th>
                    <th>Ancho</th>
                    <th>Largo</th>
                    <th>Calibre</th>
                    <th>Estibas</th>
                    <th>Kilos</th>
                    <th>Ubicación</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td><span className="code-cell">{item.codigo_dynamics}</span></td>
                      <td style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.descripcion ?? '—'}
                      </td>
                      <td>{item.nombre_cliente}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{item.numero_pedido ?? '—'}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{item.ancho_mm ?? '—'}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{item.largo_mm ?? '—'}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>{item.calibre ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>{item.unidades_estibas}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 12 }}>
                        {Number(item.kilos_totales).toLocaleString('es-CO')}
                      </td>
                      <td>{item.ubicacion ?? '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(item.created_at).toLocaleDateString('es-CO')}
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
