// app/api/exportar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') ?? 'inventario' // 'inventario' | 'movimientos'

  let rows: Record<string, unknown>[] = []

  if (tipo === 'inventario') {
    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    rows = (data ?? []).map((r) => ({
      'Código Dynamics': r.codigo_dynamics,
      'Descripción':     r.descripcion ?? '',
      'Ancho (mm)':      r.ancho_mm ?? '',
      'Largo (mm)':      r.largo_mm ?? '',
      'Calibre':         r.calibre ?? '',
      'Material':        r.material,
      'Cliente':         r.nombre_cliente,
      'N° Pedido':       r.numero_pedido ?? '',
      'Unidades (Est.)': r.unidades_estibas,
      'Kilos Totales':   r.kilos_totales,
      'Ubicación':       r.ubicacion ?? '',
      'Observaciones':   r.observaciones ?? '',
      'Fecha Ingreso':   new Date(r.created_at).toLocaleString('es-CO'),
    }))
  } else {
    const { data, error } = await supabase
      .from('movimientos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    rows = (data ?? []).map((r) => ({
      'Tipo':            r.tipo.toUpperCase(),
      'Código Dynamics': r.codigo_dynamics,
      'Descripción':     r.descripcion ?? '',
      'Cliente':         r.nombre_cliente ?? '',
      'N° Pedido':       r.numero_pedido ?? '',
      'Unidades (Est.)': r.unidades_estibas,
      'Kilos Totales':   r.kilos_totales,
      'Ubic. Origen':    r.ubicacion_origen ?? '',
      'Ubic. Destino':   r.ubicacion_destino ?? '',
      'Material':        r.material ?? '',
      'Observaciones':   r.observaciones ?? '',
      'Fecha':           new Date(r.created_at).toLocaleString('es-CO'),
    }))
  }

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(rows)

  // Ajustar ancho de columnas automáticamente
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }))
  ws['!cols'] = colWidths

  XLSX.utils.book_append_sheet(wb, ws, tipo === 'inventario' ? 'Inventario' : 'Movimientos')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = `liners_${tipo}_${new Date().toISOString().slice(0, 10)}.xlsx`

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type':        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
