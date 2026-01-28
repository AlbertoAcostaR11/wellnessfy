// Análisis completo de datos disponibles en Google Health Connect / Google Fit
async function analyzeGoogleHealthData() {
    const token = localStorage.getItem('google_health_token');
    if (!token) {
        console.error('❌ No hay token disponible');
        return;
    }

    console.log('🔍 ANÁLISIS COMPLETO DE GOOGLE HEALTH CONNECT / GOOGLE FIT');
    console.log('='.repeat(80));

    // 1. Obtener todas las fuentes de datos disponibles
    console.log('\n📊 PASO 1: FUENTES DE DATOS DISPONIBLES');
    console.log('-'.repeat(80));

    try {
        const sourcesResp = await fetch(
            'https://www.googleapis.com/fitness/v1/users/me/dataSources',
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const sourcesData = await sourcesResp.json();

        if (sourcesData.dataSource) {
            console.log(`✅ Encontradas ${sourcesData.dataSource.length} fuentes de datos:\n`);

            const categorized = {
                'Actividad': [],
                'Sueño': [],
                'Frecuencia Cardíaca': [],
                'Nutrición': [],
                'Cuerpo': [],
                'Ubicación': [],
                'Otros': []
            };

            sourcesData.dataSource.forEach(ds => {
                const info = {
                    id: ds.dataStreamId,
                    type: ds.dataType.name,
                    app: ds.application?.name || ds.device?.model || 'Sistema',
                    fields: ds.dataType.field.map(f => f.name).join(', ')
                };

                // Categorizar
                if (ds.dataType.name.includes('step') || ds.dataType.name.includes('activity') ||
                    ds.dataType.name.includes('calories') || ds.dataType.name.includes('distance')) {
                    categorized['Actividad'].push(info);
                } else if (ds.dataType.name.includes('sleep')) {
                    categorized['Sueño'].push(info);
                } else if (ds.dataType.name.includes('heart')) {
                    categorized['Frecuencia Cardíaca'].push(info);
                } else if (ds.dataType.name.includes('nutrition') || ds.dataType.name.includes('hydration')) {
                    categorized['Nutrición'].push(info);
                } else if (ds.dataType.name.includes('weight') || ds.dataType.name.includes('height') ||
                    ds.dataType.name.includes('body')) {
                    categorized['Cuerpo'].push(info);
                } else if (ds.dataType.name.includes('location')) {
                    categorized['Ubicación'].push(info);
                } else {
                    categorized['Otros'].push(info);
                }
            });

            // Mostrar por categoría
            Object.entries(categorized).forEach(([category, sources]) => {
                if (sources.length > 0) {
                    console.group(`📁 ${category} (${sources.length})`);
                    sources.forEach(s => {
                        console.log(`   • ${s.type}`);
                        console.log(`     App: ${s.app}`);
                        console.log(`     Campos: ${s.fields}`);
                        console.log(`     ID: ${s.id}\n`);
                    });
                    console.groupEnd();
                }
            });
        }
    } catch (e) {
        console.error('Error obteniendo fuentes:', e);
    }

    // 2. Tipos de datos agregables
    console.log('\n📊 PASO 2: TIPOS DE DATOS AGREGABLES');
    console.log('-'.repeat(80));

    const commonDataTypes = [
        // Actividad
        'com.google.step_count.delta',
        'com.google.calories.expended',
        'com.google.distance.delta',
        'com.google.active_minutes',
        'com.google.activity.segment',
        'com.google.speed',
        'com.google.power.sample',

        // Sueño
        'com.google.sleep.segment',

        // Corazón
        'com.google.heart_rate.bpm',
        'com.google.heart_rate.variability.rmssd',
        'com.google.heart_minutes',

        // Cuerpo
        'com.google.weight',
        'com.google.height',
        'com.google.body.fat.percentage',
        'com.google.body.temperature',
        'com.google.oxygen_saturation',
        'com.google.blood_pressure',
        'com.google.blood_glucose',

        // Nutrición
        'com.google.nutrition',
        'com.google.hydration',

        // Ciclo menstrual
        'com.google.menstruation',
        'com.google.ovulation_test',
        'com.google.cervical_mucus',

        // Otros
        'com.google.cycling.pedaling.cadence',
        'com.google.cycling.pedaling.cumulative',
        'com.google.location.sample',
        'com.google.location.bounding_box'
    ];

    console.log('Tipos de datos estándar de Google Fit:\n');
    commonDataTypes.forEach(type => console.log(`   • ${type}`));

    // 3. Sesiones disponibles
    console.log('\n📊 PASO 3: TIPOS DE SESIONES DISPONIBLES');
    console.log('-'.repeat(80));

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    try {
        const sessionsResp = await fetch(
            `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(thirtyDaysAgo).toISOString()}&endTime=${new Date(now).toISOString()}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const sessionsData = await sessionsResp.json();

        if (sessionsData.session) {
            const sessionTypes = {};
            sessionsData.session.forEach(s => {
                const type = s.activityType;
                if (!sessionTypes[type]) {
                    sessionTypes[type] = { count: 0, name: s.name || 'Sin nombre' };
                }
                sessionTypes[type].count++;
            });

            console.log(`✅ Encontradas ${sessionsData.session.length} sesiones en los últimos 30 días:\n`);
            Object.entries(sessionTypes).forEach(([type, info]) => {
                console.log(`   • Tipo ${type}: ${info.name} (${info.count} sesiones)`);
            });

            console.log('\n📝 Tipos de actividad comunes:');
            console.log('   • 72 = Dormir');
            console.log('   • 9 = Correr');
            console.log('   • 7 = Caminar');
            console.log('   • 1 = Ciclismo');
            console.log('   • 100 = Yoga');
            console.log('   • 45 = Meditación');
            console.log('   • 106 = Ejercicios de respiración');
        }
    } catch (e) {
        console.error('Error obteniendo sesiones:', e);
    }

    // 4. Ejemplo de datos recientes
    console.log('\n📊 PASO 4: MUESTRA DE DATOS RECIENTES (ÚLTIMAS 24H)');
    console.log('-'.repeat(80));

    const yesterday = now - (24 * 60 * 60 * 1000);
    const sampleTypes = [
        'com.google.step_count.delta',
        'com.google.heart_rate.bpm',
        'com.google.calories.expended'
    ];

    for (const dataType of sampleTypes) {
        try {
            const body = {
                "aggregateBy": [{ "dataTypeName": dataType }],
                "bucketByTime": { "durationMillis": 3600000 }, // 1 hora
                "startTimeMillis": yesterday,
                "endTimeMillis": now
            };

            const resp = await fetch(
                'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                }
            );
            const data = await resp.json();

            if (data.bucket && data.bucket.length > 0) {
                const pointsCount = data.bucket.reduce((sum, b) =>
                    sum + (b.dataset[0]?.point?.length || 0), 0);
                console.log(`✅ ${dataType}: ${pointsCount} puntos de datos`);
            } else {
                console.log(`⚠️ ${dataType}: Sin datos`);
            }
        } catch (e) {
            console.log(`❌ ${dataType}: Error`);
        }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ ANÁLISIS COMPLETO');
    console.log('='.repeat(80));
}

// Exponer globalmente
window.analyzeGoogleHealthData = analyzeGoogleHealthData;
console.log('✅ Script de análisis cargado. Ejecuta: analyzeGoogleHealthData()');
