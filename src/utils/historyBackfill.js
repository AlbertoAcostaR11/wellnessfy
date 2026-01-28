
import { syncHealthData } from './healthSync_v2.js';
import { AppState } from './state.js';
import { getLocalISOString } from './dateHelper.js';

/**
 * 🕵️‍♂️ History Backfill Manager
 * 
 * Se encarga de sincronizar el historial en segundo plano sin bloquear la UI.
 * Estrategia: "Carga rápida primero (7 días), carga profunda después (30 días)".
 */

const BACKFILL_KEY = 'last_history_backfill_timestamp';
const BACKFILL_INTERVAL = 1000 * 60 * 60 * 12; // 12 horas

export async function runBackgroundHistorySync() {
    console.log('🕵️‍♂️ Iniciando proceso de backfill de historial en segundo plano...');

    // 1. Verificación de frecuencia (Throttling)
    const lastRun = localStorage.getItem(BACKFILL_KEY);
    if (lastRun) {
        const diff = Date.now() - parseInt(lastRun);
        if (diff < BACKFILL_INTERVAL) {
            console.log(`⏳ Backfill reciente (${Math.floor(diff / 60000)}min). Saltando.`);
            return;
        }
    }

    try {
        // 2. Definir rango: Últimos 30 días
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);

        console.log(`🕵️‍♂️ Descargando historial profundo (${30} días):`,
            getLocalISOString(startDate), '->', getLocalISOString(endDate)
        );

        // 3. Ejecutar sincronización silenciosa
        // No actualizamos la UI inmediatamente para no causar "jank", 
        // confiamos en que syncHealthData guardará en Firestore/LocalStorage
        const result = await syncHealthData(startDate, endDate);

        if (result) {
            console.log('✅ Backfill completado exitosamente.');

            // 4. Actualizar Timestamp
            localStorage.setItem(BACKFILL_KEY, Date.now().toString());

            // 5. Actualizar AppState silenciosamente si hay datos nuevos
            if (result.allActivities && result.allActivities.length > AppState.activities.length) {
                console.log('🔄 Actualizando AppState.activities con datos del backfill');
                AppState.activities = result.allActivities;

                // Si el usuario está viendo el historial AHORA, refrescar
                if (AppState.currentPage === 'activity') {
                    // Disparar evento custom o llamar render si es seguro
                    const activeTab = document.querySelector('.activity-tab.active');
                    if (activeTab && activeTab.dataset.tab === 'historial') {
                        console.log('🔄 Refrescando pestaña Historial en tiempo real');
                        if (window.switchActivityTab) window.switchActivityTab('historial');
                    }
                }
            }

            // 6. Recargar Resúmenes Diarios en AppState para que el Historial los vea
            refreshDailySummariesInState();
        }

    } catch (error) {
        console.warn('⚠️ Error en backfill de historial:', error);
    }
}

async function refreshDailySummariesInState() {
    try {
        const { getSummariesRange } = await import('./dailySummaryManager.js');
        const user = AppState.currentUser;
        if (!user || !user.uid) return;

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 90); // Leer hasta 90 días para el historial

        const summaries = await getSummariesRange(user.uid, getLocalISOString(start), getLocalISOString(end));

        if (summaries && summaries.length > 0) {
            AppState.dailyTotals = summaries.map(s => ({
                date: s.date,
                steps: s.totals?.steps || 0,
                calories: s.totals?.calories || 0,
                distance: s.totals?.distance || 0,
                activeMinutes: s.totals?.activeMinutes || 0,
                sleep: s.sleep // Preservar data de sueño
            }));
            console.log('📑 AppState.dailyTotals actualizado post-backfill');
        }
    } catch (e) {
        console.warn('Error refreshing daily summaries:', e);
    }
}
