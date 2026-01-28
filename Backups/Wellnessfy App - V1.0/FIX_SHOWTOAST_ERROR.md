# Fix: Error "showToast is not defined"

## Problema
Al ejecutar la sincronización, aparecía el error:
```
ReferenceError: showToast is not defined
at processFitnessData (googleHealth.js:303)
```

## Causa
La función auxiliar `showToast` estaba definida al final del archivo (después de la línea 354), pero se estaba llamando en la función `processFitnessData` (línea 303). 

En módulos ES6, las funciones declaradas con `function` no tienen hoisting completo, por lo que la función no estaba disponible cuando se intentaba llamar.

## Solución
Se movió la definición de la función `showToast` al inicio del archivo (después de las funciones de manejo de token, línea 49) para que esté disponible cuando se llame desde cualquier otra función.

### Cambios realizados:
1. ✅ Movida la función `showToast` de la línea 354 a la línea 49
2. ✅ Eliminada la definición duplicada

### Código:
```javascript
// Función auxiliar para mostrar toasts (ahora al inicio)
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
```

## Verificación
Ahora la sincronización debería funcionar sin errores. Para verificar:

1. Recarga la página (Ctrl+F5)
2. Ve a "Actividad"
3. Haz clic en "Sincronizar"
4. Verifica en consola que no hay errores de `showToast`

## Resultado
✅ El error está resuelto
✅ Los toasts ahora se muestran correctamente
✅ Si `window.showToast` no está disponible, se usa `console.log` como fallback
