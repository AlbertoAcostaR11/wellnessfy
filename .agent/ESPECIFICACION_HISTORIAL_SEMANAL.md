# 📅 Especificación: Pestaña Historial Semanal

## 🎯 Concepto

Una pestaña de **solo lectura** que muestra un resumen completo de la actividad de UNA semana específica (Lunes a Domingo), con navegación entre semanas.

---

## 🎨 Diseño de UI

### **Header de Navegación**
```
┌─────────────────────────────────────────────┐
│  [◀]  Semana 3 • 20 - 26 Enero 2026  [▶]   │
│       Lun 20 Ene - Dom 26 Ene               │
└─────────────────────────────────────────────┘
```

**Comportamiento:**
- **Flecha Izquierda (◀)**: Retrocede a la semana anterior
- **Flecha Derecha (▶)**: Avanza a la semana siguiente
  - ⚠️ **DESHABILITADA** si es la semana actual (no hay futuro)
- **Texto Central**: Muestra número de semana y rango de fechas

---

## 📊 Secciones del Historial (En orden)

### **1. Días de Ejercicio** 
**Referencia: Imagen 1**

```
🏃 Días de Ejercicio

[✓] [✓] [✓] [✓] [✓] [✓] [✓]
jue vie sáb dom lun mar mié
```

**Características:**
- 7 círculos (uno por cada día de lunes a domingo)
- ✓ Verde (#00ff9d) si hubo ejercicio ese día
- Gris oscuro si NO hubo ejercicio
- Labels de día abreviados debajo

**Datos:**
- Basado en `exerciseDays` de `weeklyStats`
- Muestra TODOS los 7 días (incluso si la semana no ha terminado)

---

### **2. Resumen de Totales Semanales**
**Referencia: Imagen 2**

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   🚶        │     🗺️      │     🔥      │     ⚡      │
│ TOTAL PASOS │  DISTANCIA  │  CALORÍAS   │ HORAS ACTIVAS│
│   80,911    │  60.1 km    │   26,355    │   12h 30m   │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Características:**
- 4 tarjetas en grid (2x2 en móvil, 4x1 en desktop)
- Iconos Material Symbols
- Números grandes y destacados
- **NUEVO**: Agregar "Horas Activas" (suma de duración de todas las actividades)

**Datos:**
```javascript
{
    totalSteps: 80911,
    totalDistance: 60.1,  // km
    totalCalories: 26355,
    totalActiveHours: 12.5  // NUEVO - suma de act.duration
}
```

---

### **3. Sueño (Últimos 7 días)**
**Referencia: Imagen 3**

```
🌙 Sueño (Últimos 7 días)

[████] [█████] [███] [███] [████] [███] [█████]
  jue    vie    sáb   dom   lun   mar   mié
```

**Características:**
- Gráfica de barras verticales
- Color: Índigo/Morado (#818cf8)
- Altura proporcional a horas de sueño
- Tooltip al hover: "7h 30m"
- Labels de día abajo

**Datos:**
- Basado en `sleepData` de `weeklyStats`
- Muestra los 7 días completos

---

### **4. Días de Mindfulness**
**Referencia: Imagen 4**

```
🧘 Días de Mindfulness

[✓] [ ] [✓] [✓] [✓] [✓] [✓]
jue vie sáb dom lun mar mié
```

**Características:**
- Similar a "Días de Ejercicio"
- Color morado/lila (#c084fc)
- ✓ si hubo yoga, meditación o respiración ese día
- Gris oscuro si no hubo

**Datos:**
- Basado en `mindfulnessDays` de `weeklyStats`

---

### **5. Deportes Practicados**
**Referencia: Imagen 5**

```
🏋️ Halterofilia
1h 56m totales

[█] [██] [█] [ ] [██] [██] [█]
jue  vie sáb dom lun  mar mié

────────────────────────────────

🧘 Yoga
1h 52m totales

[ ] [ ] [█] [███] [ ] [██] [ ]
jue vie sáb  dom  lun  mar mié

────────────────────────────────

🏃 Correr
0.0 km/día

[ ] [ ] [ ] [███] [ ] [██] [██]
jue vie sáb  dom  lun  mar  mié
```

**Características:**
- Una tarjeta por cada deporte practicado en la semana
- **Header**: Icono + Nombre del deporte + Total (tiempo o distancia)
- **Gráfica de barras**: 7 barras (lun-dom)
  - Altura proporcional a duración del día
  - Color según el deporte (naranja, morado, rojo, verde, etc.)
- **Sin interactividad**: Solo visualización (no tooltips complejos)
- Ordenado por total de tiempo descendente

**Datos:**
- Basado en `sportsData` (mismo que "Mis Deportes")
- Pero muestra TODOS los 7 días (no dinámico)

---

## 🗂️ Estructura de Datos

### **Fuente de Datos:**

```javascript
// Opción 1: Calcular en tiempo real desde activities
const weekData = calculateWeeklyStatsForWeek(weekNumber, year);

// Opción 2 (Futuro): Cargar desde Firestore
const weekData = await loadWeeklyReport(weekNumber, year);
```

### **Formato de weekData:**
```javascript
{
    weekNumber: 3,
    year: 2026,
    weekStart: "2026-01-20",  // Lunes
    weekEnd: "2026-01-26",    // Domingo
    
    // Sección 1
    exerciseDays: [
        { day: "Lun", date: "2026-01-20", hasExercise: true },
        { day: "Mar", date: "2026-01-21", hasExercise: true },
        ...
    ],
    
    // Sección 2
    weeklyTotals: {
        steps: 80911,
        distance: 60.1,
        calories: 26355,
        activeHours: 12.5  // NUEVO
    },
    
    // Sección 3
    sleepData: [
        { day: "Lun", date: "2026-01-20", hours: 7.5 },
        { day: "Mar", date: "2026-01-21", hours: 8.2 },
        ...
    ],
    
    // Sección 4
    mindfulnessDays: [
        { day: "Lun", date: "2026-01-20", hasMindfulness: true },
        { day: "Mar", date: "2026-01-21", hasMindfulness: false },
        ...
    ],
    
    // Sección 5
    sports: {
        "Halterofilia": {
            totalDuration: 116,  // minutos
            totalDistance: 0,
            days: [
                { duration: 20, distance: 0 },  // Lun
                { duration: 35, distance: 0 },  // Mar
                ...
            ],
            meta: { icon: "fitness_center", color: "#ff9f43", unit: "min" }
        },
        "Yoga": { ... },
        "Correr": { ... }
    }
}
```

---

## 🔧 Implementación Técnica

### **Archivo Nuevo:**
```
src/pages/history.js
```

### **Funciones Principales:**

```javascript
// 1. Renderizar página completa
export function renderHistory() {
    const currentWeek = getCurrentWeekNumber();
    const selectedWeek = AppState.selectedWeek || currentWeek;
    
    return `
        ${renderWeekNavigator(selectedWeek)}
        ${renderExerciseDays(weekData)}
        ${renderWeeklyTotals(weekData)}
        ${renderSleepChart(weekData)}
        ${renderMindfulnessDays(weekData)}
        ${renderSportsBreakdown(weekData)}
    `;
}

// 2. Navegación entre semanas
window.navigateToWeek = function(direction) {
    // direction: 'prev' | 'next'
    const newWeek = AppState.selectedWeek + (direction === 'next' ? 1 : -1);
    
    // Validar que no sea futuro
    if (newWeek > getCurrentWeekNumber()) return;
    
    AppState.selectedWeek = newWeek;
    
    // Re-renderizar
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = renderHistory();
}

// 3. Calcular datos de una semana específica
function calculateWeeklyStatsForWeek(weekNumber, year) {
    const weekStart = getWeekStartFromNumber(weekNumber, year);
    const weekEnd = getWeekEndFromNumber(weekNumber, year);
    
    // Filtrar actividades de esa semana
    const weekActivities = AppState.activities.filter(act => {
        const actDate = new Date(act.startTime);
        return actDate >= weekStart && actDate <= weekEnd;
    });
    
    // Calcular stats (similar a calculateWeeklyStatsFromActivities)
    return {
        exerciseDays: [...],
        weeklyTotals: {...},
        sleepData: [...],
        mindfulnessDays: [...],
        sports: {...}
    };
}
```

---

## 🎨 Diseño Visual (CSS)

### **Paleta de Colores:**
- **Ejercicio**: Verde neón (#00ff9d)
- **Mindfulness**: Morado (#c084fc)
- **Sueño**: Índigo (#818cf8)
- **Pasos**: Verde (#00ff9d)
- **Distancia**: Cyan (#00d9ff)
- **Calorías**: Naranja (#ff9100)
- **Horas Activas**: Amarillo (#fbbf24)

### **Componentes Reutilizables:**
```css
.week-navigator {
    /* Header con flechas */
}

.stat-card {
    /* Tarjeta de totales semanales */
}

.day-indicator {
    /* Círculo de día (ejercicio/mindfulness) */
}

.bar-chart-week {
    /* Gráfica de barras de 7 días */
}

.sport-card {
    /* Tarjeta de deporte individual */
}
```

---

## 📱 Responsive Design

### **Mobile (< 768px):**
- Totales semanales: Grid 2x2
- Gráficas de deportes: Stack vertical
- Navegador de semana: Compacto

### **Desktop (>= 768px):**
- Totales semanales: Grid 4x1
- Gráficas de deportes: 2 columnas
- Navegador de semana: Más espaciado

---

## 🚀 Roadmap de Implementación

### **Fase 1: Estructura Base** (1 día)
- [ ] Crear `src/pages/history.js`
- [ ] Implementar navegador de semanas
- [ ] Agregar ruta `/history` al router
- [ ] Layout básico con placeholders

### **Fase 2: Secciones Estáticas** (1 día)
- [ ] Renderizar "Días de Ejercicio"
- [ ] Renderizar "Totales Semanales" (con Horas Activas)
- [ ] Renderizar "Sueño"
- [ ] Renderizar "Días de Mindfulness"

### **Fase 3: Deportes Detallados** (1 día)
- [ ] Renderizar tarjetas de deportes
- [ ] Gráficas de barras por deporte
- [ ] Ordenamiento por total

### **Fase 4: Navegación y Datos** (1 día)
- [ ] Implementar `calculateWeeklyStatsForWeek()`
- [ ] Lógica de navegación prev/next
- [ ] Validación de semana actual
- [ ] Persistir semana seleccionada en AppState

### **Fase 5: Polish y Testing** (1 día)
- [ ] Animaciones de transición
- [ ] Estados vacíos (sin datos)
- [ ] Testing en diferentes semanas
- [ ] Responsive design

---

## ✅ Criterios de Aceptación

1. ✅ Muestra TODOS los 7 días (Lun-Dom) incluso si la semana no ha terminado
2. ✅ Navegación entre semanas funciona correctamente
3. ✅ No se puede avanzar más allá de la semana actual
4. ✅ Totales semanales incluyen "Horas Activas"
5. ✅ Deportes se muestran ordenados por total de tiempo
6. ✅ Diseño coincide con las imágenes de referencia
7. ✅ Responsive en móvil y desktop
8. ✅ Sin errores en consola
9. ✅ Carga rápida (< 1 segundo)

---

## 🎯 Diferencias con "Resumen" (Tab Actual)

| Característica | Resumen (Actual) | Historial (Nuevo) |
|----------------|------------------|-------------------|
| **Periodo** | Semana dinámica (hoy - 6 días) | Semana fija (Lun-Dom) |
| **Días mostrados** | Variable (depende del día actual) | Siempre 7 días completos |
| **Navegación** | No tiene | Flechas prev/next |
| **Deportes** | Dinámico, con tooltips | Estático, solo barras |
| **Propósito** | Vista "en vivo" | Vista histórica/comparativa |

---

## 📝 Notas Adicionales

- **Sin tooltips complejos**: Para simplificar, las gráficas de deportes solo muestran las barras sin tooltips interactivos
- **Orden de deportes**: Siempre por total de tiempo descendente (más practicado arriba)
- **Semanas vacías**: Si una semana no tiene datos, mostrar mensaje "Sin actividad registrada esta semana"
- **Transiciones**: Animación suave al cambiar de semana (fade in/out)

---

## 🔮 Futuro (Versión PRO)

- Comparación lado a lado de 2 semanas
- Exportar reporte semanal como PDF
- Gráficas de tendencias (últimas 4 semanas)
- Insights automáticos ("Mejoraste un 15% vs semana pasada")
