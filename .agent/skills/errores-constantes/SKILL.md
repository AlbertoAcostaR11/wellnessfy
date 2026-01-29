---
name: Errores_Constantes
description: Skill para el análisis forense de errores recurrentes, fallos de sintaxis por refactorización y estados de "Código Fantasma".
---

# Skill: Errores Constantes 🕵️‍♂️

Este Skill se activa obligatoriamente cuando ocurre un error que "ya ha pasado antes", especialmente pantallas negras, fallos de carga o errores de sintaxis tras una edición.

## Protocolo de Análisis Forense
Cada vez que se detecte un error recurrente, se debe responder a las siguientes preguntas ANTES de proponer una solución:

1.  **¿Qué situaciones similares han pasado y cómo se han corregido?**
2.  **¿Cuántas situaciones similares han pasado?** (Mencionar mínimo 5 con breves detalles).
3.  **¿Cómo se solucionaron específicamente?** (¿Fue una llave, un import, un scope?).
4.  **¿Esta situación se parece a una anterior?** (Identificar el patrón exacto).
5.  **¿Cómo se corrige?** (Explicación técnica de la corrección real).
6.  **¿Por qué estoy tan seguro?** (Evidencia en el código o logs).

---

## 📚 Biblioteca de Errores Recurrentes (Error Library)

### Error #1: El "Cierre Ignorado" (Missing Brace/Unexpected End of Input)
*   **Síntomas:** Pantalla negra, error en consola `Uncaught SyntaxError: Unexpected end of input`.
*   **Causa Raíz:** Al usar `replace_file_content` o `multi_replace_file_content` para inyectar lógica al final de una sección, se toma la llave de cierre `};` de una función anterior como ancla (Target) pero se omite en el reemplazo (Replacement).
*   **Ejemplo:** `src/pages/activity.js` (29-01-2026). Se borró el cierre de la función `fmt`.
*   **Solución:** Revisar visualmente los cierres de todas las funciones editadas recientemente. Siempre incluir el cierre de la función precedente en el bloque de reemplazo.

### Error #2: El "Scope Roto" (ReferenceError tras Refactorización)
*   **Síntomas:** Error en consola `ReferenceError: [variable] is not defined`.
*   **Causa Raíz:** Se mueve un bloque de código HTML (template string) de una función principal a una función auxiliar (Helper) para "limpiar", pero el bloque movido dependía de variables locales (o closures) que no fueron pasadas como argumentos.
*   **Ejemplo:** `renderStatsGrid` movido fuera de `renderResumenTab`. Perdió acceso a `fmt` y `todayISO`.
*   **Solución:** Pasar todas las dependencias necesarias como argumentos o re-definir las variables de utilidad dentro del nuevo scope del helper.

### Error #3: El "Código Zombi" (Duplicación por Reemplazo Incompleto)
*   **Síntomas:** Errores extraños de funciones duplicadas o comportamiento errático.
*   **Causa Raíz:** La herramienta de reemplazo inserta el nuevo código pero deja parte del código antiguo "colgando" debajo porque el `TargetContent` no abarcó el bloque completo original.
*   **Solución:** Usar `view_file` inmediatamente después de un edit para confirmar que la estructura del archivo es coherente.

### Error #4: El "Cache de Despliegue" (Stale Production Files)
*   **Síntomas:** Arreglo local funciona, pero en producción el error persiste tras `firebase deploy`.
*   **Causa Raíz:** Caching de Firebase Hosting o Service Worker de la PWA que no se actualiza inmediatamente.
*   **Solución:** Forzar Hard Refresh (Ctrl+F5) y verificar el timestamp del despliegue.

### Error #5: El "Módulo Inalcanzable" (Module Import Conflicts)
*   **Síntomas:** `Uncaught TypeError: Failed to resolve module specifier`.
*   **Causa Raíz:** Rutas relativas (`../`) incorrectas al mover archivos o usar imports dinámicos dentro de funciones anidadas.
*   **Solución:** Verificar siempre el path real del archivo importado respecto al archivo actual.
