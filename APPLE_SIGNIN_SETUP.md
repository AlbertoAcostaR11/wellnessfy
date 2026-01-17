# Configuración de Apple Sign-In para Wellnessfy

## Requisitos Previos

Para usar Apple Sign-In necesitas:
- Una cuenta de Apple Developer (de pago, $99/año)
- Un Service ID configurado en Apple Developer
- Firebase Authentication configurado

## Paso 1: Configurar en Apple Developer

### 1.1 Crear un App ID

1. Ve a [Apple Developer Console](https://developer.apple.com/account/)
2. Ve a **Certificates, Identifiers & Profiles**
3. Selecciona **Identifiers** en el menú lateral
4. Haz clic en el botón **+** para crear un nuevo identificador
5. Selecciona **App IDs** y continúa
6. Configura:
   - **Description**: Wellnessfy
   - **Bundle ID**: `com.tudominio.wellnessfy` (usa tu dominio)
7. En **Capabilities**, marca **Sign In with Apple**
8. Haz clic en **Continue** y luego **Register**

### 1.2 Crear un Service ID

1. En **Identifiers**, haz clic en **+** nuevamente
2. Selecciona **Services IDs** y continúa
3. Configura:
   - **Description**: Wellnessfy Web
   - **Identifier**: `com.tudominio.wellnessfy.web`
4. Marca **Sign In with Apple**
5. Haz clic en **Configure** junto a Sign In with Apple
6. Configura:
   - **Primary App ID**: Selecciona el App ID que creaste
   - **Website URLs**:
     - **Domains**: Agrega tu dominio (ej: `tudominio.com`)
     - **Return URLs**: Agrega `https://TU_PROJECT_ID.firebaseapp.com/__/auth/handler`
       - Reemplaza `TU_PROJECT_ID` con tu ID de proyecto de Firebase
7. Haz clic en **Save**, luego **Continue** y **Register**

### 1.3 Crear una Key

1. Ve a **Keys** en el menú lateral
2. Haz clic en **+** para crear una nueva key
3. Configura:
   - **Key Name**: Wellnessfy Sign In Key
   - Marca **Sign In with Apple**
4. Haz clic en **Configure** junto a Sign In with Apple
5. Selecciona tu **Primary App ID**
6. Haz clic en **Save**, luego **Continue** y **Register**
7. **IMPORTANTE**: Descarga la key (.p8 file) - solo puedes hacerlo una vez
8. Anota el **Key ID** que se muestra

## Paso 2: Configurar en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Authentication > Sign-in method**
4. Haz clic en **Apple** en la lista de proveedores
5. Activa el toggle **Enable**
6. Configura:
   - **Service ID**: `com.tudominio.wellnessfy.web` (el que creaste)
   - **Apple Team ID**: Encuéntralo en Apple Developer > Membership
   - **Key ID**: El ID de la key que creaste
   - **Private Key**: Abre el archivo .p8 y copia todo el contenido
7. Haz clic en **Save**

## Paso 3: Configurar OAuth Redirect Domain

1. En Firebase Console > Authentication > Settings > Authorized domains
2. Asegúrate de que tu dominio esté agregado
3. Para desarrollo local, `localhost` debería estar ya incluido

## Paso 4: Probar la Integración

1. Abre `login.html` en tu navegador
2. Haz clic en el botón de Apple
3. Inicia sesión con tu Apple ID
4. Deberías ser redirigido a la app

## Notas Importantes

### Privacidad de Email

Apple permite a los usuarios ocultar su email real. En ese caso, Apple proporciona un email relay como:
- `abc123@privaterelay.appleid.com`

Tu app debe manejar esto correctamente.

### Nombre del Usuario

Apple solo proporciona el nombre completo del usuario en el **primer inicio de sesión**. En inicios de sesión subsecuentes, el nombre no estará disponible. Por eso el código guarda el nombre en localStorage.

### Testing

- Para testing en localhost, necesitas configurar el dominio en Apple Developer
- Apple Sign-In requiere HTTPS en producción
- En desarrollo, localhost funciona sin HTTPS

## Solución de Problemas

### Error: "operation-not-allowed"
- Verifica que Apple Sign-In esté habilitado en Firebase Console
- Asegúrate de haber configurado correctamente el Service ID

### Error: "unauthorized-domain"
- Agrega tu dominio en Firebase Console > Authentication > Settings > Authorized domains
- Verifica que el Return URL en Apple Developer coincida con Firebase

### Error: "invalid-oauth-client-id"
- Verifica que el Service ID en Firebase coincida con el de Apple Developer
- Asegúrate de haber copiado correctamente la Private Key

### El popup no aparece
- Verifica que las ventanas emergentes no estén bloqueadas
- Revisa la consola del navegador para errores

## Limitaciones

- **Requiere cuenta de Apple Developer de pago** ($99/año)
- Solo funciona en dispositivos/navegadores que soporten Apple Sign-In
- El nombre del usuario solo está disponible en el primer login

## Alternativa para Testing

Si no tienes una cuenta de Apple Developer, puedes:
1. Comentar el código de Apple Sign-In temporalmente
2. Usar solo Google Sign-In para desarrollo
3. Mostrar un mensaje "Coming soon" para Apple

## Recursos Adicionales

- [Firebase Apple Sign-In Docs](https://firebase.google.com/docs/auth/web/apple)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Configure Sign In with Apple](https://help.apple.com/developer-account/#/dev1c0e25352)
