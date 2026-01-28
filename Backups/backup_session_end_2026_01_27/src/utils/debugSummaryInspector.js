
import { db, auth } from '../config/firebaseInit.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getLocalISOString } from './dateHelper.js';

// Exponer Debugger Globalmente
window.inspectDailySummary = inspectDailySummary;

/**
 * 🕵️‍♂️ Inspector de Resúmenes Diarios
 * Diagnostica qué está guardado exactamente en Firestore para una fecha dada.
 */
export async function inspectDailySummary(offsetDays = 1) {
    console.log('🕵️‍♂️ Iniciando inspección de Resumen Diario...');

    const user = auth.currentUser;
    if (!user) {
        console.error('❌ No hay usuario autenticado.');
        return;
    }

    // Calcular fecha objetivo (Ayer por defecto)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - offsetDays);
    const dateStr = getLocalISOString(targetDate);

    console.log(`📅 Inspeccionando fecha: ${dateStr} (Hace ${offsetDays} días)`);
    console.log(`👤 Usuario ID: ${user.uid}`);

    try {
        // CORRECCIÓN: Usar CamelCase 'dailySummaries'
        const docRef = doc(db, 'users', user.uid, 'dailySummaries', dateStr);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('✅ DOCUMENTO ENCONTRADO EN FIRESTORE:');
            console.log('--------------------------------------------------');
            console.log('🔢 Totales:', data.totals);
            console.log('😴 Sueño:', data.sleep);
            console.log('🏃 Actividades (Array):', data.activities);
            console.log('--------------------------------------------------');

            // Análisis de Actividades
            if (!data.activities || data.activities.length === 0) {
                console.warn('⚠️ ALERTA: El array de actividades está VACÍO. Por eso no ves círculos.');
            } else {
                console.log(`📊 Hay ${data.activities.length} actividades registradas.`);
                data.activities.forEach((act, idx) => {
                    console.log(`   [${idx + 1}] ${act.name} (${act.type}) - ${act.duration} min`);

                    // Simulación de lógica visual
                    if (act.duration >= 10 && !isMindfulness(act.type)) {
                        console.log('      ✅ Debería pintar círculo VERDE (Ejercicio > 10m)');
                    } else if (isMindfulness(act.type)) {
                        console.log('      🟣 Debería pintar círculo MORADO (Mindfulness)');
                    } else {
                        console.log('      ❌ No cumple requisitos visuales (muy corto o desconocido)');
                    }
                });
            }

        } else {
            console.error(`❌ NO EXISTE el documento para la fecha ${dateStr}. La sincronización falló o nunca se ejecutó para este día.`);
        }

    } catch (error) {
        console.error('❌ Error fatal leyendo Firestore:', error);
    }
}

function isMindfulness(type) {
    const t = (type || '').toLowerCase();
    return t.includes('tation') || t.includes('yoga') || t.includes('breath') || t.includes('mindful');
}
