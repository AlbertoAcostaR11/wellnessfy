
import { getLocalISOString } from './dateHelper.js';

/**
 * 🕵️‍♂️ INSPECTOR AUTÓNOMO (Bypass Provider Cache)
 * Hace fetch directo a la API de Fitbit usando el token de localStorage.
 */
export async function inspectLastWeekData() {
    console.clear();
    console.log('🕵️‍♂️ Iniciando auditoría AUTÓNOMA...');

    // 1. Obtener Token Directo
    const token = localStorage.getItem('fitbit_access_token');
    if (!token) {
        console.error('❌ No hay token de Fitbit en localStorage.');
        return;
    }
    console.log('🔑 Token detectado. Usando modo BYPASS.');

    // 2. Calcular fechas
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0-6
    const daysSinceLastMonday = dayOfWeek + 6;

    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceLastMonday);
    const lastSunday = new Date(lastMonday);
    lastSunday.setDate(lastMonday.getDate() + 6);

    const startStr = getLocalISOString(lastMonday);
    const endStr = getLocalISOString(lastSunday);

    console.log(`📅 Rango: ${startStr} al ${endStr}`);

    try {
        // A. Totales Diarios (Fetch Manual)
        console.log('⏳ (HTTP) Solicitando Totales Diarios...');
        const dailyTotals = await getDirectDailyTotals(token, startStr, endStr);

        // B. Actividades (Fetch Manual)
        console.log('⏳ (HTTP) Solicitando Actividades...');
        const activities = await getDirectActivities(token, startStr, endStr);

        // C. Sueño (Fetch Manual)
        console.log('⏳ (HTTP) Solicitando Sueño...');
        const sleepHistory = await getDirectSleep(token, startStr, endStr);

        // REPORTE
        console.log('--------------------------------------------------');
        console.log('📊 REPORTE FINAL');
        console.log('--------------------------------------------------');

        const days = [];
        let iterDate = new Date(lastMonday);
        while (iterDate <= lastSunday) {
            days.push(getLocalISOString(iterDate));
            iterDate.setDate(iterDate.getDate() + 1);
        }

        days.forEach(date => {
            console.log(`\n📅 DÍA: ${date}`);

            const total = dailyTotals.find(d => d.date === date);
            if (total) {
                console.log(`   👣 Pasos: ${total.steps} | 🔥 Cal: ${total.calories} | ⚡ Min Activos: ${total.active}`);
            } else console.log('   ⚠️ Sin datos totales.');

            const sleep = sleepHistory.find(s => s.date === date);
            if (sleep) {
                console.log(`   😴 Sueño: ${sleep.duration.toFixed(1)} hrs`);
            } else console.log('   ⚪ Sin sueño.');

            const dayActs = activities.filter(a => a.startDate === date);
            if (dayActs.length > 0) {
                console.log(`   🏃 Actividades:`);
                dayActs.forEach(a => console.log(`      • ${a.name} (${a.duration}m)`));
            } else console.log('   ⚪ Sin actividades.');
        });

    } catch (e) {
        console.error('❌ Error Fetch Directo:', e);
    }
}

// FUNCIONES HTTP DIRECTAS (Sin Proxy Interno)
async function getDirectDailyTotals(token, start, end) {
    const resources = ['steps', 'calories', 'distance', 'minutesVeryActive']; // Usamos VeryActive como proxy de activeMinutes
    const results = {};

    for (const res of resources) {
        const url = `https://corsproxy.io/?https://api.fitbit.com/1/user/-/activities/${res}/date/${start}/${end}.json`;
        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resp.ok) {
            const json = await resp.json();
            const list = json[`activities-${res}`] || [];
            list.forEach(item => {
                if (!results[item.dateTime]) results[item.dateTime] = { date: item.dateTime };
                results[item.dateTime][res] = parseFloat(item.value);
            });
        }
    }
    return Object.values(results).map(d => ({
        date: d.date,
        steps: d.steps || 0,
        calories: d.calories || 0,
        active: d.minutesVeryActive || 0
    }));
}

async function getDirectActivities(token, start, end) {
    // Fitbit Activities List endpoint
    // Nota: La API oficial de lista es 'afterDate' o 'offset'. No acepta rango simple start-end para LISTA, 
    // pero intentaremos iterar día por día para ser precisos.
    // O usamos el endpoint de rango global de steps para inferir? No, queremos log de actividades.
    // Usaremos iteración rápida.

    const acts = [];
    let curr = new Date(start);
    const last = new Date(end);

    while (curr <= last) {
        const dStr = getLocalISOString(curr);
        const url = `https://corsproxy.io/?https://api.fitbit.com/1/user/-/activities/date/${dStr}.json`;
        try {
            const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resp.ok) {
                const json = await resp.json();
                if (json.activities) {
                    json.activities.forEach(a => {
                        acts.push({
                            startDate: dStr,
                            name: a.name || a.activityName,
                            duration: Math.round(a.duration / 60000)
                        });
                    });
                }
            }
        } catch (e) { }
        curr.setDate(curr.getDate() + 1);
    }
    return acts;
}

async function getDirectSleep(token, start, end) {
    const url = `https://corsproxy.io/?https://api.fitbit.com/1.2/user/-/sleep/date/${start}/${end}.json`;
    const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!resp.ok) return [];

    const json = await resp.json();
    const sleepMap = {};

    (json.sleep || []).forEach(log => {
        const date = log.dateOfSleep;
        if (!sleepMap[date]) sleepMap[date] = 0;
        sleepMap[date] += (log.minutesAsleep || (log.duration / 60000)) / 60;
    });

    return Object.keys(sleepMap).map(k => ({ date: k, duration: sleepMap[k] }));
}

window.inspectLastWeekData = inspectLastWeekData;
