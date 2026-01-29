# Estado del Proyecto - 28 Enero 2026

## ✅ Logros (Funcionalidad Social Completa)

### 1. Feed e Interacciones (Realtime)
- **Likes:** Se guardan en Firestore y se actualizan al instante en todos los usuarios conectados.
- **Comentarios:** Persistencia en Firestore y sincronización en tiempo real.
- **Respuestas:** Funcionando.
- **Implementación:** 
  - Se usa `onSnapshot` en `main.js` para escuchar cambios en la colección `posts`.
  - Se agregaron permisos `write` en `firestore.rules` para permitir que cualquier usuario edite arrays de reactions/comments.

### 2. Notificaciones Internas (In-App)
- **Sistema Unificado:**
  - Se modificó `main.js` para escuchar **DOS fuentes** simultáneas:
    1. `friendRequests` (Sistema legacy de amigos)
    2. `users/{currentUser}/notifications` (Nuevo sistema social)
  - Ambas fuentes se fusionan en la UI (`AppState.notifications`).
- **Trigger:**
  - `feed.js` dispara la notificación al autor del post cuando alguien comenta o da like.
  - `friendRequestHandler.js` dispara notificación al enviar solicitud.
  - `friendshipManager.js` dispara notificación al aceptar solicitud.

### 3. Persistencia
- **Firestore:** Toda la data social es persistente. Si recargas la página, los likes, comentarios y notificaciones se mantienen.

---

## ⚠️ Pendiente (Infraestructura)

### 1. Notificaciones Push (Celular)
- **Estado:** Código listo en `functions/index.js` (`sendPushNotification`).
- **Problema:** El despliegue (`firebase deploy`) se quedó colgado por horas.
- **Solución:** Reintentar el deploy mañana. Una vez desplegado, las notificaciones que YA se generan internamente empezarán a llegar también al celular.

---

## Archivos Críticos Respaldados
- `src/main.js`: Lógica de listeners unificados.
- `src/pages/feed.js`: Lógica de UI social.
- `src/utils/notificationService.js`: Orquestador de alertas.
- `firestore.rules`: Permisos de seguridad.
