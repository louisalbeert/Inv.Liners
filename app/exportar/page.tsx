'use client'
// app/exportar/page.tsx
import { Download, FileSpreadsheet } from 'lucide-react'

export default function ExportarPage() {
  return (
    <>
      <div className="page-header">
        <div className="page-header-left"><h1>Exportar</h1><p>Descargar reportes en Excel</p></div>
      </div>
      <div className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 640 }}>
          {[
            { tipo: 'inventario',   title: 'Inventario Actual', desc: 'Todos los liners en inventario con sus medidas, cliente, cantidad y ubicación.' },
            { tipo: 'movimientos',  title: 'Historial de Movimientos', desc: 'Registro completo de entradas, salidas y traslados con fecha y detalles.' },
          ].map(({ tipo, title, desc }) => (
            <div key={tipo} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={20} color="var(--green-mid)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Formato .xlsx</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => window.open(`/api/exportar?tipo=${tipo}`)}
              >
                <Download size={14} /> Descargar Excel
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
