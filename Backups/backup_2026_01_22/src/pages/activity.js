/* src/pages/activity.js - FIXED & CLEANED v3 */
import { AppState, saveUserData } from '../utils/state.js';
import { requestGoogleSync } from '../utils/googleHealth.js';
import { healthProviderManager } from '../utils/healthProviders/HealthProviderManager.js';
import { syncHealthData } from '../utils/healthSync.js';
import { renderWeeklyCharts } from '../utils/weeklyCharts.js';
import { getLocalISOString, getCurrentWeekDays, getWeekNumber, getWeekStart, getWeekEnd, getWeekStartFromNumber, getWeekEndFromNumber, getFullWeekDays, formatWeekRange } from '../utils/dateHelper.js';
import { renderHistorialTab } from '../utils/historialTabHelper.js';
import { isPhysicalSport, isMindfulnessActivity } from '../utils/activityClassifier.js';

// --- Tab Switching Logic ---
window.switchActivityTab = (tabName) => {
    console.log('🔄 Switching to tab:', tabName);

    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    const targetTab = document.getElementById(`tab-${tabName}`);

    if (!targetTab) {
        console.error('❌ Tab not found:', `tab-${tabName}`);
        return;
    }

    targetTab.classList.remove('hidden');
    console.log('✅ Tab visible:', tabName);

    document.querySelectorAll('.activity-tab').forEach(el => el.classList.remove('active'));
    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
};

// --- Main Sync Handler ---
async function handleHealthSync() {
    const syncBtn = document.getElementById('syncBtn');
    const syncIcon = document.getElementById('syncIcon');
    const syncLabel = document.getElementById('syncLabel');

    try {
        const provider = healthProviderManager.getActiveProvider();
        const providerName = provider ? provider.name.toLowerCase() : 'desconocido';

        if (syncIcon) syncIcon.classList.add('animate-spin');
        if (syncLabel) syncLabel.innerText = 'Sincronizando...';

        console.log(`🚀 [ACTIVITY] Iniciando sincronización con ${providerName}...`);

        // Sincronizar desde el lunes de la semana actual hasta hoy
        const { getWeekStart } = await import('../utils/dateHelper.js');
        const startDate = getWeekStart(); // Lunes de esta semana
        const endDate = new Date(); // Hoy

        // Fetch data
        const result = await syncHealthData(startDate, endDate);
        console.log('📊 [ACTIVITY] Resultado del Motor:', result ? 'Éxito' : 'Vacío');

        if (result) {
            // Actualizar AppState con resultados del motor
            if (result.categorized && result.categorized.sports) {
                AppState.activities = result.categorized.sports;
            } else if (result.normalized) {
                AppState.activities = result.normalized;
            }
            if (result.todayMetrics) AppState.todayStats = result.todayMetrics;
            if (result.sleepHistory) AppState.sleepHistory = result.sleepHistory;
            if (result.dailyTotals) AppState.dailyTotals = result.dailyTotals;

            saveUserData();

            // Solo forzar re-render si estamos en la página de actividad
            if (AppState.currentPage === 'activity') {
                const activeTab = document.querySelector('.activity-tab.active');
                if (activeTab && activeTab.dataset.tab) {
                    window.switchActivityTab(activeTab.dataset.tab);
                }

                console.log('🔄 Refrescando vista de actividad...');
                const mainContent = document.getElementById('mainContent');
                if (mainContent) mainContent.innerHTML = renderActivity();
            }
            window.showToast('Datos actualizados');
        }

        if (syncLabel) syncLabel.innerText = 'Sincronizado';

    } catch (error) {
        console.error('❌ Error en sincronización:', error);

        // Manejo amigable de falta de autenticación
        if (error.message.includes('No autenticado') || error.message.includes('AUTH_ERROR')) {
            const providerId = error.providerId || (healthProviderManager.getActiveProvider() ? healthProviderManager.getActiveProvider().name : 'googleFit');
            const providerName = providerId === 'googleFit' ? 'Google Fit' : (providerId === 'fitbit' ? 'Fitbit' : providerId);

            if (window.showToast) window.showToast(`Tu sesión con ${providerName} ha expirado`, 'warning');

            // Preguntar si quiere reconectar
            setTimeout(() => {
                if (confirm(`Tu sesión con ${providerName} ha expirado o no ha sido iniciada. ¿Quieres conectarte ahora?`)) {
                    if (window.handleGlobalProviderToggle) {
                        window.handleGlobalProviderToggle(providerId, true);
                    } else {
                        window.navigateTo('settings');
                    }
                }
            }, 500);
        } else {
            if (window.showToast) {
                window.showToast(`Error: ${error.message}`, 'error');
            } else {
                alert(`Error: ${error.message}`);
            }
        }
    } finally {
        if (syncIcon) syncIcon.classList.remove('animate-spin');
        if (syncLabel && syncLabel.innerText === 'Sincronizando...') {
            syncLabel.innerText = 'Sincronizar';
        }
    }
}
window.syncHealthConnect = handleHealthSync;
export { handleHealthSync as syncHealthConnect };

// --- Main Render Function ---
export function renderActivity() {
    const activeProvider = healthProviderManager.activeProvider || 'googleFit';
    let providerIcon = activeProvider === 'fitbit'
        ? 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Fitbit_logo_2016.svg'
        : 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Fit_icon_%282018%29.svg/1024px-Google_Fit_icon_%282018%29.svg.png';

    const lastSync = localStorage.getItem('last_health_sync');
    let lastSyncText = 'Nunca';
    if (lastSync) {
        const diffMinutes = Math.floor((new Date() - new Date(parseInt(lastSync))) / 60000);
        lastSyncText = diffMinutes < 1 ? 'Hace un momento' : diffMinutes < 60 ? `Hace ${diffMinutes} min` : `Hace ${Math.floor(diffMinutes / 60)}h`;
    }

    return `
        <!-- Header & Tabs (Cleaned) -->
        <!-- Header & Tabs (Standardized) -->
        <div class="mb-6 relative z-50">
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold tracking-tight text-white">Actividad</h1>
                <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 opacity-80 cursor-pointer bg-white/5 py-2 px-4 rounded-full hover:opacity-100 backdrop-blur-md" onclick="window.syncHealthConnect()" id="syncBtn">
                        <span class="material-symbols-outlined text-[16px] text-[#00f5d4]" id="syncIcon">sync</span>
                        <p class="text-white text-[11px] font-bold uppercase tracking-widest" id="syncLabel">Sincronizar</p>
                        <div class="w-px h-3 bg-white/20 mx-1"></div>
                        <img src="${providerIcon}" class="size-4 object-contain">
                    </div>
                    <button class="relative p-2 rounded-full hover:bg-white/5 transition-all text-white/80 hover:text-white lg:hidden" onclick="navigateTo('notifications')">
                        <span class="material-symbols-outlined text-xl">notifications</span>
                        <div id="notifBadgeMobile" class="absolute top-1.5 right-1.5 min-w-[1rem] h-4 px-1 bg-[#00f5d4] rounded-full hidden flex items-center justify-center shadow-[0_0_8px_#00f5d4]">
                            <span class="text-[9px] font-black text-[#0f172a]" id="notifCountMobile">0</span>
                        </div>
                    </button>
                </div>
            </div>
            <p class="text-[10px] text-white/40 uppercase tracking-wider mt-1">Última sync: ${lastSyncText}</p>
        </div>

        <div class="flex gap-2 mb-6 relative z-40">
            <button class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all active" data-tab="resumen" onclick="window.switchActivityTab('resumen')">
                <span class="material-symbols-outlined text-lg mr-2 align-middle">dashboard</span>Resumen
            </button>
            <button class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all" data-tab="deportes" onclick="window.switchActivityTab('deportes')">
                <span class="material-symbols-outlined text-lg mr-2 align-middle">sports_tennis</span>Mis Deportes
            </button>
            <button class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all" data-tab="historial" onclick="window.switchActivityTab('historial')">
                <span class="material-symbols-outlined text-lg mr-2 align-middle">history</span>Historial
            </button>
        </div>

        <div id="tab-resumen" class="tab-content">
            ${renderResumenTab()}
        </div>
        <div id="tab-deportes" class="tab-content hidden">
            ${renderDeportesTab()}
        </div>
        <div id="tab-historial" class="tab-content hidden">
            ${renderHistorialTab()}
        </div>
    `;
}

// --- Render Resumen Tab ---
function renderResumenTab() {
    const todayStats = AppState.todayStats || {};

    // Helper
    const fmtTime = (mins) => {
        const totalMins = Math.round(mins);
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // Values
    const stepsVal = todayStats.steps ? todayStats.steps.toLocaleString() : '--';
    const caloriesVal = todayStats.calories ? todayStats.calories.toLocaleString() : '--';
    const sleepVal = todayStats.sleep ? fmtTime(todayStats.sleep.duration) : '--';
    const heartVal = todayStats.heartRate?.resting || '--';

    // Active Minutes Calculation
    let activeMinutes = 0;
    const now = new Date();
    // Usar fecha LOCAL en lugar de UTC para evitar problemas de zona horaria
    const todayISO = getLocalISOString();

    const todaysActivities = (AppState.activities || []).filter(act => {
        try {
            const actDate = new Date(act.startTime);
            const actDateStr = getLocalISOString(actDate);
            return actDateStr === todayISO;
        } catch (e) { return false; }
    });
    todaysActivities.forEach(act => {
        if (isPhysicalSport(act)) {
            activeMinutes += (act.duration || 0);
        }
    });
    const activeValText = activeMinutes > 0 ? fmtTime(activeMinutes) : '-- m';

    // Wellbeing Calculation
    let yogaMins = 0, medMins = 0, breathMins = 0;
    todaysActivities.forEach(act => {
        const key = (act.sportKey || '').toLowerCase();
        const d = act.duration || 0;
        if (key.includes('yoga')) yogaMins += d;
        if (key.includes('meditation') || key.includes('mindfulness')) medMins += d;
        if (key.includes('breath') || key.includes('respiracion')) breathMins += d;
    });

    const fmt = (min) => {
        if (!min) return `<span class="text-white/40">0</span><span class="text-xs text-white/20 ml-1">m</span>`;
        const h = Math.floor(min / 60), m = Math.round(min % 60);
        return h > 0 ? `${h}<span class="text-xs text-white/40">h</span> ${m}m` : `${m}<span class="text-xs text-white/40">m</span>`;
    };

    return `
        <section class="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden shadow-2xl">
            <!-- Neon Ring & Header -->
            <div class="flex items-center justify-between mb-8 relative z-10">
                <h3 class="text-lg font-bold text-white">Análisis Diario</h3>
                <span class="text-[#00f5d4] text-[10px] font-bold bg-[#00f5d4]/10 border border-[#00f5d4]/20 px-3 py-1 rounded-full animate-pulse">En Vivo</span>
            </div>
            
            <div class="flex flex-col items-center gap-6 relative z-10">
                <!-- Simple SVG Ring Placeholder -->
                <div class="relative size-48">
                     <svg class="size-full overflow-visible">
                        <circle class="stroke-white/5" cx="96" cy="96" r="80" stroke-width="12" fill="none"></circle>
                        <circle cx="96" cy="96" r="80" stroke-width="12" fill="none" stroke="#00d2ff" stroke-dasharray="500" stroke-dashoffset="100" stroke-linecap="round"></circle>
                     </svg>
                     <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="material-symbols-outlined text-[#00f5d4] text-4xl">bolt</span>
                        <span class="text-[10px] text-white/40 mt-1 font-bold">ENERGÍA</span>
                     </div>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-2 w-full">
                    <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#00ff9d] mb-1">directions_walk</span>
                        <span class="text-[10px] text-white/50 mb-1">Pasos</span>
                        <span class="text-lg font-bold text-[#00ff9d]">${stepsVal}</span>
                    </div>
                    <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#00d2ff] mb-1">fitness_center</span>
                        <span class="text-[10px] text-white/50 mb-1">Activo</span>
                        <span class="text-lg font-bold text-[#00d2ff]">${activeValText}</span>
                    </div>
                    <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#d946ef] mb-1">bedtime</span>
                        <span class="text-[10px] text-white/50 mb-1">Sueño</span>
                        <span class="text-lg font-bold text-[#d946ef]">${sleepVal}</span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 w-full">
                     <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#fb923c] mb-1">local_fire_department</span>
                        <span class="text-[10px] text-white/50 mb-1">Calorías</span>
                        <span class="text-lg font-bold text-[#fb923c]">${caloriesVal}</span>
                    </div>
                     <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#f43f5e] mb-1">favorite</span>
                        <span class="text-[10px] text-white/50 mb-1">Ritmo</span>
                        <span class="text-lg font-bold text-white">${heartVal}</span>
                    </div>
                </div>

                <!-- Daily Activity Graph (Replaced with Weekly Chart Visualization) -->
                <div class="w-full mt-6">
                    <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[#00f5d4] text-lg">schedule</span>
                        Actividad por Hora
                    </h4>
                    <div id="hourlyActivityChart" class="h-32 flex items-end justify-between gap-1 px-2 border-b border-white/5 pb-2">
                        <!-- Populated by weeklyCharts.js -->
                    </div>
                    <div id="hourlyActivityLabels" class="flex justify-between text-[9px] text-white/40 mt-2 px-2"></div>
                </div>
            </div>
        </section>

        <!-- Weekly & Wellbeing -->
        ${renderWeeklyStats()}
        
        <section class="glass-card rounded-3xl p-6 mb-24 mt-6 border border-white/5">
            <h3 class="text-lg font-bold text-white mb-4">Bienestar Emocional</h3>
            <div class="grid grid-cols-2 gap-3">
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#a78bfa] text-2xl mb-1">spa</span>
                    <span class="text-[10px] text-[#a78bfa] font-bold">MEDITACIÓN</span>
                    <span class="text-xl font-bold text-white/90">${fmt(medMins)}</span>
                </div>
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#f472b6] text-2xl mb-1">self_improvement</span>
                    <span class="text-[10px] text-[#f472b6] font-bold">YOGA</span>
                    <span class="text-xl font-bold text-white/90">${fmt(yogaMins)}</span>
                </div>
                 <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#38bdf8] text-2xl mb-1">air</span>
                    <span class="text-[10px] text-[#38bdf8] font-bold">RESPIRACIÓN</span>
                    <span class="text-xl font-bold text-white/90">${fmt(breathMins)}</span>
                </div>
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-orange-400 text-2xl mb-1">psychology</span>
                    <span class="text-[10px] text-orange-400 font-bold">ESTRÉS</span>
                    <span class="text-xl font-bold text-white/40">--</span>
                </div>
            </div>
        </section>
    `;
}

// --- Weekly Stats Render (Restored & Adapted) ---
function renderWeeklyStats() {
    // 1. Calcular estadísticas usando el adaptador (Pasamos actividades y sueño Y dailyTotals)
    const weeklyData = calculateWeeklyStatsFromActivities(AppState.activities || [], AppState.sleepHistory || [], AppState.dailyTotals || []);

    // 2. Guardar en AppState para que weeklyCharts.js los consuma
    AppState.weeklyStats = weeklyData;

    // 3. Programar renderizado de gráficas (después de que el DOM exista)
    setTimeout(() => {
        if (typeof renderWeeklyCharts === 'function') {
            renderWeeklyCharts();
        }
    }, 100);

    // 4. Devolver Estructura HTML Original (Contenedores vacíos para rellenar)
    return `
        <section class="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden mt-6">
            <div class="flex items-center justify-between mb-6 relative z-10">
                <h3 class="text-lg font-bold tracking-tight text-white">Estadísticas</h3>
                <span class="text-[#00f5d4] text-[10px] font-bold bg-[#00f5d4]/10 border border-[#00f5d4]/20 px-3 py-1 rounded-full uppercase tracking-tighter">Semana Actual</span>
            </div>

            <!-- Activity by Hour Chart (MOVED TO DAILY ANALYSIS) -->
            <!-- Was here previously -->

            <!-- Exercise Days -->
            <div class="mb-8">
                <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#00ff9d] text-lg">fitness_center</span>
                    Días de Ejercicio
                </h4>
                <div id="exerciseDaysChart" class="flex justify-between gap-2">
                     <!-- Populated by weeklyCharts.js -->
                </div>
            </div>

            <!-- Sleep History -->
            <div class="mb-4">
                <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#818cf8] text-lg">bedtime</span>
                    Sueño (Semana Actual)
                </h4>
                <div id="sleepChart" class="flex items-end justify-between gap-2 h-24">
                     <!-- Populated by weeklyCharts.js -->
                </div>
            </div>

            <!-- Mindfulness Days -->
            <div class="mb-8 mt-6">
                <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#c084fc] text-lg" style="font-variation-settings: 'FILL' 1">spa</span>
                    Días de Mindfulness
                </h4>
                <div id="mindfulnessDaysChart" class="flex justify-between gap-2">
                     <!-- Populated by weeklyCharts.js -->
                </div>
            </div>

            <!-- Weekly Totals -->
            <div class="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
                <div class="text-center flex flex-col items-center">
                    <span class="material-symbols-outlined text-[#00ff9d] text-2xl mb-1">directions_walk</span>
                    <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Pasos</p>
                    <p class="text-xl font-bold text-[#00ff9d]" id="weeklySteps">--</p>
                </div>
                <div class="text-center flex flex-col items-center">
                    <span class="material-symbols-outlined text-[#00d9ff] text-2xl mb-1">map</span>
                    <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Distancia</p>
                    <p class="text-xl font-bold text-[#00d9ff]"><span id="weeklyDistance">--</span><span class="text-xs ml-1">km</span></p>
                </div>
                <div class="text-center flex flex-col items-center">
                    <span class="material-symbols-outlined text-[#ff9100] text-2xl mb-1">local_fire_department</span>
                    <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Calorías</p>
                    <p class="text-xl font-bold text-[#ff9100]" id="weeklyCalories">--</p>
                </div>
            </div>
        </section>
    `;
}

// --- Data Adapter: Normalized Activities -> Legacy Weekly Format ---
function calculateWeeklyStatsFromActivities(activities, sleepHistory = [], dailyTotals = []) {
    // Usar el nuevo sistema de semanas (Lunes-Domingo)
    // getCurrentWeekDays() retorna desde lunes hasta HOY
    // Si hoy es miércoles: [lun, mar, mié]
    // Si hoy es domingo: [lun, mar, mié, jue, vie, sáb, dom]
    const currentWeekDays = getCurrentWeekDays();

    console.log(`📅 Calculando stats para semana actual (${currentWeekDays.length} días):`, currentWeekDays);

    // 1. Totales, Días de Ejercicio y Días de Mindfulness
    let totalSteps = 0, totalDist = 0, totalCal = 0, totalActiveMinutes = 0;
    const exerciseDaysMap = {}; // fecha -> { hasExercise: bool }
    const mindfulnessDaysMap = {}; // fecha -> { hasMindfulness: bool }

    // Init con fechas vacías
    currentWeekDays.forEach(date => {
        exerciseDaysMap[date] = { date, hasExercise: false, steps: 0, calories: 0 };
        mindfulnessDaysMap[date] = { date, hasMindfulness: false };
    });

    // 2. Procesar Actividades (Rediseño: Minutos Activos por Hora)
    const activityByHour = new Array(24).fill(0).map((_, i) => ({
        hour: i,
        activeMinutes: 0,
        intensity: 0 // 0=none, 1=light, 2=vigorous
    }));
    // Usar fecha LOCAL para evitar problemas de zona horaria
    const todayDateStr = getLocalISOString();

    activities.forEach(act => {
        if (!act) return; // Defensive check against nulls

        try {
            // Usar fecha LOCAL para comparación
            const actDate = new Date(act.startTime);
            const dateStr = getLocalISOString(actDate); // Consistent YYYY-MM-DD

            // A. Sumar a totales semanales (Fallback si no hay dailyTotals)
            if (exerciseDaysMap[dateStr]) {
                // Verificar clasificación centralizada
                const isPhysical = isPhysicalSport(act);
                const duration = act.duration || 0;

                // Lógica de Círculos Verdes (Días de Ejercicio):
                // SOLO si es actividad física Y dura >= 10 minutos
                if (isPhysical && duration >= 10) {
                    exerciseDaysMap[dateStr].hasExercise = true;
                }

                // NOTA: Si hay dailyTotals, steps y calories se sobrescriben abajo para la tarjeta principal,
                // pero se mantiene aquí para acumulados parciales si fallara dailyTotals.
                exerciseDaysMap[dateStr].steps += (act.steps || 0);
                exerciseDaysMap[dateStr].calories += (act.calories || 0);

                // Si es MINDFULNESS (Yoga, Meditación), marcar en su propio mapa
                if (isMindfulnessActivity(act)) {
                    mindfulnessDaysMap[dateStr].hasMindfulness = true;
                }

                totalSteps += (act.steps || 0);
                totalDist += (act.distance || 0);
                totalCal += (act.calories || 0);

                // CORRECCIÓN: Solo sumar minutos activos al total semanal si es DEPORTE FÍSICO
                if (isPhysical) {
                    totalActiveMinutes += duration;
                }
            }

            // B. Distribución por Hora (SOLO HOY para la gráfica diaria)
            // CORRECCIÓN: Solo graficar movimiento físico
            const isPhysicalForGraph = isPhysicalSport(act);

            if (dateStr === todayDateStr && isPhysicalForGraph) {
                const start = new Date(act.startTime);
                const end = act.endTime ? new Date(act.endTime) : new Date(start.getTime() + (act.duration * 60000));

                const startHour = start.getHours();
                const endHour = end.getHours();

                // ... logic to distribute hours ...
                const totalDuration = (end - start) || 1; // ms

                // Distribuir proporcionalmente en las horas que abarca
                for (let h = startHour; h <= endHour; h++) {
                    const hourStart = new Date(start); hourStart.setHours(h, 0, 0, 0);
                    const hourEnd = new Date(start); hourEnd.setHours(h + 1, 0, 0, 0);

                    // Intersección de tiempos
                    const overlapStart = Math.max(start.getTime(), hourStart.getTime());
                    const overlapEnd = Math.min(end.getTime(), hourEnd.getTime());

                    if (overlapEnd > overlapStart) {
                        if (h >= 0 && h < 24) {
                            if (!activityByHour[h].activeMinutes) activityByHour[h].activeMinutes = 0;
                            activityByHour[h].activeMinutes += ((overlapEnd - overlapStart) / 60000);

                            // Estimate intensity logic... kept simple
                            if (act.calories > 5 && activityByHour[h].intensity < 2) activityByHour[h].intensity = 2;
                            else if (activityByHour[h].intensity < 1) activityByHour[h].intensity = 1;
                        }
                    }
                }
            }
        } catch (e) {
            console.warn('Error procesando actividad para stats:', e);
        }
    });

    // 2.5 SUPERPONER TOTALES DIARIOS REALES (Si existen)
    // Esto asegura que "Total Pasos" incluya caminatas casuales, no solo ejercicios.
    if (dailyTotals && dailyTotals.length > 0) {
        // Reiniciar contadores para usar la fuente de verdad superior
        let dtSteps = 0;
        let dtDist = 0;
        let dtCal = 0;
        let hasData = false;

        dailyTotals.forEach(dayStat => {
            if (currentWeekDays.includes(dayStat.date)) {
                dtSteps += (dayStat.steps || 0);
                dtDist += (dayStat.distance || 0);
                dtCal += (dayStat.calories || 0);
                hasData = true;
            }
        });

        if (hasData) {
            totalSteps = dtSteps;
            totalDist = dtDist; // Ya viene en KM usualmente desde el provider
            totalCal = dtCal;
            console.log('✅ Usando Totales Diarios Reales para Resumen Semanal:', { totalSteps, totalDist, totalCal });
        }
    }

    // Helper para formato seguro de día (Evitar UTC shift)
    const getLabel = (dStr) => {
        const [y, m, d] = dStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short' });
    };

    // 3. Formatear para legacy charts
    const exerciseDays = currentWeekDays.map(date => ({
        day: getLabel(date),
        ...exerciseDaysMap[date]
    }));

    // 4. Real Sleep Data from History
    const sleepData = currentWeekDays.map(dateStr => {
        const entry = sleepHistory.find(s => s.date === dateStr);
        return {
            day: getLabel(dateStr),
            hours: entry ? entry.duration : 0
        };
    });

    const mindfulnessDays = currentWeekDays.map(date => ({
        day: getLabel(date),
        ...mindfulnessDaysMap[date]
    }));

    return {
        weeklyTotals: {
            steps: totalSteps,
            distance: totalDist,
            calories: totalCal,
            activeMinutes: totalActiveMinutes
        },
        activityByHour: activityByHour,
        exerciseDays: exerciseDays,
        mindfulnessDays: mindfulnessDays,
        sleepData: sleepData
    };
}

// --- Mis Deportes Tab (Dynamic Charts Implementation) ---
function renderDeportesTab() {
    const activities = AppState.activities || [];

    // --- LÓGICA DE GRÁFICAS DETALLADAS ---
    const sportsData = aggregateSportsData(activities);

    // Ordenar por tiempo total de dedicación (duration)
    const sportsList = Object.keys(sportsData).sort((a, b) => sportsData[b].totalDuration - sportsData[a].totalDuration);

    // Labels de días (ej. 'Lun', 'Mar')
    const today = new Date();
    const dayLabels = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3);
    });

    if (sportsList.length === 0) {
        return `<div class="flex flex-col items-center justify-center py-20 text-white/30">
            <span class="material-symbols-outlined text-4xl mb-2">event_busy</span>
            <p>No hay actividad registrada esta semana</p>
        </div>`;
    }

    // Helper para formatear tiempo (ej. 82m -> 1h 22m)
    const fmtTime = (mins) => {
        const totalMins = Math.round(mins);
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    // Generate Cards HTML
    const cardsHtml = sportsList.map(sportName => {
        const data = sportsData[sportName];
        const meta = data.meta;

        // Header Metrics: Show Distance if applicable, otherwise Time
        const showDistInHeader = meta.unit === 'km';
        const totalValue = showDistInHeader ? data.totalDistance : data.totalDuration;
        const totalUnit = showDistInHeader ? 'km' : 'min';
        const dailyAvg = totalValue / 7;

        // Escala de barras SIEMPRE basada en TIEMPO (Duración)
        // Encontrar el día con más minutos para calcular el 100% de altura
        const maxDuration = Math.max(...data.days.map(d => d.duration), 1);

        const barsHtml = data.days.map((dayData, idx) => {
            const minutes = dayData.duration;
            const dist = dayData.distance;

            // Calcular altura en PIXELES (no porcentaje)
            const containerHeight = 96;
            const heightPct = (minutes / maxDuration) * 100;
            const heightPx = Math.max((heightPct / 100) * containerHeight, minutes > 0 ? 4 : 2);

            const isToday = idx === 6;

            // Background style based on sport color
            const bgStyle = minutes > 0
                ? `background: linear-gradient(to top, ${meta.color}, ${meta.color}80);`
                : 'background: rgba(255,255,255,0.05);';

            // --- ETIQUETA FLOTANTE (TOOLTIP) ---
            let tooltipContent = '';
            if (minutes > 0) {
                if (meta.unit === 'km' && dist > 0) {
                    tooltipContent = `
                        <div class="font-bold text-[#00f5d4] text-[10px] leading-tight">${dist.toFixed(1)} km</div>
                        <div class="text-white/80 text-[9px] leading-tight">${fmtTime(minutes)}</div>
                    `;
                } else {
                    tooltipContent = `
                        <div class="font-bold text-white text-[10px] leading-tight">${fmtTime(minutes)}</div>
                    `;
                }
            }

            const tooltipHtml = minutes > 0 ?
                `<div class="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f172a] border border-white/10 shadow-xl px-2 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all z-20 pointer-events-none flex flex-col items-center min-w-[50px]">
                    ${tooltipContent}
                    <!--Triangle Arrow-->
                    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0f172a] border-r border-b border-white/10 rotate-45"></div>
                </div>` : '';

            return `
                <div class="flex-1 flex flex-col items-center gap-1 group/bar relative">
                    ${tooltipHtml}
                    <div class="w-full rounded-t-lg transition-all hover:brightness-125 hover:scale-x-110 origin-bottom duration-200"
                         style="height: ${heightPx}px; ${bgStyle}"></div>
                    <span class="text-[8px] ${isToday ? 'text-white font-bold' : 'text-white/30'} uppercase">${dayLabels[idx]}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="glass-card p-5 rounded-2xl border border-white/5 transition-colors hover:border-[${meta.color}]/30">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-xl flex items-center justify-center text-xl bg-[${meta.color}]/10 border border-[${meta.color}]/20">
                            <span class="material-symbols-outlined" style="color: ${meta.color};">${meta.icon}</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-white">${sportName}</h4>
                            <p class="text-[10px] text-white/40">
                                ${showDistInHeader ? `${totalValue.toFixed(1)} km` : fmtTime(totalValue)} totales
                            </p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[9px] text-white/40 uppercase tracking-wider">PROMEDIO</p>
                        <p class="text-sm font-bold" style="color: ${meta.color}">
                            ${showDistInHeader ? `${dailyAvg.toFixed(1)} <span class="text-[10px]">km/día</span>` : `${fmtTime(dailyAvg)} <span class="text-[10px]">/día</span>`}
                        </p>
                    </div>
                </div>
                
                <div class="h-24 flex items-end justify-between gap-2 mt-2 pt-4">
                    ${barsHtml}
                </div>
            </div>`;
    }).join('');

    return `
        <div class="space-y-4 pb-24">
            ${cardsHtml}
        </div>
    `;
}

// --- Helpers for Mis Deportes (Dynamic Charts) ---

function getSportMetadata(sportKey) {
    // Definición de colores e iconos por deporte
    const META = {
        'yoga': { name: 'Yoga', icon: 'self_improvement', color: '#a29bfe', unit: 'min' },
        'meditation': { name: 'Meditación', icon: 'psychiatry', color: '#b19cd9', unit: 'min' },
        'running': { name: 'Correr', icon: 'directions_run', color: '#ff6b6b', unit: 'km' },
        'walking': { name: 'Caminata', icon: 'directions_walk', color: '#00ff9d', unit: 'km' },
        'cycling': { name: 'Ciclismo', icon: 'directions_bike', color: '#4ecdc4', unit: 'km' },
        'gym': { name: 'Gimnasio', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'weights': { name: 'Pesas', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'weightlifting': { name: 'Halterofilia', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'strength_training': { name: 'Entrenamiento de Fuerza', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'swimming': { name: 'Natación', icon: 'pool', color: '#00d2ff', unit: 'km' },
        'tennis': { name: 'Tenis', icon: 'sports_tennis', color: '#ffeaa7', unit: 'min' },
        'soccer': { name: 'Fútbol', icon: 'sports_soccer', color: '#00b894', unit: 'min' },
        'football_soccer': { name: 'Fútbol', icon: 'sports_soccer', color: '#00b894', unit: 'min' },
        'basketball': { name: 'Baloncesto', icon: 'sports_basketball', color: '#ff7675', unit: 'min' },
        'hiking': { name: 'Senderismo', icon: 'hiking', color: '#26de81', unit: 'km' },
        'default': { name: 'Actividad', icon: 'sports_score', color: '#95a5a6', unit: 'min' }
    };

    const key = (sportKey || '').toLowerCase();
    // Búsqueda aproximada
    const match = META[key] ||
        Object.keys(META).find(k => key.includes(k)) && META[Object.keys(META).find(k => key.includes(k))] ||
        { ...META.default, name: sportKey || 'Actividad' };

    return match;
}

function aggregateSportsData(activities) {
    if (!activities || activities.length === 0) return {};

    const sports = {};
    const today = new Date();

    // Generar array de fechas usando Helper Local
    const dates = [...Array(7)].map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        return getLocalISOString(d); // "2026-01-16" (Local)
    });

    activities.forEach(act => {
        if (!act.startTime) return;

        // Extraer fecha usando Helper Local (Maneja timestamps, strings y Dates)
        const dateStr = getLocalISOString(act.startTime);

        const dayIndex = dates.indexOf(dateStr);

        // Solo procesar si está en los últimos 7 días
        if (dayIndex >= 0) {
            const key = (act.sportKey || act.name || 'unknown').toLowerCase();
            const meta = getSportMetadata(key);
            const sportName = meta.name;

            if (!sports[sportName]) {
                sports[sportName] = {
                    days: Array(7).fill(null).map(() => ({ duration: 0, distance: 0 })),
                    totalDuration: 0,
                    totalDistance: 0,
                    meta: meta,
                    count: 0
                };
            }

            // Extraer valores
            let dist = 0;
            if (act.distance) {
                // Normalizar a KM si es necesario (asumimos que si > 100 son metros)
                dist = act.distance > 100 ? act.distance / 1000 : act.distance;
            }
            const duration = act.duration || 0; // Minutos

            // Acumular en el día específico
            sports[sportName].days[dayIndex].duration += duration;
            sports[sportName].days[dayIndex].distance += dist;

            // Acumular totales
            sports[sportName].totalDuration += duration;
            sports[sportName].totalDistance += dist;
            sports[sportName].count++;
        }
    });

    return sports;
}

// Export for safe global access
window.renderResumenTab = renderResumenTab;
window.renderWeeklyStats = renderWeeklyStats;
window.renderDeportesTab = renderDeportesTab;
window.renderHistorialTab = renderHistorialTab;
