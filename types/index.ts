// types/index.ts

export interface LinerCatalogo {
  id: string
  codigo_dynamics: string
  descripcion: string | null
  ancho_mm: number | null
  largo_mm: number | null
  calibre: number | null
  material: string
  created_at: string
}

export interface InventarioItem {
  id: string
  codigo_dynamics: string
  descripcion: string | null
  ancho_mm: number | null
  largo_mm: number | null
  calibre: number | null
  material: string
  nombre_cliente: string
  numero_pedido: string | null
  unidades_estibas: number
  kilos_totales: number
  ubicacion: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export interface Movimiento {
  id: string
  tipo: 'entrada' | 'salida' | 'traslado'
  inventario_id: string | null
  codigo_dynamics: string
  descripcion: string | null
  nombre_cliente: string | null
  numero_pedido: string | null
  unidades_estibas: number
  kilos_totales: number
  ubicacion_origen: string | null
  ubicacion_destino: string | null
  material: string | null
  observaciones: string | null
  created_at: string
}

export interface NuevoRegistroForm {
  codigo_dynamics: string
  descripcion: string
  ancho_mm: string
  largo_mm: string
  calibre: string
  material: string
  nombre_cliente: string
  numero_pedido: string
  unidades_estibas: string
  kilos_totales: string
  ubicacion: string
  observaciones: string
}
