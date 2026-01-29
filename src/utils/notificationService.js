
import { AppState } from './state.js';
import { NOTIFICATION_CATEGORIES, EVENT_TYPES } from '../config/notificationConstants.js';

// Importaciones dinámicas de Firebase para evitar dependencias circulares y mejorar carga
let db = null;
let addDoc = null;
let collection = null;
let serverTimestamp = null;

async function initFirebase() {
    if (db) return;
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const firebaseInit = await import('../config/firebaseInit.js');

        db = firebaseInit.db;
        addDoc = firestoreModule.addDoc;
        collection = firestoreModule.collection;
        serverTimestamp = firestoreModule.serverTimestamp;
    } catch (e) {
        console.error('Failed to load Firebase for notification service', e);
    }
}

/**
 * Servicio Central de Notificaciones
 * Se encarga de validar preferencias, crear notificaciones y gestionar el envío.
 */
export const NotificationService = {

    /**
     * Dispara una notificación para un evento específico
     * @param {string} eventKey - Clave del evento (de EVENT_TYPES) o tipo directo string
     * @param {object} payload - Datos del evento
     * @param {object} payload.actor - Usuario que realiza la acción (id, name, avatar)
     * @param {string} payload.targetUserId - ID del usuario que recibe la notificación
     * @param {string} payload.title - Título (opcional, se genera auto si no)
     * @param {string} payload.message - Mensaje principal
     * @param {object} payload.data - Datos extra para navegación (eventId, typeId, etc)
     */
    async send(eventKey, payload) {
        await initFirebase();

        // 1. Identificar Tipo y Categoría
        let eventConfig = null;

        if (typeof eventKey === 'string' && EVENT_TYPES[eventKey]) {
            eventConfig = EVENT_TYPES[eventKey];
        } else {
            // Fallback si pasan un string directo que no está en constantes
            eventConfig = { type: eventKey, category: 'social' };
            console.warn(`[NotifService] Event type '${eventKey}' not found in constants. Defaulting to social.`);
        }

        const categoryId = eventConfig.category;
        const targetUserId = payload.targetUserId;

        if (!targetUserId) {
            console.error('[NotifService] Target User ID is missing');
            return;
        }

        // 2. Verificar Preferencias del Usuario Destinatario
        // NOTA: Idealmente esto se verificaría leyendo el perfil del usuario receptor desde DB.
        // Como optimización, si el target es el usuario actual (ej. recordatorio self), miramos AppState.
        // Si es otro usuario, asumimos True por defecto y dejamos que el Cloud Function filtre, 
        // O leemos su perfil (costoso). 
        // Para esta implementación híbrida: Guardamos SIEMPRE en DB, y el cliente final filtra al mostrar.
        // Esto permite que si el usuario activa la categoría después, vea el historial.

        // 3. Construir Objeto de Notificación
        const notificationData = {
            type: eventConfig.type,
            category: categoryId,
            actor: {
                id: payload.actor?.id || 'system',
                name: payload.actor?.name || 'Wellnessfy',
                username: payload.actor?.username || '',
                avatar: payload.actor?.avatar || ''
            },
            title: payload.title || this._getDefaultTitle(eventConfig.type),
            message: payload.message,
            data: payload.data || {},
            read: false,
            createdAt: serverTimestamp(),
            // Metadatos para agrupación
            groupId: this._generateGroupId(eventConfig.type, payload.data?.referenceId),
            isProcessed: false // Para Cloud Functions (Push)
        };

        try {
            // 4. Guardar en Firestore (Colección General 'notifications')
            // Ojo: Usar subcolección users/{uid}/notifications es más escalable/seguro
            const userNotifRef = collection(db, `users/${targetUserId}/notifications`);
            await addDoc(userNotifRef, notificationData);

            console.log(`🔔 [NotifService] Sent '${eventConfig.type}' to user ${targetUserId}`);

        } catch (error) {
            console.error('[NotifService] Error sending notification:', error);
        }
    },

    /**
     * Genera un título por defecto basado en el tipo de evento
     */
    _getDefaultTitle(type) {
        switch (type) {
            case 'friend_request': return 'Nueva solicitud de amistad';
            case 'post_reaction': return 'Nuevo Me Gusta';
            case 'post_comment': return 'Nuevo comentario';
            case 'challenge_invite': return 'Invitación a desafío';
            case 'daily_goal_reached': return '¡Objetivo Diario Alcanzado!';
            case 'badge_unlocked': return '¡Nueva Insignia!';
            default: return 'Nueva notificación';
        }
    },

    /**
     * Genera un ID de grupo para evitar spam (Debouncing)
     * Ej: post_reaction_post123 -> Permite agrupar "5 personas dieron like a tu post"
     */
    _generateGroupId(type, referenceId) {
        if (!referenceId) return null;
        return `${type}_${referenceId}`;
    }
};

// Expose globally for easy access
if (typeof window !== 'undefined') {
    window.NotificationService = NotificationService;
    console.log('✅ NotificationService loaded and ready');
}
