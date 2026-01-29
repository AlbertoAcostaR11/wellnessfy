/**
 * 🎯 Goals Tracker
 * Sistema de tracking automático de progreso de objetivos
 */

import { AppState } from './state.js';
import { goalsManager } from './goalsManager.js';
import { db } from '../config/firebaseInit.js';
import { getLocalISOString, getCurrentWeekDays } from './dateHelper.js';

export class GoalsTracker {
    constructor() {
        this.userId = null;
    }

    /**
     * Inicializar tracker con userId
     */
    init(userId) {
        this.userId = userId;
    }

    /**
     * Actualizar progreso de objetivos basado en datos de salud
     * Llamar después de cada sincronización de health APIs
     */
    async updateAllProgress(healthData) {
        if (!this.userId) {
            console.error('GoalsTracker not initialized with userId');
            return;
        }

        try {
            const goals = AppState.goalsData || await goalsManager.loadGoals(this.userId);

            // Actualizar objetivos diarios
            await this.updateDailyGoals(goals, healthData);

            // Actualizar objetivos semanales
            await this.updateWeeklyGoals(goals, healthData);

            // Detectar logros alcanzados (logging silencioso)
            const milestones = this.detectMilestones(goals);
            if (milestones.length > 0) {
                await this.logMilestones(goals, milestones);
            }

            // Guardar progreso actualizado
            await goalsManager.saveGoals(this.userId, goals);

            console.log('✅ Progreso de objetivos actualizado');
            return goals;

        } catch (error) {
            console.error('Error updating goals progress:', error);
            throw error;
        }
    }

    /**
     * Actualizar objetivos diarios
     */
    async updateDailyGoals(goals, healthData) {
        const today = healthData.todayStats || AppState.todayStats || {};
        const activities = healthData.activities || AppState.activities || [];

        // Pasos
        if (goals.dailySteps?.enabled && today.steps !== undefined) {
            goals.dailySteps.current = today.steps || 0;
        }

        // Calorías
        if (goals.dailyCalories?.enabled && today.calories !== undefined) {
            goals.dailyCalories.current = today.calories || 0;
        }

        // Sueño (en horas)
        if (goals.dailySleepHours?.enabled && today.sleep !== undefined) {
            // Convertir minutos a horas
            const sleepHours = (today.sleep / 60) || 0;
            goals.dailySleepHours.current = parseFloat(sleepHours.toFixed(1));
        }

        // Minutos activos
        if (goals.dailyActiveMinutes?.enabled) {
            const activeMinutes = this.calculateActiveMinutesToday(activities);
            goals.dailyActiveMinutes.current = activeMinutes;
        }

        // Minutos de meditación
        if (goals.dailyMeditationMinutes?.enabled) {
            const meditationMinutes = this.calculateMeditationMinutesToday(activities);
            goals.dailyMeditationMinutes.current = meditationMinutes;
        }

        // Sesiones de respiración
        if (goals.dailyBreathingSessions?.enabled) {
            const breathingSessions = this.calculateBreathingSessionsToday(activities);
            goals.dailyBreathingSessions.current = breathingSessions;
        }

        // Hidratación (si el usuario lo trackea manualmente)
        // Por ahora no tenemos API que lo provea automáticamente
    }

    /**
     * Actualizar objetivos semanales
     */
    async updateWeeklyGoals(goals, healthData) {
        const activities = healthData.activities || AppState.activities || [];
        const weekDates = getCurrentWeekDays();

        // Días de ejercicio esta semana
        if (goals.weeklyExerciseDays?.enabled) {
            const exerciseDays = this.calculateExerciseDaysThisWeek(activities, weekDates);
            goals.weeklyExerciseDays.current = exerciseDays;
        }

        // Días de mindfulness esta semana
        if (goals.weeklyMindfulnessDays?.enabled) {
            const mindfulnessDays = this.calculateMindfulnessDaysThisWeek(activities, weekDates);
            goals.weeklyMindfulnessDays.current = mindfulnessDays;
        }
    }

    /**
     * Calcular minutos activos hoy (ejercicio físico)
     */
    calculateActiveMinutesToday(activities) {
        const today = getLocalISOString();
        const mindfulnessTypes = ['yoga', 'meditation', 'breathwork', 'guided_breathing'];

        const activeMinutes = activities
            .filter(act => {
                const actDate = getLocalISOString(act.startTime);
                const sportKey = (act.sportKey || act.name || '').toLowerCase();

                // Solo ejercicio físico de hoy, no mindfulness
                return actDate === today &&
                    !mindfulnessTypes.includes(sportKey) &&
                    act.duration >= 10; // Mínimo 10 minutos
            })
            .reduce((sum, act) => sum + (act.duration || 0), 0);

        return Math.round(activeMinutes);
    }

    /**
     * Calcular minutos de meditación hoy
     */
    calculateMeditationMinutesToday(activities) {
        const today = getLocalISOString();

        const meditationMinutes = activities
            .filter(act => {
                const actDate = getLocalISOString(act.startTime);
                const sportKey = (act.sportKey || act.name || '').toLowerCase();

                return actDate === today && sportKey === 'meditation';
            })
            .reduce((sum, act) => sum + (act.duration || 0), 0);

        return Math.round(meditationMinutes);
    }

    /**
     * Calcular sesiones de respiración hoy (mínimo 1 minuto cada una)
     */
    calculateBreathingSessionsToday(activities) {
        const today = getLocalISOString();

        const sessions = activities
            .filter(act => {
                const actDate = getLocalISOString(act.startTime);
                const sportKey = (act.sportKey || act.name || '').toLowerCase();

                return actDate === today &&
                    (sportKey === 'breathwork' || sportKey === 'guided_breathing') &&
                    act.duration >= 1; // Mínimo 1 minuto
            });

        return sessions.length;
    }

    /**
     * Calcular días de ejercicio esta semana
     */
    calculateExerciseDaysThisWeek(activities, weekDates) {
        const mindfulnessTypes = ['yoga', 'meditation', 'breathwork', 'guided_breathing'];

        const exerciseDays = new Set();

        activities.forEach(act => {
            const actDate = getLocalISOString(act.startTime);
            const sportKey = (act.sportKey || act.name || '').toLowerCase();

            // Solo contar si está en la semana actual, es ejercicio físico y dura al menos 10 min
            if (weekDates.includes(actDate) &&
                !mindfulnessTypes.includes(sportKey) &&
                act.duration >= 10) {
                exerciseDays.add(actDate);
            }
        });

        return exerciseDays.size;
    }

    /**
     * Calcular días de mindfulness esta semana
     */
    calculateMindfulnessDaysThisWeek(activities, weekDates) {
        const mindfulnessTypes = ['yoga', 'meditation', 'breathwork', 'guided_breathing'];

        const mindfulnessDays = new Set();

        activities.forEach(act => {
            const actDate = getLocalISOString(act.startTime);
            const sportKey = (act.sportKey || act.name || '').toLowerCase();

            // Solo contar si está en la semana actual y es actividad de mindfulness
            if (weekDates.includes(actDate) && mindfulnessTypes.includes(sportKey)) {
                mindfulnessDays.add(actDate);
            }
        });

        return mindfulnessDays.size;
    }

    /**
     * Detectar logros alcanzados
     */
    detectMilestones(goals) {
        const milestones = [];
        const today = getLocalISOString();

        // Verificar cada objetivo
        Object.keys(goals).forEach(key => {
            if (key.startsWith('_') || ['createdAt', 'updatedAt', 'lastReviewedAt', 'height', 'bodyComposition'].includes(key)) {
                return;
            }

            const goal = goals[key];

            if (goal && goal.enabled && goalsManager.isGoalReached(goal)) {
                milestones.push({
                    type: key,
                    date: today,
                    value: goal.current,
                    target: goal.target
                });
            }
        });

        return milestones;
    }

    /**
     * Logging silencioso de logros (para badges futuros)
     */
    async logMilestones(goals, milestones) {
        const today = getLocalISOString();

        if (!goals._milestones) {
            goals._milestones = {};
        }

        if (!goals._milestones[today]) {
            goals._milestones[today] = [];
        }

        milestones.forEach(milestone => {
            // Solo agregar si no existe ya
            const exists = goals._milestones[today].some(m => m.type === milestone.type);
            if (!exists) {
                goals._milestones[today].push(milestone.type);

                // Mapa de nombres amigables
                const goalNames = {
                    dailySteps: 'Pasos',
                    dailyCalories: 'Calorías',
                    dailyActiveMinutes: 'Minutos Activos',
                    dailySleepHours: 'Sueño',
                    dailyMeditationMinutes: 'Meditación',
                    dailyBreathingSessions: 'Respiración',
                    weeklyExerciseDays: 'Días de Ejercicio',
                    weeklyMindfulnessDays: 'Días de Mindfulness'
                };

                const friendlyName = goalNames[milestone.type] || milestone.type;

                console.log(`🏆 Logro detectado: ${friendlyName}`, milestone);

                // Trigger Notification (Frontend -> DB)
                if (window.NotificationService && this.userId) {
                    window.NotificationService.send('DAILY_GOAL', {
                        targetUserId: this.userId,
                        actor: {
                            id: 'system',
                            name: 'Wellnessfy Coach',
                            avatar: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' // Trophy Icon
                        },
                        title: '¡Objetivo Alcanzado! 🎯',
                        message: `¡Felicidades! Has completado tu meta de ${friendlyName} hoy.`,
                        data: {
                            click_action: '/activity',
                            goalType: milestone.type
                        }
                    });
                }
            }
        });
    }

    /**
     * Obtener resumen de progreso para mostrar en UI
     */
    getProgressSummary(goals) {
        if (!goals) return null;

        const summary = {
            daily: {
                reached: 0,
                total: 0,
                goals: []
            },
            weekly: {
                reached: 0,
                total: 0,
                goals: []
            }
        };

        // Objetivos diarios
        const dailyGoals = [
            'dailySteps',
            'dailyCalories',
            'dailySleepHours',
            'dailyActiveMinutes',
            'dailyMeditationMinutes',
            'dailyBreathingSessions',
            'dailyWaterIntake'
        ];

        dailyGoals.forEach(key => {
            const goal = goals[key];
            if (goal && goal.enabled) {
                summary.daily.total++;
                const progress = goalsManager.calculateProgress(goal);
                const reached = goalsManager.isGoalReached(goal);

                if (reached) summary.daily.reached++;

                summary.daily.goals.push({
                    key,
                    current: goal.current,
                    target: goal.target,
                    progress,
                    reached,
                    unit: goal.unit
                });
            }
        });

        // Objetivos semanales
        const weeklyGoals = ['weeklyExerciseDays', 'weeklyMindfulnessDays'];

        weeklyGoals.forEach(key => {
            const goal = goals[key];
            if (goal && goal.enabled) {
                summary.weekly.total++;
                const progress = goalsManager.calculateProgress(goal);
                const reached = goalsManager.isGoalReached(goal);

                if (reached) summary.weekly.reached++;

                summary.weekly.goals.push({
                    key,
                    current: goal.current,
                    target: goal.target,
                    progress,
                    reached,
                    unit: goal.unit
                });
            }
        });

        return summary;
    }

    /**
     * Resetear progreso diario (llamar a medianoche)
     */
    async resetDailyProgress() {
        if (!this.userId) return;
        await goalsManager.resetDailyProgress(this.userId);
    }

    /**
     * Resetear progreso semanal (llamar los lunes)
     */
    async resetWeeklyProgress() {
        if (!this.userId) return;
        await goalsManager.resetWeeklyProgress(this.userId);
    }
}

// Exportar instancia singleton
export const goalsTracker = new GoalsTracker();

// Exponer globalmente para debugging
window.goalsTracker = goalsTracker;
