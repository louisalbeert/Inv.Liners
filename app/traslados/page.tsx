'use client'
// app/traslados/page.tsx
import { useEffect, useState } from 'react'
import type { InventarioItem } from '@/types'

const UBICACIONES = ['Bodega A', 'Bodega B', 'Bodega C', 'Zona Producción', 'Zona Despacho', 'Exterior']

export default function TrasladosPage() {
  const [inventario, setInventario] = useState<InventarioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [destinos, setDestinos] = useState<Record<string, string>>({})
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

  const registrarTraslado = async (item: InventarioItem) => {
    const destino = destinos[item.id]
    if (!destino) { setError('Selecciona una ubicación destino.'); setTimeout(() => setError(''), 3000); return }
    if (destino === item.ubicacion) { setError('El destino es igual al origen.'); setTimeout(() => setError(''), 3000); return }

    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tipo: 'traslado',
        inventario_id: item.id,
        codigo_dynamics: item.codigo_dynamics,
        nombre_cliente: item.nombre_cliente,
        unidades_estibas: item.unidades_estibas,
        kilos_totales: item.kilos_totales,
        ubicacion_origen: item.ubicacion,
        ubicacion_destino: destino,
        material: item.material,
      }),
    })
    if (res.ok) {
      setSuccess(`Traslado registrado: ${item.codigo_dynamics} → ${destino}`)
      fetchInv()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      const j = await res.json()
      setError(j.error ?? 'Error al registrar traslado.')
      setTimeout(() => setError(''), 4000)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left"><h1>Traslados</h1><p>Mover liners entre ubicaciones</p></div>
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
                <thead><tr><th>Código</th><th>Cliente</th><th>Estibas</th><th>Origen</th><th>Destino</th><th>Acción</th></tr></thead>
                <tbody>
                  {inventario.map(item => (
                    <tr key={item.id}>
                      <td><span className="code-cell">{item.codigo_dynamics}</span></td>
                      <td>{item.nombre_cliente}</td>
                      <td style={{ fontWeight: 600 }}>{item.unidades_estibas}</td>
                      <td>
                        <span style={{ background: 'var(--green-light)', color: 'var(--green-mid)', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                          {item.ubicacion ?? '—'}
                        </span>
                      </td>
                      <td>
                        <select
                          className="form-select"
                          style={{ height: 34, fontSize: 12, width: 160 }}
                          value={destinos[item.id] ?? ''}
                          onChange={(e) => setDestinos(d => ({ ...d, [item.id]: e.target.value }))}
                        >
                          <option value="">Seleccionar…</option>
                          {UBICACIONES.filter(u => u !== item.ubicacion).map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-primary"
                          style={{ height: 30, padding: '0 12px', fontSize: 11 }}
                          onClick={() => registrarTraslado(item)}
                        >
                          ⇄ Trasladar
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
