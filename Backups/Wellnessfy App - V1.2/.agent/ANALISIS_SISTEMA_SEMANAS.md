# 📊 Análisis de Impacto: Cambio de Sistema de Semanas

## 🎯 Decisión Estratégica

### **Cambio Propuesto:**
- **Actual**: Ventana deslizante de 7 días (hoy - 6 días)
- **Nuevo**: Semana fija Lunes-Domingo (acumulativa hasta hoy)

### **Ejemplo Visual:**
```
HOY: Miércoles 22 de Enero

ACTUAL (Últimos 7 días):
[Jue 16] [Vie 17] [Sáb 18] [Dom 19] [Lun 20] [Mar 21] [Mié 22]
   ↑                                                      ↑
 -6 días                                               hoy

NUEVO (Semana actual):
[Lun 20] [Mar 21] [Mié 22] [ ] [ ] [ ] [ ]
   ↑                  ↑
inicio semana      hoy (solo 3 días)

El Domingo se reinicia todo.
```

---

## 📁 Archivos Afectados

### **1. Archivos CRÍTICOS (Requieren modificación)**

#### **A. `src/utils/dateHelper.js`** ⭐ NUEVO
```javascript
// AGREGAR FUNCIONES:
export function getWeekStart(date = new Date()) {
    // Retorna el lunes de la semana actual
}

export function getWeekEnd(date = new Date()) {
    // Retorna el domingo de la semana actual
}

export function getCurrentWeekDays() {
    // Retorna array de días desde lunes hasta HOY
    // Si hoy es miércoles: [lun, mar, mié]
}

export function getWeekNumber(date = new Date()) {
    // Retorna número de semana del año (para historial)
}
```

#### **B. `src/pages/activity.js`** ⭐ CRÍTICO
**Líneas afectadas:**
- **394-558**: `calculateWeeklyStatsFromActivities()`
  - Cambiar generación de `last7Days` a `currentWeekDays`
  - Línea 400-404: Reemplazar lógica de fechas
  
```javascript
// ANTES (Línea 400-404):
const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(todayBase);
    d.setDate(d.getDate() - (6 - i));
    return getLocalISOString(d);
});

// DESPUÉS:
const currentWeekDays = getCurrentWeekDays(); // [lun, mar, mié] si hoy es miércoles
```

- **730-735**: `aggregateSportsData()` - Mismo cambio
- **332**: Cambiar texto "Últimos 7 días" → "Semana Actual"
- **353**: Cambiar texto "Últimos 7 días" → "Semana Actual"

#### **C. `src/utils/weeklyCharts.js`** ⭐ CRÍTICO
**Líneas afectadas:**
- **52**: Comentario "Últimos 7 días"
- **Funciones de renderizado**: Ajustar para mostrar solo días hasta hoy

#### **D. `src/utils/googleHealth.js`** ⚠️ IMPORTANTE
**Líneas afectadas:**
- **527, 544, 650**: Eventos `weeklyStatsUpdated`
- Lógica de sincronización debe cambiar de "7 días atrás" a "desde lunes"

```javascript
// ANTES:
const startDate = new Date();
startDate.setDate(startDate.getDate() - 6);

// DESPUÉS:
const startDate = getWeekStart(); // Lunes de esta semana
```

---

### **2. Archivos de TEXTO (Solo cambios visuales)**

- `src/utils/sportsData.js` (Línea 91): "Últimos 7 días" → "Semana Actual"
- `src/utils/debugFitbitData.js` (Líneas 120-144): Comentarios de debug

---

## 🗄️ Impacto en Firebase/Firestore

### **Estructura de Datos Actual:**
```javascript
// AppState (localStorage + memoria)
{
    activities: [...],        // Array de actividades
    sleepHistory: [...],      // Array de sueño
    dailyTotals: [...],       // Totales diarios
    weeklyStats: {...}        // Calculado en tiempo real
}
```

### **Nueva Estructura Propuesta:**

#### **A. Colección: `weeklyReports` (NUEVA)**
```javascript
{
    userId: "user123",
    weekNumber: 3,              // Semana del año (1-52)
    year: 2026,
    weekStart: "2026-01-20",    // Lunes
    weekEnd: "2026-01-26",      // Domingo
    
    // Resumen calculado al finalizar la semana
    summary: {
        totalSteps: 45000,
        totalDistance: 32.5,
        totalCalories: 2800,
        totalActiveMinutes: 420,
        
        // Por deporte
        sports: {
            "Running": { duration: 120, distance: 15.2, sessions: 3 },
            "Yoga": { duration: 90, sessions: 2 }
        },
        
        // Por día
        dailyBreakdown: [
            { date: "2026-01-20", steps: 8000, ... },
            { date: "2026-01-21", steps: 9500, ... },
            ...
        ]
    },
    
    createdAt: timestamp,
    status: "in_progress" | "completed"  // completed el domingo a las 23:59
}
```

#### **B. Firestore Rules:**
```javascript
match /weeklyReports/{reportId} {
    allow read: if request.auth.uid == resource.data.userId;
    allow create: if request.auth.uid == request.resource.data.userId;
    allow update: if request.auth.uid == resource.data.userId;
}
```

#### **C. Cloud Functions (Opcional - Automatización):**
```javascript
// functions/index.js
exports.finalizeWeeklyReport = functions.pubsub
    .schedule('0 0 * * 1') // Todos los lunes a medianoche
    .timeZone('America/Mexico_City')
    .onRun(async (context) => {
        // Marcar reportes de la semana pasada como "completed"
        // Calcular promedios, tendencias, etc.
    });
```

---

## 🏗️ Nueva Pestaña: "Historial"

### **Diseño Propuesto:**

```
┌─────────────────────────────────────────┐
│  HISTORIAL                              │
├─────────────────────────────────────────┤
│  [◀ Semana Anterior] Semana 3 [▶]      │
│  20 Ene - 26 Ene 2026                  │
├─────────────────────────────────────────┤
│  📊 RESUMEN SEMANAL                     │
│  ┌──────────┐  ┌──────────┐            │
│  │ 45,000   │  │ 32.5 km  │            │
│  │ Pasos    │  │ Distancia│            │
│  └──────────┘  └──────────┘            │
│                                         │
│  📈 COMPARACIÓN CON SEMANA ANTERIOR     │
│  Pasos:     +12% ↑                     │
│  Distancia: -5%  ↓                     │
│                                         │
│  🏃 DEPORTES DE LA SEMANA              │
│  [Gráfica de barras por deporte]       │
└─────────────────────────────────────────┘
```

### **Archivo Nuevo:**
```javascript
// src/pages/history.js
export function renderHistory() {
    // Cargar reportes semanales desde Firestore
    // Mostrar navegación entre semanas
    // Gráficas comparativas
}
```

---

## 💰 Versión PRO (Resumen Mensual)

### **Estructura de Datos:**
```javascript
// Colección: monthlyReports
{
    userId: "user123",
    month: 1,
    year: 2026,
    
    summary: {
        totalSteps: 180000,
        avgStepsPerDay: 5806,
        
        // Tendencias
        trends: {
            stepsGrowth: "+15%",
            mostActiveDay: "Martes",
            favoriteS port: "Running"
        },
        
        // Consejos generados por IA (futuro)
        insights: [
            "Tu actividad aumentó un 15% este mes",
            "Considera agregar más días de descanso"
        ]
    }
}
```

### **Firestore Rules:**
```javascript
match /monthlyReports/{reportId} {
    allow read: if request.auth.uid == resource.data.userId 
                && request.auth.token.premium == true;
}
```

---

## 🚀 Plan de Implementación

### **Fase 1: Fundamentos (1-2 días)**
1. ✅ Extender `dateHelper.js` con funciones de semana
2. ✅ Modificar `calculateWeeklyStatsFromActivities()` en `activity.js`
3. ✅ Actualizar textos UI "Últimos 7 días" → "Semana Actual"
4. ✅ Ajustar lógica de sincronización en `googleHealth.js`
5. ✅ Testing exhaustivo con diferentes días de la semana

### **Fase 2: Persistencia (2-3 días)**
1. ✅ Crear colección `weeklyReports` en Firestore
2. ✅ Implementar función `saveWeeklyReport()` que se ejecute:
   - Al finalizar cada día
   - Al cambiar de semana (lunes)
3. ✅ Agregar lógica de "finalización" el domingo
4. ✅ Firestore Rules y Security

### **Fase 3: Historial (3-4 días)**
1. ✅ Crear `src/pages/history.js`
2. ✅ Diseñar UI de navegación entre semanas
3. ✅ Implementar gráficas comparativas
4. ✅ Agregar pestaña "Historial" al router
5. ✅ Testing de carga de datos históricos

### **Fase 4: Versión PRO (Opcional - 5-7 días)**
1. ✅ Sistema de suscripciones (Firebase Extensions o Stripe)
2. ✅ Colección `monthlyReports`
3. ✅ Generación automática de insights
4. ✅ UI premium con gráficas avanzadas
5. ✅ Cloud Functions para automatización

---

## ⚠️ Riesgos y Mitigaciones

### **Riesgo 1: Pérdida de Datos Históricos**
**Mitigación:**
- Mantener `activities` array intacto
- `weeklyReports` es solo un "snapshot" agregado
- Siempre se puede recalcular desde `activities`

### **Riesgo 2: Confusión de Usuarios**
**Mitigación:**
- Agregar tooltip explicativo: "La semana empieza el lunes y se reinicia el domingo"
- Mostrar indicador visual del día actual
- Animación de transición el lunes

### **Riesgo 3: Costos de Firestore**
**Mitigación:**
- 1 documento por semana por usuario = ~52 docs/año
- Con 1000 usuarios = 52,000 docs/año
- Costo estimado: ~$0.30/mes (muy bajo)

### **Riesgo 4: Zona Horaria**
**Mitigación:**
- Ya usamos `getLocalISOString()` consistentemente
- Guardar `timezone` del usuario en el reporte
- Calcular "lunes" basado en hora local del usuario

---

## 📊 Métricas de Éxito

1. **Funcionalidad:**
   - ✅ Semana se reinicia correctamente el lunes
   - ✅ Datos acumulan correctamente durante la semana
   - ✅ Historial carga sin errores

2. **Performance:**
   - ⏱️ Carga de historial < 1 segundo
   - ⏱️ Transición entre semanas < 500ms

3. **UX:**
   - 📈 Usuarios entienden el nuevo sistema (encuesta)
   - 📈 Engagement con pestaña "Historial" > 30%

---

## 🔧 Código de Ejemplo

### **dateHelper.js (Extensión)**
```javascript
export function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lunes
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function getCurrentWeekDays() {
    const start = getWeekStart();
    const today = new Date();
    const days = [];
    
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
        days.push(getLocalISOString(d));
    }
    
    return days;
}
```

### **Guardar Reporte Semanal**
```javascript
// src/utils/weeklyReportManager.js
export async function saveCurrentWeekReport() {
    const weekStart = getWeekStart();
    const weekNumber = getWeekNumber();
    const year = weekStart.getFullYear();
    
    const reportId = `${AppState.currentUser.uid}_${year}_W${weekNumber}`;
    
    const report = {
        userId: AppState.currentUser.uid,
        weekNumber,
        year,
        weekStart: getLocalISOString(weekStart),
        weekEnd: getLocalISOString(getWeekEnd()),
        summary: calculateWeeklyStatsFromActivities(...),
        updatedAt: serverTimestamp(),
        status: isWeekComplete() ? 'completed' : 'in_progress'
    };
    
    await setDoc(doc(db, 'weeklyReports', reportId), report, { merge: true });
}
```

---

## ✅ Checklist de Implementación

- [ ] Extender `dateHelper.js`
- [ ] Modificar `activity.js` (cálculo de stats)
- [ ] Actualizar `weeklyCharts.js`
- [ ] Ajustar `googleHealth.js` (rango de sync)
- [ ] Cambiar textos UI
- [ ] Crear colección `weeklyReports`
- [ ] Implementar `weeklyReportManager.js`
- [ ] Crear `history.js`
- [ ] Agregar ruta `/history` al router
- [ ] Testing en diferentes días de la semana
- [ ] Testing de transición lunes
- [ ] Documentar para usuarios
- [ ] (Opcional) Implementar versión PRO

---

## 🎯 Conclusión

**Impacto Total:**
- **Archivos a modificar**: 5 archivos principales
- **Archivos nuevos**: 2-3 archivos
- **Complejidad**: Media-Alta
- **Tiempo estimado**: 7-10 días (con testing)
- **Costo Firestore**: Mínimo (~$0.30/mes por 1000 usuarios)

**Recomendación**: ✅ **VIABLE Y BENEFICIOSO**
- Mejora la UX (semanas más intuitivas)
- Habilita funcionalidad de historial
- Base para versión PRO
- Riesgos controlables
