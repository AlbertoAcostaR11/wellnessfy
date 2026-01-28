# 🔄 Sistema de Reconexión Automática

## 📋 Descripción

Sistema inteligente que monitorea la conexión con proveedores de salud (Fitbit/Google Fit) y maneja automáticamente la reconexión cuando el token expira o se pierde la conexión.

---

## 🎯 **¿Qué Pasa si Fitbit se Desconecta?**

### **Escenarios de Desconexión**

| Escenario | Causa | Qué Pasa | Solución |
|-----------|-------|----------|----------|
| **Token Expirado** | Los tokens OAuth expiran (Fitbit: ~8h, Google Fit: ~1h) | ❌ No puedes sincronizar NUEVAS actividades<br>✅ Actividades guardadas siguen disponibles<br>✅ Progreso de desafíos se mantiene | 🔄 Refresh Token (automático)<br>🔐 Re-autenticación (manual) |
| **Permisos Revocados** | Usuario revoca acceso en Fitbit.com | ❌ Token inválido permanentemente<br>✅ Actividades guardadas siguen disponibles | 🔐 Re-autenticación completa |
| **Error de Red** | Conexión a internet perdida | ⏳ Sincronización falla temporalmente<br>✅ Actividades guardadas siguen disponibles | 🔄 Retry automático |

---

## 🔧 **Cómo Funciona la Reconexión Automática**

### **1. Monitoreo Periódico**

```
┌─────────────────────────────────────────────────────────┐
│  SISTEMA DE MONITOREO                                   │
├─────────────────────────────────────────────────────────┤
│  • Verifica cada 5 minutos el estado del token         │
│  • Detecta si el token expirará en los próximos 30min │
│  • Intenta renovar automáticamente                     │
│  • Si falla, muestra prompt al usuario                 │
└─────────────────────────────────────────────────────────┘
```

### **2. Flujo de Reconexión**

```
┌─────────────────────────────────────────────────────────┐
│  PASO 1: Detección                                      │
├─────────────────────────────────────────────────────────┤
│  ⏰ Token expirará en 25 minutos                        │
│  🔍 Sistema detecta: isTokenExpiringSoon() = true      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 2: Intento Automático                            │
├─────────────────────────────────────────────────────────┤
│  🔄 Intenta: provider.refreshToken()                    │
│  ❌ Fitbit no soporta refresh (Implicit Flow)          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 3: Prompt al Usuario                             │
├─────────────────────────────────────────────────────────┤
│  ⚠️ Muestra notificación visual                         │
│  📱 "Tu sesión ha expirado. Reconecta ahora"           │
│  🔘 Botón: "Reconectar Ahora"                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  PASO 4: Re-autenticación                              │
├─────────────────────────────────────────────────────────┤
│  🔐 Usuario hace clic en "Reconectar"                  │
│  🪟 Abre popup de Fitbit OAuth                         │
│  ✅ Obtiene nuevo token                                │
│  🔄 Sincroniza automáticamente                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **Configuración**

```javascript
const RECONNECTION_CONFIG = {
    // Intentar reconectar automáticamente
    autoReconnect: true,
    
    // Tiempo antes de expiración para renovar (30 minutos)
    renewBeforeExpiry: 30 * 60 * 1000,
    
    // Intervalo de verificación (5 minutos)
    checkInterval: 5 * 60 * 1000,
    
    // Máximo de intentos automáticos
    maxRetries: 3,
    
    // Tiempo entre reintentos (2 segundos)
    retryDelay: 2000
};
```

---

## 🎨 **Interfaz de Usuario**

### **Prompt de Reconexión**

Cuando el token expira, aparece una notificación elegante:

```
┌──────────────────────────────────────────────┐
│  ⚠️  Reconexión Necesaria                    │
│                                              │
│  Tu sesión con Fitbit ha expirado.          │
│  Reconecta para seguir sincronizando.       │
│                                              │
│  [Reconectar Ahora]  [Más Tarde]      [×]   │
└──────────────────────────────────────────────┘
```

**Características:**
- ✅ Diseño consistente con la app
- ✅ Auto-dismiss después de 30 segundos
- ✅ No bloquea la UI
- ✅ Un solo prompt a la vez

---

## 🔧 **API del Sistema**

### **Iniciar Monitoreo**

```javascript
import { startConnectionMonitoring } from './utils/autoReconnection.js';

// Iniciar monitoreo automático
startConnectionMonitoring();
// → Verifica cada 5 minutos
// → Muestra prompts cuando sea necesario
```

### **Detener Monitoreo**

```javascript
import { stopConnectionMonitoring } from './utils/autoReconnection.js';

// Detener monitoreo
stopConnectionMonitoring();
```

### **Verificar Manualmente**

```javascript
import { checkConnection } from './utils/autoReconnection.js';

// Verificar conexión ahora
await checkConnection();
```

### **Obtener Estado**

```javascript
import { getReconnectionState } from './utils/autoReconnection.js';

const state = getReconnectionState();
console.log(state);
// {
//   isChecking: false,
//   lastCheck: 1768940000000,
//   retryCount: 0,
//   isMonitoring: true,
//   config: { ... }
// }
```

---

## 🔄 **Integración**

### **En `main.js`**

```javascript
// Al autenticarse
const { startConnectionMonitoring } = await import('./utils/autoReconnection.js');
startConnectionMonitoring();
```

**Qué hace:**
- Inicia el monitoreo automático
- Verifica cada 5 minutos
- Muestra prompts cuando sea necesario

---

## 💡 **Casos de Uso**

### **Caso 1: Token Próximo a Expirar**

```javascript
// T = 0: Usuario se autentica
// Token válido hasta T + 8 horas

// T + 7h 30min: Sistema detecta
console.log('⏰ Token expirará en 30 minutos');

// T + 7h 30min: Intenta refresh
// ❌ Fitbit no soporta refresh

// T + 7h 30min: Muestra prompt
showReconnectionPrompt('fitbit');

// Usuario hace clic en "Reconectar Ahora"
await reconnectProvider('fitbit');
// ✅ Nuevo token obtenido
```

### **Caso 2: Usuario Ignora Prompt**

```javascript
// Sistema muestra prompt
showReconnectionPrompt('fitbit');

// Usuario hace clic en "Más Tarde"
dismissReconnectionPrompt();

// 5 minutos después: Sistema verifica de nuevo
// Token aún próximo a expirar
// Muestra prompt nuevamente (hasta 3 veces)
```

### **Caso 3: Token Ya Expirado**

```javascript
// Usuario intenta sincronizar
await syncHealthData();

// Error: Token expirado
// Sistema detecta y muestra prompt inmediatamente
showReconnectionPrompt('fitbit');
```

---

## 🛡️ **Ventajas del Sistema**

### **Para el Usuario**

✅ **No pierde datos**: Actividades guardadas siguen disponibles
✅ **Reconexión fácil**: Un clic para reconectar
✅ **Notificaciones claras**: Sabe exactamente qué hacer
✅ **No intrusivo**: Prompt elegante, no bloquea la UI

### **Para el Desarrollador**

✅ **Automático**: Se inicia solo al autenticarse
✅ **Configurable**: Fácil ajustar tiempos y comportamiento
✅ **Extensible**: Fácil agregar soporte para más proveedores
✅ **Robusto**: Maneja errores gracefully

---

## 🔮 **Mejoras Futuras**

### **Refresh Token para Fitbit**

Fitbit usa **Implicit Flow** (solo Access Token). Para soporte completo de refresh automático, necesitaríamos:

1. **Cambiar a Authorization Code Flow**
   ```javascript
   // Requiere backend para manejar client_secret
   response_type: 'code' // En lugar de 'token'
   ```

2. **Implementar Refresh Endpoint**
   ```javascript
   async refreshToken() {
       const response = await fetch(this.tokenUrl, {
           method: 'POST',
           body: new URLSearchParams({
               grant_type: 'refresh_token',
               refresh_token: this.refreshToken
           })
       });
       // Guardar nuevo access_token
   }
   ```

3. **Beneficios**
   - ✅ Reconexión 100% automática
   - ✅ Sin intervención del usuario
   - ✅ Experiencia más fluida

### **Sincronización en Background**

```javascript
// Service Worker para sincronizar en background
navigator.serviceWorker.register('/sync-worker.js');

// Programar sincronización periódica
navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('sync-health-data');
});
```

### **Notificaciones Push**

```javascript
// Notificar al usuario cuando se necesite reconectar
new Notification('Wellnessfy', {
    body: 'Tu sesión con Fitbit ha expirado. Toca para reconectar.',
    icon: '/logo-icon.png',
    tag: 'reconnection-needed'
});
```

---

## 🧪 **Testing**

### **Simular Token Expirado**

```javascript
// En consola del navegador
localStorage.setItem('fitbit_token_expiry', Date.now() + 60000); // Expira en 1 minuto

// Esperar 1 minuto
// → Sistema detectará y mostrará prompt
```

### **Forzar Verificación**

```javascript
const { checkConnection } = await import('./utils/autoReconnection.js');
await checkConnection();
```

### **Ver Estado**

```javascript
const { getReconnectionState } = await import('./utils/autoReconnection.js');
console.table(getReconnectionState());
```

---

## ✅ **Checklist de Implementación**

- [x] Crear `autoReconnection.js`
- [x] Implementar monitoreo periódico
- [x] Implementar detección de expiración
- [x] Crear prompt visual
- [x] Integrar en `main.js`
- [ ] Probar con token próximo a expirar
- [ ] Probar reconexión manual
- [ ] Verificar que no se muestren múltiples prompts
- [ ] Confirmar que actividades persisten durante desconexión

---

## 📚 **Documentos Relacionados**

- `SISTEMA_PERSISTENCIA_ACTIVIDADES.md` - Cómo se guardan las actividades
- `SISTEMA_PROGRESO_DESAFIOS.md` - Cómo se calcula el progreso
- `src/utils/autoReconnection.js` - Código del sistema
- `src/utils/activityPersistence.js` - Persistencia de actividades
