/**
 * Constantes para el Sistema de Notificaciones de Wellnessfy
 * Centraliza los IDs, etiquetas y metadatos visuales de todas las categorías.
 */

export const NOTIFICATION_CATEGORIES = {
    SOCIAL: {
        id: 'social',
        label: 'Social',
        description: 'Comentarios, reacciones y menciones',
        icon: 'chat_bubble',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/20'
    },
    FRIENDS: {
        id: 'friends',
        label: 'Amigos',
        description: 'Solicitudes de amistad y nuevos amigos',
        icon: 'person_add',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20'
    },
    CHALLENGES: {
        id: 'challenges',
        label: 'Desafíos',
        description: 'Invitaciones, progreso y finales de retos',
        icon: 'emoji_events',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/20'
    },
    WELLNESS: {
        id: 'wellness',
        label: 'Bienestar',
        description: 'Recordatorios de actividad y objetivos diarios',
        icon: 'self_improvement',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/20'
    },
    COMPETITION: {
        id: 'competition',
        label: 'Competición',
        description: 'Alertas de ranking y adelantamientos',
        icon: 'trending_up',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/20'
    },
    STREAKS: {
        id: 'streaks',
        label: 'Rachas y Récords',
        description: 'Rachas activas y nuevos récords personales',
        icon: 'local_fire_department',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/20'
    },
    BRANDS: {
        id: 'brands',
        label: 'Desafíos de Marca',
        description: 'Eventos patrocinados y promociones especiales',
        icon: 'campaign', // o 'verified'
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/20'
    },
    REWARDS: {
        id: 'rewards',
        label: 'Recompensas',
        description: 'Insignias desbloqueadas y premios',
        icon: 'military_tech', // o 'stars'
        color: 'text-yellow-300',
        bgColor: 'bg-yellow-500/20'
    }
};

// Tipos de Eventos mapeados a sus Categorías (Para uso interno del Orquestador)
export const EVENT_TYPES = {
    // Social
    POST_LIKE: { type: 'post_reaction', category: 'social' },
    POST_COMMENT: { type: 'post_comment', category: 'social' },
    POST_MENTION: { type: 'post_mention', category: 'social' },

    // Friends
    FRIEND_REQUEST: { type: 'friend_request', category: 'friends' },
    FRIEND_ACCEPTED: { type: 'friend_accepted', category: 'friends' },

    // Challenges
    CHALLENGE_INVITE: { type: 'challenge_invite', category: 'challenges' },
    CHALLENGE_GOAL: { type: 'challenge_goal_reached', category: 'challenges' },
    CHALLENGE_ENDING: { type: 'challenge_ending_soon', category: 'challenges' },

    // Wellness
    SEDENTARY_ALERT: { type: 'sedentary_reminder', category: 'wellness' },
    DAILY_GOAL: { type: 'daily_goal_reached', category: 'wellness' },

    // Competition
    RANKING_OVERTAKE: { type: 'ranking_overtake', category: 'competition' },
    LEADERBOARD_CLOSE: { type: 'leaderboard_closing', category: 'competition' },

    // Streaks
    STREAK_WARNING: { type: 'streak_danger', category: 'streaks' },
    NEW_RECORD: { type: 'personal_record', category: 'streaks' },

    // Brands
    BRAND_PROMO: { type: 'brand_promotion', category: 'brands' },
    BRAND_EVENT_START: { type: 'brand_event_start', category: 'brands' },

    // Rewards
    BADGE_UNLOCKED: { type: 'badge_unlocked', category: 'rewards' },
    LEVEL_UP: { type: 'level_up', category: 'rewards' }
};

/**
 * Obtiene la configuración de una categoría por su ID
 * @param {string} categoryId 
 * @returns {object} Configuración visual y textos
 */
export function getCategoryConfig(categoryId) {
    return Object.values(NOTIFICATION_CATEGORIES).find(c => c.id === categoryId) || NOTIFICATION_CATEGORIES.SOCIAL;
}
