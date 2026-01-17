/* src/pages/activity.js - FIXED & CLEANED v2 */
import { AppState, saveUserData } from '../utils/state.js';
import { requestGoogleSync } from '../utils/googleHealth.js';
import { healthProviderManager } from '../utils/healthProviders/HealthProviderManager.js';
import { syncHealthData } from '../utils/healthSync.js';

// --- Tab Switching Logic ---
window.switchActivityTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    document.querySelectorAll('.activity-tab').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
};

// --- Main Sync Handler ---
async function handleHealthSync() {
    const syncBtn = document.getElementById('syncBtn');
    const syncIcon = document.getElementById('syncIcon');
    const syncLabel = document.getElementById('syncLabel');
    // const originalLabel = syncLabel ? syncLabel.innerText : 'Sincronizar';

    try {
        const provider = healthProviderManager.activeProvider || 'fitbit';

        if (syncIcon) syncIcon.classList.add('animate-spin');
        if (syncLabel) syncLabel.innerText = 'Sincronizando...';

        console.log('🚀 Iniciando sincronización real con Motor Universal...');

        if (provider === 'googleFit') {
            await requestGoogleSync();
        } else {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6);

            const result = await syncHealthData(startDate, endDate);
            console.log('📊 Resultado del Motor Universal:', result);

            if (result) {
                if (result.categorized && result.categorized.sports) {
                    AppState.activities = result.categorized.sports;
                } else if (Array.isArray(result)) {
                    AppState.activities = result;
                }
                if (result.todayMetrics) {
                    AppState.todayStats = result.todayMetrics;
                }
                saveUserData();
            }
        }

        if (syncLabel) syncLabel.innerText = 'Sincronizado';
        console.log('🔄 Refrescando vista de actividad...');
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.innerHTML = renderActivity();

    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        alert(`Error: ${error.message}`);
    } finally {
        if (syncIcon) syncIcon.classList.remove('animate-spin');
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
        <div class="flex justify-between items-center mb-4 relative z-50">
             <div class="flex flex-col">
                <h2 class="text-xl font-bold text-white">Actividad</h2>
                <p class="text-[10px] text-white/40 uppercase tracking-wider">Última sync: ${lastSyncText}</p>
            </div>
            <div class="flex items-center gap-2 opacity-80 cursor-pointer bg-white/5 py-2 px-4 rounded-full hover:opacity-100 backdrop-blur-md" onclick="window.syncHealthConnect()" id="syncBtn">
                <span class="material-symbols-outlined text-[16px] text-[#00f5d4]" id="syncIcon">sync</span>
                <p class="text-white text-[11px] font-bold uppercase tracking-widest" id="syncLabel">Sincronizar</p>
                <div class="w-px h-3 bg-white/20 mx-1"></div>
                <img src="${providerIcon}" class="size-4 object-contain">
            </div>
        </div>

        <div class="flex gap-2 mb-6 relative z-40">
            <button class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all active" data-tab="resumen" onclick="window.switchActivityTab('resumen')">
                <span class="material-symbols-outlined text-lg mr-2 align-middle">dashboard</span>Resumen
            </button>
            <button class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all" data-tab="deportes" onclick="window.switchActivityTab('deportes')">
                <span class="material-symbols-outlined text-lg mr-2 align-middle">sports_tennis</span>Mis Deportes
            </button>
        </div>

        <div id="tab-resumen" class="tab-content">
            ${renderResumenTab()}
        </div>
        <div id="tab-deportes" class="tab-content hidden">
            ${renderDeportesTab()}
        </div>
    `;
}

// --- Render Resumen Tab ---
function renderResumenTab() {
    const todayStats = AppState.todayStats || {};

    // Values
    const stepsVal = todayStats.steps ? todayStats.steps.toLocaleString() : '--';
    const caloriesVal = todayStats.calories ? todayStats.calories.toLocaleString() : '--';
    const sleepVal = todayStats.sleep ? (todayStats.sleep.duration / 60).toFixed(1) : '--';
    const heartVal = todayStats.heartRate?.resting || '--';

    // Active Minutes Calculation
    let activeMinutes = 0;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Safety check for AppState.activities
    const todaysActivities = (AppState.activities || []).filter(act => {
        try {
            return new Date(act.startTime).toISOString().split('T')[0] === todayStr;
        } catch (e) { return false; }
    });
    todaysActivities.forEach(act => activeMinutes += (act.duration || 0));
    const activeVal = activeMinutes > 0 ? Math.round(activeMinutes) : '--';
    const activeValText = activeMinutes > 0 ? `${activeVal}m` : '-- m';

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
                        <span class="text-lg font-bold text-[#d946ef]">${sleepVal}<span class="text-xs">h</span></span>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 w-full">
                     <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#fb923c] mb-1">local_fire_department</span>
                        <span class="text-lg font-bold text-[#fb923c]">${caloriesVal}</span>
                    </div>
                     <div class="p-3 glass-card bg-[#0f172a]/50 rounded-xl flex flex-col items-center">
                        <span class="material-symbols-outlined text-[#f43f5e] mb-1">favorite</span>
                        <span class="text-lg font-bold text-white">${heartVal}</span>
                    </div>
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

function renderWeeklyStats() {
    return `<div class="glass-card rounded-2xl p-4 text-center text-white/20 text-xs mt-4">Gráficas Semanales Cargando...</div>`;
}

// --- Mis Deportes Tab (Simple List Implementation) ---
function renderDeportesTab() {
    const activities = AppState.activities || [];
    if (activities.length === 0) {
        return `<div class="flex flex-col items-center justify-center py-20 text-white/30">
            <span class="material-symbols-outlined text-4xl mb-2">sports_off</span>
            <p>No hay deportes registrados aún</p>
        </div>`;
    }

    // Sort by date desc
    const sorted = [...activities].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    return `
        <div class="space-y-3 pb-24">
            ${sorted.map(act => {
        const date = new Date(act.startTime).toLocaleDateString();
        const time = new Date(act.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
                <div class="glass-card p-4 rounded-2xl flex items-center justify-between border border-white/5">
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-full bg-white/10 flex items-center justify-center text-lg">
                            ${getIconForSport(act.sportKey)}
                        </div>
                        <div>
                            <h4 class="font-bold text-white capitalize">${act.name || act.sportKey || 'Deporte'}</h4>
                            <p class="text-xs text-white/40">${date} • ${time}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-[#00f5d4]">${act.duration ? Math.round(act.duration) + 'm' : ''}</p>
                        <p class="text-xs text-white/40">${act.calories ? Math.round(act.calories) + 'cal' : ''}</p>
                    </div>
                </div>`;
    }).join('')}
        </div>
    `;
}

function getIconForSport(key) {
    if (!key) return 'sports_score';
    key = key.toLowerCase();
    if (key.includes('run') || key.includes('caminar')) return 'directions_run';
    if (key.includes('gym') || key.includes('pesas')) return 'fitness_center';
    if (key.includes('yoga')) return 'self_improvement';
    if (key.includes('swim')) return 'pool';
    if (key.includes('tennis')) return 'sports_tennis';
    return 'sports_score';
}

// Export for safe global access
window.renderResumenTab = renderResumenTab;
window.renderWeeklyStats = renderWeeklyStats;
window.renderDeportesTab = renderDeportesTab;
