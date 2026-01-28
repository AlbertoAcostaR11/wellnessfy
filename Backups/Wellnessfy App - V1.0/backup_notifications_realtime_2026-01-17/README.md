# Backup: Módulo de Notificaciones Real-Time y Refinamiento Social
**Fecha:** 17 de Enero, 2026

## Cambios Incluidos:
1. **Notificaciones Real-Time:** Implementación de `onSnapshot` de Firestore para recibir alertas sin recargar.
2. **Badge Numérico:** Actualización de UI para mostrar conteo exacto (1, 2, 3... 9+) en escritorio y móvil.
3. **Filtros de Notificaciones:** Sistema de navegación interna por categorías (Todas, Social, Desafíos, Bienestar).
4. **Corrección de Bugs:**
   - Eliminado el salto automático a "Actividad" al sincronizar.
   - Fix de error `failed-precondition` (Index) mediante ordenamiento en cliente.
   - Centrado de botones de filtros.
5. **Feedback de Solicitud:** El botón de enviar solicitud ahora muestra "SOLICITUD ENVIADA" y se bloquea.
6. **Default Landing:** Se estableció "Actividad" como la página raíz al iniciar o recargar.

## Archivos Respaldados:
- `index.html` (UI de Badges)
- `src/main.js` (Lógica de listeners y sincronización)
- `src/router.js` (Rutas y página por defecto)
- `src/pages/notifications.js` (Layout de filtros y renderizado)
- `src/pages/circles.js` (Feedback de botones de solicitud)
- `src/pages/activity.js` (Fix de redirección molesta)
- `src/utils/state.js` (Estado global de notificaciones y landing)
