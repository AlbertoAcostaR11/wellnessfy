---
name: Arquitecto_de_Notificaciones
description: Skill maestro para diseñar, implementar y auditar sistemas de notificaciones Push y Social en aplicaciones web/PWA usando Firebase. Enfocado en arquitectura segura (Backend Trigger Pattern), canales de notificación, autocuración de tokens y experiencia de usuario (clics inteligentes).
triggers:
  - "Cuando el usuario pida 'implementar notificaciones push'."
  - "Cuando se necesite crear un sistema de alertas in-app."
  - "Al solicitar correcciones en el flujo de envío de mensajes FCM."
  - "Si se detecta código de envío de FCM en el frontend (React/JS cliente)."
---

# Arquitecto de Notificaciones (Firebase & PWA)

Este Skill define el estándar de oro para la implementación de notificaciones. No se limita a "hacer que funcione", sino a estructurar un sistema robusto, seguro y escalable.

## 1. Reglas de Arquitectura (Strict Mode)

### A. The Database Trigger Pattern (Backend vs Frontend)
**NUNCA** permitas que el cliente (Frontend) hable directamente con FCM (Firebase Cloud Messaging).
- **Frontend (Cliente):** Su ÚNICA responsabilidad es **escribir** un documento en Firestore (ej. `users/{uid}/notifications/{id}`).
- **Backend (Cloud Functions):** Es el ÚNICO autorizado para escuchar ese evento (`onDocumentCreated`) y ejecutar el envío del Push Notification a través de `admin.messaging()`.

### B. Gestión de Tokens (Self-Healing)
El sistema debe ser capaz de "curarse" a sí mismo.
- **Validación:** Al enviar un push, la Cloud Function debe capturar los errores.
- **Limpieza:** Si Firebase responde con `messaging/invalid-registration-token` o `not-registered`, la función debe **eliminar** inmediatamente ese token de la base de datos del usuario (`arrayRemove`).
- **Ubicación:** Los tokens deben residir en una ruta privada/protegida, ej: `users/{userId}/private/tokens` o campo `fcmTokens` en el documento de usuario protegido.

### C. Idempotencia y Estado
Evita spam accidental por reintentos de servidor.
- **Marcado:** La Cloud Function debe actualizar el documento original con `status: 'sent'` o `processed: true` una vez enviado el éxito.
- **Verificación:** Al inicio de la ejecución (`onDocumentCreated`), verifica si el documento ya tiene ese flag. Si es así, aborta la ejecución (`return null`).

## 2. Tipos y Canales (Categorización)

Define y respeta estos niveles de prioridad para no saturar al usuario:

| Tipo | Prioridad | Comportamiento | Ejemplo |
| :--- | :--- | :--- | :--- |
| **URGENT_CHALLENGE** | 🚨 Alta | Sonido + Vibración + Heads-up | "¡Te retaron a una carrera!" |
| **SOCIAL_INTERACTION** | 🔵 Default | Sonido suave | "A Juan le gustó tu foto" |
| **MARKETING_PROMO** | ⚪ Baja | Silencioso (Minimizado) | "Nuevo cupón disponible" |

*Instrucción:* Configura estos canales en el payload del mensaje (`android_channel_id`) y en el Service Worker si es necesario.

## 3. Instrucciones de Implementación (Paso a Paso)

### Paso 1: El Disparador (Frontend)
El cliente solo crea datos. Ejemplo de estructura requerida en el `NotificationService`:
```javascript
// Payload que el cliente debe guardar en Firestore
const notificationDoc = {
  title: "Nuevo Reto",
  body: "Juan te ha desafiado a 5km",
  type: "URGENT_CHALLENGE",
  data: {
    click_action: "/challenges/view/123", // RUTA CLAVE PARA EL CLIC
    sourceId: "123"
  },
  read: false,
  timestamp: serverTimestamp(),
  processed: false // Flag para idempotencia
};
```

### Paso 2: El Ejecutor (Cloud Function)
Genera o audita la función en `functions/index.js` (o similar). Debe:
1. Leer el documento creado.
2. Verificar idempotencia (`if (data.processed) return`).
3. Leer tokens del usuario destino.
4. Enviar usando `sendEachForMulticast`.
5. Manejar errores y limpiar tokens inválidos.
6. Marcar `processed: true`.

### Paso 3: El Visualizador (Service Worker)
El archivo `firebase-messaging-sw.js` debe ser capaz de manejar el evento `notificationclick`.
**Requisito de Auditoría:** Busca explícitamente `clients.openWindow`. Si no existe, la notificación es "tonta" (no abre la app).
```javascript
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Lógica para abrir la URL específica del payload
  const urlToOpen = event.notification.data.click_action || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(...)
      // Lógica de focus o openWindow
  );
});
```

## 4. Checklist de Calidad (Auditoría Final)

Antes de dar por finalizada la tarea, verifica:
- [ ] **Ubicación:** ¿La lógica de envío está en `/functions` y NO en `/src`?
- [ ] **Seguridad:** ¿Las reglas de Firestore (`firestore.rules`) protegen la colección de notificaciones (solo el usuario ve las suyas)?
- [ ] **Interacción:** ¿El Service Worker tiene lógica de `notificationclick` con `openWindow`?
- [ ] **Limpieza:** ¿Existe código para borrar tokens `Unregistered`?
- [ ] **Canales:** ¿Se diferencia entre notificaciones urgentes y promocionales?

## 5. Salida Esperada
Cuando generes código, entrégalo en bloques separados claramente identificados:
1. `functions/index.js` (Backend)
2. `public/firebase-messaging-sw.js` (Worker)
3. `firestore.rules` (Seguridad)
4. Instrucciones de uso para el `NotificationService` (Frontend).
