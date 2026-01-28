/**
 * 🔍 DIAGNÓSTICO: IDENTIFICAR SPORTKEY DE "UNKNOWN"
 * 
 * Ejecuta este script en la consola del navegador (F12) para identificar
 * exactamente qué sportKey tiene la actividad "unknown"
 */

console.log('🔍 DIAGNÓSTICO: Identificando sportKey de "unknown"\n');
console.log('═'.repeat(60));

// ========================================
// 1. OBTENER ACTIVIDADES CRUDAS
// ========================================
const activities = window.AppState?.activities || [];
console.log(`\n📊 Total actividades: ${activities.length}`);

if (activities.length === 0) {
    console.error('❌ NO HAY ACTIVIDADES. Sincroniza primero.');
} else {
    // ========================================
    // 2. ANALIZAR CADA ACTIVIDAD
    // ========================================
    console.log('\n📋 ANÁLISIS DETALLADO DE ACTIVIDADES:\n');

    const activityAnalysis = activities.map((act, idx) => {
        return {
            index: idx,
            sportKey: act.sportKey,
            name: act.name,
            originalId: act.originalId,
            provider: act.provider,
            duration: act.duration,
            distance: act.distance,
            startTime: act.startTime
        };
    });

    console.table(activityAnalysis);

    // ========================================
    // 3. IDENTIFICAR "UNKNOWN"
    // ========================================
    console.log('\n🔎 BUSCANDO ACTIVIDADES CON SPORTKEY "unknown"...\n');

    const unknownActivities = activities.filter(act =>
        (act.sportKey || '').toLowerCase() === 'unknown'
    );

    if (unknownActivities.length === 0) {
        console.log('✓ No hay actividades con sportKey "unknown"');

        // Buscar otras variantes
        const possibleUnknowns = activities.filter(act => {
            const key = (act.sportKey || '').toLowerCase();
            return key === '' || key === 'unknown' || key === 'other' || !act.sportKey;
        });

        if (possibleUnknowns.length > 0) {
            console.log(`⚠️ Encontradas ${possibleUnknowns.length} actividades sin sportKey válido:`);
            console.table(possibleUnknowns.map(act => ({
                sportKey: act.sportKey || '(vacío)',
                name: act.name,
                originalId: act.originalId,
                provider: act.provider,
                duration: act.duration
            })));
        }
    } else {
        console.log(`⚠️ Encontradas ${unknownActivities.length} actividades "unknown":`);
        console.table(unknownActivities.map(act => ({
            sportKey: act.sportKey,
            name: act.name,
            originalId: act.originalId,
            activityId: act.rawSource?.activityId,
            activityTypeId: act.rawSource?.activityTypeId,
            provider: act.provider,
            duration: act.duration,
            rawData: act.rawSource
        })));

        // ========================================
        // 4. VERIFICAR MAPEO EN REVERSE_ID_MAP
        // ========================================
        console.log('\n🗺️ VERIFICANDO MAPEO DE IDs...\n');

        unknownActivities.forEach((act, idx) => {
            const provider = act.provider || 'fitbit';
            const rawId = act.originalId || act.rawSource?.activityId || act.rawSource?.activityTypeId;
            const mapKey = `${provider}_${rawId}`;

            console.log(`\n   Actividad ${idx + 1}:`);
            console.log(`   - Provider: ${provider}`);
            console.log(`   - Original ID: ${rawId}`);
            console.log(`   - Map Key esperado: "${mapKey}"`);
            console.log(`   - Name from API: ${act.name}`);

            // Verificar si existe en SportSpecsDB (si está disponible)
            if (window.REVERSE_ID_MAP) {
                const mapped = window.REVERSE_ID_MAP[mapKey];
                console.log(`   - Mapeado a: ${mapped || '❌ NO ENCONTRADO'}`);
            }
        });
    }

    // ========================================
    // 5. VERIFICAR FUNCIÓN getSportMetadata
    // ========================================
    console.log('\n🎨 VERIFICANDO FUNCIÓN getSportMetadata...\n');

    // Simular getSportMetadata
    const META = {
        'yoga': { name: 'Yoga', icon: 'self_improvement', color: '#a29bfe', unit: 'min' },
        'meditation': { name: 'Meditación', icon: 'psychiatry', color: '#b19cd9', unit: 'min' },
        'running': { name: 'Correr', icon: 'directions_run', color: '#ff6b6b', unit: 'km' },
        'walking': { name: 'Caminata', icon: 'directions_walk', color: '#00ff9d', unit: 'km' },
        'cycling': { name: 'Ciclismo', icon: 'directions_bike', color: '#4ecdc4', unit: 'km' },
        'gym': { name: 'Gimnasio', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'weights': { name: 'Pesas', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'weightlifting': { name: 'Halterofilia', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'strength_training': { name: 'Entrenamiento de Fuerza', icon: 'fitness_center', color: '#ff9f43', unit: 'min' },
        'swimming': { name: 'Natación', icon: 'pool', color: '#00d2ff', unit: 'km' },
        'tennis': { name: 'Tenis', icon: 'sports_tennis', color: '#ffeaa7', unit: 'min' },
        'soccer': { name: 'Fútbol', icon: 'sports_soccer', color: '#00b894', unit: 'min' },
        'basketball': { name: 'Baloncesto', icon: 'sports_basketball', color: '#ff7675', unit: 'min' },
        'hiking': { name: 'Senderismo', icon: 'hiking', color: '#26de81', unit: 'km' },
        'default': { name: 'Actividad', icon: 'sports_score', color: '#95a5a6', unit: 'min' }
    };

    const testKeys = ['unknown', 'weightlifting', 'strength_training', 'walking', 'running'];

    console.log('   Probando diferentes sportKeys:');
    testKeys.forEach(key => {
        const keyLower = (key || '').toLowerCase();
        const match = META[keyLower] ||
            Object.keys(META).find(k => keyLower.includes(k)) && META[Object.keys(META).find(k => keyLower.includes(k))] ||
            { ...META.default, name: key || 'Actividad' };

        console.log(`   - "${key}" → "${match.name}"`);
    });

    // ========================================
    // 6. SIMULAR aggregateSportsData
    // ========================================
    console.log('\n⚙️ SIMULANDO aggregateSportsData...\n');

    const sportsGrouped = {};
    activities.forEach(act => {
        const key = (act.sportKey || act.name || 'unknown').toLowerCase();
        const keyLower = key;
        const match = META[keyLower] ||
            Object.keys(META).find(k => keyLower.includes(k)) && META[Object.keys(META).find(k => keyLower.includes(k))] ||
            { ...META.default, name: act.sportKey || act.name || 'Actividad' };

        const sportName = match.name;

        if (!sportsGrouped[sportName]) {
            sportsGrouped[sportName] = {
                sportKey: act.sportKey,
                count: 0,
                totalDuration: 0
            };
        }

        sportsGrouped[sportName].count++;
        sportsGrouped[sportName].totalDuration += (act.duration || 0);
    });

    console.log('   Deportes agrupados:');
    console.table(sportsGrouped);
}

// ========================================
// 7. RESUMEN
// ========================================
console.log('\n\n📋 RESUMEN:');
console.log('═'.repeat(60));
console.log('Copia la tabla "ANÁLISIS DETALLADO DE ACTIVIDADES" de arriba');
console.log('y comparte los valores de sportKey y originalId.');
console.log('═'.repeat(60));
