/**
 * 💾 Activity Persistence Module
 * 
 * Maneja la persistencia de actividades en Firestore para que no se pierdan
 * al recargar la página o cuando expire el token de autenticación.
 */

import { AppState } from './state.js';

/**
 * Guarda actividades en Firestore
 * @param {Array} activities - Array de actividades a guardar
 * @returns {Promise<number>} - Número de actividades guardadas
 */
export async function saveActivitiesToFirestore(activities) {
    if (!activities || activities.length === 0) {
        console.log('📦 No activities to save');
        return 0;
    }

    const userId = AppState.currentUser?.uid || AppState.currentUser?.id;
    if (!userId) {
        console.warn('⚠️ No user ID found, cannot save activities');
        return 0;
    }

    try {
        const { getFirestore, collection, doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        let savedCount = 0;
        const batch = [];

        for (const activity of activities) {
            // Crear ID único basado en fecha + deporte + duración
            const activityId = `${userId}_${activity.startTime || activity.date}_${activity.sportKey}_${activity.duration}`.replace(/[^a-zA-Z0-9_]/g, '_');

            const activityData = {
                userId: userId,
                sportKey: activity.sportKey || 'unknown',
                name: activity.name || 'Actividad',
                duration: activity.duration || 0,
                distance: activity.distance || 0,
                calories: activity.calories || 0,
                steps: activity.steps || 0,
                startTime: activity.startTime || activity.date || new Date().toISOString(),
                endTime: activity.endTime || null,
                provider: activity.provider || 'manual',
                rawData: activity.rawData || null,
                createdAt: serverTimestamp(),
                syncedAt: Date.now()
            };

            // Guardar en Firestore
            const activityRef = doc(db, 'activities', activityId);
            batch.push(setDoc(activityRef, activityData, { merge: true }));
            savedCount++;
        }

        // Ejecutar todas las escrituras
        await Promise.all(batch);

        console.log(`✅ Saved ${savedCount} activities to Firestore`);
        return savedCount;

    } catch (error) {
        console.error('❌ Error saving activities to Firestore:', error);
        return 0;
    }
}

/**
 * Carga actividades desde Firestore
 * @param {Date} startDate - Fecha de inicio (opcional)
 * @param {Date} endDate - Fecha de fin (opcional)
 * @returns {Promise<Array>} - Array de actividades
 */
export async function loadActivitiesFromFirestore(startDate = null, endDate = null) {
    const userId = AppState.currentUser?.uid || AppState.currentUser?.id;
    if (!userId) {
        console.warn('⚠️ No user ID found, cannot load activities');
        return [];
    }

    try {
        const { getFirestore, collection, query, where, getDocs, orderBy } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        // Construir query
        let q = query(
            collection(db, 'activities'),
            where('userId', '==', userId),
            orderBy('startTime', 'desc')
        );

        const snapshot = await getDocs(q);
        const activities = [];

        snapshot.forEach((doc) => {
            const data = doc.data();

            // Filtrar por rango de fechas si se especifica
            if (startDate || endDate) {
                const activityDate = new Date(data.startTime);
                if (startDate && activityDate < startDate) return;
                if (endDate && activityDate > endDate) return;
            }

            activities.push({
                id: doc.id,
                ...data
            });
        });

        console.log(`📦 Loaded ${activities.length} activities from Firestore`);
        return activities;

    } catch (error) {
        console.error('❌ Error loading activities from Firestore:', error);
        return [];
    }
}

/**
 * Sincroniza actividades: carga desde Firestore y combina con nuevas
 * @param {Array} newActivities - Nuevas actividades desde el proveedor
 * @returns {Promise<Array>} - Array combinado de actividades
 */
export async function syncActivities(newActivities = []) {
    console.log('🔄 Syncing activities...');

    // 1. Cargar actividades existentes desde Firestore
    const existingActivities = await loadActivitiesFromFirestore();

    // 2. Combinar con nuevas actividades (evitar duplicados)
    const existingIds = new Set(existingActivities.map(a => a.id));
    const uniqueNewActivities = newActivities.filter(a => {
        const tempId = `${AppState.currentUser?.uid}_${a.startTime || a.date}_${a.sportKey}_${a.duration}`.replace(/[^a-zA-Z0-9_]/g, '_');
        return !existingIds.has(tempId);
    });

    // 3. Guardar nuevas actividades en Firestore
    if (uniqueNewActivities.length > 0) {
        await saveActivitiesToFirestore(uniqueNewActivities);
    }

    // 4. Combinar todas las actividades
    const allActivities = [...existingActivities, ...uniqueNewActivities];

    // 5. Ordenar por fecha (más reciente primero)
    allActivities.sort((a, b) => {
        const dateA = new Date(a.startTime || a.date);
        const dateB = new Date(b.startTime || b.date);
        return dateB - dateA;
    });

    console.log(`✅ Total activities after sync: ${allActivities.length} (${existingActivities.length} existing + ${uniqueNewActivities.length} new)`);

    return allActivities;
}

/**
 * Elimina actividades antiguas (más de 90 días)
 * @returns {Promise<number>} - Número de actividades eliminadas
 */
export async function cleanupOldActivities() {
    const userId = AppState.currentUser?.uid || AppState.currentUser?.id;
    if (!userId) return 0;

    try {
        const { getFirestore, collection, query, where, getDocs, deleteDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        const q = query(
            collection(db, 'activities'),
            where('userId', '==', userId),
            where('startTime', '<', cutoffDate.toISOString())
        );

        const snapshot = await getDocs(q);
        const deletePromises = [];

        snapshot.forEach((docSnap) => {
            deletePromises.push(deleteDoc(doc(db, 'activities', docSnap.id)));
        });

        await Promise.all(deletePromises);

        console.log(`🗑️ Cleaned up ${deletePromises.length} old activities`);
        return deletePromises.length;

    } catch (error) {
        console.error('❌ Error cleaning up old activities:', error);
        return 0;
    }
}
