
/**
 * ⚽ Detector de Fútbol - Wellnessfy Debug Tool (V2)
 * Busca específicamente sesiones de fútbol en los últimos 7 días
 */

async function findSoccerActivities() {
    console.group('🔍 ANÁLISIS DE FÚTBOL EN WELLNESSFY');

    // 1. Obtener actividades de LOCALSTORAGE (Nueva Key: wellnessfy_user_data)
    let activities = [];
    try {
        const saved = localStorage.getItem('wellnessfy_user_data');
        if (saved) {
            const data = JSON.parse(saved);
            activities = data.activities || [];
            console.log(`📊 Total actividades en memoria: ${activities.length}`);
        } else {
            console.warn('⚠️ No se encontró la clave "wellnessfy_user_data" en localStorage.');
            // Fallback al antiguo por si acaso
            const oldSaved = localStorage.getItem('wellnessfy_user');
            if (oldSaved) {
                const oldData = JSON.parse(oldSaved);
                activities = oldData.activities || [];
            }
        }
    } catch (e) {
        console.error('❌ Error leyendo localStorage:', e);
    }

    if (activities.length === 0) {
        console.warn('⚠️ La lista de actividades está vacía.');
        console.groupEnd();
        return;
    }

    // 2. Definir criterios de búsqueda para Fútbol (Actualizados)
    const soccerIdentifiers = {
        ids: [1010, 29, 4004, 28], // 1010 (Fitbit), 29 (Google Fit), 4004 (Samsung), 28 (HC)
        keywords: ['futbol', 'fútbol', 'soccer', 'football', 'balonpié']
    };

    const matches = activities.filter(act => {
        const name = (act.name || '').toLowerCase();
        const sportKey = (act.sportKey || '').toLowerCase();
        const id = Number(act.originalId || act.activityTypeId);

        const matchesName = soccerIdentifiers.keywords.some(kw => name.includes(kw));
        const matchesKey = soccerIdentifiers.keywords.some(kw => sportKey.includes(kw));
        const matchesId = soccerIdentifiers.ids.includes(id);

        return matchesName || matchesKey || matchesId;
    });

    if (matches.length > 0) {
        console.log(`✅ ¡ÉXITO! Se encontraron ${matches.length} sesiones de Fútbol:`);
        matches.forEach((act, i) => {
            console.log(`   ${i + 1}. [${act.provider.toUpperCase()}] ${act.name} (${act.sportKey})`);
            console.log(`      📅 Fecha: ${new Date(act.startTime).toLocaleString()}`);
            console.log(`      ⏱️ Duración: ${act.duration} min`);
            console.log(`      🆔 ID Original: ${act.originalId}`);
        });
    } else {
        console.log('❌ No se detectaron sesiones de Fútbol en el historial reciente.');

        // 3. Analizar qué hay para dar pistas
        const summary = {};
        activities.forEach(a => {
            const key = a.sportKey || 'unknown';
            summary[key] = (summary[key] || 0) + 1;
        });

        console.log('📊 Deportes encontrados en memoria:', summary);

        // Buscar si hay algún "Walking" que pudiera ser fútbol (por el bug anterior)
        const suspiciousWalking = activities.filter(a => a.sportKey === 'walking' && a.originalId == 90013);
        if (suspiciousWalking.length > 0) {
            console.log(`🕵️‍♂️ Encontradas ${suspiciousWalking.length} caminatas con ID 90013. Si alguna fue fútbol, ahora debería detectarse correctamente tras resincronizar.`);
        }
    }

    console.groupEnd();
}

// Ejecutar automáticamente al cargar el script
findSoccerActivities();
