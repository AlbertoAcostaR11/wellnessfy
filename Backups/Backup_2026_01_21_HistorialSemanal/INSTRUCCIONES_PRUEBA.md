# 🧪 Instrucciones de Prueba - Google Health Sync

## Preparación

### 1. Asegúrate de tener datos en Google Fit
- Abre Google Fit en tu teléfono
- Camina al menos 100 pasos
- Espera 2-3 minutos para que se sincronicen con Google

### 2. Verifica que el navegador permita popups
- Ve a la configuración del navegador
- Asegúrate de que los popups estén permitidos para tu dominio

---

## Prueba 1: Primera Sincronización

### Pasos:
1. Abre la aplicación Wellnessfy
2. Ve a la página "Actividad"
3. Abre la consola del navegador (F12)
4. Haz clic en el botón "Sincronizar"

### Resultado Esperado:
- ✅ Aparece un popup de Google pidiendo permisos
- ✅ Aceptas los permisos
- ✅ El botón muestra "Sincronizando..." con un spinner
- ✅ En consola ves: `✅ Token de acceso recibido`
- ✅ En consola ves: `📊 Obteniendo datos de fitness...`
- ✅ Los datos aparecen en las tarjetas (pasos, calorías, etc.)
- ✅ El botón cambia a verde y muestra "Sincronizado ✓"
- ✅ Aparece un toast: "✅ Sincronizado: X pasos"

### Si algo falla:
- Revisa los logs en consola
- Busca mensajes con ❌ o ⚠️
- Consulta `GOOGLE_HEALTH_DIAGNOSTICO.md`

---

## Prueba 2: Persistencia del Token

### Pasos:
1. Después de la Prueba 1, recarga la página (F5)
2. Ve a la página "Actividad"
3. Observa la consola

### Resultado Esperado:
- ✅ En consola ves: `✅ Token de Google Health cargado desde localStorage`
- ✅ En consola ves: `🔄 Sincronización automática iniciada...`
- ✅ Los datos se cargan automáticamente SIN pedir permisos
- ✅ El indicador "Última sync" muestra "Hace un momento"

### Si algo falla:
- Verifica en consola: `localStorage.getItem('google_health_token')`
- Debe retornar un string largo, no `null`

---

## Prueba 3: Sincronización Manual con Token Guardado

### Pasos:
1. Después de la Prueba 2, espera 1 minuto
2. Haz clic en "Sincronizar" nuevamente

### Resultado Esperado:
- ✅ En consola ves: `✅ Usando token existente`
- ✅ NO aparece el popup de Google
- ✅ Los datos se actualizan directamente
- ✅ El indicador "Última sync" se actualiza

---

## Prueba 4: Página de Diagnóstico

### Pasos:
1. Abre `test-google-health.html` en el navegador
2. Haz clic en todos los botones

### Resultado Esperado:
- ✅ "Google SDK: ✅ Cargado" (puede ser ❌ en esta página, es normal)
- ✅ "Token: ✅ Válido"
- ✅ Se muestra la fecha de expiración del token
- ✅ Se muestran los datos de actividad

---

## Prueba 5: Manejo de Errores

### Prueba 5.1: Token Expirado

**Pasos:**
1. En consola, ejecuta:
   ```javascript
   localStorage.setItem('google_health_token_expiry', '0');
   ```
2. Recarga la página
3. Ve a "Actividad"
4. Haz clic en "Sincronizar"

**Resultado Esperado:**
- ✅ En consola ves: `⚠️ Token expirado, se requiere nueva autenticación`
- ✅ Aparece el popup de Google pidiendo permisos nuevamente

### Prueba 5.2: Sin Datos

**Pasos:**
1. Si no tienes datos en Google Fit
2. Haz clic en "Sincronizar"

**Resultado Esperado:**
- ✅ En consola ves: `⚠️ No se encontraron datos en los buckets`
- ✅ Los valores muestran "0" o "--"
- ✅ No hay errores, solo advertencias

---

## Prueba 6: Limpieza y Reinicio

### Pasos:
1. En consola, ejecuta:
   ```javascript
   localStorage.removeItem('google_health_token');
   localStorage.removeItem('google_health_token_expiry');
   localStorage.removeItem('last_health_sync');
   location.reload();
   ```
2. Ve a "Actividad"
3. Haz clic en "Sincronizar"

### Resultado Esperado:
- ✅ Aparece el popup de Google (como si fuera la primera vez)
- ✅ Después de aceptar, todo funciona normalmente

---

## Comandos Útiles para la Consola

### Ver estado actual
```javascript
console.log('Token:', localStorage.getItem('google_health_token') ? 'Existe' : 'No existe');
console.log('Expira:', new Date(parseInt(localStorage.getItem('google_health_token_expiry'))).toLocaleString());
console.log('Última sync:', new Date(parseInt(localStorage.getItem('last_health_sync'))).toLocaleString());
```

### Ver datos de actividad
```javascript
const user = JSON.parse(localStorage.getItem('wellnessfy_user'));
console.table(user.stats);
```

### Forzar expiración del token
```javascript
localStorage.setItem('google_health_token_expiry', '0');
```

### Limpiar todo
```javascript
localStorage.clear();
location.reload();
```

---

## Checklist de Verificación

Marca cada item cuando lo hayas verificado:

- [ ] Primera sincronización funciona
- [ ] El token se guarda en localStorage
- [ ] Al recargar, el token se carga automáticamente
- [ ] La sincronización automática funciona
- [ ] Los datos aparecen en las tarjetas
- [ ] El indicador "Última sync" se actualiza
- [ ] Los logs en consola son claros y útiles
- [ ] El botón muestra el estado correcto (spinner, verde, rojo)
- [ ] Los toasts aparecen con mensajes claros
- [ ] El manejo de errores funciona (token expirado, sin datos, etc.)

---

## Problemas Comunes

### "Google SDK: ❌ No cargado"
**Solución:** Espera unos segundos y recarga. El script se carga de forma asíncrona.

### "No se encontraron datos en los buckets"
**Solución:** Asegúrate de tener datos en Google Fit. Camina un poco y espera 2-3 minutos.

### "HTTP 403: Forbidden"
**Solución:** Verifica que el CLIENT_ID sea correcto y que la API de Google Fit esté habilitada.

### El popup de Google no aparece
**Solución:** 
1. Desactiva el bloqueador de popups
2. Verifica en consola si hay errores
3. Recarga la página completamente (Ctrl+F5)

### Los datos no se actualizan
**Solución:**
1. Verifica en consola si hay errores
2. Limpia el token y vuelve a sincronizar
3. Verifica que tengas datos en Google Fit

---

## Siguiente Paso

Una vez que todas las pruebas pasen:

1. ✅ Marca este documento como completado
2. 📝 Documenta cualquier problema encontrado
3. 🚀 Despliega a producción si todo funciona

**¡Buena suerte con las pruebas!** 🎉
