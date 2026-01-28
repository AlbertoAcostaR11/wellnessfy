/**
 * Script de Diagnóstico Detallado para Fitbit
 * Muestra exactamente qué datos se están obteniendo de la API
 */

import { healthProviderManager } from './healthSync_v2.js';

export async function debugFitbitData() {
    console.group('🔍 DIAGNÓSTICO DETALLADO DE FITBIT');

    const provider = healthProviderManager.providers['fitbit'];

    if (!provider) {
        console.error('❌ Proveedor Fitbit no encontrado');
        console.groupEnd();
        return;
    }

    console.log('✅ Proveedor Fitbit cargado');
    console.log('📋 Token presente:', provider.token ? 'Sí (primeros 10 chars: ' + provider.token.substring(0, 10) + '...)' : 'No');
    console.log('🔐 Autenticado:', provider.isAuthenticated);

    if (!provider.hasValidToken()) {
        console.error('❌ No hay token válido');
        console.groupEnd();
        return;
    }

    const today = new Date();
    const dateStr = provider.formatDate(today);

    console.log('📅 Fecha de hoy:', dateStr);
    console.log('');

    // Test 1: Actividades
    console.group('🏃 TEST 1: Actividades del día');
    try {
        const activities = await provider.getActivitiesForDate(dateStr);
        console.log('✅ Respuesta recibida');
        console.log('📊 Número de actividades:', activities.length);

        if (activities.length > 0) {
            console.log('📝 Actividades encontradas:');
            activities.forEach((act, i) => {
                console.log(`  ${i + 1}. ${act.name || act.activityName}`, {
                    id: act.activityId,
                    typeId: act.activityTypeId,
                    duration: act.duration,
                    calories: act.calories,
                    distance: act.distance
                });
            });
        } else {
            console.warn('⚠️ No hay actividades para hoy');
        }

        console.log('🔍 Datos RAW completos:', activities);
    } catch (error) {
        console.error('❌ Error obteniendo actividades:', error.message);
        console.error('Stack:', error.stack);
    }
    console.groupEnd();

    // Test 2: Pasos
    console.group('👣 TEST 2: Pasos del día');
    try {
        const steps = await provider.getSteps(today);
        console.log('✅ Respuesta recibida');
        console.log('📊 Pasos:', steps);

        if (steps === 0) {
            console.warn('⚠️ Pasos = 0 (puede ser que no haya datos o que la API devuelva 0)');
        }
    } catch (error) {
        console.error('❌ Error obteniendo pasos:', error.message);
        console.error('Stack:', error.stack);
    }
    console.groupEnd();

    // Test 3: Calorías
    console.group('🔥 TEST 3: Calorías del día');
    try {
        const calories = await provider.getCalories(today);
        console.log('✅ Respuesta recibida');
        console.log('📊 Calorías:', calories);

        if (calories === 0) {
            console.warn('⚠️ Calorías = 0');
        }
    } catch (error) {
        console.error('❌ Error obteniendo calorías:', error.message);
        console.error('Stack:', error.stack);
    }
    console.groupEnd();

    // Test 4: Sueño
    console.group('😴 TEST 4: Sueño');
    try {
        const sleep = await provider.getSleep(today);
        console.log('✅ Respuesta recibida');
        console.log('📊 Datos de sueño:', sleep);
    } catch (error) {
        console.error('❌ Error obteniendo sueño:', error.message);
        console.error('Stack:', error.stack);
    }
    console.groupEnd();

    // Test 5: Frecuencia cardíaca
    console.group('❤️ TEST 5: Frecuencia Cardíaca');
    try {
        const heartRate = await provider.getHeartRate(today);
        console.log('✅ Respuesta recibida');
        console.log('📊 Frecuencia cardíaca:', heartRate);
    } catch (error) {
        console.error('❌ Error obteniendo frecuencia cardíaca:', error.message);
        console.error('Stack:', error.stack);
    }
    console.groupEnd();

    // Test 6: Rango de actividades (últimos 7 días)
    console.group('📅 TEST 6: Actividades últimos 7 días');
    try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        console.log('Rango:', provider.formatDate(startDate), 'a', provider.formatDate(endDate));

        const activities = await provider.getActivities(startDate, endDate);
        console.log('✅ Respuesta recibida');
        console.log('📊 Total de actividades en 7 días:', activities.length);

        if (activities.length > 0) {
            console.log('📝 Resumen por día:');
            const byDay = {};
            activities.forEach(act => {
                const day = act.startTime ? new Date(act.startTime).toLocaleDateString() : 'Sin fecha';
                byDay[day] = (byDay[day] || 0) + 1;
            });
            console.table(byDay);

            console.log('🔍 Primeras 3 actividades (sample):', activities.slice(0, 3));
        } else {
            console.warn('⚠️ No hay actividades en los últimos 7 días');
        }
    } catch (error) {
        console.error('❌ Error obteniendo actividades de rango:', error.message);
        console.error('Stack:', error.stack);
    }
    console.groupEnd();

    console.log('');
    console.log('✅ Diagnóstico completo');
    console.log('💡 TIP: Si ves datos aquí pero no en la UI, el problema está en la capa de presentación, no en la API');
    console.groupEnd();
}

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.debugFitbitData = debugFitbitData;
}
