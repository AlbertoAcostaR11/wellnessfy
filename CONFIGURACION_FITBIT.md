# 🔧 Configuración de Fitbit API

## Paso 1: Crear aplicación en Fitbit Developer Console

### 1.1 Ir a Fitbit Developer Portal
- URL: https://dev.fitbit.com/apps
- Inicia sesión con tu cuenta de Fitbit

### 1.2 Registrar nueva aplicación
Haz clic en "Register an App" y completa:

**Application Details:**
- **Application Name:** Wellnessfy
- **Description:** App de bienestar que sincroniza datos de salud y fitness
- **Application Website:** http://localhost:8000 (o tu dominio de producción)
- **Organization:** Tu nombre o empresa
- **Organization Website:** http://localhost:8000

**OAuth 2.0 Application Type:**
- Selecciona: **Personal**

**Callback URL:**
```
http://localhost:8000/fitbit-callback.html
```

**Default Access Type:**
- Selecciona: **Read Only**

### 1.3 Obtener credenciales
Después de registrar, obtendrás:
- **OAuth 2.0 Client ID** (ejemplo: 23ABCD)
- **Client Secret** (ejemplo: a1b2c3d4e5f6g7h8i9j0)

---

## Paso 2: Configurar credenciales en Wellnessfy

### 2.1 Abrir archivo FitbitProvider.js
Ubicación: `src/utils/healthProviders/FitbitProvider.js`

### 2.2 Reemplazar credenciales
Busca estas líneas (aproximadamente línea 12-13):

```javascript
this.clientId = 'TU_CLIENT_ID'; // TODO: Configurar
this.clientSecret = 'TU_CLIENT_SECRET';
```

Reemplaza con tus credenciales:

```javascript
this.clientId = '23ABCD'; // Tu Client ID real
this.clientSecret = 'a1b2c3d4e5f6g7h8i9j0'; // Tu Client Secret real
```

---

## Paso 3: Configurar Callback URL en producción

### Para desarrollo (localhost):
```
http://localhost:8000/fitbit-callback.html
```

### Para producción (Firebase):
```
https://wellnessfy-cbc1b.web.app/fitbit-callback.html
```

**IMPORTANTE:** Debes agregar AMBAS URLs en la configuración de tu app en Fitbit Developer Console si quieres que funcione en desarrollo y producción.

---

## Paso 4: Permisos (Scopes)

La app solicita estos permisos:
- ✅ **activity** - Actividades y ejercicios
- ✅ **heartrate** - Frecuencia cardíaca
- ✅ **sleep** - Datos de sueño
- ✅ **weight** - Peso corporal
- ✅ **profile** - Información del perfil

Si necesitas más permisos, modifica la línea en `FitbitProvider.js`:
```javascript
this.scope = 'activity heartrate sleep weight profile';
```

Permisos adicionales disponibles:
- `nutrition` - Datos de nutrición
- `location` - Ubicación GPS
- `settings` - Configuración del dispositivo

---

## Paso 5: Límites de API

### Rate Limits de Fitbit:
- **150 requests por hora** por usuario
- **150 requests por hora** por aplicación

### Recomendaciones:
- ✅ Cachear datos localmente
- ✅ Sincronizar solo cuando sea necesario
- ✅ Usar batch requests cuando sea posible

---

## Paso 6: Testing

### 6.1 Probar autenticación
En la consola del navegador:
```javascript
await healthProviderManager.authenticateProvider('fitbit');
```

### 6.2 Probar sincronización
```javascript
const data = await healthProviderManager.syncActiveProvider();
console.log(data);
```

### 6.3 Ver actividades
```javascript
const provider = healthProviderManager.getActiveProvider();
const activities = await provider.getActivities(
    new Date('2026-01-15'),
    new Date('2026-01-15')
);
console.log(activities);
```

---

## Troubleshooting

### Error: "Invalid redirect_uri"
- Verifica que la URL de callback coincida EXACTAMENTE con la configurada en Fitbit Developer Console
- Incluye http:// o https://
- No incluyas parámetros adicionales

### Error: "Invalid client credentials"
- Verifica que Client ID y Client Secret sean correctos
- Asegúrate de no tener espacios extra

### Error: "Insufficient scope"
- Verifica que los scopes solicitados estén habilitados en tu app de Fitbit
- Algunos scopes requieren aprobación adicional

### Popup bloqueado
- Permite popups para localhost:8000 en tu navegador
- O usa el botón de autenticación en la UI en lugar de la consola

---

## Próximos pasos

Una vez configurado:
1. ✅ Probar autenticación
2. ✅ Probar sincronización de actividades
3. ✅ Integrar con "Mis Deportes"
4. ✅ Agregar UI para seleccionar proveedor
5. ✅ Desplegar a producción

---

## Recursos

- **Fitbit Developer Docs:** https://dev.fitbit.com/build/reference/web-api/
- **OAuth 2.0 Guide:** https://dev.fitbit.com/build/reference/web-api/developer-guide/authorization/
- **Activity Types:** https://dev.fitbit.com/build/reference/web-api/activity/
