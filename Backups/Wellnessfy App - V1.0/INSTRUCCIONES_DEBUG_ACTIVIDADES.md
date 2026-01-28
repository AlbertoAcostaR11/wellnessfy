# 🔍 Instrucciones para ejecutar el Debug Script

## Objetivo
Detectar exactamente qué actividades registró Google Health hoy para identificar el problema de confusión entre sleep segments y activity segments.

## Pasos para ejecutar:

### 1. Abre la aplicación en el navegador
- URL: http://localhost:8000/index.html

### 2. Asegúrate de estar sincronizado con Google Health
- Ve a la sección "Actividad"
- Haz clic en "Sincronizar" si no lo has hecho hoy
- Espera a que termine la sincronización

### 3. Abre la consola del navegador
- **Windows/Linux:** Presiona `F12` o `Ctrl + Shift + J`
- **Mac:** Presiona `Cmd + Option + J`

### 4. Ejecuta el script de debugging
En la consola, escribe:
```javascript
debugTodayActivities()
```

### 5. Analiza los resultados
El script mostrará:

#### 📊 MÉTODO 1: Activity Segments via Aggregate API
- Lista de todos los activity segments detectados hoy
- Para cada segment:
  - Activity Type ID
  - Duración en minutos
  - Hora de inicio y fin
  - Datos crudos completos

#### 📊 MÉTODO 2: Sessions API
- Lista de todas las sesiones registradas hoy
- Para cada sesión:
  - Activity Type
  - Nombre de la sesión
  - Duración
  - Horarios

#### 📊 MÉTODO 3: Data Sources Disponibles
- Fuentes de datos de actividad disponibles
- Aplicaciones que están reportando datos

#### 📊 RESUMEN Y ANÁLISIS
- Activity Types únicos detectados
- Interpretación de cada ID
- ⚠️ Advertencias si detecta sleep segments mezclados

## Qué buscar en los resultados:

### ✅ Caso correcto:
```
✅ Activity Types únicos detectados hoy: 1
   IDs: [108]
   
📋 Interpretación de IDs:
   108 → ❓ Other
```

### ❌ Caso problemático:
```
✅ Activity Types únicos detectados hoy: 4
   IDs: [1, 4, 5, 6]
   
📋 Interpretación de IDs:
   1 → 😴 Awake (Sleep)
   4 → 😴 Light sleep
   5 → 😴 Deep sleep
   6 → 😴 REM sleep

⚠️ ADVERTENCIAS:
   ⚠️ Se detectaron SLEEP SEGMENTS mezclados con actividades
   ⚠️ Estos deben ser filtrados para evitar confusión
```

## Información a reportar:

Una vez ejecutado el script, copia y pega en un archivo:

1. **La sección "RESUMEN Y ANÁLISIS"** completa
2. **Los Activity Type IDs** detectados
3. **Las advertencias** si las hay
4. **El desglose de Activity Segments** (al menos los primeros 3)

## Siguiente paso:

Con esta información podremos:
- Confirmar si el problema es la mezcla de sleep segments
- Identificar el ID correcto de "Gym" en tu caso
- Ajustar los filtros de exclusión si es necesario
- Mapear correctamente las actividades en el diccionario

---

**Nota:** El script NO modifica ningún dato, solo lee y muestra información para debugging.
