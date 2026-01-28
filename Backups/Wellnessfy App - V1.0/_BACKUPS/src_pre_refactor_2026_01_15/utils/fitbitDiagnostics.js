
import { healthProviderManager } from './healthProviders/HealthProviderManager.js';
import { getSportByPlatformId } from './sportsDictionaryMaster.js';

/**
 * Ejecuta un diagnóstico completo de la integración con Fitbit
 */
export async function runFitbitDiagnostics() {
    console.group('🔍 Diagnóstico de Integración Fitbit');

    const provider = healthProviderManager.providers['fitbit'];
    if (!provider) {
        console.error('❌ Proveedor Fitbit no encontrado en manager');
        console.groupEnd();
        return;
    }

    console.log('✅ Proveedor Fitbit inicializado');

    // Verificar Token
    const hasToken = provider.hasValidToken();
    console.log(`🔑 Token presente: ${hasToken ? 'SÍ' : 'NO'}`);

    if (!hasToken) {
        console.warn('⚠️ No tienes un token válido. Ve a Configuración, apaga y enciende el interruptor de Fitbit.');
        console.groupEnd();
        return;
    }

    try {
        // 1. Probar Perfil (Auth Check)
        console.log('📡 Verificando acceso a API (Profile)...');
        const profile = await provider.getUserProfile();
        console.log(`✅ Conexión API exitosa. Hola, ${profile.user.displayName}!`);

        // 2. Probar Diccionario con IDs comunes
        console.log('📘 Verificando Diccionario de Deportes (Muestra)...');
        const testIds = [
            { id: 90013, name: 'Walking' },
            { id: 90009, name: 'Running' },
            { id: 90001, name: 'Bike' },
            { id: 52001, name: 'Yoga' },
            { id: 90024, name: 'Swimming' }
        ];

        testIds.forEach(test => {
            const mapped = getSportByPlatformId('fitbit', test.id);
            if (mapped) {
                console.log(`   ✅ ID ${test.id} (${test.name}) -> Detectado como: ${mapped.key}`);
            } else {
                console.error(`   ❌ ID ${test.id} (${test.name}) -> NO ENCONTRADO en Diccionario`);
            }
        });

        // 3. Ver actividades reales de hoy
        console.log('🏃 Buscando actividades de hoy para verificar traducción real...');
        const today = new Date();
        const activities = await provider.getActivities(today, today);

        if (activities.length > 0) {
            console.log(`   Encontradas ${activities.length} actividades:`);
            activities.forEach(act => {
                const originalId = act.rawData?.activityTypeId;
                const dictionaryEntry = getSportByPlatformId('fitbit', originalId);
                const status = dictionaryEntry ? '✅ OK' : '❌ FALLO';
                console.log(`   - "${act.name}" (ID ${originalId}) -> Key: ${dictionaryEntry?.key || 'N/A'} [${status}]`);
            });
        } else {
            console.log('   ℹ️ No hay actividades hoy para analizar.');
        }

    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
        if (error.message.includes('401')) {
            console.error('   👉 Esto indica credenciales inválidas. Por favor haz logout/login en Configuración.');
        }
    }

    console.groupEnd();
    return 'Diagnóstico finalizado';
}

// Auto-exponer
if (typeof window !== 'undefined') {
    window.runFitbitDiagnostics = runFitbitDiagnostics;
}
