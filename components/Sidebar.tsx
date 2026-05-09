'use client'
// components/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Package, ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, History, Download } from 'lucide-react'

export default function Sidebar() {
  const path = usePathname()

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href)

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Package size={18} color="white" />
        </div>
        <div className="logo-text">
          <h2>Liners · Planta<br />Conversión</h2>
          <span>Control de Inventario</span>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Principal</div>
        <Link href="/" className={`sidebar-link ${isActive('/') && path === '/' ? 'active' : ''}`}>
          <Plus size={15} />
          Nuevo Registro
        </Link>
        <Link href="/inventario" className={`sidebar-link ${isActive('/inventario') ? 'active' : ''}`}>
          <Package size={15} />
          Inventario
          <span className="sidebar-badge" id="inv-count">—</span>
        </Link>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Movimientos</div>
        <Link href="/entradas" className={`sidebar-link ${isActive('/entradas') ? 'active' : ''}`}>
          <ArrowDownCircle size={15} />
          Entradas
          <span className="sidebar-badge">↓</span>
        </Link>
        <Link href="/salidas" className={`sidebar-link ${isActive('/salidas') ? 'active' : ''}`}>
          <ArrowUpCircle size={15} />
          Salidas
          <span className="sidebar-badge">↑</span>
        </Link>
        <Link href="/traslados" className={`sidebar-link ${isActive('/traslados') ? 'active' : ''}`}>
          <ArrowLeftRight size={15} />
          Traslados
          <span className="sidebar-badge">⇄</span>
        </Link>
        <Link href="/historial" className={`sidebar-link ${isActive('/historial') ? 'active' : ''}`}>
          <History size={15} />
          Historial
        </Link>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-section-label">Reportes</div>
        <Link href="/exportar" className={`sidebar-link ${isActive('/exportar') ? 'active' : ''}`}>
          <Download size={15} />
          Exportar
        </Link>
      </div>
    </aside>
  )
}
