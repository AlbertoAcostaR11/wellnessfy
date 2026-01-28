
import { AppState, saveUserData } from './state.js';
import { getLocalISOString } from './dateHelper.js';

export function generateHistoricalData() {
    console.log('🔮 Generando historial simulado para demostración...');

    // Si ya tenemos muchos datos, quizás no sea necesario sobrescribir todo,
    // pero para este fix nos aseguraremos de llenar los huecos.

    const activities = AppState.activities || [];
    const sleepHistory = AppState.sleepHistory || [];
    const dailyTotals = AppState.dailyTotals || []; // Asegurar que exista en AppState

    // Generar datos para las últimas 12 semanas
    const today = new Date();

    for (let i = 1; i <= 84; i++) { // 12 semanas * 7 días
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = getLocalISOString(date.toISOString());

        // 1. Simular Totales Diarios (Pasos, etc)
        // Solo si no existe ya un registro para este día
        if (!dailyTotals.find(d => d.date === dateStr)) {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const stepsBase = isWeekend ? 12000 : 6000;
            const steps = Math.floor(stepsBase + Math.random() * 5000);

            dailyTotals.push({
                date: dateStr,
                steps: steps,
                distance: parseFloat((steps * 0.000762).toFixed(2)), // km aprox
                calories: Math.floor(steps * 0.045 + 1300), // BMR + actividad
                activeMinutes: Math.floor(steps / 100)
            });
        }

        // 2. Simular Sueño
        if (!sleepHistory.find(d => d.date === dateStr)) {
            const sleepDuration = 5 + Math.random() * 4; // Entre 5 y 9 horas
            sleepHistory.push({
                date: dateStr,
                duration: parseFloat(sleepDuration.toFixed(2)),
                efficiency: Math.floor(80 + Math.random() * 20)
            });
        }

        // 3. Simular Actividades Deportivas (Aleatorio: 60% probabilidad de entrenar)
        if (Math.random() > 0.4) {
            // Verificar si ya hay actividades para este día para no duplicar en exceso
            // Nota: Aquí simplificamos, asumiendo que si no hay en dailyTotals, generamos actividad.

            const sports = ['running', 'yoga', 'weights', 'cycling', 'swimming'];
            const sport = sports[Math.floor(Math.random() * sports.length)];

            // Variar duración
            const duration = 30 + Math.floor(Math.random() * 60);

            // Añadir actividad
            activities.push({
                id: `dummy_${dateStr}_${Math.random().toString(36).substr(2, 9)}`,
                name: getSportName(sport),
                sportKey: sport,
                startTime: `${dateStr}T${18 + Math.floor(Math.random() * 3)}:00:00`,
                duration: duration,
                calories: Math.floor(duration * (Math.random() * 10 + 5)),
                distance: sport === 'running' || sport === 'cycling' ? (duration / 6) * (sport === 'cycling' ? 3 : 1) : 0,
                steps: sport === 'running' ? duration * 160 : 0
            });
        }
    }

    // Guardar en AppState
    AppState.activities = activities;
    AppState.sleepHistory = sleepHistory; // Asegurar que sleepHistory esté en AppState
    AppState.dailyTotals = dailyTotals;   // Asegurar que dailyTotals esté en AppState

    // Guardar en LocalStorage para persistencia
    localStorage.setItem('wellnessfy_daily_totals', JSON.stringify(dailyTotals));
    localStorage.setItem('wellnessfy_sleep_history', JSON.stringify(sleepHistory));
    saveUserData(); // Guarda activities y otros

    console.log('✅ Historial generado exitosamente.');
}

function getSportName(key) {
    const names = {
        'running': 'Carrera Matutina',
        'yoga': 'Hatha Yoga',
        'weights': 'Entrenamiento de Fuerza',
        'cycling': 'Ruta en Bici',
        'swimming': 'Nado Libre'
    };
    return names[key] || 'Entrenamiento';
}
