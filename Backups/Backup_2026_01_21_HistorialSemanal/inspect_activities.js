
/**
 * 🕵️ Inspector de Datos de Salud (V2)
 * Muestra el contenido de "wellnessfy_user_data"
 */

function inspectHealthData() {
    console.group('📦 INSPECCIÓN DE ACTIVIDADES');

    const saved = localStorage.getItem('wellnessfy_user_data');
    if (!saved) {
        console.warn('❌ No hay datos en "wellnessfy_user_data".');
        console.groupEnd();
        return;
    }

    try {
        const data = JSON.parse(saved);
        const activities = data.activities || [];

        console.log(`📊 Actividades guardadas: ${activities.length}`);

        if (activities.length > 0) {
            console.table(activities.map(a => ({
                Deporte: a.name,
                Key: a.sportKey,
                Fecha: new Date(a.startTime).toLocaleDateString(),
                Duracion: a.duration + ' min',
                Proveedor: a.provider,
                ID: a.originalId
            })));
        }

        if (data.todayStats) {
            console.log('📈 Métricas de hoy:', data.todayStats);
        }

    } catch (e) {
        console.error('❌ Error al parsear:', e);
    }

    console.groupEnd();
}

inspectHealthData();
