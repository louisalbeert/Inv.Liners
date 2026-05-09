// app/api/movimientos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/movimientos?tipo=entrada|salida|traslado
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo')
  const limit = parseInt(searchParams.get('limit') ?? '50')

  let query = supabase
    .from('movimientos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (tipo && ['entrada', 'salida', 'traslado'].includes(tipo)) {
    query = query.eq('tipo', tipo)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data })
}

// POST /api/movimientos — registra una salida o traslado manual
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const {
    tipo,
    inventario_id,
    codigo_dynamics,
    nombre_cliente,
    numero_pedido,
    unidades_estibas,
    kilos_totales,
    ubicacion_origen,
    ubicacion_destino,
    material,
    observaciones,
  } = body

  if (!tipo || !codigo_dynamics) {
    return NextResponse.json(
      { error: 'tipo y codigo_dynamics son requeridos.' },
      { status: 400 }
    )
  }

  // Si es una salida, eliminamos o reducimos el inventario
  if (tipo === 'salida' && inventario_id) {
    const { error: delError } = await supabase
      .from('inventario')
      .delete()
      .eq('id', inventario_id)

    if (delError) {
      return NextResponse.json({ error: delError.message }, { status: 500 })
    }
  }

  // Si es traslado, actualizamos ubicación
  if (tipo === 'traslado' && inventario_id && ubicacion_destino) {
    await supabase
      .from('inventario')
      .update({ ubicacion: ubicacion_destino })
      .eq('id', inventario_id)
  }

  // Registrar movimiento
  const { data, error } = await supabase
    .from('movimientos')
    .insert({
      tipo,
      inventario_id: inventario_id || null,
      codigo_dynamics,
      nombre_cliente: nombre_cliente || null,
      numero_pedido: numero_pedido || null,
      unidades_estibas: Number(unidades_estibas ?? 0),
      kilos_totales: Number(kilos_totales ?? 0),
      ubicacion_origen: ubicacion_origen || null,
      ubicacion_destino: ubicacion_destino || null,
      material: material || null,
      observaciones: observaciones || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
