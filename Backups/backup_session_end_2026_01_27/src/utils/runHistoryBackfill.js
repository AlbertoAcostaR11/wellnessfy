
import { saveDailySummary } from './dailySummaryManager.js';
import { getLocalISOString } from './dateHelper.js';
import { AppState } from './state.js';

/**
 * 🛠️ DATA BACKFILL (Modo Autónomo - Bypass Provider)
 * Lee datos directamente de API Fitbit y llena el historial en Firestore.
 */
export async function runHistoryBackfill() {
    console.clear();
    console.log('🏗️ INICIANDO RECONSTRUCCIÓN DE HISTORIAL (MODO AUTÓNOMO)...');

    const userId = AppState.currentUser?.uid || AppState.currentUser?.id;
    if (!userId) {
        console.error('❌ Error: Usuario no logueado.');
        return;
    }

    // 1. Obtener Token Directo (Bypass de la clase Provider)
    const token = localStorage.getItem('fitbit_access_token');
    if (!token) {
        console.error('❌ No hay token de Fitbit en localStorage. Inicia sesión en Fitbit primero.');
        return;
    }
    console.log('🔑 Token Fitbit detectado.');

    // 2. Definir Rango (Últimos 21 días - 3 semanas)
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 21);

    const startStr = getLocalISOString(start);
    const endStr = getLocalISOString(end);

    console.log(`📅 Sincronizando rango: ${startStr} -> ${endStr}`);

    try {
        // A. Obtener Datos Masivos (HTTP Directo)
        console.log('⏳ (HTTP) Descargando Totales Diarios...');
        const dailyTotals = await getDirectDailyTotals(token, startStr, endStr);

        console.log('⏳ (HTTP) Descargando Actividades...');
        const activities = await getDirectActivities(token, start, end); // Nota: Paso fechas obj para iteracion interna

        console.log('⏳ (HTTP) Descargando Sueño...');
        const sleepHistory = await getDirectSleep(token, startStr, endStr);

        // B. Procesar Día por Día
        console.log('💾 Guardando en Firestore...');

        const daysToProcess = [];
        let curr = new Date(start);
        while (curr <= end) {
            daysToProcess.push(getLocalISOString(curr));
            curr.setDate(curr.getDate() + 1);
        }

        let savedCount = 0;

        for (const date of daysToProcess) {
            // 1. Filtrar datos del día
            const dayMetrics = dailyTotals.find(d => d.date === date) || {};

            // Actividades
            const dayActs = activities.filter(a => a.startDate === date);

            // Transformar al formato que espera Firestore
            const normActivities = dayActs.map((a, index) => ({
                id: `act_backfill_${date}_${index}`,
                sportKey: a.name, // Usamos nombre como key
                type: a.name,     // Usamos nombre como type
                name: a.name,
                duration: a.duration, // min
                calories: a.calories || 0,
                startTime: `${date}T12:00:00` // Hora dummy si no la tenemos exacta, suficiente para el día
            }));

            // Sueño
            const daySleep = sleepHistory.find(s => s.date === date);

            const isEmpty = !dayMetrics.steps && normActivities.length === 0 && !daySleep;

            if (!isEmpty) {
                const metrics = {
                    steps: dayMetrics.steps || 0,
                    calories: dayMetrics.calories || 0,
                    distance: dayMetrics.distance || 0,
                    activeMinutes: dayMetrics.active || 0
                };

                await saveDailySummary(userId, date, metrics, normActivities, daySleep);
                console.log(`   ✅ Guardado: ${date} (Actividades: ${normActivities.length}, Pasos: ${metrics.steps})`);
                savedCount++;
            }
        }

        console.log(`🏁 FINALIZADO. ${savedCount} días actualizados en historial.`);
        console.log('👉 Ahora recarga el navegador (F5) y revisa la pestaña Historial.');

    } catch (error) {
        console.error('❌ Error crítico en Backfill:', error);
    }
}

// --- HELPER FUNCTIONS (Direct HTTP) ---

async function getDirectDailyTotals(token, start, end) {
    const resources = ['steps', 'calories', 'distance', 'minutesVeryActive'];
    const results = {};

    for (const res of resources) {
        const url = `https://corsproxy.io/?https://api.fitbit.com/1/user/-/activities/${res}/date/${start}/${end}.json`;
        try {
            const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (resp.ok) {
                const json = await resp.json();
                const list = json[`activities-${res}`] || [];
                list.forEach(item => {
                    if (!results[item.dateTime]) results[item.dateTime] = { date: item.dateTime };
                    results[item.dateTime][res] = parseFloat(item.value);
                });
            }
        } catch (e) { console.warn(`Error fetching ${res}:`, e); }
    }
    return Object.values(results).map(d => ({
        date: d.date,
        steps: d.steps || 0,
        calories: d.calories || 0,
        distance: d.distance || 0,
        active: d.minutesVeryActive || 0
    }));
}

async function getDirectActivities(token, startDate, endDate) {
    const acts = [];
    let curr = new Date(startDate);
    const last = new Date(endDate);

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
                            duration: Math.round(a.duration / 60000),
                            calories: a.calories
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
    try {
        const resp = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!resp.ok) return [];

        const json = await resp.json();
        const sleepMap = {};

        (json.sleep || []).forEach(log => {
            const date = log.dateOfSleep;
            if (!sleepMap[date]) sleepMap[date] = { duration: 0, efficiency: 0, count: 0 };

            // Horas reales
            const hours = (log.minutesAsleep || (log.duration / 60000)) / 60;
            sleepMap[date].duration += hours;
            sleepMap[date].efficiency += (log.efficiency || 0);
            sleepMap[date].count++;
        });

        return Object.keys(sleepMap).map(k => ({
            date: k,
            duration: sleepMap[k].duration,
            efficiency: Math.round(sleepMap[k].efficiency / sleepMap[k].count)
        }));
    } catch (e) { return []; }
}


window.runHistoryBackfill = runHistoryBackfill;
