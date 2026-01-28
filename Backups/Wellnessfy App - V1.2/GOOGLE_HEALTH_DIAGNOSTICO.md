# Guía de Diagnóstico - Google Health Connect

## Cambios Realizados

### 1. **Mejoras en `googleHealth.js`**

#### ✅ Persistencia de Token
- El token de acceso ahora se guarda en `localStorage` con su tiempo de expiración
- Se carga automáticamente al iniciar la aplicación
- Se limpia automáticamente cuando expira

#### ✅ Manejo Robusto de Errores
- Reintentos automáticos (hasta 5 intentos) si el SDK de Google no está disponible
- Manejo específico de errores de autenticación (401, token expirado)
- Feedback claro al usuario sobre el tipo de error

#### ✅ Mejor Feedback Visual
- Estados claros: `connecting`, `syncing`, `success`, `error`, `ready`
- Animación de spinner durante la sincronización
- Cambios de color según el estado (verde=éxito, rojo=error, cyan=normal)

#### ✅ Logging Detallado
- Emojis en consola para identificar rápidamente el tipo de mensaje
- Logs de cada paso del proceso de sincronización
- Información de debugging para diagnosticar problemas

#### ✅ Sincronización Automática
- Se ejecuta automáticamente al cargar la página si hay un token válido
- Evita pedir permisos innecesariamente

### 2. **Mejoras en `activity.js`**

#### ✅ Indicador de Última Sincronización
- Muestra cuándo fue la última sincronización exitosa
- Formato amigable: "Hace un momento", "Hace 5 min", "Hace 2h"

#### ✅ Mejor UI del Botón
- Botón más grande y visible
- Título de página "Actividad" agregado
- Mejor contraste y efectos hover

### 3. **Mejoras en `main.js`**

#### ✅ Auto-sincronización al Cargar
- Llama a `autoSyncIfReady()` después de inicializar
- Espera 1.5 segundos para asegurar que el DOM esté listo

---

## Cómo Probar la Sincronización

### Paso 1: Abrir la Consola del Navegador
1. Presiona `F12` o `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. Ve a la pestaña **Console**

### Paso 2: Navegar a la Página de Actividad
1. Abre la aplicación en el navegador
2. Haz clic en "Actividad" en el menú

### Paso 3: Iniciar Sincronización
1. Haz clic en el botón **"Sincronizar"**
2. Observa los mensajes en la consola

### Mensajes Esperados (Éxito)

```
✅ Google Identity inicializado correctamente
🔄 Solicitando sincronización...
🔐 Solicitando nuevo token de acceso...
📥 Respuesta de autenticación recibida: {...}
✅ Token de acceso recibido
✅ Token guardado. Expira en: [hora]
📊 Obteniendo datos de fitness...
📅 Rango de tiempo: {inicio: ..., fin: ...}
📥 Respuesta de Google Fit API: {...}
🔍 Procesando datos de fitness...
📊 Datasets encontrados: 4
👣 Pasos: 1234
🔥 Calorías: 567
❤️ Ritmo cardíaco: 72
⏱️ Minutos activos: 30
💾 Datos guardados en AppState
```

### Mensajes de Error Comunes

#### ❌ SDK no disponible
```
⚠️ Google Identity SDK no disponible aún. Reintento: 1
```
**Solución**: Espera unos segundos, el sistema reintentará automáticamente.

#### ❌ Token expirado
```
🔄 Token expirado, limpiando y solicitando nuevo...
```
**Solución**: Haz clic en "Sincronizar" nuevamente para obtener un nuevo token.

#### ❌ Acceso denegado
```
❌ Error en autenticación: access_denied
```
**Solución**: Acepta los permisos cuando Google te lo solicite.

#### ❌ Error de red
```
❌ Error al obtener datos de fitness: HTTP 403
```
**Solución**: Verifica que el CLIENT_ID sea correcto y que la API de Google Fit esté habilitada.

---

## Verificación de Datos

### En la UI
1. Los valores deben aparecer en las tarjetas:
   - **Pasos**: Número formateado (ej: "1,234")
   - **Activo**: Minutos (ej: "30m")
   - **Sueño**: Horas (ej: "7h")
   - **Calorías**: Número formateado (ej: "567")
   - **Corazón**: BPM (ej: "72")

### En localStorage
Abre la consola y ejecuta:
```javascript
// Ver token guardado
localStorage.getItem('google_health_token')

// Ver expiración del token
new Date(parseInt(localStorage.getItem('google_health_token_expiry'))).toLocaleString()

// Ver última sincronización
new Date(parseInt(localStorage.getItem('last_health_sync'))).toLocaleString()

// Ver datos del usuario
JSON.parse(localStorage.getItem('wellnessfy_user')).stats
```

---

## Problemas Conocidos y Soluciones

### 1. "No se encontraron datos en los buckets"
**Causa**: No hay datos de actividad en Google Fit para hoy.
**Solución**: 
- Usa una app de fitness (Google Fit, Samsung Health, etc.)
- Camina un poco con el teléfono
- Espera unos minutos y sincroniza de nuevo

### 2. "HTTP 403: Forbidden"
**Causa**: El CLIENT_ID no tiene permisos o la API no está habilitada.
**Solución**:
- Verifica que la API de Google Fit esté habilitada en Google Cloud Console
- Verifica que el CLIENT_ID sea correcto
- Asegúrate de que el dominio esté autorizado en Google Cloud Console

### 3. "Token expirado" constantemente
**Causa**: El token tiene una duración de 1 hora por defecto.
**Solución**: 
- Esto es normal, simplemente sincroniza de nuevo
- El sistema ahora guarda el token y lo reutiliza mientras sea válido

### 4. Popup de Google no aparece
**Causa**: Bloqueador de popups o script no cargado.
**Solución**:
- Desactiva el bloqueador de popups para este sitio
- Recarga la página completamente (Ctrl+F5)
- Verifica en consola si hay errores de carga del script

---

## Comandos Útiles para Debugging

### Limpiar todos los datos guardados
```javascript
localStorage.removeItem('google_health_token');
localStorage.removeItem('google_health_token_expiry');
localStorage.removeItem('last_health_sync');
```

### Forzar nueva autenticación
```javascript
localStorage.clear();
location.reload();
```

### Ver estado actual
```javascript
console.log('Token:', localStorage.getItem('google_health_token') ? 'Existe' : 'No existe');
console.log('Expira:', localStorage.getItem('google_health_token_expiry') ? new Date(parseInt(localStorage.getItem('google_health_token_expiry'))).toLocaleString() : 'N/A');
console.log('Última sync:', localStorage.getItem('last_health_sync') ? new Date(parseInt(localStorage.getItem('last_health_sync'))).toLocaleString() : 'Nunca');
```

---

## Próximos Pasos Recomendados

1. **Probar en dispositivo móvil real**
   - La sincronización funciona mejor con datos reales de actividad

2. **Configurar refresh token** (opcional)
   - Para evitar pedir permisos cada hora
   - Requiere configuración adicional en Google Cloud Console

3. **Agregar más métricas**
   - Distancia recorrida
   - Pisos subidos
   - Tiempo de ejercicio por tipo

4. **Sincronización en segundo plano**
   - Usar Service Workers para sincronizar periódicamente
   - Notificar al usuario cuando hay nuevos datos

---

## Contacto y Soporte

Si encuentras algún problema que no esté cubierto en esta guía:

1. Copia los logs de la consola
2. Toma una captura de pantalla del error
3. Anota los pasos exactos que seguiste
4. Comparte esta información para recibir ayuda

**¡La sincronización con Google Health Connect ahora debería funcionar correctamente!** 🎉
