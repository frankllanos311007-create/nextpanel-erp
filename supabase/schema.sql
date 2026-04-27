-- ============================================================
-- NextPanel - Mini ERP Schema para Supabase (PostgreSQL)
-- ============================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================


-- -------------------------------------------------------
-- TABLA: productos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre        TEXT NOT NULL,
    precio        NUMERIC(10, 2) NOT NULL DEFAULT 0,
    stock         INTEGER NOT NULL DEFAULT 0,
    stock_minimo  INTEGER NOT NULL DEFAULT 5,   -- alerta cuando stock <= stock_minimo
    activo        BOOLEAN NOT NULL DEFAULT true,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda rápida por nombre
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos (nombre);


-- -------------------------------------------------------
-- TABLA: sesiones
-- Código temporal para vendedores/caja
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS sesiones (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codigo      TEXT NOT NULL UNIQUE,           -- código que ingresa el vendedor
    rol         TEXT NOT NULL DEFAULT 'caja',   -- 'caja' | 'admin'
    expira_en   TIMESTAMPTZ NOT NULL,           -- cuándo expira el código
    activo      BOOLEAN NOT NULL DEFAULT true,  -- el admin puede desactivar manualmente
    creado_por  TEXT,                           -- email del admin que lo creó
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para buscar el código rápidamente
CREATE INDEX IF NOT EXISTS idx_sesiones_codigo ON sesiones (codigo);


-- -------------------------------------------------------
-- TABLA: ventas
-- Encabezado de cada transacción de venta
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    total       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sesion_id   UUID REFERENCES sesiones(id) ON DELETE SET NULL,
    nota        TEXT,                           -- comentario opcional
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas por fecha (dashboard)
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas (created_at);


-- -------------------------------------------------------
-- TABLA: detalle_ventas
-- Líneas de cada venta (productos vendidos)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS detalle_ventas (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    venta_id         UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id      UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad         INTEGER NOT NULL DEFAULT 1,
    precio_unitario  NUMERIC(10, 2) NOT NULL,   -- precio al momento de la venta
    subtotal         NUMERIC(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- Índice para obtener el detalle de una venta rápidamente
CREATE INDEX IF NOT EXISTS idx_detalle_venta_id ON detalle_ventas (venta_id);
-- Índice para estadísticas de producto más vendido
CREATE INDEX IF NOT EXISTS idx_detalle_producto_id ON detalle_ventas (producto_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Habilitar para que las peticiones desde el frontend sean seguras
-- Las operaciones del backend usan service_role key (bypasa RLS)
-- ============================================================
ALTER TABLE productos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sesiones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_ventas  ENABLE ROW LEVEL SECURITY;

-- Política: solo el service_role (backend) puede leer/escribir
-- En el frontend NUNCA uses la service_role key

-- ============================================================
-- DATOS DE EJEMPLO (opcional, para probar)
-- ============================================================
INSERT INTO productos (nombre, precio, stock, stock_minimo) VALUES
    ('Coca-Cola 600ml',  1.50, 50, 10),
    ('Agua Mineral 1L',  1.00, 30,  5),
    ('Galletas Oreo',    2.00, 20,  5),
    ('Chicles Trident',  0.50, 40, 10)
ON CONFLICT DO NOTHING;
