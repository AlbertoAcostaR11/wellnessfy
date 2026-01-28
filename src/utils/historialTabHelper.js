// Historial Tab Helper Functions for activity.js
import { AppState } from './state.js';
import {
    getLocalISOString,
    getWeekNumber,
    getWeekStartFromNumber,
    getWeekEndFromNumber,
    getFullWeekDays,
    formatWeekRange
} from './dateHelper.js';
import { isPhysicalSport, isMindfulnessActivity } from './activityClassifier.js';

// Flag to prevent infinite rendering loops
let isRendering = false;

export function renderHistorialTab() {
    console.log('📄 [HISTORIAL] Rendering historial tab...');

    try {
        const currentWeekNumber = getWeekNumber();
        const currentYear = new Date().getFullYear();

        if (!AppState.selectedWeek) {
            AppState.selectedWeek = { weekNumber: currentWeekNumber, year: currentYear };
        }

        const { weekNumber, year } = AppState.selectedWeek;
        console.log(`📅 [HISTORIAL] Selected week: ${weekNumber} of ${year}`);

        const weekData = calculateWeeklyStatsForWeek(weekNumber, year);
        console.log('✅ [HISTORIAL] Week data calculated successfully');

        const result = `
            <div id="historial-content" class="pb-6">
                ${getHistorialContent(weekNumber, year, currentWeekNumber, currentYear, weekData)}
            </div>
        `;

        console.log('✅ [HISTORIAL] Historial tab rendered successfully');
        return result;
    } catch (error) {
        console.error('❌ [HISTORIAL] Error rendering historial tab:', error);
        return `
            <div class="glass-card rounded-3xl p-6 mb-6">
                <h2 class="text-2xl font-bold text-white mb-4">Error</h2>
                <p class="text-red-400">Error al cargar el historial: ${error.message}</p>
                <pre class="text-xs text-white/40 mt-2">${error.stack}</pre>
            </div>
        `;
    }
}

// Helper function to generate historial content
function getHistorialContent(weekNumber, year, currentWeekNumber, currentYear, weekData) {
    return `
        ${renderWeekNavigator(weekNumber, year, currentWeekNumber, currentYear)}
        ${renderExerciseDaysSection(weekData.exerciseDays)}
        ${renderWeeklyTotalsSection(weekData.weeklyTotals)}
        ${renderSleepSection(weekData.sleepData)}
        ${renderMindfulnessDaysSection(weekData.mindfulnessDays)}
        ${renderSportsSection(weekData.sports)}
    `;
}

function renderWeekNavigator(weekNumber, year, currentWeekNumber, currentYear) {
    const weekStart = getWeekStartFromNumber(weekNumber, year);
    const weekEnd = getWeekEndFromNumber(weekNumber, year);
    const weekRange = formatWeekRange(weekStart, weekEnd);

    const isCurrentWeek = (weekNumber === currentWeekNumber && year === currentYear);
    const canGoNext = !isCurrentWeek;

    return `
        <div class="glass-card rounded-3xl p-6 mb-6 sticky top-0 z-30 backdrop-blur-xl">
            <div class="flex items-center justify-between">
                <button 
                    onclick="navigateToWeek('prev')" 
                    class="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 hover:border-[#00f5d4]/30">
                    <span class="material-symbols-outlined text-white/80">chevron_left</span>
                </button>
                
                <div class="text-center">
                    <h2 class="text-xl font-bold text-white">Semana ${weekNumber}</h2>
                    <p class="text-sm text-white/60 mt-1">${weekRange}</p>
                </div>
                
                <button 
                    onclick="navigateToWeek('next')" 
                    class="size-10 rounded-full flex items-center justify-center transition-all border ${canGoNext ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-[#00f5d4]/30' : 'opacity-0 pointer-events-none'}"
                    ${!canGoNext ? 'disabled' : ''}>
                    <span class="material-symbols-outlined text-white/80">chevron_right</span>
                </button>
            </div>
        </div>
    `;
}

function renderExerciseDaysSection(exerciseDays) {
    if (!exerciseDays || exerciseDays.length === 0) return '';

    const daysHtml = exerciseDays.map(day => {
        const bgColor = day.hasExercise ? '#00ff9d' : 'rgba(255,255,255,0.05)';
        const iconColor = day.hasExercise ? '#000' : 'rgba(255,255,255,0.2)';
        const shadow = day.hasExercise ? '0 0 15px rgba(0,255,157,0.5)' : 'none';
        const iconHtml = day.hasExercise ? '<span class="material-symbols-outlined" style="font-size: 20px;">check</span>' : '';

        return `
            <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all"
                     style="background: ${bgColor}; color: ${iconColor}; box-shadow: ${shadow};">
                    ${iconHtml}
                </div>
                <p class="text-[9px] text-white/60 font-bold uppercase">${day.day}</p>
            </div>
        `;
    }).join('');

    return `
        <section class="glass-card rounded-3xl p-6 mb-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#00ff9d]">fitness_center</span>
                Días de Ejercicio
            </h3>
            <div class="flex justify-between gap-2">
                ${daysHtml}
            </div>
        </section>
    `;
}

function renderWeeklyTotalsSection(totals) {
    if (!totals) {
        totals = { steps: 0, distance: 0, calories: 0, activeMinutes: 0 };
    }

    const formatActiveHours = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        if (hours > 0) return `${hours}h ${mins}m`;
        return `${mins}m`;
    };

    return `
        <section class="glass-card rounded-3xl p-6 mb-6">
            <h3 class="text-lg font-bold text-white mb-4">Resumen Semanal</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#00ff9d] text-2xl mb-2">directions_walk</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Total Pasos</span>
                    <span class="text-2xl font-bold text-[#00ff9d]">${totals.steps.toLocaleString()}</span>
                </div>
                
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#00d9ff] text-2xl mb-2">map</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Distancia</span>
                    <span class="text-2xl font-bold text-[#00d9ff]">${totals.distance.toFixed(1)} <span class="text-sm">km</span></span>
                </div>
                
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#ff9100] text-2xl mb-2">local_fire_department</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Calorías</span>
                    <span class="text-2xl font-bold text-[#ff9100]">${Math.round(totals.calories).toLocaleString()}</span>
                </div>
                
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#fbbf24] text-2xl mb-2">bolt</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Horas Activas</span>
                    <span class="text-2xl font-bold text-[#fbbf24]">${formatActiveHours(totals.activeMinutes || 0)}</span>
                </div>
            </div>
        </section>
    `;
}

function renderSleepSection(sleepData) {
    if (!sleepData || sleepData.length === 0) return '';

    const barsHtml = sleepData.map(day => {
        const hours = day.hours || 0;
        const heightPx = hours * 12;
        const color = hours >= 7 ? '#818cf8' : '#6366f1';
        const opacity = Math.max(0.3, Math.min(1, hours / 8));

        return `
            <div class="flex-1 flex flex-col items-center justify-end group/bar relative h-full">
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    ${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m
                </div>
                
                <div class="w-full mx-0.5 rounded-t-lg transition-all hover:brightness-125 relative" 
                     style="height: ${heightPx}px; background-color: ${color}; opacity: ${opacity}; min-height: ${hours > 0 ? '4px' : '2px'};">
                </div>
                <p class="text-[9px] text-white/40 mt-1 uppercase">${day.day}</p>
            </div>
        `;
    }).join('');

    return `
        <section class="glass-card rounded-3xl p-6 mb-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#818cf8]">bedtime</span>
                Sueño
            </h3>
            <div class="flex items-end justify-between gap-2 h-32">
                ${barsHtml}
            </div>
        </section>
    `;
}

function renderMindfulnessDaysSection(mindfulnessDays) {
    if (!mindfulnessDays || mindfulnessDays.length === 0) return '';

    const daysHtml = mindfulnessDays.map(day => {
        const bgColor = day.hasMindfulness ? '#c084fc' : 'rgba(255,255,255,0.05)';
        const iconColor = day.hasMindfulness ? '#000' : 'rgba(255,255,255,0.2)';
        const shadow = day.hasMindfulness ? '0 0 15px rgba(192, 132, 252, 0.5)' : 'none';
        const iconHtml = day.hasMindfulness ? '<span class="material-symbols-outlined" style="font-size: 20px;">check</span>' : '';

        return `
            <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all"
                     style="background: ${bgColor}; color: ${iconColor}; box-shadow: ${shadow};">
                    ${iconHtml}
                </div>
                <p class="text-[9px] text-white/60 font-bold uppercase">${day.day}</p>
            </div>
        `;
    }).join('');

    return `
        <section class="glass-card rounded-3xl p-6 mb-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#c084fc]" style="font-variation-settings: 'FILL' 1">spa</span>
                Días de Mindfulness
            </h3>
            <div class="flex justify-between gap-2">
                ${daysHtml}
            </div>
        </section>
    `;
}

function renderSportsSection(sports) {
    if (!sports || Object.keys(sports).length === 0) {
        return `
            <section class="glass-card rounded-3xl p-6 mb-6">
                <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#00f5d4]">sports_score</span>
                    Deportes Practicados
                </h3>
                <div class="text-center py-12 text-white/40">
                    <span class="material-symbols-outlined text-4xl mb-2">event_busy</span>
                    <p>No hay actividad deportiva registrada esta semana</p>
                </div>
            </section>
        `;
    }

    const sportsList = Object.keys(sports).sort((a, b) =>
        sports[b].totalDuration - sports[a].totalDuration
    );

    const fmtTime = (mins) => {
        const totalMins = Math.round(mins);
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const sportsCardsHtml = sportsList.map(sportName => {
        const data = sports[sportName];
        const meta = data.meta;

        const showDistInHeader = meta.unit === 'km';
        const totalValue = showDistInHeader ? data.totalDistance : data.totalDuration;

        const maxDuration = Math.max(...data.days.map(d => d.duration), 1);

        const barsHtml = data.days.map((dayData, idx) => {
            const minutes = dayData.duration;
            const containerHeight = 96;
            const heightPct = (minutes / maxDuration) * 100;
            const heightPx = Math.max((heightPct / 100) * containerHeight, minutes > 0 ? 4 : 2);

            const bgStyle = minutes > 0
                ? `background: linear-gradient(to top, ${meta.color}, ${meta.color}80);`
                : 'background: rgba(255,255,255,0.05);';

            const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

            return `
                <div class="flex-1 flex flex-col items-center gap-1">
                    <div class="w-full rounded-t-lg transition-all"
                         style="height: ${heightPx}px; ${bgStyle}"></div>
                    <span class="text-[8px] text-white/30 uppercase">${dayLabels[idx]}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="glass-card p-5 rounded-2xl border border-white/5 mb-4">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="size-10 rounded-xl flex items-center justify-center text-xl" 
                             style="background: ${meta.color}20; border: 1px solid ${meta.color}40;">
                            <span class="material-symbols-outlined" style="color: ${meta.color};">${meta.icon}</span>
                        </div>
                        <div>
                            <h4 class="font-bold text-white">${sportName}</h4>
                            <p class="text-[10px] text-white/40">
                                ${showDistInHeader ? `${totalValue.toFixed(1)} km totales` : `${fmtTime(totalValue)} totales`}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="h-24 flex items-end justify-between gap-2 mt-2">
                    ${barsHtml}
                </div>
            </div>
        `;
    }).join('');

    return `
        <section class="glass-card rounded-3xl p-6 mb-6">
            <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#00f5d4]">sports_score</span>
                Deportes Practicados
            </h3>
            <div class="space-y-4">
                ${sportsCardsHtml}
            </div>
        </section>
    `;
}

function calculateWeeklyStatsForWeek(weekNumber, year) {
    const weekStart = getWeekStartFromNumber(weekNumber, year);
    const weekDays = getFullWeekDays(weekStart);

    const weekActivities = (AppState.activities || []).filter(act => {
        if (!act.startTime) return false;
        const actDate = getLocalISOString(act.startTime);
        return weekDays.includes(actDate);
    });

    // --- FUSIÓN DE DATOS DE SUEÑO (History + DailyTotals) ---
    const sleepMap = new Map();

    // 1. Cargar desde SleepHistory explícito (datos recientes sync)
    (AppState.sleepHistory || []).forEach(s => {
        if (s.date) sleepMap.set(s.date, s);
    });

    // 2. Cargar desde Resúmenes Diarios (datos históricos guardados)
    (AppState.dailyTotals || []).forEach(daily => {
        if (daily.sleep && (daily.sleep.duration > 0 || daily.sleep.minutesAsleep > 0)) {
            const dDate = daily.date.includes('T') ? daily.date.split('T')[0] : daily.date;

            // Prioridad: Si ya existe (del sync reciente), no tocar. Si no, rellenar del historial.
            if (!sleepMap.has(dDate)) {
                // Normalizar estructura si viene diferente
                const duration = daily.sleep.duration || (daily.sleep.minutesAsleep / 60) || 0;
                sleepMap.set(dDate, {
                    date: dDate,
                    duration: duration,
                    efficiency: daily.sleep.efficiency || 0
                });
            }
        }
    });

    const weekSleep = Array.from(sleepMap.values()).filter(sleep => {
        return weekDays.includes(sleep.date);
    });

    const weekDailyTotals = (AppState.dailyTotals || []).filter(daily => {
        const dDate = daily.date.includes('T') ? daily.date.split('T')[0] : daily.date;
        return weekDays.includes(dDate);
    });

    return calculateStatsForActivities(weekActivities, weekSleep, weekDailyTotals, weekDays);
}

function calculateStatsForActivities(activities, sleepHistory, dailyTotals, weekDays) {
    let totalSteps = 0, totalDist = 0, totalCal = 0, totalActiveMinutes = 0;
    const exerciseDaysMap = {};
    const mindfulnessDaysMap = {};
    const sportsMap = {};

    weekDays.forEach(date => {
        exerciseDaysMap[date] = { date, hasExercise: false };
        mindfulnessDaysMap[date] = { date, hasMindfulness: false };
    });

    weekDays.forEach(date => {
        exerciseDaysMap[date] = { date, hasExercise: false };
        mindfulnessDaysMap[date] = { date, hasMindfulness: false };
    });

    // --- FUSIÓN DE DATOS: RAW + SUMMARIES ---
    // El historial antiguo vive en dailyTotals (resúmenes), el actual en activities (raw).
    // Debemos combinarlos sin duplicar.

    const allActivitiesMap = new Map();

    // 1. Agregar actividades RAW (prioridad alta)
    activities.forEach(act => {
        const id = act.id || `${act.startTime}_${act.sportKey}`;
        allActivitiesMap.set(id, act);
    });

    // 2. Agregar actividades de RESÚMENES DIARIOS (si faltan)
    if (dailyTotals) {
        dailyTotals.forEach(summary => {
            if (summary.activities && Array.isArray(summary.activities)) {
                summary.activities.forEach(summaryAct => {
                    // Reconstruir objeto compatible
                    const reconstructedAct = {
                        startTime: summaryAct.startTime || `${summary.date}T12:00:00`,
                        sportKey: summaryAct.type || summaryAct.sportKey,
                        name: summaryAct.name,
                        duration: summaryAct.duration,
                        calories: summaryAct.calories,
                        // Marcar como proveniente de resumen
                        source: 'summary'
                    };

                    // Solo agregar si no existe ya (evitar duplicados con raw)
                    const tempId = summaryAct.id || `${summary.date}_${reconstructedAct.sportKey}_${reconstructedAct.duration}`;
                    if (!allActivitiesMap.has(tempId)) {
                        allActivitiesMap.set(tempId, reconstructedAct);
                    }
                });
            }
        });
    }

    const mergedActivities = Array.from(allActivitiesMap.values());

    mergedActivities.forEach(act => {
        if (!act.startTime) return;

        let dateStr;
        // Fix robustness: handle String vs Date object
        if (typeof act.startTime === 'string') {
            if (act.startTime.includes('T')) dateStr = act.startTime.split('T')[0];
            else dateStr = act.startTime;
        } else if (act.startTime instanceof Date) {
            dateStr = getLocalISOString(act.startTime);
        } else {
            // Fallback for timestamps or weird objects
            dateStr = getLocalISOString(new Date(act.startTime));
        }

        const dayIndex = weekDays.indexOf(dateStr);

        if (dayIndex >= 0) {
            const key = (act.sportKey || '').toLowerCase();
            const name = (act.name || '').toLowerCase();

            // Usar Clasificador Centralizado
            const isMindfulness = isMindfulnessActivity(act);

            if (isMindfulness) {
                mindfulnessDaysMap[dateStr].hasMindfulness = true;
            }

            // Lógica Estricta del Usuario: Yoga, Meditación y Respiración NO son ejercicio físico
            if (!isMindfulness) {
                const duration = act.duration || 0;

                // 1. FILTRO VISUAL (>10m) para marcar el día con círculo verde
                if (duration >= 10) {
                    console.log(`💪 Ejercicio válido detectado (${dateStr}):`, name || key, `(${duration}m)`);
                    exerciseDaysMap[dateStr].hasExercise = true;
                } else {
                    console.log(`🗑️ Ejercicio corto ignorado para marca visual (<10m):`, name || key, `(${duration}m)`);
                }

                // 2. CORRECCIÓN: Sumar a "Minutos Activos" solo si NO es mindfulness
                // (Sumamos todo el tiempo físico, incluso si es corto, para no perder data,
                // pero NO sumamos meditación).
                totalActiveMinutes += duration;
            }

            const sportKey = act.sportKey || act.name || 'Actividad';
            const meta = getSportMetadata(sportKey);
            const sportName = meta.name;

            if (!sportsMap[sportName]) {
                sportsMap[sportName] = {
                    days: Array(7).fill(null).map(() => ({ duration: 0, distance: 0 })),
                    totalDuration: 0,
                    totalDistance: 0,
                    meta: meta
                };
            }

            const dist = act.distance > 100 ? act.distance / 1000 : (act.distance || 0);
            sportsMap[sportName].days[dayIndex].duration += (act.duration || 0);
            sportsMap[sportName].days[dayIndex].distance += dist;
            sportsMap[sportName].totalDuration += (act.duration || 0);
            sportsMap[sportName].totalDistance += dist;
        }
    });

    if (dailyTotals && dailyTotals.length > 0) {
        dailyTotals.forEach(day => {
            totalSteps += (day.steps || 0);
            totalDist += (day.distance || 0);
            totalCal += (day.calories || 0);
        });
    } else {
        activities.forEach(act => {
            totalSteps += (act.steps || 0);
            totalDist += (act.distance > 100 ? act.distance / 1000 : (act.distance || 0));
            totalCal += (act.calories || 0);
        });
    }

    const getLabel = (dStr) => {
        const [y, m, d] = dStr.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3);
    };

    const exerciseDays = weekDays.map(date => ({
        day: getLabel(date),
        ...exerciseDaysMap[date]
    }));

    const mindfulnessDays = weekDays.map(date => ({
        day: getLabel(date),
        ...mindfulnessDaysMap[date]
    }));

    const sleepData = weekDays.map(dateStr => {
        const entry = sleepHistory.find(s => s.date === dateStr);
        return {
            day: getLabel(dateStr),
            hours: entry ? entry.duration : 0
        };
    });

    return {
        weeklyTotals: {
            steps: totalSteps,
            distance: totalDist,
            calories: totalCal,
            activeMinutes: totalActiveMinutes
        },
        exerciseDays,
        mindfulnessDays,
        sleepData,
        sports: sportsMap
    };
}

function getSportMetadata(sportKey) {
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
    const match = META[key] ||
        Object.keys(META).find(k => key.includes(k)) && META[Object.keys(META).find(k => key.includes(k))] ||
        { ...META.default, name: sportKey || 'Actividad' };

    return match;
}

// Navigation handler
window.navigateToWeek = function (direction) {
    // Prevent multiple simultaneous renders
    if (isRendering) {
        console.warn('⚠️ Already rendering, skipping navigation');
        return;
    }

    isRendering = true;

    try {
        const currentWeekNumber = getWeekNumber();
        const currentYear = new Date().getFullYear();

        let { weekNumber, year } = AppState.selectedWeek;

        if (direction === 'next') {
            weekNumber++;
            if (weekNumber > 52) {
                weekNumber = 1;
                year++;
            }

            if (year > currentYear || (year === currentYear && weekNumber > currentWeekNumber)) {
                window.showToast('No hay semanas futuras', 'info');
                isRendering = false;
                return;
            }
        } else if (direction === 'prev') {
            weekNumber--;
            if (weekNumber < 1) {
                weekNumber = 52;
                year--;
            }
        }

        AppState.selectedWeek = { weekNumber, year };

        // Re-renderizar solo el contenido interno del historial
        const historialContent = document.getElementById('historial-content');
        if (historialContent) {
            const weekData = calculateWeeklyStatsForWeek(weekNumber, year);
            const currentWeekNumber = getWeekNumber();
            const currentYear = new Date().getFullYear();

            historialContent.innerHTML = getHistorialContent(weekNumber, year, currentWeekNumber, currentYear, weekData);
        }
    } finally {
        // Always reset the flag
        isRendering = false;
    }
};
