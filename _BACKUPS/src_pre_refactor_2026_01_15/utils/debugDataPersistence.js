/**
 * Diagnóstico de Persistencia de Datos
 * Verifica si los datos se están guardando y cargando correctamente
 */

export function debugDataPersistence() {
    console.group('🔍 DIAGNÓSTICO DE PERSISTENCIA');

    // 1. Verificar AppState actual
    console.group('📦 Estado Actual de AppState');
    console.log('AppState.todayStats:', window.AppState?.todayStats);
    console.log('AppState.activities:', window.AppState?.activities?.length || 0, 'actividades');
    console.log('AppState.currentUser:', window.AppState?.currentUser?.email);
    console.groupEnd();

    // 2. Verificar localStorage
    console.group('💾 Datos en localStorage');
    const userDataRaw = localStorage.getItem('wellnessfy_user_data');
    if (userDataRaw) {
        try {
            const userData = JSON.parse(userDataRaw);
            console.log('✅ wellnessfy_user_data encontrado');
            console.log('  - todayStats:', userData.todayStats);
            console.log('  - activities:', userData.activities?.length || 0);
            console.log('  - stats (legacy):', userData.stats);
        } catch (e) {
            console.error('❌ Error parseando wellnessfy_user_data:', e);
        }
    } else {
        console.warn('⚠️ No hay wellnessfy_user_data en localStorage');
    }

    const lastSync = localStorage.getItem('last_health_sync');
    if (lastSync) {
        const syncDate = new Date(parseInt(lastSync));
        console.log('⏰ Última sincronización:', syncDate.toLocaleString());
    }
    console.groupEnd();

    // 3. Simular guardado
    console.group('🧪 Test de Guardado');
    const testData = {
        steps: 9999,
        calories: 8888,
        sleep: { duration: 400 },
        heartRate: { resting: 70 }
    };

    console.log('Guardando datos de prueba:', testData);
    window.AppState.todayStats = testData;

    if (typeof window.saveUserData === 'function') {
        window.saveUserData();
        console.log('✅ saveUserData() ejecutado');

        // Verificar si se guardó
        const savedRaw = localStorage.getItem('wellnessfy_user_data');
        if (savedRaw) {
            const saved = JSON.parse(savedRaw);
            console.log('Datos guardados en localStorage:', saved.todayStats);

            if (JSON.stringify(saved.todayStats) === JSON.stringify(testData)) {
                console.log('✅ Los datos se guardaron correctamente');
            } else {
                console.error('❌ Los datos NO coinciden');
            }
        }
    } else {
        console.error('❌ saveUserData() no está disponible');
    }
    console.groupEnd();

    // 4. Verificar función de carga
    console.group('📥 Test de Carga');
    if (typeof window.loadUserData === 'function') {
        console.log('✅ loadUserData() está disponible');
        console.log('💡 Ejecuta: loadUserData() para recargar desde localStorage');
    } else {
        console.error('❌ loadUserData() no está disponible');
    }
    console.groupEnd();

    console.log('');
    console.log('📋 RESUMEN:');
    console.log('1. ¿AppState.todayStats tiene datos?', !!window.AppState?.todayStats);
    console.log('2. ¿localStorage tiene datos?', !!localStorage.getItem('wellnessfy_user_data'));
    console.log('3. ¿saveUserData funciona?', typeof window.saveUserData === 'function');
    console.log('4. ¿loadUserData funciona?', typeof window.loadUserData === 'function');

    console.groupEnd();
}

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.debugDataPersistence = debugDataPersistence;
}
