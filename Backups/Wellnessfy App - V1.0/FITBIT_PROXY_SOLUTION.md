# Solución Implementada: Firebase Cloud Functions como Proxy para Fitbit API

## Problema Identificado
La API de Fitbit **NO soporta CORS** para peticiones client-side directas desde navegadores web. Aunque el flujo OAuth funciona (porque usa redirecciones), las peticiones subsecuentes a endpoints de datos (`/activities`, `/steps`, etc.) son bloqueadas por el navegador debido a la falta de headers CORS.

## Solución Implementada
Se ha creado una Firebase Cloud Function que actúa como **proxy servidor** entre tu aplicación web y la API de Fitbit:

```
[App Web] → [Firebase Function Proxy] → [Fitbit API]
          ✅ Sin CORS              ✅ Sin CORS
```

## Archivos Creados/Modificados

### 1. `functions/index.js` (NUEVO)
- Cloud Function `fitbitProxy` que recibe peticiones POST con `{endpoint, token}`
- Hace la petición a Fitbit desde el servidor (sin restricciones CORS)
- Devuelve los datos a la app web

### 2. `functions/package.json` (NUEVO)
- Dependencias: `firebase-functions`, `firebase-admin`, `cors`
- Runtime: Node.js 18

### 3. `src/utils/healthProviders/FitbitProvider.js` (MODIFICADO)
- Agregada propiedad `this.proxyUrl` apuntando a la Cloud Function
- Método `getActivitiesForDate()` modificado para usar el proxy en lugar de fetch directo

### 4. `firebase.json` (MODIFICADO)
- Agregada configuración de `functions` para habilitar el despliegue

## Estado Actual
⚠️ **PENDIENTE DE DESPLIEGUE**

El despliegue de Cloud Functions requiere:
1. **Plan Blaze de Firebase** (pago por uso, pero tiene capa gratuita generosa)
2. Habilitar APIs: `cloudfunctions.googleapis.com` y `cloudbuild.googleapis.com`

## Próximos Pasos

### Opción A: Habilitar Cloud Functions (Recomendado)
1. Ve a [Firebase Console](https://console.firebase.google.com/project/wellnessfy-cbc1b)
2. Actualiza al plan Blaze (requiere tarjeta, pero tiene límites gratuitos altos)
3. Ejecuta: `firebase deploy --only functions`
4. La URL del proxy será: `https://us-central1-wellnessfy-cbc1b.cloudfunctions.net/fitbitProxy`

### Opción B: Usar Google Fit en su lugar
Google Fit SÍ soporta CORS y funciona perfectamente client-side sin proxy.

### Opción C: Proxy Temporal de Desarrollo
Para testing inmediato, puedes usar un proxy CORS público (NO para producción):
- Modificar `FitbitProvider.js` para usar `https://cors-anywhere.herokuapp.com/` como prefijo
- Solo para desarrollo/testing

## Costos Estimados (Plan Blaze)
- **Capa gratuita**: 2 millones de invocaciones/mes
- **Tu uso estimado**: ~100-500 invocaciones/día = ~15,000/mes
- **Costo real**: $0 (dentro de la capa gratuita)

## Notas Técnicas
- El proxy solo maneja peticiones GET a Fitbit
- Implementa validación de parámetros y manejo de errores
- Usa CORS abierto (`origin: true`) - en producción deberías restringirlo a tu dominio
