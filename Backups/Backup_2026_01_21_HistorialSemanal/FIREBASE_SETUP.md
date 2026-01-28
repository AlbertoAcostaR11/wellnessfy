# Configuración de Firebase para Wellnessfy

## Paso 1: Crear un Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" o "Add project"
3. Nombra tu proyecto (ej: "Wellnessfy")
4. Acepta los términos y continúa
5. Puedes desactivar Google Analytics si no lo necesitas
6. Haz clic en "Crear proyecto"

## Paso 2: Registrar tu App Web

1. En la página principal de tu proyecto, haz clic en el ícono web `</>`
2. Registra tu app con un nombre (ej: "Wellnessfy Web")
3. **NO** marques "Firebase Hosting" por ahora
4. Haz clic en "Registrar app"

## Paso 3: Obtener la Configuración de Firebase

Verás un código similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**COPIA ESTOS VALORES** - Los necesitarás en el siguiente paso.

## Paso 4: Configurar Google Sign-In

1. En el menú lateral de Firebase Console, ve a **Authentication**
2. Haz clic en "Get started" o "Comenzar"
3. Ve a la pestaña **Sign-in method**
4. Haz clic en **Google** en la lista de proveedores
5. Activa el toggle "Enable"
6. Selecciona un email de soporte (tu email de Google)
7. Haz clic en "Save"

## Paso 5: Configurar Dominios Autorizados

1. Aún en **Authentication > Settings > Authorized domains**
2. Asegúrate de que `localhost` esté en la lista (debería estar por defecto)
3. Si vas a desplegar en un dominio específico, agrégalo aquí

## Paso 6: Actualizar login.html

1. Abre `login.html`
2. Busca la sección que dice:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. **REEMPLAZA** los valores con los que copiaste en el Paso 3

## Paso 7: Probar la Integración

1. Abre `login.html` en tu navegador
2. Haz clic en el botón de Google
3. Selecciona tu cuenta de Google
4. Deberías ser redirigido a la app con tu perfil creado automáticamente

## Solución de Problemas

### Error: "auth/unauthorized-domain"
- Ve a Firebase Console > Authentication > Settings > Authorized domains
- Agrega el dominio desde el que estás probando (ej: `localhost`, `127.0.0.1`)

### Error: "auth/popup-blocked"
- Permite las ventanas emergentes en tu navegador para el sitio

### Error: "auth/invalid-api-key"
- Verifica que copiaste correctamente todos los valores de firebaseConfig
- Asegúrate de no tener espacios extra o comillas mal cerradas

### La ventana de Google no aparece
- Verifica la consola del navegador (F12) para ver errores
- Asegúrate de que Google Sign-In esté habilitado en Firebase Console

## Seguridad

⚠️ **IMPORTANTE**: 
- Los valores de `firebaseConfig` son seguros para usar en el cliente
- Firebase usa reglas de seguridad del lado del servidor para proteger tus datos
- Nunca compartas tu "Service Account Key" (diferente a firebaseConfig)

## Próximos Pasos

Una vez que Google Sign-In funcione:
1. Puedes agregar más proveedores (Facebook, Apple, Email/Password)
2. Configurar Firestore para guardar datos de usuarios
3. Implementar reglas de seguridad de Firestore

## Recursos Adicionales

- [Documentación de Firebase Authentication](https://firebase.google.com/docs/auth)
- [Guía de Google Sign-In](https://firebase.google.com/docs/auth/web/google-signin)
