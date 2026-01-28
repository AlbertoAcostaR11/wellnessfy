/**
 * Sports Dictionary - Mapeo completo de actividades
 * Mapea Google Fit Activity Type IDs a metadatos visuales y de medición
 * 
 * Fuente de IDs: https://developers.google.com/fit/rest/v1/reference/activity-types
 */

export const SPORTS_DICTIONARY = {
    // CARDIO
    7: {
        name: 'Caminar',
        icon: 'directions_walk',
        color: '#00ff9d',
        category: 'cardio',
        metric: 'distance', // 'distance' | 'time'
        unit: 'km'
    },
    9: {
        name: 'Correr',
        icon: 'directions_run',
        color: '#ff6b6b',
        category: 'cardio',
        metric: 'distance',
        unit: 'km'
    },
    1: {
        name: 'Ciclismo',
        icon: 'directions_bike',
        color: '#4ecdc4',
        category: 'cardio',
        metric: 'distance',
        unit: 'km'
    },
    8: {
        name: 'Cinta de correr',
        icon: 'sprint',
        color: '#74b9ff',
        category: 'cardio',
        metric: 'distance',
        unit: 'km'
    },
    15: {
        name: 'Spinning',
        icon: 'pedal_bike',
        color: '#a29bfe',
        category: 'cardio',
        metric: 'time',
        unit: 'hr'
    },
    21: {
        name: 'Máquina Elíptica',
        icon: 'settings_accessibility',
        color: '#00cec9',
        category: 'cardio',
        metric: 'time',
        unit: 'hr'
    },
    40: {
        name: 'Remo',
        icon: 'rowing',
        color: '#0984e3',
        category: 'cardio',
        metric: 'time',
        unit: 'hr'
    },

    // FUERZA
    5: {
        name: 'Entrenamiento de Fuerza',
        icon: 'fitness_center',
        color: '#ff9f43',
        category: 'strength',
        metric: 'time',
        unit: 'hr'
    },
    102: {
        name: 'Calistenia',
        icon: 'accessibility_new',
        color: '#fd79a8',
        category: 'strength',
        metric: 'time',
        unit: 'hr'
    },

    // MENTE & CUERPO
    100: {
        name: 'Yoga',
        icon: 'self_improvement',
        color: '#a29bfe',
        category: 'mindfulness',
        metric: 'time',
        unit: 'hr'
    },
    45: {
        name: 'Meditación',
        icon: 'psychiatry',
        color: '#b19cd9',
        category: 'mindfulness',
        metric: 'time',
        unit: 'hr'
    },
    106: {
        name: 'Respiración',
        icon: 'air',
        color: '#c8b6ff',
        category: 'mindfulness',
        metric: 'time',
        unit: 'hr'
    },
    101: {
        name: 'Pilates',
        icon: 'spa',
        color: '#dfe6e9',
        category: 'mindfulness',
        metric: 'time',
        unit: 'hr'
    },

    // DEPORTES DE EQUIPO
    11: {
        name: 'Fútbol',
        icon: 'sports_soccer',
        color: '#00b894',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },
    3: {
        name: 'Baloncesto',
        icon: 'sports_basketball',
        color: '#ff7675',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },
    90: {
        name: 'Voleibol',
        icon: 'sports_volleyball',
        color: '#fdcb6e',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },
    76: {
        name: 'Rugby',
        icon: 'sports_rugby',
        color: '#2d3436',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },
    10: {
        name: 'Fútbol Americano',
        icon: 'sports_football',
        color: '#636e72',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },
    94: {
        name: 'Béisbol',
        icon: 'sports_baseball',
        color: '#b2bec3',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },
    32: {
        name: 'Cricket',
        icon: 'sports_cricket',
        color: '#f9ca24',
        category: 'team',
        metric: 'time',
        unit: 'hr'
    },

    // ACUÁTICOS
    82: {
        name: 'Natación',
        icon: 'pool',
        color: '#00d2ff',
        category: 'water',
        metric: 'distance',
        unit: 'km'
    },
    107: {
        name: 'Surf',
        icon: 'surfing',
        color: '#00cec9',
        category: 'water',
        metric: 'time',
        unit: 'hr'
    },

    // AVENTURA / OUTDOOR
    79: {
        name: 'Senderismo',
        icon: 'hiking',
        color: '#26de81',
        category: 'outdoor',
        metric: 'distance',
        unit: 'km'
    },
    48: {
        name: 'Escalada',
        icon: 'terrain',
        color: '#6c5ce7',
        category: 'outdoor',
        metric: 'time',
        unit: 'hr'
    },

    // COMBATE
    2: {
        name: 'Boxeo',
        icon: 'sports_martial_arts',
        color: '#ee5a6f',
        category: 'combat',
        metric: 'time',
        unit: 'hr'
    },
    59: {
        name: 'Artes Marciales',
        icon: 'sports_kabaddi',
        color: '#d63031',
        category: 'combat',
        metric: 'time',
        unit: 'hr'
    },
    31: {
        name: 'Esgrima',
        icon: 'swords',
        color: '#c7ecee',
        category: 'combat',
        metric: 'time',
        unit: 'hr'
    },

    // RAQUETA
    87: {
        name: 'Tenis',
        icon: 'sports_tennis',
        color: '#ffeaa7',
        category: 'racket',
        metric: 'time',
        unit: 'hr'
    },
    4: {
        name: 'Bádminton',
        icon: 'sports_tennis',
        color: '#dfe6e9',
        category: 'racket',
        metric: 'time',
        unit: 'hr'
    },
    // Nota: Padel usa mismo ID que Tenis en algunos sistemas, lo manejamos por nombre si viene

    // INVIERNO
    20: {
        name: 'Esquí',
        icon: 'downhill_skiing',
        color: '#74b9ff',
        category: 'winter',
        metric: 'time',
        unit: 'hr'
    },
    64: {
        name: 'Snowboard',
        icon: 'snowboarding',
        color: '#a29bfe',
        category: 'winter',
        metric: 'time',
        unit: 'hr'
    },
    29: {
        name: 'Curling',
        icon: 'sports',
        color: '#dfe4ea',
        category: 'winter',
        metric: 'time',
        unit: 'hr'
    },

    // ALTA INTENSIDAD
    104: {
        name: 'HIIT',
        icon: 'local_fire_department',
        color: '#ff4757',
        category: 'intensity',
        metric: 'time',
        unit: 'hr'
    },
    27: {
        name: 'CrossFit',
        icon: 'exercise',
        color: '#e17055',
        category: 'intensity',
        metric: 'time',
        unit: 'hr'
    },

    // DIVERSIÓN
    6: {
        name: 'Baile',
        icon: 'music_note',
        color: '#f368e0',
        category: 'fun',
        metric: 'time',
        unit: 'hr'
    },
    43: {
        name: 'Patinaje',
        icon: 'roller_skating',
        color: '#fab1a0',
        category: 'fun',
        metric: 'time',
        unit: 'hr'
    },
    34: {
        name: 'Frisbee',
        icon: 'album',
        color: '#f0932b',
        category: 'fun',
        metric: 'time',
        unit: 'hr'
    }
};

/**
 * Nombres oficiales de Google Fit Activity Types
 * Fuente: https://developers.google.com/fit/rest/v1/reference/activity-types
 */
const GOOGLE_FIT_ACTIVITY_NAMES = {
    0: 'En vehículo', 7: 'Caminar', 8: 'Cinta de correr', 9: 'Correr',
    10: 'Fútbol Americano', 11: 'Fútbol', 12: 'Frisbee', 13: 'Jardinería',
    14: 'Golf', 15: 'Gimnasia', 16: 'Handball', 17: 'Senderismo',
    18: 'Hockey', 19: 'Patinaje sobre hielo', 20: 'Salto de comba',
    21: 'Kayak', 22: 'Kickboxing', 23: 'Kitesurfing', 24: 'Artes marciales',
    25: 'Meditación', 26: 'Remo mixto', 27: 'Pilates', 28: 'Polo',
    29: 'Racquetball', 30: 'Escalada', 31: 'Remo', 32: 'Rugby',
    33: 'Correr en arena', 34: 'Patinaje', 35: 'Esquí', 36: 'Snowboard',
    37: 'Squash', 38: 'Escaladora', 39: 'Surf', 40: 'Natación',
    41: 'Tenis de mesa', 42: 'Tenis', 43: 'Voleibol', 44: 'Wakeboard',
    45: 'Caminar (Fitness)', 46: 'Polo acuático', 47: 'Yoga', 48: 'Zumba',
    50: 'Diving', 51: 'Ergómetro', 52: 'Patinaje sobre hielo', 53: 'Esquí alpino',
    54: 'Esquí de fondo', 55: 'Esquí de fondo', 56: 'Esquí de fondo',
    57: 'Patinaje de velocidad', 58: 'Surf de remo', 59: 'Spinning',
    60: 'Stair climbing', 61: 'Stand up paddleboarding', 62: 'Fuerza',
    63: 'Surf', 64: 'Natación en piscina', 65: 'Natación en aguas abiertas',
    66: 'Tenis de mesa', 67: 'Tenis', 68: 'Cinta de correr', 69: 'Voleibol',
    70: 'Voleibol de playa', 71: 'Voleibol indoor', 72: 'Wakeboard',
    73: 'Caminar', 74: 'Polo acuático', 75: 'Yoga', 76: 'Zumba',
    77: 'Buceo', 78: 'Ergómetro', 79: 'Escalada', 80: 'Esgrima',
    81: 'Fútbol americano', 82: 'Frisbee', 83: 'Jardinería', 84: 'Golf',
    85: 'Gimnasia', 86: 'Handball', 87: 'Senderismo', 88: 'Hockey',
    89: 'Patinaje sobre hielo', 90: 'Salto de comba', 91: 'Kayak',
    92: 'Kickboxing', 93: 'Kitesurfing', 94: 'Artes marciales',
    95: 'Meditación', 96: 'Remo mixto', 97: 'Pilates', 98: 'Polo',
    99: 'Racquetball', 100: 'Escalada', 101: 'Remo', 102: 'Rugby',
    103: 'Correr en arena', 104: 'Patinaje', 105: 'Esquí', 106: 'Snowboard',
    107: 'Squash', 108: 'Escaladora', 109: 'Surf', 110: 'Natación',
    111: 'Tenis de mesa', 112: 'Tenis', 113: 'Voleibol', 114: 'Wakeboard',
    115: 'Caminar (Fitness)', 116: 'Polo acuático', 117: 'Yoga', 118: 'Zumba',
    119: 'Aeróbic', 120: 'Bádminton'
};

/**
 * Obtiene metadata de un deporte por su ID
 * @param {number} activityTypeId - Google Fit Activity Type ID
 * @returns {object} Metadata del deporte
 */
export function getSportMetadata(activityTypeId) {
    // Si está en nuestro diccionario, usarlo
    if (SPORTS_DICTIONARY[activityTypeId]) {
        return SPORTS_DICTIONARY[activityTypeId];
    }

    // Si no, usar nombre oficial de Google Fit con valores genéricos
    const googleName = GOOGLE_FIT_ACTIVITY_NAMES[activityTypeId] || `Actividad ${activityTypeId}`;

    return {
        name: googleName,
        icon: 'sports_tennis', // Icono genérico de deportes
        color: '#95a5a6',
        category: 'other',
        metric: 'time', // Por defecto, medimos por tiempo
        unit: 'hr'
    };
}

/**
 * Categorías de deportes para agrupación visual
 */
export const SPORT_CATEGORIES = {
    'cardio': { name: 'Cardio', icon: 'favorite', color: '#ff6b6b' },
    'strength': { name: 'Fuerza', icon: 'fitness_center', color: '#ff9f43' },
    'mindfulness': { name: 'Mente & Cuerpo', icon: 'self_improvement', color: '#a29bfe' },
    'team': { name: 'Deportes de Equipo', icon: 'groups', color: '#00b894' },
    'water': { name: 'Acuáticos', icon: 'pool', color: '#00d2ff' },
    'outdoor': { name: 'Aventura', icon: 'hiking', color: '#26de81' },
    'combat': { name: 'Combate', icon: 'sports_martial_arts', color: '#d63031' },
    'racket': { name: 'Raqueta', icon: 'sports_tennis', color: '#ffeaa7' },
    'winter': { name: 'Invierno', icon: 'ac_unit', color: '#74b9ff' },
    'intensity': { name: 'Alta Intensidad', icon: 'local_fire_department', color: '#ff4757' },
    'fun': { name: 'Diversión', icon: 'celebration', color: '#f368e0' },
    'other': { name: 'Otros', icon: 'more_horiz', color: '#95a5a6' }
};
