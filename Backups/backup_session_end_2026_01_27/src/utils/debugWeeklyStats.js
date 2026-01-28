import { AppState } from './src/utils/state.js';
import { getLocalISOString } from './src/utils/dateHelper.js';

async function diagnose() {
    console.log("🔍 DIAGNÓSTICO DE TOTALES SEMANALES");
    console.log("====================================");

    // 1. Simular generación de fechas (Lógica actual)
    const today = new Date();
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return getLocalISOString(d);
    });

    console.log(`📅 Rango de Fechas (Local): ${last7Days[0]} -> ${last7Days[6]}`);
    console.log(`🕒 Hora Local Servidor: ${new Date().toString()}`);
    console.log(`🕒 Hora Helper: ${getLocalISOString()}`);

    // 2. Inspeccionar Actividades
    const activities = AppState.activities || [];
    console.log(`\n📂 Actividades en AppState: ${activities.length}`);

    if (activities.length === 0) {
        console.warn("⚠️ No hay actividades cargadas en AppState.");
        return;
    }

    let totalSteps = 0;
    let totalCal = 0;
    let matchCount = 0;

    console.log("\n📋 Revisando últimas 10 actividades:");
    activities.slice(0, 10).forEach((act, i) => {
        // Lógica de fecha usada en activity.js
        const actDate = new Date(act.startTime);
        const dateStr = getLocalISOString(actDate);

        const isMatch = last7Days.includes(dateStr);
        if (isMatch) matchCount++;

        if (isMatch) {
            totalSteps += (act.steps || 0);
            totalCal += (act.calories || 0);
        }

        console.log(`   [${i}] ${act.name} (${act.sportKey})`);
        console.log(`       Fecha RAW: ${act.startTime}`);
        console.log(`       Fecha Local: ${dateStr} ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        console.log(`       Datos: Steps=${act.steps}, Cal=${act.calories}, Dist=${act.distance}`);
    });

    console.log("\n📊 DESGLOSE POR DÍA:");
    let sumFromThu = 0;

    // Agrupar por fecha
    const days = {};
    activities.forEach(act => {
        const d = getLocalISOString(act.startTime);
        if (!days[d]) days[d] = 0;
        days[d] += (act.calories || 0);
    });

    // Imprimir últimos 14 días para encontrar el "Jueves pasado"
    for (let i = 14; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = getLocalISOString(d);
        const dayName = d.toLocaleDateString('es-ES', { weekday: 'long' });

        const cals = days[dateStr] || 0;

        // Acumular si es desde el jueves pasado (Jueves 8 de Enero aprox, o Jueves 15?)
        // Asumo Jueves de la SEMANA ANTERIOR (hace > 7 dias) no entra en 'activities' si la API solo pidió 7.
        // Pero si la API de Fitbit trajo más...

        console.log(`   ${dateStr} (${dayName}): ${Math.round(cals)} kcal`);
    }

    console.log("\n(Nota: Si la API solo trajo 7 días, no verás datos anteriores al Sábado 10)");
}

// Ejecutar (Mocking AppState si es necesario para test local, pero idealmente acceder al real)
// En entorno real del usuario, este script tendría acceso a AppState si se inyecta.
// Como no puedo inyectar en su consola 'live', simulo carga o pido al usuario correrlo.
// PERO tengo 'compareProviders.js' que importa cosas.
// Intentaré correrlo asumiendo que AppState se llena (lo cual no pasará en node directo sin mock).
// Así que haré un script que el usuario pueda ver, pero yo lo ejecutaré simulando datos? 
// No, necesito ver SUS datos.
// Voy a desplegar este script como un archivo en su proyecto y pedirle que lo abra? No.
// Mejor: Modifico un archivo existente que se ejecute al inicio y loguee esto, o uso el 'compareProviders.js' hack.

// VOY A EDITAR 'src/utils/debugWeeklyStats.js' y pedirle que mire la consola,
// O ejecutarlo yo si tengo acceso al entorno (Tengo 'run_command' pero solo node, no browser context).
// NO PUEDO leer su memoria RAM (AppState) desde aquí con 'run_command'.

// Plan B: Modificar 'activity.js' para que haga este log al renderizar.
// Es lo más efectivo.
diagnose();
