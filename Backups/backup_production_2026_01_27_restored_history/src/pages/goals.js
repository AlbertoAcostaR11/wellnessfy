/**
 * 🎯 Goals Page
 * Página de configuración de objetivos personales
 */

import { AppState } from '../utils/state.js';
import { goalsManager } from '../utils/goalsManager.js';
import { navigateTo } from '../router.js';

export async function renderGoalsPage() {
    const userId = AppState.currentUser?.uid || AppState.currentUser?.id;

    if (!userId) {
        return `<div class="text-white text-center py-20">Por favor inicia sesión</div>`;
    }

    // Cargar objetivos
    const goals = await goalsManager.loadGoals(userId);

    return `
        <div class="pb-24">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <button onclick="window.history.back()" class="size-10 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
                        <span class="material-symbols-outlined text-white">arrow_back</span>
                    </button>
                    <h1 class="font-bold text-2xl tracking-tight text-white">Mis Objetivos</h1>
                </div>
                <button onclick="window.saveGoals()" class="px-6 py-2 bg-[#00f5d4] text-[#020617] font-bold rounded-xl hover:brightness-110 transition-all">
                    Guardar
                </button>
            </div>

            <!-- Descripción -->
            <div class="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.02] mb-6">
                <p class="text-white/60 text-sm leading-relaxed">
                    Define tus metas de bienestar. Wellnessfy te ayudará a alcanzarlas con seguimiento diario y recordatorios inteligentes.
                </p>
            </div>

            <!-- Objetivos Semanales -->
            <section class="mb-8">
                <h2 class="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">calendar_month</span>
                    Objetivos Semanales
                </h2>
                
                ${renderGoalCard('weeklyExerciseDays', 'Días de Ejercicio', 'fitness_center', goals.weeklyExerciseDays, {
        min: 1,
        max: 7,
        step: 1,
        description: '¿Cuántos días a la semana quieres hacer ejercicio?'
    })}

                ${renderGoalCard('weeklyMindfulnessDays', 'Días de Mindfulness', 'self_improvement', goals.weeklyMindfulnessDays, {
        min: 1,
        max: 7,
        step: 1,
        description: 'Yoga, meditación o respiración consciente'
    })}
            </section>

            <!-- Objetivos Diarios - Actividad -->
            <section class="mb-8">
                <h2 class="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">today</span>
                    Actividad Diaria
                </h2>

                ${renderGoalCard('dailySteps', 'Pasos al Día', 'directions_walk', goals.dailySteps, {
        min: 1000,
        max: 30000,
        step: 500,
        description: 'Meta diaria de pasos'
    })}

                ${renderGoalCard('dailyActiveMinutes', 'Minutos Activos', 'timer', goals.dailyActiveMinutes, {
        min: 10,
        max: 180,
        step: 5,
        description: 'Ejercicio moderado o intenso'
    })}

                ${renderGoalCard('dailyCalories', 'Calorías Quemadas', 'local_fire_department', goals.dailyCalories, {
        min: 100,
        max: 2000,
        step: 50,
        description: 'Meta diaria de calorías activas'
    })}
            </section>

            <!-- Objetivos Diarios - Mindfulness -->
            <section class="mb-8">
                <h2 class="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">spa</span>
                    Bienestar Mental
                </h2>

                ${renderGoalCard('dailyMeditationMinutes', 'Minutos de Meditación', 'psychiatry', goals.dailyMeditationMinutes, {
        min: 5,
        max: 60,
        step: 5,
        description: 'Tiempo diario de meditación'
    })}

                ${renderGoalCard('dailyBreathingSessions', 'Sesiones de Respiración', 'air', goals.dailyBreathingSessions, {
        min: 1,
        max: 10,
        step: 1,
        description: 'Ejercicios de respiración consciente (mín. 1 min)'
    })}
            </section>

            <!-- Objetivos de Sueño e Hidratación -->
            <section class="mb-8">
                <h2 class="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">bedtime</span>
                    Descanso e Hidratación
                </h2>

                ${renderGoalCard('dailySleepHours', 'Horas de Sueño', 'bedtime', goals.dailySleepHours, {
        min: 4,
        max: 12,
        step: 0.5,
        description: 'Meta de horas de sueño por noche'
    })}

                ${renderGoalCard('dailyWaterIntake', 'Hidratación Diaria', 'water_drop', goals.dailyWaterIntake, {
        min: 500,
        max: 5000,
        step: 250,
        description: 'Meta de agua en mililitros (ml)',
        optional: true
    })}
            </section>

            <!-- Objetivos de Peso y Composición Corporal -->
            <section class="mb-8">
                <h2 class="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">monitor_weight</span>
                    Peso y Composición Corporal
                </h2>

                ${renderWeightGoalCard(goals)}
                ${renderBodyCompositionCard(goals)}
            </section>
        </div>
    `;
}

/**
 * Renderizar tarjeta de objetivo individual
 */
function renderGoalCard(key, title, icon, goal, options = {}) {
    const { min = 0, max = 100, step = 1, description = '', optional = false } = options;
    const isEnabled = goal?.enabled !== false;
    const currentTarget = goal?.target || min;

    return `
        <div class="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02] mb-4">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3 flex-1">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[#00f5d4]">${icon}</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-white font-bold text-sm">${title}</h3>
                        <p class="text-white/40 text-xs mt-0.5">${description}</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" ${isEnabled ? 'checked' : ''} 
                           onchange="window.toggleGoalEnabled('${key}', this.checked)">
                    <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                </label>
            </div>

            ${isEnabled ? `
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-white/60 text-xs">Meta: <span id="goal-label-${key}" class="text-[#00f5d4] font-bold">${currentTarget} ${goal?.unit || ''}</span></span>
                        <input type="number" 
                               id="goal-${key}" 
                               class="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm font-bold text-right focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                               min="${min}" 
                               max="${max}" 
                               step="${step}" 
                               value="${currentTarget}"
                               oninput="window.updateGoalValue('${key}', this.value, '${goal?.unit || ''}')">
                    </div>
                    <input type="range" 
                           id="goal-slider-${key}"
                           class="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00f5d4]"
                           min="${min}" 
                           max="${max}" 
                           step="${step}" 
                           value="${currentTarget}"
                           oninput="window.updateGoalValue('${key}', this.value, '${goal?.unit || ''}')">
                </div>
            ` : `
                <p class="text-white/30 text-xs italic">Objetivo desactivado</p>
            `}
        </div>
    `;
}

/**
 * Renderizar tarjeta de objetivo de peso
 */
function renderWeightGoalCard(goals) {
    const weight = goals.weight || {};
    const height = goals.height || {};
    const isEnabled = weight.enabled !== false;

    // Obtener peso y altura del perfil si existen
    const currentWeight = weight.current || AppState.currentUser?.weight || 0;
    const currentHeight = height.current || AppState.currentUser?.height || 0;
    const targetWeight = weight.target || currentWeight;
    const startWeight = weight.startWeight || currentWeight;

    return `
        <div class="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02] mb-4">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 flex-1">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[#00f5d4]">monitor_weight</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-white font-bold text-sm">Peso Objetivo</h3>
                        <p class="text-white/40 text-xs mt-0.5">Define tu meta de peso</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" ${isEnabled ? 'checked' : ''} 
                           onchange="window.toggleWeightGoal(this.checked)">
                    <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                </label>
            </div>

            <div id="weight-goal-content">
                ${isEnabled ? `
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-white/40 text-xs mb-2 block">Peso Actual</label>
                                <input type="number" 
                                       id="goal-weight-current" 
                                       class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                                       step="0.1" 
                                       value="${currentWeight}"
                                       placeholder="0.0">
                                <span class="text-white/30 text-xs mt-1 block">${weight.unit || 'kg'}</span>
                            </div>
                            <div>
                                <label class="text-white/40 text-xs mb-2 block">Peso Deseado</label>
                                <input type="number" 
                                       id="goal-weight-target" 
                                       class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                                       step="0.1" 
                                       value="${targetWeight}"
                                       placeholder="0.0">
                                <span class="text-white/30 text-xs mt-1 block">${weight.unit || 'kg'}</span>
                            </div>
                        </div>
                        <div>
                            <label class="text-white/40 text-xs mb-2 block">Altura</label>
                            <input type="number" 
                                   id="goal-height" 
                                   class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                                   step="0.1" 
                                   value="${currentHeight}"
                                   placeholder="0.0">
                            <span class="text-white/30 text-xs mt-1 block">${height.unit || 'cm'}</span>
                        </div>
                    </div>
                ` : `
                    <p class="text-white/30 text-xs italic">Objetivo desactivado</p>
                `}
            </div>
        </div>
    `;
}

/**
 * Renderizar tarjeta de composición corporal
 */
function renderBodyCompositionCard(goals) {
    const bc = goals.bodyComposition || {};
    const isEnabled = bc.waterLiters?.enabled || bc.proteinKg?.enabled || bc.mineralsKg?.enabled || bc.fatMassKg?.enabled;

    return `
        <div class="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center gap-3 flex-1">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 border border-[#00f5d4]/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-[#00f5d4]">analytics</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-white font-bold text-sm">Composición Corporal</h3>
                        <p class="text-white/40 text-xs mt-0.5">Análisis detallado (opcional)</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" ${isEnabled ? 'checked' : ''} 
                           onchange="window.toggleBodyCompositionGoal(this.checked)">
                    <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                </label>
            </div>

            <div id="body-composition-content">
                ${isEnabled ? `
                    <div class="space-y-3">
                        ${renderBodyCompField('waterLiters', 'Agua Corporal Total', bc.waterLiters, 'L')}
                        ${renderBodyCompField('proteinKg', 'Proteínas', bc.proteinKg, 'kg')}
                        ${renderBodyCompField('mineralsKg', 'Minerales', bc.mineralsKg, 'kg')}
                        ${renderBodyCompField('fatMassKg', 'Masa Grasa Corporal', bc.fatMassKg, 'kg')}
                    </div>
                ` : `
                    <p class="text-white/30 text-xs italic">Análisis desactivado</p>
                `}
            </div>
        </div>
    `;
}

function renderBodyCompField(key, label, data, unit) {
    const current = data?.current || 0;
    const target = data?.target || 0;

    return `
        <div class="grid grid-cols-2 gap-3">
            <div>
                <label class="text-white/40 text-[10px] mb-1 block">${label} Actual</label>
                <input type="number" 
                       id="bc-${key}-current" 
                       class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold focus:border-[#00f5d4] outline-none"
                       step="0.1" 
                       value="${current}"
                       placeholder="0.0">
                <span class="text-white/30 text-[9px] mt-0.5 block">${unit}</span>
            </div>
            <div>
                <label class="text-white/40 text-[10px] mb-1 block">Objetivo</label>
                <input type="number" 
                       id="bc-${key}-target" 
                       class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold focus:border-[#00f5d4] outline-none"
                       step="0.1" 
                       value="${target}"
                       placeholder="0.0">
                <span class="text-white/30 text-[9px] mt-0.5 block">${unit}</span>
            </div>
        </div>
    `;
}

// ==========================================
// WINDOW FUNCTIONS
// ==========================================

window.toggleGoalEnabled = function (key, enabled) {
    const goals = AppState.goalsData;
    if (goals[key]) {
        goals[key].enabled = enabled;
    }
};

window.toggleBodyComposition = function (enabled) {
    const goals = AppState.goalsData;
    if (goals.bodyComposition) {
        goals.bodyComposition.waterLiters.enabled = enabled;
        goals.bodyComposition.proteinKg.enabled = enabled;
        goals.bodyComposition.mineralsKg.enabled = enabled;
        goals.bodyComposition.fatMassKg.enabled = enabled;
    }
};

/**
 * Toggle reactivo para Peso Objetivo
 */
window.toggleWeightGoal = function (enabled) {
    const goals = AppState.goalsData;
    if (goals.weight) {
        goals.weight.enabled = enabled;
    }

    // Actualizar DOM inmediatamente
    const container = document.getElementById('weight-goal-content');
    if (!container) return;

    const weight = goals.weight || {};
    const height = goals.height || {};
    const currentWeight = weight.current || AppState.currentUser?.weight || 0;
    const currentHeight = height.current || AppState.currentUser?.height || 0;
    const targetWeight = weight.target || currentWeight;

    if (enabled) {
        container.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="text-white/40 text-xs mb-2 block">Peso Actual</label>
                        <input type="number" 
                               id="goal-weight-current" 
                               class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                               step="0.1" 
                               value="${currentWeight}"
                               placeholder="0.0">
                        <span class="text-white/30 text-xs mt-1 block">${weight.unit || 'kg'}</span>
                    </div>
                    <div>
                        <label class="text-white/40 text-xs mb-2 block">Peso Deseado</label>
                        <input type="number" 
                               id="goal-weight-target" 
                               class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                               step="0.1" 
                               value="${targetWeight}"
                               placeholder="0.0">
                        <span class="text-white/30 text-xs mt-1 block">${weight.unit || 'kg'}</span>
                    </div>
                </div>
                <div>
                    <label class="text-white/40 text-xs mb-2 block">Altura</label>
                    <input type="number" 
                           id="goal-height" 
                           class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-bold focus:border-[#00f5d4] focus:ring-1 focus:ring-[#00f5d4] outline-none"
                           step="0.1" 
                           value="${currentHeight}"
                           placeholder="0.0">
                    <span class="text-white/30 text-xs mt-1 block">${height.unit || 'cm'}</span>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = '<p class="text-white/30 text-xs italic">Objetivo desactivado</p>';
    }
};

/**
 * Toggle reactivo para Composición Corporal
 */
window.toggleBodyCompositionGoal = function (enabled) {
    const goals = AppState.goalsData;
    if (goals.bodyComposition) {
        goals.bodyComposition.waterLiters.enabled = enabled;
        goals.bodyComposition.proteinKg.enabled = enabled;
        goals.bodyComposition.mineralsKg.enabled = enabled;
        goals.bodyComposition.fatMassKg.enabled = enabled;
    }

    // Actualizar DOM inmediatamente
    const container = document.getElementById('body-composition-content');
    if (!container) return;

    const bc = goals.bodyComposition || {};

    if (enabled) {
        // Helper function para renderizar campos
        const renderField = (key, label, data, unit) => {
            const current = data?.current || 0;
            const target = data?.target || 0;

            return `
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-white/40 text-[10px] mb-1 block">${label} Actual</label>
                        <input type="number" 
                               id="bc-${key}-current" 
                               class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold focus:border-[#00f5d4] outline-none"
                               step="0.1" 
                               value="${current}"
                               placeholder="0.0">
                        <span class="text-white/30 text-[9px] mt-0.5 block">${unit}</span>
                    </div>
                    <div>
                        <label class="text-white/40 text-[10px] mb-1 block">Objetivo</label>
                        <input type="number" 
                               id="bc-${key}-target" 
                               class="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs font-bold focus:border-[#00f5d4] outline-none"
                               step="0.1" 
                               value="${target}"
                               placeholder="0.0">
                        <span class="text-white/30 text-[9px] mt-0.5 block">${unit}</span>
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div class="space-y-3">
                ${renderField('waterLiters', 'Agua Corporal Total', bc.waterLiters, 'L')}
                ${renderField('proteinKg', 'Proteínas', bc.proteinKg, 'kg')}
                ${renderField('mineralsKg', 'Minerales', bc.mineralsKg, 'kg')}
                ${renderField('fatMassKg', 'Masa Grasa Corporal', bc.fatMassKg, 'kg')}
            </div>
        `;
    } else {
        container.innerHTML = '<p class="text-white/30 text-xs italic">Análisis desactivado</p>';
    }
};

/**
 * Sincronizar valor de objetivo entre label, input y slider
 */
window.updateGoalValue = function (key, value, unit) {
    // Formatear valor según la unidad
    let displayValue = value;
    if (unit === 'horas') {
        // Convertir decimal a formato Xh Ym
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        displayValue = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    } else {
        displayValue = `${value} ${unit}`;
    }

    // Actualizar label
    const label = document.getElementById(`goal-label-${key}`);
    if (label) {
        label.textContent = displayValue;
    }

    // Actualizar input
    const input = document.getElementById(`goal-${key}`);
    if (input && input.value !== value) {
        input.value = value;
    }

    // Actualizar slider
    const slider = document.getElementById(`goal-slider-${key}`);
    if (slider && slider.value !== value) {
        slider.value = value;
    }
};

window.saveGoals = async function () {
    try {
        const userId = AppState.currentUser?.uid || AppState.currentUser?.id;
        const goals = AppState.goalsData;

        // Recopilar valores del DOM
        const goalKeys = [
            'weeklyExerciseDays',
            'weeklyMindfulnessDays',
            'dailySteps',
            'dailyActiveMinutes',
            'dailyCalories',
            'dailyMeditationMinutes',
            'dailyBreathingSessions',
            'dailySleepHours',
            'dailyWaterIntake'
        ];

        goalKeys.forEach(key => {
            const input = document.getElementById(`goal-${key}`);
            if (input && goals[key]) {
                goals[key].target = parseFloat(input.value);
            }
        });

        // Peso
        const weightCurrent = document.getElementById('goal-weight-current');
        const weightTarget = document.getElementById('goal-weight-target');
        const heightInput = document.getElementById('goal-height');

        if (weightCurrent && goals.weight) {
            goals.weight.current = parseFloat(weightCurrent.value) || 0;
            goals.weight.target = parseFloat(weightTarget.value) || 0;
            if (!goals.weight.startWeight) {
                goals.weight.startWeight = goals.weight.current;
            }
        }

        if (heightInput && goals.height) {
            goals.height.current = parseFloat(heightInput.value) || 0;
        }

        // Composición corporal
        const bcFields = ['waterLiters', 'proteinKg', 'mineralsKg', 'fatMassKg'];
        bcFields.forEach(field => {
            const currentInput = document.getElementById(`bc-${field}-current`);
            const targetInput = document.getElementById(`bc-${field}-target`);

            if (currentInput && targetInput && goals.bodyComposition[field]) {
                goals.bodyComposition[field].current = parseFloat(currentInput.value) || 0;
                goals.bodyComposition[field].target = parseFloat(targetInput.value) || 0;
            }
        });

        // Guardar en Firestore
        await goalsManager.saveGoals(userId, goals);

        if (window.showToast) {
            window.showToast('✅ Objetivos guardados correctamente');
        }

        // Volver a perfil
        setTimeout(() => navigateTo('profile'), 500);

    } catch (error) {
        console.error('Error saving goals:', error);
        if (window.showToast) {
            window.showToast('❌ Error al guardar objetivos', 'error');
        }
    }
};
