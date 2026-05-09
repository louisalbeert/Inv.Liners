// app/api/liners/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/liners — lista el inventario completo
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)

  const cliente = searchParams.get('cliente')
  const codigo = searchParams.get('codigo')

  let query = supabase
    .from('inventario')
    .select('*')
    .order('created_at', { ascending: false })

  if (cliente) query = query.ilike('nombre_cliente', `%${cliente}%`)
  if (codigo)  query = query.ilike('codigo_dynamics', `%${codigo}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ data })
}

// POST /api/liners — crea un nuevo registro y guarda movimiento de entrada
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const body = await req.json()

  const {
    codigo_dynamics,
    descripcion,
    ancho_mm,
    largo_mm,
    calibre,
    material,
    nombre_cliente,
    numero_pedido,
    unidades_estibas,
    kilos_totales,
    ubicacion,
    observaciones,
  } = body

  // Validaciones básicas
  if (!codigo_dynamics || !nombre_cliente) {
    return NextResponse.json(
      { error: 'Código Dynamics y nombre de cliente son requeridos.' },
      { status: 400 }
    )
  }
  if (!unidades_estibas || Number(unidades_estibas) <= 0) {
    return NextResponse.json(
      { error: 'Las unidades (estibas) deben ser mayores a 0.' },
      { status: 400 }
    )
  }

  // 1. Upsert catálogo (guarda/actualiza info del código si vino con datos)
  if (descripcion || ancho_mm || largo_mm || calibre) {
    await supabase.from('liners_catalogo').upsert(
      {
        codigo_dynamics,
        descripcion: descripcion || null,
        ancho_mm: ancho_mm ? Number(ancho_mm) : null,
        largo_mm: largo_mm ? Number(largo_mm) : null,
        calibre: calibre ? Number(calibre) : null,
        material: material || 'PE — Polietileno',
      },
      { onConflict: 'codigo_dynamics', ignoreDuplicates: false }
    )
  }

  // 2. Insertar en inventario
  const { data: invData, error: invError } = await supabase
    .from('inventario')
    .insert({
      codigo_dynamics,
      descripcion: descripcion || null,
      ancho_mm: ancho_mm ? Number(ancho_mm) : null,
      largo_mm: largo_mm ? Number(largo_mm) : null,
      calibre: calibre ? Number(calibre) : null,
      material: material || 'PE — Polietileno',
      nombre_cliente,
      numero_pedido: numero_pedido || null,
      unidades_estibas: Number(unidades_estibas),
      kilos_totales: Number(kilos_totales),
      ubicacion: ubicacion || null,
      observaciones: observaciones || null,
    })
    .select()
    .single()

  if (invError) {
    return NextResponse.json({ error: invError.message }, { status: 500 })
  }

  // 3. Registrar movimiento de entrada
  await supabase.from('movimientos').insert({
    tipo: 'entrada',
    inventario_id: invData.id,
    codigo_dynamics,
    descripcion: descripcion || null,
    nombre_cliente,
    numero_pedido: numero_pedido || null,
    unidades_estibas: Number(unidades_estibas),
    kilos_totales: Number(kilos_totales),
    ubicacion_destino: ubicacion || null,
    material: material || 'PE — Polietileno',
    observaciones: observaciones || null,
  })

  return NextResponse.json({ data: invData }, { status: 201 })
}
