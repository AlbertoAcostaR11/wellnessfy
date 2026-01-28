/* src/pages/history.js - Weekly History View */
import { AppState } from '../utils/state.js';
import {
    getLocalISOString,
    getWeekNumber,
    getWeekStart,
    getWeekEnd,
    getWeekStartFromNumber,
    getWeekEndFromNumber,
    getFullWeekDays,
    formatWeekRange
} from '../utils/dateHelper.js';

// ==========================================
// MAIN RENDER FUNCTION
// ==========================================

export function renderHistory() {
    // Obtener semana actual o la seleccionada
    const currentWeekNumber = getWeekNumber();
    const currentYear = new Date().getFullYear();

    // Si no hay semana seleccionada, usar la actual
    if (!AppState.selectedWeek) {
        AppState.selectedWeek = { weekNumber: currentWeekNumber, year: currentYear };
    }

    const { weekNumber, year } = AppState.selectedWeek;

    // Calcular datos de la semana seleccionada
    const weekData = calculateWeeklyStatsForWeek(weekNumber, year);

    return `
        <div class="pb-24">
            ${renderWeekNavigator(weekNumber, year, currentWeekNumber, currentYear)}
            ${renderExerciseDays(weekData.exerciseDays)}
            ${renderWeeklyTotals(weekData.weeklyTotals)}
            ${renderSleepChart(weekData.sleepData)}
            ${renderMindfulnessDays(weekData.mindfulnessDays)}
            ${renderSportsBreakdown(weekData.sports)}
        </div>
    `;
}

// ==========================================
// WEEK NAVIGATOR
// ==========================================

function renderWeekNavigator(weekNumber, year, currentWeekNumber, currentYear) {
    const weekStart = getWeekStartFromNumber(weekNumber, year);
    const weekEnd = getWeekEndFromNumber(weekNumber, year);
    const weekRange = formatWeekRange(weekStart, weekEnd);

    // Deshabilitar flecha derecha si es la semana actual
    const isCurrentWeek = (weekNumber === currentWeekNumber && year === currentYear);
    const canGoNext = !isCurrentWeek;

    return `
        <div class="glass-card rounded-3xl p-6 mb-6 sticky top-0 z-50 backdrop-blur-xl">
            <div class="flex items-center justify-between">
                <button 
                    onclick="navigateToWeek('prev')" 
                    class="size-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 hover:border-[#00f5d4]/30"
                    title="Semana anterior">
                    <span class="material-symbols-outlined text-white/80">chevron_left</span>
                </button>
                
                <div class="text-center">
                    <h2 class="text-xl font-bold text-white">Semana ${weekNumber}</h2>
                    <p class="text-sm text-white/60 mt-1">${weekRange}</p>
                </div>
                
                <button 
                    onclick="navigateToWeek('next')" 
                    class="size-10 rounded-full ${canGoNext ? 'bg-white/5 hover:bg-white/10' : 'bg-white/5 opacity-30 cursor-not-allowed'} flex items-center justify-center transition-all border border-white/10 ${canGoNext ? 'hover:border-[#00f5d4]/30' : ''}"
                    ${!canGoNext ? 'disabled' : ''}
                    title="${canGoNext ? 'Semana siguiente' : 'No hay semanas futuras'}">
                    <span class="material-symbols-outlined text-white/80">chevron_right</span>
                </button>
            </div>
        </div>
    `;
}

// ==========================================
// SECTION 1: DÍAS DE EJERCICIO
// ==========================================

function renderExerciseDays(exerciseDays) {
    if (!exerciseDays || exerciseDays.length === 0) {
        return '<div class="text-center text-white/40 py-8">No hay datos de ejercicio</div>';
    }

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

// ==========================================
// SECTION 2: TOTALES SEMANALES
// ==========================================

function renderWeeklyTotals(totals) {
    if (!totals) {
        totals = { steps: 0, distance: 0, calories: 0, activeHours: 0 };
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
                <!-- Total Pasos -->
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#00ff9d] text-3xl mb-2">directions_walk</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Total Pasos</span>
                    <span class="text-2xl font-bold text-[#00ff9d]">${totals.steps.toLocaleString()}</span>
                </div>
                
                <!-- Distancia -->
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#00d9ff] text-3xl mb-2">map</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Distancia</span>
                    <span class="text-2xl font-bold text-[#00d9ff]">${totals.distance.toFixed(1)} <span class="text-sm">km</span></span>
                </div>
                
                <!-- Calorías -->
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#ff9100] text-3xl mb-2">local_fire_department</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Calorías</span>
                    <span class="text-2xl font-bold text-[#ff9100]">${Math.round(totals.calories).toLocaleString()}</span>
                </div>
                
                <!-- Horas Activas (NUEVO) -->
                <div class="p-4 bg-[#151b2e]/60 rounded-xl flex flex-col items-center border border-white/5">
                    <span class="material-symbols-outlined text-[#fbbf24] text-3xl mb-2">bolt</span>
                    <span class="text-[10px] text-white/50 uppercase tracking-wider mb-1">Horas Activas</span>
                    <span class="text-2xl font-bold text-[#fbbf24]">${formatActiveHours(totals.activeMinutes || 0)}</span>
                </div>
            </div>
        </section>
    `;
}

// ==========================================
// SECTION 3: SUEÑO
// ==========================================

function renderSleepChart(sleepData) {
    if (!sleepData || sleepData.length === 0) {
        return '<div class="text-center text-white/40 py-8">No hay datos de sueño</div>';
    }

    const barsHtml = sleepData.map(day => {
        const hours = day.hours || 0;
        const heightPx = hours * 12; // 12px por hora
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

// ==========================================
// SECTION 4: DÍAS DE MINDFULNESS
// ==========================================

function renderMindfulnessDays(mindfulnessDays) {
    if (!mindfulnessDays || mindfulnessDays.length === 0) {
        return '<div class="text-center text-white/40 py-8">No hay datos de mindfulness</div>';
    }

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

// ==========================================
// SECTION 5: DEPORTES PRACTICADOS
// ==========================================

function renderSportsBreakdown(sports) {
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

    // Ordenar por duración total (descendente)
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

        // Determinar qué mostrar en el header
        const showDistInHeader = meta.unit === 'km';
        const totalValue = showDistInHeader ? data.totalDistance : data.totalDuration;

        // Calcular altura máxima para escalar barras
        const maxDuration = Math.max(...data.days.map(d => d.duration), 1);

        const barsHtml = data.days.map((dayData, idx) => {
            const minutes = dayData.duration;
            const containerHeight = 96;
            const heightPct = (minutes / maxDuration) * 100;
            const heightPx = Math.max((heightPct / 100) * containerHeight, minutes > 0 ? 4 : 2);

            const bgStyle = minutes > 0
                ? `background: linear-gradient(to top, ${meta.color}, ${meta.color}80);`
                : 'background: rgba(255,255,255,0.05);';

            // Labels de día
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

// ==========================================
// DATA CALCULATION
// ==========================================

function calculateWeeklyStatsForWeek(weekNumber, year) {
    const weekStart = getWeekStartFromNumber(weekNumber, year);
    const weekEnd = getWeekEndFromNumber(weekNumber, year);
    const weekDays = getFullWeekDays(weekStart); // Siempre 7 días completos

    console.log(`📊 Calculando stats para Semana ${weekNumber} de ${year}:`, weekDays);

    // Filtrar actividades de esta semana
    const weekActivities = (AppState.activities || []).filter(act => {
        if (!act.startTime) return false;
        const actDate = getLocalISOString(act.startTime);
        return weekDays.includes(actDate);
    });

    // Filtrar sueño de esta semana
    const weekSleep = (AppState.sleepHistory || []).filter(sleep => {
        return weekDays.includes(sleep.date);
    });

    // Filtrar totales diarios de esta semana
    const weekDailyTotals = (AppState.dailyTotals || []).filter(daily => {
        return weekDays.includes(daily.date);
    });

    // Calcular stats usando la misma lógica que calculateWeeklyStatsFromActivities
    // pero con los datos filtrados de la semana específica
    return calculateStatsForActivities(weekActivities, weekSleep, weekDailyTotals, weekDays);
}

function calculateStatsForActivities(activities, sleepHistory, dailyTotals, weekDays) {
    // Inicializar estructuras
    let totalSteps = 0, totalDist = 0, totalCal = 0, totalActiveMinutes = 0;
    const exerciseDaysMap = {};
    const mindfulnessDaysMap = {};
    const sportsMap = {};

    // Init con fechas vacías
    weekDays.forEach(date => {
        exerciseDaysMap[date] = { date, hasExercise: false };
        mindfulnessDaysMap[date] = { date, hasMindfulness: false };
    });

    // Procesar actividades
    activities.forEach(act => {
        if (!act.startTime) return;

        const dateStr = getLocalISOString(act.startTime);
        const dayIndex = weekDays.indexOf(dateStr);

        if (dayIndex >= 0) {
            // Marcar día con ejercicio
            exerciseDaysMap[dateStr].hasExercise = true;

            // Verificar mindfulness
            const key = (act.sportKey || '').toLowerCase();
            const name = (act.name || '').toLowerCase();
            const isMindfulness = key.includes('yoga') || key.includes('meditation') ||
                key.includes('breath') || name.includes('yoga') ||
                name.includes('meditación') || name.includes('respiración');

            if (isMindfulness) {
                mindfulnessDaysMap[dateStr].hasMindfulness = true;
            }

            // Acumular totales
            totalActiveMinutes += (act.duration || 0);

            // Agregar a deportes
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

    // Usar dailyTotals si existen (más precisos)
    if (dailyTotals && dailyTotals.length > 0) {
        dailyTotals.forEach(day => {
            totalSteps += (day.steps || 0);
            totalDist += (day.distance || 0);
            totalCal += (day.calories || 0);
        });
    } else {
        // Fallback: sumar de actividades
        activities.forEach(act => {
            totalSteps += (act.steps || 0);
            totalDist += (act.distance > 100 ? act.distance / 1000 : (act.distance || 0));
            totalCal += (act.calories || 0);
        });
    }

    // Formatear para UI
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

// ==========================================
// NAVIGATION HANDLERS
// ==========================================

window.navigateToWeek = function (direction) {
    const currentWeekNumber = getWeekNumber();
    const currentYear = new Date().getFullYear();

    let { weekNumber, year } = AppState.selectedWeek;

    if (direction === 'next') {
        weekNumber++;
        // Si pasamos de semana 52, ir al año siguiente
        if (weekNumber > 52) {
            weekNumber = 1;
            year++;
        }

        // No permitir ir más allá de la semana actual
        if (year > currentYear || (year === currentYear && weekNumber > currentWeekNumber)) {
            window.showToast('No hay semanas futuras', 'info');
            return;
        }
    } else if (direction === 'prev') {
        weekNumber--;
        // Si retrocedemos de semana 1, ir al año anterior
        if (weekNumber < 1) {
            weekNumber = 52;
            year--;
        }
    }

    AppState.selectedWeek = { weekNumber, year };

    // Re-renderizar
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = renderHistory();
    }
};

// Exponer globalmente
window.renderHistory = renderHistory;

console.log('✅ History page loaded');
