# ⚡ NextPanel — Mini ERP para Pequeños Negocios

Sistema web completo de gestión empresarial con inventario, punto de venta, facturas y dashboard.

---

## 🚀 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML + CSS Vanilla + JavaScript puro |
| Backend | Node.js + Express |
| Base de Datos | Firebase Firestore |
| Auth Admin | Admin Password (vía .env) |
| Auth Vendedor | Código temporal personalizado (Firestore) |

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
│       ├── routes/            ← Rutas de la API
│       ├── controllers/       ← Lógica de negocio (Firestore)
│       └── services/
│           └── firebaseAdmin.js ← Conexión a Firebase (Admin SDK)
└── vercel.json                ← Configuración de despliegue
```

---

## ⚙️ Instalación y Configuración

### 1. Configurar Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
2. Habilita **Firestore Database**.
3. Ve a **Project Settings -> Service Accounts** y genera una nueva clave privada (archivo JSON).

### 2. Configurar el Backend

```bash
cd backend
npm install

# Crear el archivo .env a partir del ejemplo
copy .env.example .env
```

Edita el `.env` con tus credenciales:

```env
# Ruta al archivo JSON de Firebase (o contenido JSON en Vercel)
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}
PORT=3001
ADMIN_EMAIL=admin@tunegocio.com
ADMIN_PASSWORD=tu_password_segura
```

---

## 🔐 Seguridad y Autenticación

### Login Admin
- El acceso se valida contra las variables de entorno `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- No requiere base de datos para el login, lo que lo hace más rápido y simple de configurar.

### Login Vendedor (Código)
1. El admin genera un código desde el Dashboard (ej: `AB3X7K`).
2. El código se guarda en Firestore con una duración limitada (ej: 8 horas).
3. El sistema valida: existencia ✓ estado activo ✓ no expirado ✓

### Seguridad de Datos
- **Arquitectura:** El frontend nunca se comunica directamente con Firebase. Todo pasa por el Backend (Node.js).
- **Service Account:** El backend utiliza el SDK de Administración de Firebase, lo que garantiza que solo el servidor tiene permisos para modificar datos sensibles.
