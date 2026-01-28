/**
 * Auto-actualización de Progreso de Desafíos
 * 
 * Este módulo sincroniza automáticamente el progreso de los desafíos
 * basándose en las actividades registradas en AppState.activities
 */

import { AppState } from './state.js';

/**
 * Mapeo entre categorías de desafíos y sportKeys del normalizador
 */
const CHALLENGE_SPORT_MAPPING = {
    // Basic mappings
    'run': ['running', 'run', 'treadmill_running'],
    'running': ['running', 'run', 'treadmill_running'],
    'bike': ['cycling', 'bike', 'biking', 'biking_indoor', 'biking_road', 'biking_mountain'],
    'cycling': ['cycling', 'bike', 'biking', 'biking_indoor', 'biking_road', 'biking_mountain'],
    'walk': ['walking', 'walk', 'hiking', 'stroller_walking'],
    'walking': ['walking', 'walk', 'hiking', 'stroller_walking'],
    'hiking': ['hiking', 'walking', 'walk'],
    'gym': ['strength_training', 'gym', 'weightlifting', 'workout', 'crossfit', 'hiit', 'calisthenics', 'circuit_training'],
    'strength_training': ['strength_training', 'gym', 'weightlifting', 'workout', 'crossfit', 'hiit', 'calisthenics', 'circuit_training'],
    'yoga': ['yoga', 'hatha_yoga', 'vinyasa_yoga', 'power_yoga'],
    'swim': ['swimming', 'swim', 'swimming_pool', 'swimming_open_water'],
    'swimming': ['swimming', 'swim', 'swimming_pool', 'swimming_open_water'],
    'meditation': ['meditation', 'guided_breathing', 'mindfulness'],
    'pilates': ['pilates'],

    // Additional sports
    'football': ['football_soccer', 'soccer', 'football'],
    'soccer': ['football_soccer', 'soccer', 'football'],
    'football_soccer': ['football_soccer', 'soccer', 'football'],
    'tennis': ['tennis', 'squash', 'badminton', 'racquetball', 'table_tennis'],
    'basketball': ['basketball'],
    'boxing': ['boxing', 'kickboxing', 'martial_arts'],
    'dance': ['dancing', 'dance', 'zumba'],
    'hiit': ['hiit', 'interval_training']
};

/**
 * Calcula el progreso acumulado de un desafío basándose en actividades
 * @param {Object} challenge - El desafío a calcular
 * @returns {number} - Porcentaje de progreso (0-100)
 */
export function calculateChallengeProgress(challenge) {
    if (!challenge || !challenge.metric || !challenge.startDate || !challenge.endDate) {
        return 0;
    }

    // Parsear la métrica del desafío (ej: "4 hours", "10 km")
    const [goalValue, unit] = challenge.metric.split(' ');
    const goalNumber = parseFloat(goalValue);

    if (isNaN(goalNumber) || goalNumber <= 0) {
        console.warn('Invalid or negative challenge metric:', challenge.metric, 'goalNumber:', goalNumber);
        return 0;
    }

    // Obtener la categoría del desafío y sus sportKeys equivalentes
    const challengeCategory = challenge.category?.toLowerCase() || '';
    const validSportKeys = CHALLENGE_SPORT_MAPPING[challengeCategory] || [];

    if (validSportKeys.length === 0) {
        console.warn(`No sport mapping found for challenge category: ${challengeCategory}`);
        return 0;
    }

    // Filtrar actividades que coincidan con el desafío
    const challengeStartDate = new Date(challenge.startDate);
    const challengeEndDate = new Date(challenge.endDate);

    const relevantActivities = AppState.activities.filter(activity => {
        // Verificar que la actividad esté en el rango de fechas del desafío
        const activityDate = new Date(activity.startTime || activity.date);
        if (activityDate < challengeStartDate || activityDate > challengeEndDate) {
            return false;
        }

        // Verificar que el sportKey coincida con la categoría del desafío
        const activitySportKey = activity.sportKey?.toLowerCase() || '';
        return validSportKeys.some(key => activitySportKey.includes(key) || key.includes(activitySportKey));
    });

    console.log(`📊 [Challenge Progress] "${challenge.name}":`, {
        category: challengeCategory,
        validSportKeys,
        totalActivities: AppState.activities.length,
        relevantActivities: relevantActivities.length,
        activities: relevantActivities.map(a => ({ name: a.name, sportKey: a.sportKey, duration: a.duration }))
    });

    // Calcular el total acumulado según la unidad
    let totalAccumulated = 0;

    if (unit.toLowerCase().includes('hour') || unit.toLowerCase() === 'h') {
        // Sumar duración en horas
        totalAccumulated = relevantActivities.reduce((sum, activity) => {
            const durationMinutes = activity.duration || 0;
            return sum + (durationMinutes / 60); // Convertir minutos a horas
        }, 0);
    } else if (unit.toLowerCase().includes('km')) {
        // Sumar distancia en km
        totalAccumulated = relevantActivities.reduce((sum, activity) => {
            const distanceKm = activity.distance || 0;
            return sum + distanceKm;
        }, 0);
    } else if (unit.toLowerCase().includes('calor')) {
        // Sumar calorías
        totalAccumulated = relevantActivities.reduce((sum, activity) => {
            const calories = activity.calories || 0;
            return sum + calories;
        }, 0);
    } else if (unit.toLowerCase().includes('paso') || unit.toLowerCase().includes('step')) {
        // Sumar pasos
        totalAccumulated = relevantActivities.reduce((sum, activity) => {
            const steps = activity.steps || 0;
            return sum + steps;
        }, 0);
    }

    // Calcular porcentaje
    const percentage = Math.min(100, Math.round((totalAccumulated / goalNumber) * 100));

    console.log(`✅ Progress calculated: ${totalAccumulated.toFixed(2)} / ${goalNumber} ${unit} = ${percentage}%`);

    return percentage;
}

/**
 * Actualiza el progreso de todos los desafíos activos
 * basándose en las actividades sincronizadas
 */
export async function updateAllChallengesProgress() {
    console.log('🔄 Updating all challenges progress...');

    if (!AppState.challenges || AppState.challenges.length === 0) {
        console.log('No challenges to update');
        return;
    }

    let updatedCount = 0;
    const now = Date.now();

    for (const challenge of AppState.challenges) {
        // Solo actualizar desafíos activos (no finalizados)
        const endDate = new Date(challenge.endDate);
        if (endDate < now) {
            continue; // Desafío ya finalizado
        }

        const oldProgress = challenge.progress || 0;
        const newProgress = calculateChallengeProgress(challenge);

        if (newProgress !== oldProgress) {
            challenge.progress = newProgress;
            updatedCount++;

            console.log(`📈 Updated "${challenge.name}": ${oldProgress}% → ${newProgress}%`);

            // Actualizar en Firestore si está disponible
            try {
                const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const db = getFirestore();

                await updateDoc(doc(db, "challenges", challenge.id), {
                    progress: newProgress,
                    updatedAt: Date.now()
                });

                console.log(`☁️ Synced to Firestore: ${challenge.name}`);
            } catch (error) {
                console.error('Error updating challenge in Firestore:', error);
            }
        }
    }

    // Guardar en localStorage
    if (updatedCount > 0) {
        localStorage.setItem('my_challenges', JSON.stringify(AppState.challenges));
        console.log(`✅ Updated ${updatedCount} challenge(s)`);

        // Refrescar la vista si estamos en la página de desafíos
        if (AppState.currentPage === 'challenges' || AppState.currentPage === 'challenge-detail') {
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                if (AppState.currentPage === 'challenges') {
                    const { renderChallenges } = await import('../pages/challenges.js');
                    mainContent.innerHTML = renderChallenges();
                } else if (AppState.currentPage === 'challenge-detail') {
                    const { renderChallengeDetailPage } = await import('../pages/challengeDetail.js');
                    mainContent.innerHTML = renderChallengeDetailPage();
                }
            }
        }
    } else {
        console.log('No challenges needed updating');
    }

    return updatedCount;
}

/**
 * Hook para llamar después de sincronizar actividades
 */
export function onActivitiesSynced() {
    console.log('🎯 Activities synced, updating challenges...');
    updateAllChallengesProgress();
}
