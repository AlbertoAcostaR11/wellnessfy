
import { AppState, saveUserData } from '../utils/state.js';
import { requestGoogleSync } from '../utils/googleHealth.js';
import { renderDeportesTab } from '../utils/sportsData.js';
import { syncHealthData, getActiveProviderName } from '../utils/healthSync.js';

// Función unificada de sincronización
export async function handleHealthSync() {
    const provider = getActiveProviderName();
    console.log(`🔄 Iniciando sincronización con ${provider}...`);

    const syncIcon = document.getElementById('syncIcon');
    const syncLabel = document.getElementById('syncLabel');
    const originalLabel = syncLabel ? syncLabel.innerText : 'Sincronizar';

    try {
        if (syncIcon) syncIcon.classList.add('animate-spin');
        if (syncLabel) syncLabel.innerText = 'Sincronizando...';

        if (provider === 'googleFit') {
            // Usar flujo legacy de Google (maneja su propia UI de carga parcialmente)
            if (syncIcon) syncIcon.classList.remove('animate-spin'); // requestGoogleSync lo maneja
            await requestGoogleSync();
        } else {
            // Nuevo flujo para Fitbit y otros
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // Últimos 7 días

            const result = await syncHealthData(startDate, endDate);

            console.log('📊 Datos sincronizados de Fitbit:', result);

            // Guardar datos en AppState
            if (result && result.categorized) {
                // Guardar actividades deportivas
                AppState.activities = result.categorized.sports || [];

                // Guardar métricas del día
                if (result.todayMetrics) {
                    AppState.todayStats = {
                        steps: result.todayMetrics.steps || 0,
                        calories: result.todayMetrics.calories || 0,
                        sleep: result.todayMetrics.sleep || null,
                        heartRate: result.todayMetrics.heartRate || null
                    };
                }

                // Persistir en localStorage
                saveUserData();

                console.log('✅ Datos guardados en AppState:', {
                    activities: AppState.activities.length,
                    todayStats: AppState.todayStats
                });
            }

            // Guardar timestamp
            localStorage.setItem('last_health_sync', Date.now());

            // Recargar para refrescar toda la UI
            window.location.reload();
        }
    } catch (error) {
        console.error('❌ Error en sincronización:', error);
        alert(`Error al sincronizar con ${provider}: ${error.message}`);
    } finally {
        if (syncIcon) syncIcon.classList.remove('animate-spin');
        if (syncLabel) syncLabel.innerText = originalLabel;
    }
}

// Re-export for global access via main.js
export { handleHealthSync as syncHealthConnect };

export function renderActivity() {
    const user = AppState.currentUser;

    // Obtener proveedor activo para mostrar ícono correcto
    const activeProvider = getActiveProviderName() || 'googleFit';
    let providerIcon = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Fit_icon_%282018%29.svg/1024px-Google_Fit_icon_%282018%29.svg.png';

    if (activeProvider === 'fitbit') {
        providerIcon = 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Fitbit_logo_2016.svg'; // O un ícono local
    }

    // Obtener última sincronización
    const lastSync = localStorage.getItem('last_health_sync');
    let lastSyncText = 'Nunca';
    if (lastSync) {
        const syncDate = new Date(parseInt(lastSync));
        const now = new Date();
        const diffMinutes = Math.floor((now - syncDate) / 60000);

        if (diffMinutes < 1) {
            lastSyncText = 'Hace un momento';
        } else if (diffMinutes < 60) {
            lastSyncText = `Hace ${diffMinutes} min`;
        } else {
            const diffHours = Math.floor(diffMinutes / 60);
            lastSyncText = `Hace ${diffHours}h`;
        }
    }

    return `
        <!-- Minimal Sync Control -->
        <div class="flex justify-between items-center mb-4 relative z-50">
            <div class="flex flex-col">
                <h2 class="text-xl font-bold text-white">Actividad</h2>
                <p class="text-[10px] text-white/40 uppercase tracking-wider">Última sync: ${lastSyncText}</p>
            </div>
            <div class="flex items-center gap-2 opacity-80 cursor-pointer bg-white/5 py-2 px-4 rounded-full hover:opacity-100 hover:bg-white/10 transition-all border border-white/5 shadow-lg backdrop-blur-md active:scale-95" onclick="syncHealthConnect()" id="syncBtn">
                <span class="material-symbols-outlined text-[16px] text-[#00f5d4]" id="syncIcon">sync</span>
                <p class="text-white text-[11px] font-bold uppercase tracking-widest" id="syncLabel">Sincronizar</p>
                <div class="w-px h-3 bg-white/20 mx-1"></div>
                <img src="${providerIcon}" class="size-4 object-contain" alt="Provider">
            </div>
        </div>

        <!-- Tabs Navigation -->
        <div class="flex gap-2 mb-6 relative z-40">
            <button 
                class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 active"
                data-tab="resumen"
                onclick="window.switchActivityTab('resumen')"
            >
                <span class="material-symbols-outlined text-lg mr-2 align-middle">dashboard</span>
                Resumen
            </button>
            <button 
                class="activity-tab flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300"
                data-tab="deportes"
                onclick="window.switchActivityTab('deportes')"
            >
                <span class="material-symbols-outlined text-lg mr-2 align-middle">sports_tennis</span>
                Mis Deportes
            </button>
        </div>

        <!-- Tab Content: Resumen -->
        <div id="tab-resumen" class="tab-content">
            ${renderResumenTab()}
        </div>

        <!-- Tab Content: Mis Deportes -->
        <div id="tab-deportes" class="tab-content hidden">
            ${renderDeportesTab()}
        </div>
    `;
}

function renderResumenTab() {
    const user = AppState.currentUser;

    // Leer de AppState.todayStats (donde guardamos datos de Fitbit)
    const todayStats = AppState.todayStats || {};
    const stepsVal = todayStats.steps ? todayStats.steps.toLocaleString() : '--';
    const activeVal = '--'; // TODO: calcular minutos activos desde actividades
    const caloriesVal = todayStats.calories ? todayStats.calories.toLocaleString() : '--';
    const sleepVal = todayStats.sleep ? (todayStats.sleep.duration / 60).toFixed(1) : '--'; // Convertir minutos a horas
    const heartVal = todayStats.heartRate?.resting || '--';

    return `
        <!-- Today's Vitals Section -->
        <!-- Today's Vitals Section -->
        <section class="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden">
             <!-- Background Neon Glow (Ambient) -->
             <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-40 bg-[#00f5d4]/10 blur-[50px] rounded-full pointer-events-none"></div>

            <div class="flex items-center justify-between mb-8 relative z-10">
                <h3 class="text-lg font-bold tracking-tight text-white">Análisis Diario</h3>
                <span class="text-[#00f5d4] text-[10px] font-bold bg-[#00f5d4]/10 border border-[#00f5d4]/20 px-3 py-1 rounded-full uppercase tracking-tighter">En Vivo</span>
            </div>

            <div class="flex flex-col items-center gap-8 relative z-10">
                <!-- Energy Ring Chart -->
                <div class="relative size-56">
                    <svg class="size-full overflow-visible">
                        <defs>
                            <linearGradient id="neon-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stop-color="#00f5d4"></stop>
                                <stop offset="100%" stop-color="#00d2ff"></stop>
                            </linearGradient>
                            <filter id="neon-glow-filter">
                                <feGaussianBlur result="blur" stdDeviation="2.5"></feGaussianBlur>
                                <feComposite in="SourceGraphic" in2="blur" operator="over"></feComposite>
                            </filter>
                        </defs>
                        <!-- Background Circles -->
                        <circle class="stroke-white/5" cx="112" cy="112" fill="transparent" r="95" stroke-width="12"></circle>
                        <circle class="stroke-white/5" cx="112" cy="112" fill="transparent" r="75" stroke-width="12"></circle>
                        <circle class="stroke-white/5" cx="112" cy="112" fill="transparent" r="55" stroke-width="12"></circle>
                        
                        <!-- Progress Circles -->
                        <!-- Outer: Energy (Teal gradient) -->
                        <circle class="progress-ring-circle" cx="112" cy="112" fill="transparent" r="95" stroke="url(#neon-gradient)" stroke-dasharray="597" stroke-dashoffset="120" stroke-linecap="round" stroke-width="12"></circle>
                        <!-- Middle: Steps (Blue) -->
                        <circle class="progress-ring-circle" cx="112" cy="112" fill="transparent" r="75" stroke="#00d2ff" stroke-dasharray="471" stroke-dashoffset="180" stroke-linecap="round" stroke-width="12" style="filter: drop-shadow(0 0 3px #00d2ff);"></circle>
                        <!-- Inner: Sleep (Purple) -->
                        <circle class="progress-ring-circle" cx="112" cy="112" fill="transparent" r="55" stroke="#7000ff" stroke-dasharray="345" stroke-dashoffset="60" stroke-linecap="round" stroke-width="12" style="filter: drop-shadow(0 0 3px #7000ff);"></circle>
                    </svg>
                    
                    <!-- Center Data -->
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="material-symbols-outlined text-[#00f5d4] text-4xl neon-text-glow" style="font-variation-settings: 'FILL' 1">bolt</span>
                        <span class="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-[0.2em]">Energía</span>
                    </div>
                </div>

                <!-- Stats Grid - Primera Fila (Pasos, Activo, Sueño) -->
                <div class="grid grid-cols-3 gap-3 w-full mb-3">
                    <!-- Steps -->
                    <div class="flex flex-col items-center justify-center p-4 glass-card rounded-2xl bg-[#0f172a] border border-white/5 shadow-lg">
                        <span class="material-symbols-outlined text-2xl mb-1 text-[#00ff9d] drop-shadow-[0_0_5px_rgba(0,255,157,0.5)]">directions_walk</span>
                        <span class="text-[10px] font-bold text-[#00ff9d] uppercase tracking-wider mb-1">Pasos</span>
                        <span class="text-lg font-bold text-[#00ff9d]" id="valSteps">${stepsVal}</span>
                    </div>
                    <!-- Active -->
                    <div class="flex flex-col items-center justify-center p-4 glass-card rounded-2xl bg-[#0f172a] border border-white/5 shadow-lg">
                        <span class="material-symbols-outlined text-2xl mb-1 text-[#00d9ff] drop-shadow-[0_0_5px_rgba(0,217,255,0.5)]">fitness_center</span>
                        <span class="text-[10px] font-bold text-[#00d9ff] uppercase tracking-wider mb-1">Activo</span>
                        <span class="text-lg font-bold text-[#00d9ff]"><span id="valActive">${activeVal}</span><span class="text-xs ml-0.5">m</span></span>
                    </div>
                    <!-- Sleep -->
                    <div class="flex flex-col items-center justify-center p-4 glass-card rounded-2xl bg-[#0f172a] border border-white/5 shadow-lg">
                        <span class="material-symbols-outlined text-2xl mb-1 text-[#bd00ff] drop-shadow-[0_0_5px_rgba(189,0,255,0.5)]" style="font-variation-settings: 'FILL' 1">bedtime</span>
                        <span class="text-[10px] font-bold text-[#bd00ff] uppercase tracking-wider mb-1">Sueño</span>
                        <span class="text-lg font-bold text-[#bd00ff]" id="valSleep">${sleepVal}<span class="text-xs mx-0.5">h</span></span>
                    </div>
                </div>

                <!-- Stats Grid - Segunda Fila (Calorías, Corazón) -->
                <div class="grid grid-cols-2 gap-3 w-full">
                    <!-- Calories -->
                    <div class="flex flex-col items-center justify-center p-4 glass-card rounded-2xl bg-[#0f172a] border border-white/5 shadow-lg relative overflow-hidden">
                        <div class="absolute inset-0 bg-[#ff9100]/5 pointer-events-none"></div>
                        <span class="material-symbols-outlined text-2xl mb-1 text-[#ff9100] drop-shadow-[0_0_5px_rgba(255,145,0,0.6)]" style="font-variation-settings: 'FILL' 1">local_fire_department</span>
                        <span class="text-[10px] font-bold text-[#ff9100] uppercase tracking-wider mb-1">Calorías</span>
                        <span class="text-lg font-bold text-[#ffb700]" id="valCalories">${caloriesVal}</span>
                    </div>
                    <!-- Heart -->
                    <div class="flex flex-col items-center justify-center p-4 glass-card rounded-2xl bg-[#0f172a] border border-white/5 shadow-lg relative overflow-hidden">
                        <div class="absolute inset-0 bg-[#ff0055]/5 pointer-events-none"></div>
                        <span class="material-symbols-outlined text-2xl mb-1 text-[#ff0055] drop-shadow-[0_0_5px_rgba(255,0,85,0.6)]" style="font-variation-settings: 'FILL' 1">favorite</span>
                        <span class="text-[10px] font-bold text-[#ff0055] uppercase tracking-wider mb-1">Corazón</span>
                        <div class="flex items-center gap-1">
                            <span class="text-lg font-bold text-white" id="valHeart">${heartVal}</span>
                            <div class="size-1.5 bg-[#ff0055] rounded-full animate-pulse shadow-[0_0_6px_#ff0055]"></div>
                        </div>
                    </div>
                </div>

                <!-- Activity by Hour Chart -->
                <div class="mt-6 pt-6 border-t border-white/10 w-full">
                    <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                        <span class="material-symbols-outlined text-[#00f5d4] text-lg">schedule</span>
                        Actividad por Hora
                    </h4>
                    <div id="hourlyActivityChart" class="h-32 flex items-end justify-between gap-1">
                        <!-- Will be populated by weeklyCharts.js -->
                    </div>
                    <div id="hourlyActivityLabels" class="flex justify-between text-[9px] text-white/40 mt-2">
                        <!-- Labels will be populated by weeklyCharts.js -->
                    </div>
                </div>
            </div>
        </section>

        <!-- Weekly Stats Section -->
        <section class="glass-card rounded-3xl p-6 mb-6 relative overflow-hidden mt-6">
            <div class="flex items-center justify-between mb-6 relative z-10">
                <h3 class="text-lg font-bold tracking-tight text-white">Estadísticas Semanales</h3>
                <span class="text-[#00f5d4] text-[10px] font-bold bg-[#00f5d4]/10 border border-[#00f5d4]/20 px-3 py-1 rounded-full uppercase tracking-tighter">Últimos 7 días</span>
            </div>


            <!-- Exercise Days -->
            <div class="mb-8">
                <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#00ff9d] text-lg">fitness_center</span>
                    Días de Ejercicio
                </h4>
                <div id="exerciseDaysChart" class="flex justify-between gap-2">
                    <!-- Will be populated by weeklyCharts.js -->
                </div>
            </div>

            <!-- Sleep History -->
            <div class="mb-4">
                <h4 class="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#818cf8] text-lg">bedtime</span>
                    Sueño (Últimos 7 días)
                </h4>
                <div id="sleepChart" class="flex items-end justify-between gap-2 h-24">
                    <!-- Will be populated by weeklyCharts.js -->
                </div>
            </div>

            <!-- Weekly Totals -->
            <div class="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/10">
                <div class="text-center">
                    <span class="material-symbols-outlined text-[#00ff9d] text-2xl mb-2 inline-block">directions_walk</span>
                    <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Total Pasos</p>
                    <p class="text-xl font-bold text-[#00ff9d]" id="weeklySteps">--</p>
                </div>
                <div class="text-center">
                    <span class="material-symbols-outlined text-[#00d9ff] text-2xl mb-2 inline-block">route</span>
                    <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Distancia</p>
                    <p class="text-xl font-bold text-[#00d9ff]"><span id="weeklyDistance">--</span><span class="text-xs ml-1">km</span></p>
                </div>
                <div class="text-center">
                    <span class="material-symbols-outlined text-[#ff9100] text-2xl mb-2 inline-block" style="font-variation-settings: 'FILL' 1">local_fire_department</span>
                    <p class="text-[10px] text-white/40 uppercase tracking-wider mb-1">Calorías</p>
                    <p class="text-xl font-bold text-[#ff9100]" id="weeklyCalories">--</p>
                </div>
            </div>
        </section>

        <!-- AUN QUE NO LO CREAS ESTA ES LA SECCIÓN DE MENTAL WELL-BEING -->
        <section class="bg-[#151925] rounded-3xl p-6 border border-white/5 shadow-xl relative overflow-hidden backdrop-blur-xl mt-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-white">Bienestar Emocional</h3>
                <span class="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50 font-medium border border-white/5">HOY</span>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <!-- Meditación -->
                <div class="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10">
                    <!-- Icono Meditación: Mente/Iluminación -->
                    <span class="material-symbols-outlined text-4xl text-purple-400 mb-1" style="font-variation-settings: 'FILL' 1">psychiatry</span>
                    <p class="text-[10px] font-bold text-purple-400 tracking-widest uppercase mb-1">MEDITACIÓN</p>
                    <p class="text-2xl font-bold text-purple-400 flex items-baseline">
                        <span id="meditationHours">0</span><span class="text-sm font-bold text-white/40 ml-0.5 mr-1">h</span>
                        <span id="meditationMins">00</span><span class="text-sm font-bold text-white/40 ml-0.5">m</span>
                    </p>
                </div>

                <!-- Yoga -->
                <div class="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10">
                    <span class="material-symbols-outlined text-4xl text-pink-400 mb-1">self_improvement</span>
                    <p class="text-[10px] font-bold text-pink-400 tracking-widest uppercase mb-1">YOGA</p>
                    <p class="text-2xl font-bold text-pink-400 flex items-baseline">
                        <span id="yogaHours">0</span><span class="text-sm font-bold text-white/40 ml-0.5 mr-1">h</span>
                        <span id="yogaMins">00</span><span class="text-sm font-bold text-white/40 ml-0.5">m</span>
                    </p>
                </div>

                <!-- Respiración -->
                <div class="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10">
                    <span class="material-symbols-outlined text-3xl text-blue-400 mb-1">air</span>
                    <p class="text-[10px] font-bold text-blue-400 tracking-widest uppercase mb-1">RESPIRACIÓN</p>
                    <p class="text-2xl font-bold text-blue-400 flex items-baseline">
                        <span id="breathingHours">0</span><span class="text-sm font-bold text-white/40 ml-0.5 mr-1">h</span>
                        <span id="breathingMins">00</span><span class="text-sm font-bold text-white/40 ml-0.5">m</span>
                    </p>
                </div>

                <!-- Estrés -->
                <div class="bg-white/5 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center gap-1 transition-all hover:bg-white/10">
                    <span class="material-symbols-outlined text-3xl text-orange-400 mb-1">psychology</span>
                    <p class="text-[10px] font-bold text-orange-400 tracking-widest uppercase mb-1">ESTRÉS</p>
                    <div class="flex flex-col items-center">
                         <p class="text-xl font-bold text-orange-400" id="stressText">--</p>
                         <div class="w-16 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <div id="stressBar" class="h-full bg-orange-400" style="width: 0%"></div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="mt-6 text-center mb-20">
            <p class="text-[10px] text-white/30 uppercase tracking-widest">Powered by Google Health Connect</p>
        </div>
        </div>
    `;
}
