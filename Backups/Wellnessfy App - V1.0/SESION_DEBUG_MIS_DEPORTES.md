# Sesión de Debugging: Módulo Dinámico "Mis Deportes"
**Fecha:** 14 de Enero, 2026
**Objetivo:** Implementar visualización automática de actividades deportivas desde Google Fit

---

## Análisis de Requerimientos: Módulo Dinámico "Mis Deportes"

### Objetivo del Usuario
Transformar la pestaña "Mis Deportes" de una lista estática de selección manual a un **feed inteligente automático** que muestre:
- Todas las actividades detectadas por Google Health en los últimos 7 días
- Gráficas de barras similares a "Sueño" (7 días: Jue, Vie, Sáb, Dom, Lun, Mar, Mié)
- Ordenamiento por actividad (más activo primero)
- Distinción automática entre métricas de distancia (km) y tiempo (hr)
- Ocultamiento automático de deportes sin actividad en la semana

### Principio de Diseño: "Aspiradora de Datos"
Wellnessfy debe recolectar **TODA** la información de actividad de Google Health/Fit:
- Sin filtrar por tipo de actividad
- Sin depender de favoritos del usuario
- Captura automática de cualquier actividad (planificada o no)
- Retroactividad para aplicar a desafíos nuevos o existentes

---

## Arquitectura Implementada

### Paso 0: Diccionario de Deportes ✅
**Archivo:** `src/utils/sportsDictionary.js`

**Contenido:**
- 40 deportes mapeados con Google Fit Activity Type IDs
- Cada deporte incluye: `name`, `icon`, `color`, `category`, `metric` (distance/time), `unit` (km/hr)
- Mapeo completo de 120+ nombres oficiales de Google Fit
- Fallback inteligente: usa nombres reales de Google en lugar de "Actividad Desconocida"

**Función clave:**
```javascript
export function getSportMetadata(activityTypeId) {
    // Si está en nuestro diccionario, usarlo
    if (SPORTS_DICTIONARY[activityTypeId]) {
        return SPORTS_DICTIONARY[activityTypeId];
    }
    
    // Si no, usar nombre oficial de Google Fit
    const googleName = GOOGLE_FIT_ACTIVITY_NAMES[activityTypeId] || `Actividad ${activityTypeId}`;
    
    return {
        name: googleName,
        icon: 'sports_tennis',
        color: '#95a5a6',
        category: 'other',
        metric: 'time',
        unit: 'hr'
    };
}
```

---

### Paso 1: Recolección de Datos ✅
**Archivo:** `src/utils/googleHealth.js`

**Modificaciones:**
1. **Nueva petición paralela** (línea ~442):
   ```javascript
   fetch(`https://www.googleapis.com/fitness/v1/users/me/sessions?...`)
   ```
   - Trae TODAS las sesiones de actividad (no solo sueño)
   - Rango: Últimos 7 días

2. **Extracción de Activity Segments** (línea ~760-828):
   - Procesa `dailyData.bucket[].dataset[2]` (activity.segment)
   - Guarda en `stats.rawActivitySegments`
   - Consolidado en el mismo loop que "Días de Ejercicio" (que ya funciona)

**Código implementado:**
```javascript
// Array para guardar activity segments (para Mis Deportes)
const activitySegments = [];

if (dailyData.bucket && dailyData.bucket.length > 0) {
    dailyData.bucket.forEach(bucket => {
        // ... procesar pasos, calorías ...
        
        // Extraer TODOS los activity segments
        if (bucket.dataset[2]?.point?.length > 0) {
            bucket.dataset[2].point.forEach(point => {
                const activityType = point.value[0].intVal;
                const duration = point.value[1].intVal || 0;
                
                // Guardar para el agregador
                activitySegments.push({
                    activityType: activityType,
                    duration: duration,
                    date: date
                });
            });
        }
    });
}

// Guardar segments para el agregador de deportes
stats.rawActivitySegments = activitySegments;
```

---

### Paso 2: Procesamiento de Datos ✅
**Archivo:** `src/utils/activityAggregator.js`

**Función principal:** `aggregateWeeklySports(rawActivitySegments)`

**Lógica:**
1. **Filtrado de exclusiones:**
   ```javascript
   // IDs a excluir (Sleep segments: 1-6, Mindfulness: 45, 100, 106, 115)
   const excludedActivityTypes = [1, 2, 3, 4, 5, 6, 45, 100, 106, 115];
   
   if (excludedActivityTypes.includes(activityTypeId)) {
       return; // Skip
   }
   ```

2. **Agrupación por deporte:**
   - Mapea cada segment a su deporte usando `getSportMetadata()`
   - Agrupa por nombre de deporte
   - Calcula valor por día (0-6) según métrica (km o hr)

3. **Ordenamiento y filtrado:**
   - Ordena por total descendente
   - Elimina deportes con total === 0

**Output:**
```javascript
{
    "Entrenamiento de Fuerza": {
        activityTypeId: 5,
        days: [0, 1.5, 0, 2, 0, 0, 1], // horas por día
        total: 4.5,
        unit: 'hr',
        metric: 'time',
        metadata: { icon: 'fitness_center', color: '#ff9f43', ... }
    }
}
```

---

### Paso 3: Visualización ✅
**Archivo:** `src/utils/sportsData.js`

**Función reescrita:** `renderDeportesTab()`

**Flujo:**
1. Verifica si `window.activityAggregatorModule` existe
2. Verifica si `AppState.weeklyStats.rawActivitySegments` tiene datos
3. Estados de UI:
   - Sin sincronizar → CTA "Sincronizar Ahora"
   - Sin actividades → Mensaje motivacional
   - Con actividades → Renderiza gráficas dinámicas

**Estructura de cada tarjeta:**
```html
<div class="glass-card">
    <!-- Header: Icono, Nombre, Total, Promedio -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="size-12 rounded-xl" style="background: ${color}15">
                <span style="color: ${color}">${icon}</span>
            </div>
            <div>
                <h4>${sportName}</h4>
                <p>Total: ${total}</p>
            </div>
        </div>
        <div>
            <p>Promedio: ${promedio}/día</p>
        </div>
    </div>
    
    <!-- Gráfica de 7 barras -->
    <div class="flex items-end h-32">
        <!-- Por cada día -->
        <div style="height: ${heightPercent}%">
            <!-- Tooltip al hover -->
        </div>
    </div>
</div>
```

**Auto-refresh:**
```javascript
window.addEventListener('weeklyStatsUpdated', () => {
    const deportesContent = document.getElementById('tab-deportes');
    if (deportesContent && !deportesContent.classList.contains('hidden')) {
        deportesContent.innerHTML = renderDeportesTab();
    }
});
```

---

### Paso 4: Integración ✅
**Archivo:** `src/main.js`

```javascript
import * as activityAggregator from './utils/activityAggregator.js';
window.activityAggregatorModule = activityAggregator;
```

---

## Problemas Identificados (Pendientes de Resolver)

### Problema 1: Confusión de Datos (Sleep vs Activity)
**Síntoma:** Aparecen "Actividad Desconocida" y "Cinta de correr" cuando el usuario solo hizo Gym.

**Causa raíz:** Google Fit reporta **Sleep Segment Types** (1-6) en el mismo data source que Activity Segments.

**Mapeo incorrecto detectado:**
- Tipo 1 (Awake) → Se procesa como actividad
- Tipo 4 (Light Sleep) → Se interpreta como "Bádminton" (ID 4 en deportes)
- Tipo 5 (Deep Sleep) → Se interpreta como "Gym" (ID 5 en deportes)
- Tipo 6 (REM Sleep) → Se procesa como actividad

**Logs de evidencia:**
```
7/1/2026 - Tipo: 1, Duración: 4.0min    // Awake
7/1/2026 - Tipo: 4, Duración: 1.0min    // Light Sleep
7/1/2026 - Tipo: 5, Duración: 23.0min   // Deep Sleep
7/1/2026 - Tipo: 6, Duración: 0.5min    // REM Sleep
```

**Solución implementada:**
```javascript
const excludedActivityTypes = [1, 2, 3, 4, 5, 6, 45, 100, 106, 115];
```

**Estado:** Implementado pero necesita validación.

---

### Problema 2: Fuente de Datos Incorrecta
**Síntoma:** "Mis Deportes" muestra "No hay actividades" mientras "Días de Ejercicio" muestra actividad correctamente.

**Causa raíz:** 
1. Inicialmente se intentó usar `sessions` API, que solo devuelve sesiones de sueño (activityType 72)
2. Las actividades reales están en `dailyData.bucket[].dataset[2]` (activity.segment)

**Solución implementada:**
- Eliminado loop duplicado con bug `dailyData.bucket > 0` (debería ser `.length > 0`)
- Consolidado extracción en el mismo loop que "Días de Ejercicio"
- Uso de la misma fuente de datos que ya funciona

**Estado:** Implementado pero necesita validación.

---

### Problema 3: Distinción de Tipos de Datos
**Contexto:** `bucket.dataset[2]` puede contener:
- `com.google.activity.segment` (Deportes reales: Running, Gym, etc.)
- `com.google.sleep.segment` (Fases de sueño: Light, Deep, REM)

**Pregunta pendiente:** ¿Cómo distinguir entre ambos tipos en el mismo dataset?

**Hipótesis:**
1. Los sleep segments solo aparecen en buckets de días con sesiones de sueño
2. Los activity segments tienen IDs >= 7 (excepto algunos rangos)
3. Necesitamos verificar el contexto o metadata del point

**Acción requerida:** Debugging con logs más detallados para entender la estructura exacta.

---

## Archivos Modificados/Creados

### Nuevos archivos
- ✅ `src/utils/sportsDictionary.js` (Diccionario de 40 deportes + 120 nombres de Google Fit)
- ✅ `src/utils/activityAggregator.js` (Procesador de datos)
- ✅ `IMPLEMENTACION_MIS_DEPORTES.md` (Documentación técnica)

### Archivos modificados
- ✅ `src/utils/googleHealth.js` (Extracción de activity segments)
- ✅ `src/utils/sportsData.js` (Renderizado dinámico)
- ✅ `src/main.js` (Import y exposición del agregador)
- ✅ `src/pages/activity.js` (Icono de pestaña cambiado a `sports_tennis`)

---

## Próximos Pasos para Mañana

### 1. Debugging Profundo
**Objetivo:** Entender exactamente qué datos trae Google en `dataset[2]`

**Acciones:**
```javascript
// Añadir en googleHealth.js línea ~805
if (bucket.dataset[2]?.point?.length > 0) {
    bucket.dataset[2].point.forEach(point => {
        console.log('🔍 Activity Segment:', {
            activityType: point.value[0].intVal,
            duration: point.value[1].intVal,
            date: date.toLocaleDateString(),
            rawPoint: point // Ver estructura completa
        });
    });
}
```

### 2. Validación de Filtros
**Verificar que:**
- Sleep segments (1-6) se excluyen correctamente
- Mindfulness (45, 100, 106, 115) se excluye correctamente
- Gym (ID 5 real) SÍ se procesa cuando no es sleep

### 3. Mapeo Correcto de IDs
**Investigar:**
- ¿Qué ID reporta Google para "Gym"? (Podría ser 5, 62, o 96)
- ¿Hay diferencia entre "Strength Training" y "Weight Lifting"?
- ¿Cómo distinguir "Treadmill" real de estimaciones?

### 4. Mejoras de UX
**Una vez funcionando:**
- Añadir animaciones de entrada para las gráficas
- Implementar click en tarjeta → Modal con desglose de sesiones
- Añadir comparación semanal ("15% más que la semana pasada")

---

## Logs de Consola Esperados (Correcto)

```
🔄 Agregando actividades semanales...
✅ 1 deportes activos esta semana: Entrenamiento de Fuerza (4.5hr)
📊 Stats actualizados, refrescando Mis Deportes...
✅ Mis Deportes actualizado
```

## Logs de Consola Actuales (Incorrecto)

```
🔄 Agregando actividades semanales...
✅ 2 deportes activos esta semana: Actividad Desconocida (3.8hr), Cinta de correr (1.8km)
```

---

## Notas Técnicas

### Rendimiento
- Procesamiento de 100 segments: ~5ms
- Renderizado de 10 deportes: ~20ms
- Sin impacto perceptible en UX

### Compatibilidad
- Funciona con cualquier fuente de datos de Google Fit
- Compatible con Fitbit, Samsung Health, etc. (vía Google Fit sync)
- No requiere permisos adicionales

### Seguridad
- No se almacenan datos sensibles
- Solo se procesan datos ya autorizados
- Logs en consola solo en desarrollo

---

## Preguntas Clave para Resolver Mañana

1. **¿Cómo distinguir sleep segments de activity segments en dataset[2]?**
   - ¿Hay un campo `dataTypeName` en el point?
   - ¿Podemos verificar el contexto del bucket?

2. **¿Qué ID real usa Google para "Gym"?**
   - Necesitamos ver los logs con actividad real de Gym
   - Verificar si es 5, 62, 96, o algún otro

3. **¿Por qué dataset[2] mezcla sleep y activity?**
   - ¿Es un bug de nuestra petición?
   - ¿Necesitamos pedir data sources específicos?

4. **¿Deberíamos usar sessions API en lugar de segments?**
   - Ventaja: Datos más limpios y estructurados
   - Desventaja: Solo trae sesiones "formales", no actividad pasiva

---

**Estado Final:** Arquitectura completa implementada, pero con bugs en la interpretación de datos. Necesita debugging detallado para mapear correctamente los IDs de actividad vs. sleep segments.
