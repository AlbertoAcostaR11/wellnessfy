// Renderizar gráficas semanales (Lógica consolidada al final del archivo)

function renderMindfulnessCharts(data) {
    if (!data) return;

    // Convertir ms a horas y minutos
    const formatTime = (ms) => {
        const totalMinutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return { hours, minutes };
    };

    const yoga = formatTime(data.yoga || 0);
    const meditation = formatTime(data.meditation || 0);
    const breathing = formatTime(data.breathing || 0);

    // Actualizar UI si existen los elementos
    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    updateElement('yogaHours', yoga.hours);
    updateElement('yogaMins', String(yoga.minutes).padStart(2, '0'));

    updateElement('meditationHours', meditation.hours);
    updateElement('meditationMins', String(meditation.minutes).padStart(2, '0'));

    updateElement('breathingHours', breathing.hours);
    updateElement('breathingMins', String(breathing.minutes).padStart(2, '0'));

    // Actualizar Estrés
    const stressBar = document.getElementById('stressBar');
    const stressText = document.getElementById('stressText');

    if (data.stress !== null && data.stress !== undefined) {
        if (stressText) stressText.textContent = `${data.stress}/100`;
        if (stressBar) {
            stressBar.style.width = `${data.stress}%`;
            // Color según nivel de estrés
            if (data.stress > 70) stressBar.className = "h-full bg-red-500 transition-all duration-500";
            else if (data.stress > 40) stressBar.className = "h-full bg-orange-400 transition-all duration-500";
            else stressBar.className = "h-full bg-green-400 transition-all duration-500";
        }
    } else {
        if (stressText) stressText.textContent = "No disponible";
        if (stressBar) stressBar.style.width = "0%";
    }
}

// Renderizar Sueño Semanal (Últimos 7 días)
function renderWeeklySleep(data) {
    const chart = document.getElementById('sleepChart');
    if (!chart || !data) return;

    // Meta: 8 horas (480 minutos)
    const GOAL_HOURS = 8;

    chart.innerHTML = data.map(day => {
        const hours = day.hours || 0;
        const percentage = Math.min(100, (hours / GOAL_HOURS) * 100);

        // Color: Índigo vibrante si cumple cerca de 8h, más apagado si es poco
        let color = hours >= 7 ? '#818cf8' : '#6366f1';
        let opacity = Math.max(0.3, Math.min(1, hours / 8));

        return `
            <div class="flex-1 flex flex-col items-center justify-end group/bar relative h-full">
                <!-- Tooltip -->
                <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 px-2 py-1 rounded text-[10px] opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    ${hours.toFixed(1)}h
                </div>
                
                <div class="w-full mx-0.5 rounded-t-sm transition-all hover:brightness-125 relative" 
                     style="height: ${percentage}%; background-color: ${color}; opacity: ${opacity}; min-height: 4px;">
                </div>
                <p class="text-[9px] text-white/40 mt-1">${day.day}</p>
            </div>
        `;
    }).join('');
}

function renderHourlyActivity(data) {
    const chart = document.getElementById('hourlyActivityChart');
    const labels = document.getElementById('hourlyActivityLabels');
    if (!chart || !data) return;

    // Encontrar el máximo de pasos para escalar
    const maxSteps = Math.max(...data.map(h => h.steps), 1);

    chart.innerHTML = data.map(hourData => {
        // Calcular altura basada en intensidad
        // 10 barras = actividad intensa (100%)
        // 5 barras = actividad media (50%)
        const intensity = hourData.steps / maxSteps;
        const numBars = Math.ceil(intensity * 10); // 0-10 barras
        const height = (numBars / 10) * 100; // Convertir a porcentaje

        // Color según intensidad
        let color, glowColor;
        if (numBars >= 7) { // Intensa
            color = '#00ff9d';
            glowColor = 'rgba(0,255,157,0.5)';
        } else if (numBars >= 4) { // Media
            color = '#00f5d4';
            glowColor = 'rgba(0,245,212,0.5)';
        } else if (numBars > 0) { // Baja
            color = '#00d9ff';
            glowColor = 'rgba(0,217,255,0.3)';
        } else { // Sin actividad
            color = 'rgba(255,255,255,0.1)';
            glowColor = 'rgba(255,255,255,0.05)';
        }

        return `
            <div class="flex-1 flex flex-col items-center justify-end" style="height: 100%;">
                <div class="w-full rounded-t-lg transition-all hover:opacity-80" 
                     style="background: linear-gradient(to top, ${color}, ${glowColor}); height: ${height}%; min-height: ${hourData.steps > 0 ? '8px' : '2px'}; box-shadow: 0 0 10px ${glowColor};"
                     title="${hourData.hour}:00 - ${hourData.steps} pasos (${numBars}/10 barras)"></div>
            </div>
        `;
    }).join('');

    // Generar etiquetas cada 4 horas (0, 4, 8, 12, 16, 20)
    if (labels) {
        labels.innerHTML = data.filter((_, i) => i % 4 === 0).map(hourData => {
            const hour = hourData.hour;
            const ampm = hour < 12 ? 'am' : 'pm';
            const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
            return `<span>${displayHour}${ampm}</span>`;
        }).join('');
    }
}

function renderExerciseDays(data) {
    const chart = document.getElementById('exerciseDaysChart');
    if (!chart || !data) return;

    chart.innerHTML = data.map(day => {
        const bgColor = day.hasExercise ? '#00ff9d' : 'rgba(255,255,255,0.1)';
        const iconColor = day.hasExercise ? '#000' : 'rgba(255,255,255,0.4)';
        const shadow = day.hasExercise ? '0 0 15px rgba(0,255,157,0.5)' : 'none';
        const iconHTML = day.hasExercise ? '<span class="material-symbols-outlined" style="font-size: 20px;">check</span>' : '';

        return `
            <div class="flex-1 flex flex-col items-center gap-2">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110 cursor-pointer"
                     style="background: ${bgColor}; color: ${iconColor}; box-shadow: ${shadow};"
                     title="${day.date}: ${day.steps.toLocaleString()} pasos, ${day.calories} cal">
                    ${iconHTML}
                </div>
                <p class="text-[9px] text-white/60 font-bold">${day.day}</p>
            </div>
        `;
    }).join('');
}

function renderFloorsClimbed(data) {
    const chart = document.getElementById('floorsChart');
    if (!chart || !data) return;

    // Verificar si hay datos de pisos
    const totalFloors = data.reduce((sum, d) => sum + d.floors, 0);

    if (totalFloors === 0) {
        // Mostrar mensaje de no disponible
        chart.innerHTML = `
            <div class="w-full h-full flex items-center justify-center">
                <p class="text-white/40 text-sm">No disponible - Requiere dispositivo con barómetro</p>
            </div>
        `;
        return;
    }

    // Renderizar barras apiladas
    chart.innerHTML = data.map(day => {
        const floors = day.floors;

        // Crear barras apiladas (1 barra por piso)
        let barsHTML = '';
        for (let i = 0; i < floors; i++) {
            barsHTML += `<div class="w-full h-2 bg-[#00d9ff] rounded-sm mb-0.5" style="box-shadow: 0 0 5px rgba(0,217,255,0.5);"></div>`;
        }

        return `
            <div class="flex-1 flex flex-col items-center gap-1 justify-end" style="height: 100%;">
                <div class="w-full flex flex-col-reverse items-center" title="${day.day}: ${floors} piso${floors !== 1 ? 's' : ''}">
                    ${barsHTML}
                </div>
                <p class="text-[9px] text-white/40 font-bold mt-1">${day.day}</p>
            </div>
        `;
    }).join('');
}

function renderWeeklyTotals(totals) {
    if (!totals) return;

    const stepsEl = document.getElementById('weeklySteps');
    const distanceEl = document.getElementById('weeklyDistance');
    const caloriesEl = document.getElementById('weeklyCalories');

    if (stepsEl) stepsEl.textContent = totals.steps.toLocaleString();
    if (distanceEl) distanceEl.textContent = (totals.distance / 1000).toFixed(1);
    if (caloriesEl) caloriesEl.textContent = Math.round(totals.calories).toLocaleString();
}

// Auto-renderizar cuando los datos estén disponibles
window.addEventListener('weeklyStatsUpdated', (e) => {
    // Si viene el evento, usar los datos del evento
    if (e.detail) {
        if (e.detail.weeklyTotals) renderWeeklyTotals(e.detail.weeklyTotals);
        if (e.detail.activityByHour) renderHourlyActivity(e.detail.activityByHour);
        if (e.detail.exerciseDays) renderExerciseDays(e.detail.exerciseDays);
        if (e.detail.sleepData) renderWeeklySleep(e.detail.sleepData); // Nuevo
        if (e.detail.mindfulness) renderMindfulnessCharts(e.detail.mindfulness);
    } else {
        renderWeeklyCharts();
    }
});

export function renderWeeklyCharts() {
    if (window.AppState && window.AppState.weeklyStats) {
        const stats = window.AppState.weeklyStats;
        if (stats.weeklyTotals) renderWeeklyTotals(stats.weeklyTotals);
        if (stats.activityByHour) renderHourlyActivity(stats.activityByHour);
        if (stats.exerciseDays) renderExerciseDays(stats.exerciseDays);
        if (stats.sleepData) renderWeeklySleep(stats.sleepData);
        if (stats.mindfulness) renderMindfulnessCharts(stats.mindfulness);
    }
}

// Intentar renderizar después de un delay
setTimeout(renderWeeklyCharts, 2000);

// Exponer globalmente
window.renderWeeklyCharts = renderWeeklyCharts;
window.renderWeeklySleep = renderWeeklySleep;
window.renderWeeklyTotals = renderWeeklyTotals;
window.renderHourlyActivity = renderHourlyActivity;
window.renderExerciseDays = renderExerciseDays;
window.renderMindfulnessCharts = renderMindfulnessCharts;
