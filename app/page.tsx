'use client'
// app/page.tsx — Nuevo Registro
import { useState, useEffect, useRef } from 'react'
import { Download } from 'lucide-react'

const MATERIALES = [
  'PE — Polietileno',
  'PP — Polipropileno',
  'PET — Poliéster',
  'Nylon — PA',
  'BOPP',
  'LDPE',
  'HDPE',
]

const UBICACIONES = ['Bodega A', 'Bodega B', 'Bodega C', 'Zona Producción', 'Zona Despacho', 'Exterior']

const EMPTY: Record<string, string> = {
  codigo_dynamics: '', descripcion: '', ancho_mm: '', largo_mm: '',
  calibre: '', material: 'PE — Polietileno', nombre_cliente: '',
  numero_pedido: '', unidades_estibas: '', kilos_totales: '',
  ubicacion: '', observaciones: '',
}

export default function NuevoRegistro() {
  const [form, setForm] = useState({ ...EMPTY })
  const [autoFilled, setAutoFilled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Lookup automático al escribir el código Dynamics
  useEffect(() => {
    const code = form.codigo_dynamics.trim().toUpperCase()
    if (code.length < 6) { setAutoFilled(false); return }

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLookupLoading(true)
      try {
        const res = await fetch(`/api/liners/lookup?codigo=${encodeURIComponent(code)}`)
        const json = await res.json()
        if (json.found && json.data) {
          const d = json.data
          setForm((f) => ({
            ...f,
            descripcion: d.descripcion ?? '',
            ancho_mm:    d.ancho_mm    ? String(d.ancho_mm)  : '',
            largo_mm:    d.largo_mm    ? String(d.largo_mm)  : '',
            calibre:     d.calibre     ? String(d.calibre)   : '',
            material:    d.material    || 'PE — Polietileno',
          }))
          setAutoFilled(true)
        } else {
          setAutoFilled(false)
        }
      } catch { /* silent */ }
      finally { setLookupLoading(false) }
    }, 600)
  }, [form.codigo_dynamics])

  const handleSubmit = async () => {
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/liners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          codigo_dynamics: form.codigo_dynamics.trim().toUpperCase(),
          unidades_estibas: Number(form.unidades_estibas),
          kilos_totales:    Number(form.kilos_totales),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar.')
      setSuccess(true)
      setForm({ ...EMPTY })
      setAutoFilled(false)
      setTimeout(() => setSuccess(false), 4000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  const handleLimpiar = () => {
    setForm({ ...EMPTY })
    setAutoFilled(false)
    setError('')
    setSuccess(false)
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Nuevo Registro</h1>
          <p>Planta Conversión → Inventario</p>
        </div>
        <button className="btn btn-export" onClick={() => window.open('/api/exportar?tipo=inventario')}>
          <Download size={14} /> Exportar Excel
        </button>
      </div>

      <div className="page-body">
        {success && (
          <div className="alert alert-success">
            ✓ Liner registrado exitosamente en el inventario.
          </div>
        )}
        {error && (
          <div className="alert alert-error">
            ✗ {error}
          </div>
        )}

        <div className="card">
          <div className="card-title">Registro de Liner</div>
          <div className="card-subtitle">
            Ingresa el código Dynamics — las medidas y descripción se detectan automáticamente.
          </div>

          {/* Código Dynamics */}
          <div style={{ background: '#f8fdf9', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', marginBottom: 8 }}>
            <div className="form-section-title" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
              Código Dynamics
            </div>
            <div className="form-group">
              <label className="form-label">
                Código Dynamics <span style={{ color: '#e53e3e' }}>*</span>
              </label>
              <input
                className="form-input"
                placeholder="Ej. FLB0BD2004103.0MEX01"
                value={form.codigo_dynamics}
                onChange={(e) => set('codigo_dynamics', e.target.value)}
                style={{ fontFamily: 'DM Mono, monospace', fontSize: 13 }}
              />
              <span className="text-muted" style={{ marginTop: 2 }}>
                {lookupLoading
                  ? '⏳ Buscando código…'
                  : 'Al escribir el código, los campos de medidas y descripción se completan solos.'}
              </span>
            </div>

            {/* Descripción auto */}
            <div className="form-group" style={{ marginTop: 14 }}>
              <label className="form-label">
                Descripción <span className="badge-auto">AUTO</span>
              </label>
              <input
                className={`form-input ${autoFilled ? 'auto-filled' : ''}`}
                placeholder="Se completa automáticamente"
                value={form.descripcion}
                onChange={(e) => set('descripcion', e.target.value)}
                readOnly={autoFilled}
              />
            </div>

            {/* Medidas auto */}
            <div className="form-section-title">Medidas Extraídas</div>
            <div className="form-grid form-grid-3">
              {[
                { key: 'ancho_mm', label: 'Ancho (MM)' },
                { key: 'largo_mm', label: 'Largo (MM)' },
                { key: 'calibre',  label: 'Calibre'    },
              ].map(({ key, label }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">
                    {label} <span className="badge-auto">AUTO</span>
                  </label>
                  <input
                    className={`form-input ${autoFilled ? 'auto-filled' : ''}`}
                    placeholder="Automático"
                    value={(form as Record<string, string>)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    readOnly={autoFilled}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Información del cliente */}
          <div className="form-section-title">Información del Cliente</div>
          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">Nombre del Cliente <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                className="form-input"
                placeholder="Ej. Empresa XYZ S.A.S."
                value={form.nombre_cliente}
                onChange={(e) => set('nombre_cliente', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Número de Pedido</label>
              <input
                className="form-input"
                placeholder="Ej. PED-2024-001"
                value={form.numero_pedido}
                onChange={(e) => set('numero_pedido', e.target.value)}
              />
            </div>
          </div>

          {/* Material y cantidades */}
          <div className="form-section-title">Material y Cantidades</div>
          <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
            <div className="form-group">
              <label className="form-label">Material</label>
              <select className="form-select" value={form.material} onChange={(e) => set('material', e.target.value)}>
                {MATERIALES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unidades (Estibas) <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                className="form-input"
                type="number" min="0" placeholder="0"
                value={form.unidades_estibas}
                onChange={(e) => set('unidades_estibas', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kilos Totales <span style={{ color: '#e53e3e' }}>*</span></label>
              <input
                className="form-input"
                type="number" min="0" step="0.01" placeholder="0.00"
                value={form.kilos_totales}
                onChange={(e) => set('kilos_totales', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación</label>
              <select className="form-select" value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)}>
                <option value="">Seleccionar…</option>
                {UBICACIONES.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div className="form-section-title">Observaciones</div>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="Notas adicionales…"
              value={form.observaciones}
              onChange={(e) => set('observaciones', e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleLimpiar}>Limpiar</button>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || !form.codigo_dynamics || !form.nombre_cliente}
            >
              {loading ? '⏳ Guardando…' : '✓ Guardar liner'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
