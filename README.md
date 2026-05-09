# 🏭 Liners · Planta Conversión — Guía de Instalación y Despliegue

## Estructura del Proyecto

```
liners-inventory/
├── app/
│   ├── api/
│   │   ├── liners/
│   │   │   ├── route.ts          ← GET (listar) / POST (crear registro)
│   │   │   └── lookup/route.ts   ← GET lookup por código Dynamics
│   │   ├── movimientos/route.ts  ← GET / POST movimientos
│   │   └── exportar/route.ts     ← GET descarga Excel
│   ├── inventario/page.tsx
│   ├── entradas/page.tsx
│   ├── salidas/page.tsx
│   ├── traslados/page.tsx
│   ├── historial/page.tsx
│   ├── exportar/page.tsx
│   ├── layout.tsx
│   ├── page.tsx                  ← Nuevo Registro (página principal)
│   └── globals.css
├── components/
│   └── Sidebar.tsx
├── lib/
│   └── supabase.ts
├── types/
│   └── index.ts
├── supabase/
│   └── schema.sql                ← ⬅ Ejecutar esto primero en Supabase
├── .env.example
└── package.json
```

---

## PASO 1 — Crear proyecto en Supabase

1. Ve a **https://supabase.com** → New Project
2. Ponle nombre: `liners-planta-conversion`
3. Elige una región cercana (ej. South America)
4. Copia la contraseña de la base de datos (guárdala)

### Ejecutar el Schema SQL

1. En tu proyecto Supabase → **SQL Editor**
2. Pega el contenido de `supabase/schema.sql`
3. Haz clic en **Run**

Esto crea las tablas:
- `liners_catalogo` — catálogo de códigos Dynamics con medidas
- `inventario` — stock actual
- `movimientos` — historial de entradas/salidas/traslados

---

## PASO 2 — Obtener las credenciales de Supabase

1. En tu proyecto Supabase → **Settings** → **API**
2. Copia:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

---

## PASO 3 — Configurar el proyecto local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env.local
# Editar .env.local con los valores reales de Supabase

# 3. Correr en desarrollo
npm run dev
# Abre http://localhost:3000
```

---

## PASO 4 — Subir a Vercel

### Opción A: Desde GitHub (recomendado)

```bash
# 1. Crear repositorio en GitHub (si no tienes uno)
git init
git add .
git commit -m "feat: sistema inventario liners"
git remote add origin https://github.com/TU_USUARIO/liners-inventario.git
git push -u origin main
```

2. Ve a **https://vercel.com** → New Project
3. Importa tu repositorio de GitHub
4. En **Environment Variables**, agrega las 3 variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Haz clic en **Deploy** ✅

### Opción B: Vercel CLI

```bash
npm i -g vercel
vercel
# Sigue las instrucciones y agrega las variables cuando te las pida
```

---

## Agregar códigos Dynamics reales al catálogo

Para que el lookup automático funcione con tus códigos reales, inserta en Supabase:

```sql
INSERT INTO liners_catalogo (codigo_dynamics, descripcion, ancho_mm, largo_mm, calibre, material)
VALUES
  ('TU_CODIGO_001', 'Descripción del liner', 1500, 3000, 3.0, 'PE — Polietileno'),
  ('TU_CODIGO_002', 'Otro liner', 2000, 4000, 2.5, 'PE — Polietileno');
```

O puedes importarlos en CSV desde el panel de Supabase → **Table Editor** → Import CSV.

---

## Funcionalidades incluidas

| Función | Descripción |
|---|---|
| ✅ Nuevo Registro | Formulario con autocompletado por código Dynamics |
| ✅ Lookup automático | Al escribir el código, llena medidas y descripción |
| ✅ Inventario | Lista completa con búsqueda y stats en tiempo real |
| ✅ Entradas | Historial de ingresos |
| ✅ Salidas | Registrar salida y eliminar del inventario |
| ✅ Traslados | Mover liners entre ubicaciones |
| ✅ Historial | Todos los movimientos con filtros |
| ✅ Exportar Excel | Inventario y movimientos en .xlsx |
| ✅ Multi-dispositivo | Funciona en cualquier dispositivo con el link de Vercel |

---

## Soporte

Si necesitas agregar:
- Autenticación con usuarios y contraseña
- Múltiples plantas/sedes
- Notificaciones por stock mínimo
- Dashboard con gráficas

Puedes extender el proyecto fácilmente desde esta base.
