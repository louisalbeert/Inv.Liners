// app/api/liners/lookup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET /api/liners/lookup?codigo=XXX
// Busca en el catálogo y devuelve descripción + medidas automáticamente
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const codigo = searchParams.get('codigo')

  if (!codigo) {
    return NextResponse.json({ error: 'Parámetro "codigo" requerido.' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('liners_catalogo')
    .select('*')
    .eq('codigo_dynamics', codigo.trim().toUpperCase())
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ found: false, data: null })
  }

  return NextResponse.json({ found: true, data })
}
