
import { db } from '../config/firebaseInit.js';
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * DAILY SUMMARY MANAGER
 * Encargado de crear, guardar y recuperar las "Fichas Resumen" diarias.
 * Estrategia: 1 Documento por Día = Alta Eficiencia y Bajo Coste.
 */

/**
 * Crea o actualiza el resumen de un día específico basado en datos crudos.
 * @param {string} userId - ID del usuario
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @param {Object} metrics - Datos del día { steps, calories, distance, activeMinutes }
 * @param {Array} activities - Lista de actividades del día (solo info esencial)
 * @param {Object} sleep - Datos de sueño { duration, efficiency, startTime, endTime }
 */
export async function saveDailySummary(userId, dateStr, metrics, activities, sleep) {
    if (!userId || !dateStr) {
        console.error('❌ saveDailySummary faltan argumentos obligatorios');
        return;
    }

    // Usamos 'dailySummaries' (camelCase) para coincidir con tus reglas de Firestore existentes
    const summaryRef = doc(db, 'users', userId, 'dailySummaries', dateStr);

    // Estructura optimizada para lectura rápida en UI
    const summaryData = {
        date: dateStr,
        updatedAt: Timestamp.now(),

        // Métricas Totales (Para tarjetas de resumen)
        totals: {
            steps: metrics.steps || 0,
            calories: metrics.calories || 0,
            distance: metrics.distance || 0, // km
            activeMinutes: metrics.activeMinutes || 0
        },

        // Array ligero de actividades (Para lista visual simple)
        // Guardamos solo lo necesario para mostrar el icono y resumen
        activities: (activities || []).map(act => ({
            id: act.id,
            sportKey: act.sportKey || 'unknown', // Usamos sportKey consistentemente
            type: act.sportKey || 'unknown', // Fallback
            name: act.name,
            duration: act.duration, // minutos
            calories: act.calories,
            startTime: act.startTime
        })),

        // Sueño (Para gráfica de sueño)
        sleep: {
            duration: sleep?.duration || 0, // horas
            score: sleep?.efficiency || 0,
            hasData: !!sleep
        }
    };

    try {
        // Usamos setDoc con { merge: true } para no sobrescribir datos si ya existían campos parciales
        await setDoc(summaryRef, summaryData, { merge: true });
        console.log(`💾 Ficha Resumen guardada: ${dateStr}`);
    } catch (error) {
        console.error(`❌ Error guardando Ficha Resumen ${dateStr}:`, error);
    }
}

/**
 * Recupera los resúmenes para un rango de fechas.
 * @param {string} userId
 * @param {string} startDateStr - YYYY-MM-DD Inicio
 * @param {string} endDateStr - YYYY-MM-DD Fin
 * @returns {Promise<Array>} Lista de objetos resumen
 */
export async function getSummariesRange(userId, startDateStr, endDateStr) {
    if (!userId) return [];

    const summariesRef = collection(db, 'users', userId, 'dailySummaries');
    const q = query(
        summariesRef,
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr)
    );

    try {
        const querySnapshot = await getDocs(q);
        const summaries = [];
        querySnapshot.forEach((doc) => {
            summaries.push(doc.data());
        });

        console.log(`📥 Recuperadas ${summaries.length} fichas resumen entre ${startDateStr} y ${endDateStr}`);
        return summaries;
    } catch (error) {
        // Si falla por permisos o red, retornamos array vacío para no romper la app
        console.warn('⚠️ No se pudieron cargar resúmenes (puede ser primera vez):', error.message);
        return [];
    }
}
