-- =============================================
-- SCHEMA: Sistema de Inventario de Liners
-- Planta Conversión
-- =============================================

-- Tabla principal de liners (catálogo por código Dynamics)
CREATE TABLE IF NOT EXISTS liners_catalogo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_dynamics TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  ancho_mm NUMERIC,
  largo_mm NUMERIC,
  calibre NUMERIC,
  material TEXT DEFAULT 'PE — Polietileno',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de inventario actual (stock)
CREATE TABLE IF NOT EXISTS inventario (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_dynamics TEXT NOT NULL REFERENCES liners_catalogo(codigo_dynamics) ON UPDATE CASCADE,
  descripcion TEXT,
  ancho_mm NUMERIC,
  largo_mm NUMERIC,
  calibre NUMERIC,
  material TEXT DEFAULT 'PE — Polietileno',
  nombre_cliente TEXT NOT NULL,
  numero_pedido TEXT,
  unidades_estibas INTEGER NOT NULL DEFAULT 0,
  kilos_totales NUMERIC NOT NULL DEFAULT 0,
  ubicacion TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de movimientos (entradas, salidas, traslados)
CREATE TABLE IF NOT EXISTS movimientos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'salida', 'traslado')),
  inventario_id UUID REFERENCES inventario(id) ON DELETE SET NULL,
  codigo_dynamics TEXT NOT NULL,
  descripcion TEXT,
  nombre_cliente TEXT,
  numero_pedido TEXT,
  unidades_estibas INTEGER NOT NULL DEFAULT 0,
  kilos_totales NUMERIC NOT NULL DEFAULT 0,
  ubicacion_origen TEXT,
  ubicacion_destino TEXT,
  material TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_inventario_codigo ON inventario(codigo_dynamics);
CREATE INDEX IF NOT EXISTS idx_inventario_cliente ON inventario(nombre_cliente);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_created ON movimientos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_catalogo_codigo ON liners_catalogo(codigo_dynamics);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventario_updated_at
  BEFORE UPDATE ON inventario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- DATOS DE EJEMPLO (catálogo Dynamics)
-- Puedes ampliar con tus códigos reales
-- =============================================
INSERT INTO liners_catalogo (codigo_dynamics, descripcion, ancho_mm, largo_mm, calibre, material)
VALUES
  ('FLB0BD2004103.0MEX01', 'Liner PE 2000x4100 Cal.3 México', 2000, 4100, 3.0, 'PE — Polietileno'),
  ('FLB0BD1502002.5COL01', 'Liner PE 1500x2000 Cal.2.5 Colombia', 1500, 2000, 2.5, 'PE — Polietileno'),
  ('FLB0BD1803003.5STD01', 'Liner PE 1800x3000 Cal.3.5 Estándar', 1800, 3000, 3.5, 'PE — Polietileno')
ON CONFLICT (codigo_dynamics) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Habilitar si usas autenticación Supabase
-- =============================================
-- ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE liners_catalogo ENABLE ROW LEVEL SECURITY;

-- Política pública de lectura (sin auth, para uso interno)
-- CREATE POLICY "public_read" ON inventario FOR SELECT USING (true);
-- CREATE POLICY "public_all" ON inventario FOR ALL USING (true);
