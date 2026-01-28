
import { AppState, loadUserData } from './src/utils/state.js';
import { getLocalISOString } from './src/utils/dateHelper.js';

// Cargar datos
loadUserData();

// Obtener fecha de hoy
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
console.log(`\n📅 Analizando Actividades para HOY: ${today}\n`);

const activities = AppState.activities || [];
const todaysActivities = activities.filter(act => {
    return (act.startTime && act.startTime.startsWith(today)) ||
        (act.date && act.date.startsWith(today));
});

console.log(`🔍 Total actividades encontradas: ${todaysActivities.length}`);

if (todaysActivities.length === 0) {
    console.log("❌ No hay actividades registradas para hoy.");
} else {
    // Tabla detallada
    console.table(todaysActivities.map(a => ({
        Name: a.name || a.sportName,
        Key: a.sportKey,
        Duration: (a.duration || 0) + ' min',
        IsExerciseCandidate: isExercise(a),
        ExcludedByDuration: (a.duration || 0) < 10,
        ExcludedByMindfulness: isMindfulness(a)
    })));
}

// Helper functions (copiadas de la lógica corregida)
function isMindfulness(act) {
    const key = (act.sportKey || '').toLowerCase();
    const name = (act.name || '').toLowerCase();
    return key.includes('yoga') || key.includes('meditation') ||
        key.includes('breath') || key.includes('mindfulness') || name.includes('yoga') ||
        name.includes('meditación') || name.includes('respiración');
}

function isExercise(act) {
    return !isMindfulness(act);
}
