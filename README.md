# ReciclApp - Plataforma de Reciclaje Inteligente

Plataforma inteligente dirigida al fomento del reciclaje urbano y educación de economía circular en Ica. Conecta a ciudadanos, recolectores y municipalidades para la erradicación de puntos críticos de basura y digitalización del recojo de materiales valorizables.

## Características Principales

- **Gestión Multi-Rol Ciudadano, Recolector y Administrador**: Panel unificado y adaptativo según nivel de acceso y responsabilidades.
- **Reportes Ciudadanos de Residuos Externos**: Registro fotográfico (con soporte de cámara integrada), selección del material de desperdicio con geolocalización automatizada o ingreso asistido de coordenadas.
- **Solicitud de Recolectas Programadas**: Rastreo e historial de recojo paso a paso, con un flujo dinámico de estados de servicio (desde *recibido/en revisión* hasta *entregado*).
- **Gamificación / Sistema de Recompensas**: Acumulación de Eco-puntos con visualización de progreso de nivel, XP y canje de productos ecológicos en la Tienda Sostenible.
- **Tienda/Marketplace Sostenible de Economía Circular**: Catálogo donde artesanos y aliados publican productos reciclados, permitiendo el contacto instantáneo por canales de comunicación directa.
- **Mapa de Puntos Críticos y Centros de Acopio**: Visualizador geográfico interactivo de centros autorizados y zonas pendientes de atención por personal de limpieza.

---

## Cómo Empezar

### Requisitos Previos

- **Node.js** v18 o superior
- **npm** o **yarn**

### Instalación de Dependencias

Ejecuta el siguiente comando para instalar todos los paquetes requeridos por el ecosistema:

```bash
npm install
```

### Configuración del Entorno (`.env`)

Crea un archivo `.env` en la raíz basándote en `.env.example`:

```env
# Variables requeridas de Firebase Auth / Firestore DB si corresponden
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain_aqui
VITE_FIREBASE_PROJECT_ID=tu_project_id_aqui
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket_aqui
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id_aqui
VITE_FIREBASE_APP_ID=tu_app_id_aqui

# API Key de Gemini para optimizaciones y categorización automática
GEMINI_API_KEY=tu_gemini_api_key_aqui
```

### Ejecutar el Servidor de Desarrollo

Inicia el entorno local de desarrollo (Express + Vite) en el puerto `3000`:

```bash
npm run dev
```

### Crear la Compilación de Producción

Para compilar la aplicación para su distribución o despliegue en contenedores:

```bash
npm run build
```

---

## Estructura de Carpetas

La aplicación está organizada siguiendo una arquitectura limpia y modularizada por responsabilidades:

- `/src/auth`: Pantallas y flujos de autenticación y completitud de perfil.
- `/src/components`: Componentes visuales y módulos específicos (Dashboard, Reportes, Tienda, Mapa, Recojos, Canjes).
- `/src/context`: Proveedores de contexto para Autenticación, Reciclaje y Notificaciones Toast.
- `/src/types.ts`: Modelado estricto e interfaces del dominio del negocio.
- `/server.ts`: Servidor Express para servir archivos estáticos e integraciones API server-side optimizadas.
