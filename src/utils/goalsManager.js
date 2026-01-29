/**
 * 🎯 Goals Manager
 * Gestión centralizada de objetivos del usuario
 */

import { db } from '../config/firebaseInit.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { AppState } from './state.js';

// Estructura de objetivos por defecto
export const DEFAULT_GOALS = {
    // Objetivos Semanales
    weeklyExerciseDays: {
        current: 0,
        target: 3,
        enabled: true,
        unit: 'días'
    },
    weeklyMindfulnessDays: {
        current: 0,
        target: 3,
        enabled: true,
        unit: 'días'
    },

    // Objetivos Diarios
    dailySteps: {
        current: 0,
        target: 10000,
        enabled: true,
        unit: 'pasos'
    },
    dailyCalories: {
        current: 0,
        target: 500,
        enabled: true,
        unit: 'kcal'
    },
    dailySleepHours: {
        current: 0,
        target: 8,
        enabled: true,
        unit: 'horas'
    },
    dailyActiveMinutes: {
        current: 0,
        target: 30,
        enabled: true,
        unit: 'minutos'
    },
    dailyMeditationMinutes: {
        current: 0,
        target: 10,
        enabled: true,
        unit: 'minutos'
    },
    dailyBreathingSessions: {
        current: 0,
        target: 2,
        enabled: true,
        unit: 'sesiones'
    },
    dailyWaterIntake: {
        current: 0,
        target: 2000,
        enabled: false,
        unit: 'ml'
    },

    // Objetivos de Peso y Composición Corporal
    weight: {
        current: 0,
        target: 0,
        startWeight: 0,
        enabled: false,
        unit: 'kg'
    },
    height: {
        current: 0,
        unit: 'cm'
    },
    bodyComposition: {
        waterLiters: {
            current: 0,
            target: 0,
            enabled: false
        },
        proteinKg: {
            current: 0,
            target: 0,
            enabled: false
        },
        mineralsKg: {
            current: 0,
            target: 0,
            enabled: false
        },
        fatMassKg: {
            current: 0,
            target: 0,
            enabled: false
        }
    },

    // Metadata
    createdAt: null,
    updatedAt: null,
    lastReviewedAt: null,

    // Logging silencioso para badges futuros
    _milestones: {}
};

export class GoalsManager {
    constructor() {
        this.db = db;
    }

    /**
     * Cargar objetivos del usuario desde Firestore
     */
    async loadGoals(userId) {
        try {
            const goalsRef = doc(this.db, 'users', userId, 'goals', 'current');
            const goalsSnap = await getDoc(goalsRef);

            if (goalsSnap.exists()) {
                const goals = goalsSnap.data();
                AppState.goalsData = goals;
                return goals;
            } else {
                // Primera vez - crear objetivos por defecto
                const defaultGoals = {
                    ...DEFAULT_GOALS,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                await this.saveGoals(userId, defaultGoals);
                AppState.goalsData = defaultGoals;
                return defaultGoals;
            }
        } catch (error) {
            console.error('Error loading goals:', error);
            return DEFAULT_GOALS;
        }
    }

    /**
     * Guardar objetivos en Firestore
     */
    async saveGoals(userId, goals) {
        try {
            const goalsRef = doc(this.db, 'users', userId, 'goals', 'current');

            const updatedGoals = {
                ...goals,
                updatedAt: new Date().toISOString()
            };

            await setDoc(goalsRef, updatedGoals, { merge: true });
            AppState.goalsData = updatedGoals;

            console.log('✅ Objetivos guardados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error saving goals:', error);
            throw error;
        }
    }

    /**
     * Actualizar un objetivo específico
     */
    async updateGoal(userId, goalKey, updates) {
        try {
            const currentGoals = AppState.goalsData || await this.loadGoals(userId);

            if (!currentGoals[goalKey]) {
                throw new Error(`Goal ${goalKey} not found`);
            }

            currentGoals[goalKey] = {
                ...currentGoals[goalKey],
                ...updates
            };

            await this.saveGoals(userId, currentGoals);
            return currentGoals[goalKey];
        } catch (error) {
            console.error(`Error updating goal ${goalKey}:`, error);
            throw error;
        }
    }

    /**
     * Actualizar progreso actual de un objetivo
     */
    async updateProgress(userId, goalKey, currentValue) {
        try {
            return await this.updateGoal(userId, goalKey, { current: currentValue });
        } catch (error) {
            console.error(`Error updating progress for ${goalKey}:`, error);
            throw error;
        }
    }

    /**
     * Habilitar/deshabilitar un objetivo
     */
    async toggleGoal(userId, goalKey, enabled) {
        try {
            return await this.updateGoal(userId, goalKey, { enabled });
        } catch (error) {
            console.error(`Error toggling goal ${goalKey}:`, error);
            throw error;
        }
    }

    /**
     * Calcular progreso porcentual de un objetivo
     */
    calculateProgress(goal) {
        if (!goal || !goal.target || goal.target === 0) return 0;

        const progress = (goal.current / goal.target) * 100;
        return Math.min(Math.round(progress), 100);
    }

    /**
     * Verificar si un objetivo fue alcanzado
     */
    isGoalReached(goal) {
        if (!goal || !goal.enabled) return false;
        return goal.current >= goal.target;
    }

    /**
     * Obtener resumen de todos los objetivos
     */
    getGoalsSummary(goals) {
        const summary = {
            total: 0,
            enabled: 0,
            reached: 0,
            inProgress: 0,
            notStarted: 0
        };

        Object.keys(goals).forEach(key => {
            if (key.startsWith('_') || ['createdAt', 'updatedAt', 'lastReviewedAt', 'height', 'bodyComposition'].includes(key)) {
                return;
            }

            const goal = goals[key];
            summary.total++;

            if (goal.enabled) {
                summary.enabled++;

                if (this.isGoalReached(goal)) {
                    summary.reached++;
                } else if (goal.current > 0) {
                    summary.inProgress++;
                } else {
                    summary.notStarted++;
                }
            }
        });

        return summary;
    }

    /**
     * Resetear progreso diario (llamar a medianoche)
     */
    async resetDailyProgress(userId) {
        try {
            const goals = AppState.goalsData || await this.loadGoals(userId);

            // Resetear solo los objetivos diarios
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
                if (goals[key]) {
                    goals[key].current = 0;
                }
            });

            await this.saveGoals(userId, goals);
            console.log('✅ Daily progress reset');
        } catch (error) {
            console.error('Error resetting daily progress:', error);
        }
    }

    /**
     * Resetear progreso semanal (llamar los lunes)
     */
    async resetWeeklyProgress(userId) {
        try {
            const goals = AppState.goalsData || await this.loadGoals(userId);

            // Resetear solo los objetivos semanales
            const weeklyGoals = [
                'weeklyExerciseDays',
                'weeklyMindfulnessDays'
            ];

            weeklyGoals.forEach(key => {
                if (goals[key]) {
                    goals[key].current = 0;
                }
            });

            await this.saveGoals(userId, goals);
            console.log('✅ Weekly progress reset');
        } catch (error) {
            console.error('Error resetting weekly progress:', error);
        }
    }
}

// Exportar instancia singleton
export const goalsManager = new GoalsManager();

// Exponer globalmente para debugging
window.goalsManager = goalsManager;
