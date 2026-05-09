'use client'
// app/salidas/page.tsx
import { useEffect, useState } from 'react'
import type { InventarioItem } from '@/types'

export default function SalidasPage() {
  const [inventario, setInventario] = useState<InventarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const fetchInv = async () => {
    setLoading(true)
    const res = await fetch('/api/liners')
    const json = await res.json()
    setInventario(json.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchInv() }, [])

  const registrarSalida = async (item: InventarioItem) => {
    if (!confirm(`¿Registrar salida de "${item.codigo_dynamics}" (${item.unidades_estibas} estibas)?`)) return

    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'salida',
        inventario_id: item.id,
        codigo_dynamics: item.codigo_dynamics,
        nombre_cliente: item.nombre_cliente,
        numero_pedido: item.numero_pedido,
        unidades_estibas: item.unidades_estibas,
        kilos_totales: item.kilos_totales,
        ubicacion_origen: item.ubicacion,
        material: item.material,
      }),
    })
    if (res.ok) {
      setSuccess(`Salida registrada: ${item.codigo_dynamics}`)
      fetchInv()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      const j = await res.json()
      setError(j.error ?? 'Error al registrar salida.')
      setTimeout(() => setError(''), 4000)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left"><h1>Salidas</h1><p>Registrar salida de liners del inventario</p></div>
      </div>
      <div className="page-body">
        {success && <div className="alert alert-success">✓ {success}</div>}
        {error   && <div className="alert alert-error">✗ {error}</div>}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando inventario…</div>
            : inventario.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No hay liners en inventario.</div>
            : (
              <table>
                <thead><tr><th>Código</th><th>Cliente</th><th>Pedido</th><th>Estibas</th><th>Kilos</th><th>Ubicación</th><th>Acción</th></tr></thead>
                <tbody>
                  {inventario.map(item => (
                    <tr key={item.id}>
                      <td><span className="code-cell">{item.codigo_dynamics}</span></td>
                      <td>{item.nombre_cliente}</td>
                      <td style={{ fontFamily: 'DM Mono, monospace', fontSize: 11 }}>{item.numero_pedido ?? '—'}</td>
                      <td style={{ fontWeight: 600 }}>{item.unidades_estibas}</td>
                      <td>{Number(item.kilos_totales).toLocaleString('es-CO')}</td>
                      <td>{item.ubicacion ?? '—'}</td>
                      <td>
                        <button className="btn btn-danger" style={{ height: 30, padding: '0 12px', fontSize: 11 }} onClick={() => registrarSalida(item)}>
                          ↑ Registrar salida
                        </button>
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
