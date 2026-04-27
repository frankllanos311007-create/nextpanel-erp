# ⚡ NextPanel — Mini ERP para Pequeños Negocios

Sistema web completo de gestión empresarial con inventario, punto de venta, facturas y dashboard.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS Vanilla + JavaScript puro |
| Backend | Node.js + Express |
| Base de Datos | Supabase (PostgreSQL) |
| Auth Admin | Supabase Auth (email/password) |
| Auth Vendedor | Código temporal personalizado |

---

## 📁 Estructura del Proyecto

```
NextPanel/
├── frontend/
│   ├── pages/
│   │   ├── auth.html          ← Login (admin + vendedor por código)
│   │   ├── dashboard.html     ← Stats del día + gestión de códigos
│   │   ├── inventario.html    ← CRUD de productos
│   │   ├── ventas.html        ← Punto de venta (POS)
│   │   └── factura.html       ← Factura imprimible
│   ├── js/
│   │   ├── api.js             ← Cliente HTTP centralizado
│   │   └── auth.js            ← Sesión local + utilidades
│   └── public/assets/
│       ├── global.css         ← Sistema de diseño completo + @media print
│       └── auth.css           ← Estilos exclusivos del login
├── backend/
│   ├── package.json
│   ├── .env.example           ← Plantilla de variables de entorno
│   └── src/
│       ├── index.js           ← Servidor Express
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── productosRoutes.js
│       │   ├── ventasRoutes.js
│       │   └── dashboardRoutes.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── productosController.js
│       │   ├── ventasController.js
│       │   └── dashboardController.js
│       └── services/
│           └── supabaseClient.js  ← Conexión a Supabase
└── supabase/
    └── schema.sql             ← DDL completo (tablas, índices, RLS)
```

---

## ⚙️ Instalación y Configuración

### 1. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`
3. En **Authentication → Users**, crea tu usuario admin

### 2. Configurar el Backend

```bash
cd backend
npm install

# Crear el archivo .env a partir del ejemplo
copy .env.example .env
```

Edita el `.env` con tus credenciales de Supabase:

```env
SUPABASE_URL=https://TU_PROYECTO.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key
PORT=3001
ADMIN_EMAIL=admin@tunegocio.com
```

### 3. Iniciar el servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor corre en: `http://localhost:3001`

### 4. Abrir el Frontend

Abre `frontend/pages/auth.html` con un servidor local (ej: Live Server de VS Code) o sirve la carpeta `frontend/` con cualquier servidor estático.

> ⚠️ **No abras los HTML directamente con `file://`** — los fetch() necesitan un servidor HTTP.

---

## 🔐 Sistema de Autenticación

### Login Admin
- Ve a `auth.html` → pestaña **Admin**
- Ingresa email + contraseña del usuario Supabase
- Accedes al Dashboard completo

### Login Vendedor (Código)
1. El admin va a **Dashboard → Códigos de Acceso**
2. Genera un código indicando la duración (horas)
3. El sistema genera un código de 6 letras (ej: `AB3X7K`)
4. El vendedor ingresa en `auth.html` → pestaña **Vendedor**
5. El sistema valida: existencia ✓ estado activo ✓ no expirado ✓

---

## 📊 Módulos

| Módulo | Acceso | Funcionalidad |
|--------|--------|--------------|
| **Dashboard** | Admin | Ventas del día, total, top productos, alertas stock |
| **Inventario** | Admin | CRUD productos, alertas stock bajo |
| **Ventas (POS)** | Admin + Caja | Catálogo visual, carrito, cobro, historial |
| **Factura** | Admin + Caja | Factura HTML imprimible con `window.print()` |
| **Códigos de Acceso** | Admin | Generar/desactivar códigos temporales para vendedores |

---

## 🗄️ Base de Datos

```sql
productos        → id, nombre, precio, stock, stock_minimo, activo
sesiones         → id, codigo, rol, expira_en, activo, creado_por
ventas           → id, total, sesion_id, nota, created_at
detalle_ventas   → id, venta_id, producto_id, cantidad, precio_unitario, subtotal
```

---

## 🖨️ Facturas

Las facturas se generan en HTML y se imprimen con `window.print()`.
El CSS define `@media print` que oculta la navegación y aplica estilos de impresión limpios.

**Para personalizar la factura**, edita en `factura.html`:
```html
<h1 id="f-negocio">MI NEGOCIO</h1>
<p id="f-rif">RIF: J-XXXXXXXXX</p>
<p id="f-direccion">Dirección del negocio</p>
<p id="f-telefono">Teléfono: 0000-0000000</p>
```

---

## 🔗 Endpoints del API

```
GET    /                              → Health check
POST   /api/auth/admin-login          → Login admin
POST   /api/auth/validar-codigo       → Validar código vendedor
POST   /api/auth/generar-codigo       → Generar código (admin)
GET    /api/auth/sesiones             → Listar códigos
PATCH  /api/auth/sesiones/:id/toggle  → Activar/desactivar código

GET    /api/productos                 → Listar productos
POST   /api/productos                 → Crear producto
PUT    /api/productos/:id             → Editar producto
DELETE /api/productos/:id             → Eliminar (lógico)

GET    /api/ventas                    → Historial de ventas
POST   /api/ventas                    → Registrar venta + descontar stock
GET    /api/ventas/:id                → Detalle de venta (para factura)

GET    /api/dashboard                 → Estadísticas del día
```
