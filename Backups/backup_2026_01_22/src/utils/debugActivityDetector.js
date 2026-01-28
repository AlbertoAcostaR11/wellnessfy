/**
 * 🔍 DEBUG SCRIPT: Activity Detector
 * Objetivo: Identificar exactamente qué actividades detecta Google Health hoy
 * Fecha: 15 de Enero, 2026
 */

export async function debugTodayActivities(accessToken) {
    console.log('🔍 ========================================');
    console.log('🔍 INICIANDO DEBUG DE ACTIVIDADES DE HOY');
    console.log('🔍 ========================================');

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = now.getTime();

    console.log('📅 Rango de tiempo:', {
        inicio: new Date(startOfDay).toLocaleString(),
        fin: new Date(endOfDay).toLocaleString()
    });

    try {
        // ========================================
        // MÉTODO 1: Activity Segments (Aggregate API)
        // ========================================
        console.log('\n📊 MÉTODO 1: Activity Segments via Aggregate API');
        console.log('─────────────────────────────────────────────────');

        const aggregateResponse = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "aggregateBy": [
                    { "dataTypeName": "com.google.activity.segment" }
                ],
                "bucketByTime": { "durationMillis": 86400000 },
                "startTimeMillis": startOfDay,
                "endTimeMillis": endOfDay
            })
        });

        const aggregateData = await aggregateResponse.json();

        if (aggregateData.bucket && aggregateData.bucket.length > 0) {
            const bucket = aggregateData.bucket[0];
            const dataset = bucket.dataset[0];

            console.log(`✅ Encontrados ${dataset.point?.length || 0} activity segments`);

            if (dataset.point && dataset.point.length > 0) {
                console.log('\n📋 DESGLOSE DE ACTIVITY SEGMENTS:');
                dataset.point.forEach((point, index) => {
                    const activityType = point.value[0].intVal;
                    const duration = point.value[1].intVal || 0;
                    const startTime = new Date(parseInt(point.startTimeNanos) / 1000000);
                    const endTime = new Date(parseInt(point.endTimeNanos) / 1000000);

                    console.log(`\n  Segment #${index + 1}:`);
                    console.log(`    🏷️  Activity Type ID: ${activityType}`);
                    console.log(`    ⏱️  Duración: ${(duration / 60).toFixed(1)} minutos`);
                    console.log(`    🕐 Inicio: ${startTime.toLocaleTimeString()}`);
                    console.log(`    🕑 Fin: ${endTime.toLocaleTimeString()}`);
                    console.log(`    📦 Raw Point:`, point);
                });
            } else {
                console.log('⚠️  No se encontraron activity segments en el bucket');
            }
        } else {
            console.log('⚠️  No se encontraron buckets en la respuesta');
        }

        // ========================================
        // MÉTODO 2: Sessions API
        // ========================================
        console.log('\n\n📊 MÉTODO 2: Sessions API');
        console.log('─────────────────────────────────────────────────');

        const sessionsResponse = await fetch(
            `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startOfDay).toISOString()}&endTime=${new Date(endOfDay).toISOString()}`,
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        const sessionsData = await sessionsResponse.json();

        if (sessionsData.session && sessionsData.session.length > 0) {
            console.log(`✅ Encontradas ${sessionsData.session.length} sesiones`);

            console.log('\n📋 DESGLOSE DE SESIONES:');
            sessionsData.session.forEach((session, index) => {
                const duration = (session.endTimeMillis - session.startTimeMillis) / 60000;

                console.log(`\n  Sesión #${index + 1}:`);
                console.log(`    🏷️  Activity Type: ${session.activityType}`);
                console.log(`    📝 Nombre: ${session.name || 'Sin nombre'}`);
                console.log(`    ⏱️  Duración: ${duration.toFixed(1)} minutos`);
                console.log(`    🕐 Inicio: ${new Date(session.startTimeMillis).toLocaleTimeString()}`);
                console.log(`    🕑 Fin: ${new Date(session.endTimeMillis).toLocaleTimeString()}`);
                console.log(`    📦 Raw Session:`, session);
            });
        } else {
            console.log('⚠️  No se encontraron sesiones');
        }

        // ========================================
        // MÉTODO 3: Data Sources (Raw)
        // ========================================
        console.log('\n\n📊 MÉTODO 3: Data Sources Disponibles');
        console.log('─────────────────────────────────────────────────');

        const dataSourcesResponse = await fetch(
            'https://www.googleapis.com/fitness/v1/users/me/dataSources',
            {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        const dataSourcesData = await dataSourcesResponse.json();

        if (dataSourcesData.dataSource) {
            const activitySources = dataSourcesData.dataSource.filter(ds =>
                ds.dataType.name.includes('activity') ||
                ds.dataType.name.includes('segment')
            );

            console.log(`✅ Encontradas ${activitySources.length} fuentes de datos de actividad`);

            activitySources.forEach((source, index) => {
                console.log(`\n  Fuente #${index + 1}:`);
                console.log(`    📝 Nombre: ${source.dataType.name}`);
                console.log(`    🏢 Aplicación: ${source.application?.name || 'Sistema'}`);
                console.log(`    🆔 Stream ID: ${source.dataStreamId}`);
            });
        }

        // ========================================
        // RESUMEN Y ANÁLISIS
        // ========================================
        console.log('\n\n📊 RESUMEN Y ANÁLISIS');
        console.log('═════════════════════════════════════════════════');

        // Contar activity types únicos
        const activityTypes = new Set();
        if (aggregateData.bucket?.[0]?.dataset?.[0]?.point) {
            aggregateData.bucket[0].dataset[0].point.forEach(point => {
                activityTypes.add(point.value[0].intVal);
            });
        }

        console.log(`\n✅ Activity Types únicos detectados hoy: ${activityTypes.size}`);
        console.log(`   IDs: [${Array.from(activityTypes).join(', ')}]`);

        // Mapeo de IDs conocidos
        const knownTypes = {
            1: '😴 Awake (Sleep)',
            2: '😴 Sleep',
            3: '😴 Out of bed',
            4: '😴 Light sleep',
            5: '😴 Deep sleep',
            6: '😴 REM sleep',
            7: '🚶 Walking',
            8: '🏃 Running',
            9: '🚴 Cycling',
            45: '🧘 Meditation',
            72: '😴 Sleep session',
            96: '🏋️ Strength training',
            97: '🏋️ Weight lifting',
            100: '🧘 Yoga',
            106: '🌬️ Breathing',
            108: '❓ Other',
            115: '🌬️ Breathing exercise'
        };

        console.log('\n📋 Interpretación de IDs:');
        activityTypes.forEach(id => {
            const name = knownTypes[id] || `❓ Desconocido (ID ${id})`;
            console.log(`   ${id} → ${name}`);
        });

        // Advertencias
        console.log('\n⚠️  ADVERTENCIAS:');
        const sleepTypes = [1, 2, 3, 4, 5, 6];
        const hasSleepSegments = Array.from(activityTypes).some(id => sleepTypes.includes(id));

        if (hasSleepSegments) {
            console.log('   ⚠️  Se detectaron SLEEP SEGMENTS mezclados con actividades');
            console.log('   ⚠️  Estos deben ser filtrados para evitar confusión');
        }

        console.log('\n🔍 ========================================');
        console.log('🔍 DEBUG COMPLETADO');
        console.log('🔍 ========================================\n');

        return {
            aggregateData,
            sessionsData,
            activityTypes: Array.from(activityTypes),
            hasSleepSegments
        };

    } catch (error) {
        console.error('❌ Error en debug:', error);
        return null;
    }
}

// Función auxiliar para ejecutar desde consola
window.debugTodayActivities = async () => {
    const token = localStorage.getItem('google_health_token');
    if (!token) {
        console.error('❌ No hay token de Google Health. Sincroniza primero.');
        return;
    }
    return await debugTodayActivities(token);
};

console.log('✅ Debug script cargado. Ejecuta: debugTodayActivities()');
