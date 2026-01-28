/**
 * 🧠 Clasificador Central de Actividades
 * Define la taxonomía única del sistema:
 * - MINDFULNESS: Yoga, Respiración, Meditación.
 * - PHYSICAL_SPORT: Todo lo demás (Correr, Fútbol, Pesas, etc.)
 */

export const ACTIVITY_TYPES = {
    MINDFULNESS: 'MINDFULNESS',
    PHYSICAL_SPORT: 'PHYSICAL_SPORT'
};

/**
 * Determina el tipo de actividad basándose en su nombre o ID.
 * @param {object} activity - Objeto de actividad (debe tener sportKey, id o name)
 * @returns {string} ACTIVITY_TYPES.MINDFULNESS | ACTIVITY_TYPES.PHYSICAL_SPORT
 */
export function classifyActivity(activity) {
    if (!activity) return ACTIVITY_TYPES.PHYSICAL_SPORT; // Fallback seguro

    const key = (activity.sportKey || activity.id || '').toString().toLowerCase();
    const name = (activity.name || activity.sportName || '').toLowerCase();

    // Palabras clave que definen "Actividad Mindfulness"
    const mindfulnessKeywords = [
        'yoga',
        'meditation', 'meditación',
        'breath', 'respiración', 'breathing',
        'mindfulness', 'relajación', 'relaxation',
        'pranayama', 'nidra'
    ];

    const isMindfulness = mindfulnessKeywords.some(w => key.includes(w) || name.includes(w));

    return isMindfulness ? ACTIVITY_TYPES.MINDFULNESS : ACTIVITY_TYPES.PHYSICAL_SPORT;
}

/**
 * Helper: ¿Es una actividad de Mindfulness?
 */
export function isMindfulnessActivity(activity) {
    return classifyActivity(activity) === ACTIVITY_TYPES.MINDFULNESS;
}

/**
 * Helper: ¿Es una actividad Física/Deporte?
 * (Ideal para filtrar sumas de Minutos Activos, Calorías quemadas activamente, etc.)
 */
export function isPhysicalSport(activity) {
    return classifyActivity(activity) === ACTIVITY_TYPES.PHYSICAL_SPORT;
}
