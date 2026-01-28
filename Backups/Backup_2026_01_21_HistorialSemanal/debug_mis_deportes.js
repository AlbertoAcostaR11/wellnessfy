/**
 * 🔍 DIAGNÓSTICO: MIS DEPORTES - BARRAS INVISIBLES
 * 
 * Ejecuta este script en la consola del navegador (F12) cuando estés en la pestaña "Mis Deportes"
 * Te dirá exactamente por qué las barras no se muestran.
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DE MIS DEPORTES...\n');

// ========================================
// 1. VERIFICAR DATOS CRUDOS
// ========================================
console.log('📊 PASO 1: Verificando datos crudos de AppState...');
const activities = window.AppState?.activities || [];
console.log(`   ✓ Total actividades en AppState: ${activities.length}`);

if (activities.length === 0) {
    console.error('   ❌ NO HAY ACTIVIDADES. Ejecuta sincronización primero.');
} else {
    console.log('   ✓ Muestra de primera actividad:');
    console.log(activities[0]);
}

// ========================================
// 2. VERIFICAR FORMATO DE FECHAS
// ========================================
console.log('\n📅 PASO 2: Verificando formato de fechas...');
const today = new Date();
const expectedDates = [...Array(7)].map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
});
console.log('   ✓ Fechas esperadas (últimos 7 días):');
console.table(expectedDates.map((d, i) => ({
    index: i,
    fecha: d,
    dia: new Date(d).toLocaleDateString('es-ES', { weekday: 'short' })
})));

console.log('\n   ✓ Fechas de actividades encontradas:');
const activityDates = activities.map(act => {
    let dateStr = act.startTime;
    if (typeof dateStr !== 'string') {
        dateStr = new Date(act.startTime).toISOString().split('T')[0];
    } else if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }
    return {
        fecha: dateStr,
        deporte: act.sportKey || act.name,
        duracion: act.duration,
        distancia: act.distance,
        matchIndex: expectedDates.indexOf(dateStr)
    };
});
console.table(activityDates);

const matchedActivities = activityDates.filter(a => a.matchIndex >= 0);
console.log(`   ${matchedActivities.length > 0 ? '✓' : '❌'} Actividades que coinciden con últimos 7 días: ${matchedActivities.length}/${activities.length}`);

// ========================================
// 3. SIMULAR aggregateSportsData
// ========================================
console.log('\n⚙️ PASO 3: Simulando función aggregateSportsData...');
const sportsData = {};
const dates = expectedDates;

activities.forEach(act => {
    if (!act.startTime) return;

    let dateStr = act.startTime;
    if (typeof dateStr !== 'string') {
        dateStr = new Date(act.startTime).toISOString().split('T')[0];
    } else if (dateStr.includes('T')) {
        dateStr = dateStr.split('T')[0];
    }

    const dayIndex = dates.indexOf(dateStr);

    if (dayIndex >= 0) {
        const sportKey = (act.sportKey || act.name || 'unknown').toLowerCase();
        const sportName = sportKey.charAt(0).toUpperCase() + sportKey.slice(1);

        if (!sportsData[sportName]) {
            sportsData[sportName] = {
                days: Array(7).fill(null).map(() => ({ duration: 0, distance: 0 })),
                totalDuration: 0,
                totalDistance: 0
            };
        }

        let dist = 0;
        if (act.distance) {
            dist = act.distance > 100 ? act.distance / 1000 : act.distance;
        }
        const duration = act.duration || 0;

        sportsData[sportName].days[dayIndex].duration += duration;
        sportsData[sportName].days[dayIndex].distance += dist;
        sportsData[sportName].totalDuration += duration;
        sportsData[sportName].totalDistance += dist;
    }
});

console.log('   ✓ Datos agregados por deporte:');
console.table(Object.keys(sportsData).map(sport => ({
    deporte: sport,
    totalMinutos: sportsData[sport].totalDuration.toFixed(1),
    totalKm: sportsData[sport].totalDistance.toFixed(2),
    diasConActividad: sportsData[sport].days.filter(d => d.duration > 0).length
})));

// ========================================
// 4. VERIFICAR RENDERIZADO DE BARRAS
// ========================================
console.log('\n🎨 PASO 4: Verificando dimensiones y estilos de barras...');
Object.keys(sportsData).forEach(sportName => {
    const data = sportsData[sportName];
    const maxDuration = Math.max(...data.days.map(d => d.duration), 1);

    console.log(`\n   📊 Deporte: ${sportName}`);
    console.log(`      Max duración del día: ${maxDuration.toFixed(1)} min`);

    data.days.forEach((dayData, idx) => {
        const minutes = dayData.duration;
        const heightPct = (minutes / maxDuration) * 100;
        const finalHeight = Math.max(heightPct, 4);

        if (minutes > 0) {
            console.log(`      Día ${idx} (${expectedDates[idx]}): ${minutes.toFixed(1)} min → Altura: ${finalHeight.toFixed(1)}%`);
        }
    });
});

// ========================================
// 5. VERIFICAR DOM ACTUAL
// ========================================
console.log('\n🔎 PASO 5: Inspeccionando DOM actual...');
const chartContainers = document.querySelectorAll('.glass-card');
console.log(`   ✓ Tarjetas de deportes encontradas: ${chartContainers.length}`);

chartContainers.forEach((card, idx) => {
    const sportTitle = card.querySelector('h4')?.textContent || 'Sin título';
    const bars = card.querySelectorAll('.w-full.rounded-t-sm');
    console.log(`\n   📦 Tarjeta ${idx + 1}: ${sportTitle}`);
    console.log(`      Barras encontradas: ${bars.length}`);

    bars.forEach((bar, barIdx) => {
        const style = window.getComputedStyle(bar);
        const height = style.height;
        const background = style.background;
        const display = style.display;
        const visibility = style.visibility;

        console.log(`      Barra ${barIdx}: height=${height}, background=${background.substring(0, 50)}..., display=${display}, visibility=${visibility}`);

        if (height === '0px' || height === 'auto') {
            console.warn(`      ⚠️ PROBLEMA: Barra ${barIdx} tiene altura ${height}`);
        }
    });
});

// ========================================
// 6. RESUMEN Y RECOMENDACIONES
// ========================================
console.log('\n\n📋 RESUMEN DEL DIAGNÓSTICO:');
console.log('═'.repeat(60));

if (activities.length === 0) {
    console.error('❌ NO HAY DATOS: Sincroniza con Fitbit/Google Fit primero.');
} else if (matchedActivities.length === 0) {
    console.error('❌ PROBLEMA DE FECHAS: Las actividades no coinciden con los últimos 7 días.');
    console.log('   Posibles causas:');
    console.log('   - Las actividades son muy antiguas (>7 días)');
    console.log('   - Problema de zona horaria en startTime');
} else if (Object.keys(sportsData).length === 0) {
    console.error('❌ PROBLEMA DE AGREGACIÓN: No se pudo agrupar ningún deporte.');
} else {
    const totalBarsExpected = Object.keys(sportsData).reduce((sum, sport) => {
        return sum + sportsData[sport].days.filter(d => d.duration > 0).length;
    }, 0);

    const totalBarsRendered = document.querySelectorAll('.glass-card .w-full.rounded-t-sm').length;

    console.log(`✓ Deportes detectados: ${Object.keys(sportsData).length}`);
    console.log(`✓ Barras esperadas: ${totalBarsExpected}`);
    console.log(`✓ Barras renderizadas: ${totalBarsRendered}`);

    if (totalBarsRendered === 0) {
        console.error('❌ PROBLEMA DE RENDERIZADO: Las barras no se están generando en el DOM.');
        console.log('   Revisa errores de JavaScript en la consola.');
    } else {
        console.log('✓ Las barras están en el DOM. Revisa sus estilos CSS (altura, color).');
    }
}

console.log('═'.repeat(60));
console.log('\n💡 Para más detalles, revisa las tablas arriba.');
