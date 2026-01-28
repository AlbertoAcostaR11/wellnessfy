/**
 * 🎯 Goals Progress Components
 * Componentes visuales para mostrar progreso de objetivos
 */

import { AppState } from './state.js';
import { goalsManager } from './goalsManager.js';

/**
 * Renderizar anillo de progreso circular
 */
export function renderProgressRing(progress, size = 'md') {
    const sizeClasses = {
        sm: { container: 'size-12', stroke: '3', text: 'text-xs' },
        md: { container: 'size-16', stroke: '4', text: 'text-sm' },
        lg: { container: 'size-20', stroke: '5', text: 'text-base' }
    };

    const config = sizeClasses[size] || sizeClasses.md;
    const percentage = Math.min(Math.round(progress), 100);
    const circumference = 2 * Math.PI * 45; // radio = 45
    const offset = circumference - (percentage / 100) * circumference;

    // Color basado en progreso
    let color = '#00f5d4'; // Verde por defecto
    if (percentage >= 100) {
        color = '#00f5d4'; // Verde brillante
    } else if (percentage >= 75) {
        color = '#4ecdc4'; // Turquesa
    } else if (percentage >= 50) {
        color = '#ffd93d'; // Amarillo
    } else if (percentage >= 25) {
        color = '#ff9f43'; // Naranja
    } else {
        color = '#ff6b6b'; // Rojo
    }

    return `
        <div class="${config.container} relative">
            <svg class="transform -rotate-90 ${config.container}" viewBox="0 0 100 100">
                <!-- Background circle -->
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="${config.stroke}"
                    fill="none"
                />
                <!-- Progress circle -->
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="${color}"
                    stroke-width="${config.stroke}"
                    fill="none"
                    stroke-dasharray="${circumference}"
                    stroke-dashoffset="${offset}"
                    stroke-linecap="round"
                    class="transition-all duration-500"
                    style="filter: drop-shadow(0 0 4px ${color}40)"
                />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
                <span class="${config.text} font-bold" style="color: ${color}">${percentage}%</span>
            </div>
        </div>
    `;
}

/**
 * Renderizar barra de progreso horizontal
 */
export function renderProgressBar(current, target, unit = '', showNumbers = true) {
    const progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    const percentage = Math.round(progress);

    // Color basado en progreso
    let color = '#00f5d4';
    if (percentage >= 100) {
        color = '#00f5d4';
    } else if (percentage >= 75) {
        color = '#4ecdc4';
    } else if (percentage >= 50) {
        color = '#ffd93d';
    } else if (percentage >= 25) {
        color = '#ff9f43';
    } else {
        color = '#ff6b6b';
    }

    return `
        <div class="w-full">
            ${showNumbers ? `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-white/60 text-xs">
                        <span class="text-white font-bold">${current.toLocaleString()}</span> / ${target.toLocaleString()} ${unit}
                    </span>
                    <span class="text-xs font-bold" style="color: ${color}">${percentage}%</span>
                </div>
            ` : ''}
            <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                    class="h-full rounded-full transition-all duration-500" 
                    style="width: ${percentage}%; background: linear-gradient(90deg, ${color}, ${color}dd); box-shadow: 0 0 8px ${color}40"
                ></div>
            </div>
        </div>
    `;
}

/**
 * Renderizar tarjeta de objetivo con progreso
 */
export function renderGoalCard(goalKey, title, icon, goal, compact = false) {
    if (!goal || !goal.enabled) return '';

    const progress = goalsManager.calculateProgress(goal);
    const isReached = goalsManager.isGoalReached(goal);

    if (compact) {
        return `
            <div class="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5">
                <div class="flex items-center gap-3">
                    <div class="size-10 rounded-lg bg-${isReached ? '[#00f5d4]/20' : 'white/5'} border border-${isReached ? '[#00f5d4]/30' : 'white/10'} flex items-center justify-center">
                        <span class="material-symbols-outlined text-${isReached ? '[#00f5d4]' : 'white/40'} text-lg">${icon}</span>
                    </div>
                    <div>
                        <p class="text-white text-sm font-bold">${title}</p>
                        <p class="text-white/40 text-xs">${goal.current} / ${goal.target} ${goal.unit || ''}</p>
                    </div>
                </div>
                ${renderProgressRing(progress, 'sm')}
            </div>
        `;
    }

    return `
        <div class="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                    <div class="size-12 rounded-xl bg-${isReached ? '[#00f5d4]/20' : 'white/5'} border border-${isReached ? '[#00f5d4]/30' : 'white/10'} flex items-center justify-center">
                        <span class="material-symbols-outlined text-${isReached ? '[#00f5d4]' : 'white/60'}">${icon}</span>
                    </div>
                    <div>
                        <h3 class="text-white font-bold">${title}</h3>
                        <p class="text-white/40 text-xs mt-0.5">Meta: ${goal.target} ${goal.unit || ''}</p>
                    </div>
                </div>
                ${isReached ? `
                    <div class="size-8 rounded-full bg-[#00f5d4]/20 border border-[#00f5d4]/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[#00f5d4] text-lg">check_circle</span>
                    </div>
                ` : ''}
            </div>
            ${renderProgressBar(goal.current, goal.target, goal.unit)}
        </div>
    `;
}

/**
 * Renderizar resumen de progreso diario
 */
export function renderDailyProgressSummary(goals) {
    if (!goals) return '';

    const dailyGoals = [
        { key: 'dailySteps', title: 'Pasos', icon: 'directions_walk' },
        { key: 'dailyCalories', title: 'Calorías', icon: 'local_fire_department' },
        { key: 'dailyActiveMinutes', title: 'Minutos Activos', icon: 'timer' },
        { key: 'dailySleepHours', title: 'Sueño', icon: 'bedtime' }
    ];

    const enabledGoals = dailyGoals.filter(g => goals[g.key]?.enabled);
    if (enabledGoals.length === 0) return '';

    const reachedCount = enabledGoals.filter(g => goalsManager.isGoalReached(goals[g.key])).length;
    const totalProgress = enabledGoals.reduce((sum, g) => {
        return sum + goalsManager.calculateProgress(goals[g.key]);
    }, 0) / enabledGoals.length;

    return `
        <div class="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02] mb-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-white font-bold text-lg">Objetivos de Hoy</h3>
                    <p class="text-white/40 text-xs mt-1">${reachedCount} de ${enabledGoals.length} completados</p>
                </div>
                ${renderProgressRing(totalProgress, 'lg')}
            </div>
            <div class="grid grid-cols-2 gap-3">
                ${enabledGoals.map(g => renderGoalCard(g.key, g.title, g.icon, goals[g.key], true)).join('')}
            </div>
        </div>
    `;
}

/**
 * Renderizar indicador de objetivo en tarjeta de métrica
 */
export function renderGoalIndicator(current, target, unit = '', cardColor = null) {
    if (!target || target === 0) return '';

    const rawProgress = (current / target) * 100;
    const percentage = Math.round(rawProgress);
    const visualProgress = Math.min(percentage, 100);
    const isReached = current >= target;

    // Usar el color de la tarjeta si se proporciona, sino usar color basado en progreso
    let color;
    if (cardColor) {
        color = cardColor;
    } else {
        color = isReached ? '#00f5d4' : '#ff9f43';
    }

    // Formatear target según la unidad
    let targetDisplay = target.toLocaleString();
    if (unit === 'h' || unit === 'horas') {
        // Convertir decimal a formato Xh Ym
        const hours = Math.floor(target);
        const minutes = Math.round((target - hours) * 60);
        targetDisplay = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
        targetDisplay = `${target.toLocaleString()} ${unit}`;
    }

    return `
        <div class="mt-3 pt-3 border-t border-white/5">
            <div class="flex items-center justify-between mb-2">
                <span class="text-white/40 text-[10px] uppercase tracking-wider mr-2">Objetivo</span>
                <span class="text-xs font-bold flex items-center gap-1.5" style="color: ${color}">
                    ${isReached ? '<span>✓</span>' : ''}${percentage}%
                </span>
            </div>
            <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                    class="h-full rounded-full transition-all duration-500" 
                    style="width: ${visualProgress}%; background: ${color}; box-shadow: 0 0 6px ${color}60"
                ></div>
            </div>
            <p class="text-white/30 text-[10px] mt-1">${targetDisplay}</p>
        </div>
    `;
}
