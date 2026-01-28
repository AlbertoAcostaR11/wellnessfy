/**
 * 🏃 Diccionario Maestro de Deportes - Multi-Plataforma
 * 
 * Este diccionario mapea deportes a sus identificadores en diferentes plataformas.
 * 
 * Estructura por Prioridad:
 * 1. Health Connect (Android hub moderno)
 * 2. Fitbit (Web API - Prioridad actual)
 * 3. Garmin (Web API - Usuarios avanzados)
 * 4. Apple Health (iOS nativo)
 * 5. Google Fit (Deprecated 2026)
 * 6. Samsung Health (Android SDK)
 * 7. Huawei (Android SDK)
 * 8. Xiaomi (Limitado)
 * 
 * @version 2.0
 * @lastUpdated 2026-01-15
 */

export const SPORTS_DICTIONARY = {
    // A
    'aerobics': {
        healthConnect: null,
        fitbit: null,
        garmin: null,
        apple: null,
        googleFit: 9,
        samsung: 9007,
        huawei: null,
        xiaomi: null,
        notes: 'Solo Google Fit y Samsung'
    },
    'alpine_skiing': {
        healthConnect: 31,
        fitbit: null,
        garmin: 'ALPINE_SKIING',
        apple: 'downhillSkiing',
        googleFit: null,
        samsung: 9032,
        huawei: null,
        xiaomi: null
    },
    'american_football': {
        healthConnect: 2,
        fitbit: null,
        garmin: 'AMERICAN_FOOTBALL',
        apple: 'americanFootball',
        googleFit: 27,
        samsung: 4006,
        huawei: null,
        xiaomi: null
    },
    'archery': {
        healthConnect: null,
        fitbit: null,
        garmin: null,
        apple: 'archery',
        googleFit: 119,
        samsung: 9051,
        huawei: null,
        xiaomi: null
    },
    'australian_football': {
        healthConnect: 3,
        fitbit: null,
        garmin: null,
        apple: 'australianFootball',
        googleFit: 28,
        samsung: null,
        huawei: null,
        xiaomi: null
    },

    // B
    'backcountry_skiing': {
        healthConnect: 32,
        fitbit: null,
        garmin: 'BACKCOUNTRY_SKIING',
        apple: 'crossCountrySkiing',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'badminton': {
        healthConnect: 4,
        fitbit: null,
        garmin: 'BADMINTON',
        apple: 'badminton',
        googleFit: 10,
        samsung: 6003,
        huawei: null,
        xiaomi: null
    },
    'baseball': {
        healthConnect: 6,
        fitbit: 2001,
        garmin: 'BASEBALL',
        apple: 'baseball',
        googleFit: 11,
        samsung: 2001,
        huawei: null,
        xiaomi: null
    },
    'basketball': {
        healthConnect: 5,
        fitbit: null,
        garmin: 'BASKETBALL',
        apple: 'basketball',
        googleFit: 12,
        samsung: 4003,
        huawei: null,
        xiaomi: null,
        notes: 'Único que coincide en HC y Google Fit'
    },
    'biathlon': {
        healthConnect: 7,
        fitbit: null,
        garmin: null,
        apple: null,
        googleFit: 13,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'biking': {
        healthConnect: 8,
        fitbit: 90001,
        garmin: 'cycling',
        apple: 'cycling',
        googleFit: 1,
        samsung: 7001,
        huawei: 3,
        xiaomi: null
    },
    'biking_indoor': {
        healthConnect: null,
        fitbit: null,
        garmin: 'INDOOR_CYCLING',
        apple: 'cycling',
        googleFit: 18,
        samsung: 7002,
        huawei: 5,
        xiaomi: null
    },
    'biking_mountain': {
        healthConnect: null,
        fitbit: null,
        garmin: 'MOUNTAIN_BIKING',
        apple: 'cycling',
        googleFit: 15,
        samsung: 7003,
        huawei: null,
        xiaomi: null
    },
    'biking_road': {
        healthConnect: null,
        fitbit: null,
        garmin: 'ROAD_CYCLING',
        apple: 'cycling',
        googleFit: 16,
        samsung: 7004,
        huawei: null,
        xiaomi: null
    },
    'bowling': {
        healthConnect: 9,
        fitbit: null,
        garmin: 'BOWLING',
        apple: 'bowling',
        googleFit: null,
        samsung: 3003,
        huawei: null,
        xiaomi: null
    },
    'boxing': {
        healthConnect: 10,
        fitbit: null,
        garmin: null,
        apple: 'boxing',
        googleFit: 20,
        samsung: 9055,
        huawei: null,
        xiaomi: null
    },

    // C
    'calisthenics': {
        healthConnect: 11,
        fitbit: null,
        garmin: null,
        apple: 'functionalStrengthTraining',
        googleFit: 21,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'canoeing': {
        healthConnect: 12,
        fitbit: null,
        garmin: 'CANOEING',
        apple: 'paddleSports',
        googleFit: null,
        samsung: 9037,
        huawei: null,
        xiaomi: null
    },
    'cricket': {
        healthConnect: 13,
        fitbit: 2003,
        garmin: 'CRICKET',
        apple: 'cricket',
        googleFit: 23,
        samsung: 2003,
        huawei: null,
        xiaomi: null
    },
    'cross_country_skiing': {
        healthConnect: null,
        fitbit: null,
        garmin: 'CROSS_COUNTRY_SKIING',
        apple: 'crossCountrySkiing',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'curling': {
        healthConnect: null,
        fitbit: null,
        garmin: 'CURLING',
        apple: 'curling',
        googleFit: 106,
        samsung: null,
        huawei: null,
        xiaomi: null
    },

    // D
    'dancing': {
        healthConnect: 14,
        fitbit: null,
        garmin: null,
        apple: 'dance',
        googleFit: 24,
        samsung: 9011,
        huawei: null,
        xiaomi: null
    },
    'diving': {
        healthConnect: null,
        fitbit: null,
        garmin: 'DIVING',
        apple: 'diving',
        googleFit: 102,
        samsung: 9039,
        huawei: null,
        xiaomi: null
    },

    // E
    'elliptical': {
        healthConnect: 16,
        fitbit: 90012,
        garmin: 'ELLIPTICAL',
        apple: 'elliptical',
        googleFit: 25,
        samsung: 9003,
        huawei: null,
        xiaomi: null
    },

    // F
    'fencing': {
        healthConnect: 17,
        fitbit: null,
        garmin: null,
        apple: 'fencing',
        googleFit: 26,
        samsung: 9052,
        huawei: null,
        xiaomi: null
    },
    'football_soccer': {
        healthConnect: 28,
        fitbit: 1010,
        garmin: 'SOCCER',
        apple: 'soccer',
        googleFit: 29,
        samsung: 4004,
        huawei: null,
        xiaomi: null,
        notes: 'HC usa 28 vs Google Fit 29'
    },
    'frisbee': {
        healthConnect: 18,
        fitbit: null,
        garmin: 'ULTIMATE_FRISBEE',
        apple: 'discSports',
        googleFit: 30,
        samsung: null,
        huawei: null,
        xiaomi: null
    },

    // G
    'golf': {
        healthConnect: 19,
        fitbit: 3001,
        garmin: 'GOLF',
        apple: 'golf',
        googleFit: 32,
        samsung: 3001,
        huawei: null,
        xiaomi: null,
        notes: 'HC usa 19 vs Google Fit 32'
    },
    'guided_breathing': {
        healthConnect: 20,
        fitbit: null,
        garmin: null,
        apple: null,
        googleFit: 122,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'gymnastics': {
        healthConnect: 21,
        fitbit: null,
        garmin: null,
        apple: 'gymnastics',
        googleFit: 33,
        samsung: 9053,
        huawei: null,
        xiaomi: null
    },

    // H
    'handball': {
        healthConnect: 22,
        fitbit: null,
        garmin: null,
        apple: 'handball',
        googleFit: 34,
        samsung: 4005,
        huawei: null,
        xiaomi: null
    },
    'hiit': {
        healthConnect: 23,
        fitbit: null,
        garmin: 'HIGH_INTENSITY_INTERVAL_TRAINING',
        apple: 'highIntensityIntervalTraining',
        googleFit: 114,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'hiking': {
        healthConnect: 24,
        fitbit: null,
        garmin: 'HIKING',
        apple: 'hiking',
        googleFit: 35,
        samsung: 9001,
        huawei: null,
        xiaomi: 1
    },
    'hockey': {
        healthConnect: null,
        fitbit: 4001,
        garmin: 'HOCKEY',
        apple: 'hockey',
        googleFit: 36,
        samsung: 4001,
        huawei: null,
        xiaomi: null
    },

    // I
    'ice_skating': {
        healthConnect: 25,
        fitbit: null,
        garmin: 'ICE_SKATING',
        apple: 'skatingSports',
        googleFit: 104,
        samsung: 9030,
        huawei: null,
        xiaomi: null
    },

    // K
    'kayaking': {
        healthConnect: null,
        fitbit: null,
        garmin: 'KAYAKING',
        apple: 'paddleSports',
        googleFit: 40,
        samsung: 9036,
        huawei: null,
        xiaomi: null
    },

    // M
    'martial_arts': {
        healthConnect: 26,
        fitbit: null,
        garmin: null,
        apple: 'martialArts',
        googleFit: 44,
        samsung: 9054,
        huawei: null,
        xiaomi: null
    },

    // P
    'paddling': {
        healthConnect: 27,
        fitbit: null,
        garmin: null,
        apple: 'paddleSports',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'paragliding': {
        healthConnect: null,
        fitbit: null,
        garmin: null,
        apple: null,
        googleFit: 48,
        samsung: 9048,
        huawei: null,
        xiaomi: null
    },
    'pilates': {
        healthConnect: 29,
        fitbit: null,
        garmin: 'PILATES',
        apple: 'pilates',
        googleFit: 49,
        samsung: 9009,
        huawei: null,
        xiaomi: null
    },

    // R
    'racquetball': {
        healthConnect: 30,
        fitbit: null,
        garmin: null,
        apple: 'racquetball',
        googleFit: 51,
        samsung: 6005,
        huawei: null,
        xiaomi: null
    },
    'rock_climbing': {
        healthConnect: 33,
        fitbit: null,
        garmin: null,
        apple: 'climbing',
        googleFit: 52,
        samsung: 9044,
        huawei: null,
        xiaomi: null
    },
    'roller_skating': {
        healthConnect: 34,
        fitbit: null,
        garmin: 'ROLLER_SKATING',
        apple: 'skatingSports',
        googleFit: null,
        samsung: 9031,
        huawei: null,
        xiaomi: null
    },
    'rowing': {
        healthConnect: 35,
        fitbit: null,
        garmin: 'ROWING',
        apple: 'rowing',
        googleFit: 53,
        samsung: 9006,
        huawei: null,
        xiaomi: null
    },
    'rowing_indoor': {
        healthConnect: null,
        fitbit: null,
        garmin: 'INDOOR_ROWING',
        apple: 'rowing',
        googleFit: 54,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'rugby': {
        healthConnect: 36,
        fitbit: 4002,
        garmin: 'RUGBY',
        apple: 'rugby',
        googleFit: 55,
        samsung: 4002,
        huawei: null,
        xiaomi: null
    },
    'running': {
        healthConnect: 56,
        fitbit: 90009,
        garmin: 'running',
        apple: 'running',
        googleFit: 8,
        samsung: 1002,
        huawei: 1,
        xiaomi: null,
        notes: 'HC usa 56 vs Google Fit 8'
    },
    'running_indoor': {
        healthConnect: null,
        fitbit: null,
        garmin: 'indoor_running',
        apple: 'running',
        googleFit: 58,
        samsung: 9002,
        huawei: 4,
        xiaomi: null
    },
    'running_treadmill': {
        healthConnect: 57,
        fitbit: null,
        garmin: 'treadmill_running',
        apple: 'running',
        googleFit: 58,
        samsung: 9002,
        huawei: 4,
        xiaomi: null
    },
    'running_trail': {
        healthConnect: null,
        fitbit: null,
        garmin: 'trail_running',
        apple: 'running',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },

    // S
    'sailing': {
        healthConnect: 37,
        fitbit: null,
        garmin: 'SAILING',
        apple: 'sailing',
        googleFit: 59,
        samsung: 9038,
        huawei: null,
        xiaomi: null
    },
    'scuba_diving': {
        healthConnect: 38,
        fitbit: null,
        garmin: 'DIVING',
        apple: 'diving',
        googleFit: 60,
        samsung: 9039,
        huawei: null,
        xiaomi: null
    },
    'skateboarding': {
        healthConnect: 39,
        fitbit: null,
        garmin: 'SKATEBOARDING',
        apple: 'skatingSports',
        googleFit: 61,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'skating': {
        healthConnect: 40,
        fitbit: null,
        garmin: null,
        apple: 'skatingSports',
        googleFit: 62,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'skiing': {
        healthConnect: 41,
        fitbit: null,
        garmin: null,
        apple: 'downhillSkiing',
        googleFit: null,
        samsung: 9032,
        huawei: null,
        xiaomi: null
    },
    'snowboarding': {
        healthConnect: 42,
        fitbit: null,
        garmin: 'SNOWBOARDING',
        apple: 'snowboarding',
        googleFit: null,
        samsung: 9033,
        huawei: null,
        xiaomi: null
    },
    'snowshoeing': {
        healthConnect: 43,
        fitbit: null,
        garmin: 'SNOWSHOEING',
        apple: 'snowSports',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'softball': {
        healthConnect: 44,
        fitbit: 2002,
        garmin: 'SOFTBALL',
        apple: 'softball',
        googleFit: null,
        samsung: 2002,
        huawei: null,
        xiaomi: null
    },
    'squash': {
        healthConnect: 45,
        fitbit: null,
        garmin: 'SQUASH',
        apple: 'squash',
        googleFit: null,
        samsung: 6001,
        huawei: null,
        xiaomi: null
    },
    'stair_climbing': {
        healthConnect: 46,
        fitbit: null,
        garmin: 'STAIR_CLIMBING',
        apple: 'stairClimbing',
        googleFit: null,
        samsung: 9004,
        huawei: null,
        xiaomi: null
    },
    'strength_training': {
        healthConnect: 47,
        fitbit: 2050,
        garmin: 'STRENGTH_TRAINING',
        apple: 'traditionalStrengthTraining',
        googleFit: null,
        samsung: 9013,
        huawei: null,
        xiaomi: null
    },
    'stretching': {
        healthConnect: 48,
        fitbit: null,
        garmin: null,
        apple: 'flexibility',
        googleFit: null,
        samsung: 9012,
        huawei: null,
        xiaomi: null
    },
    'surfing': {
        healthConnect: 49,
        fitbit: null,
        garmin: 'SURFING',
        apple: 'surfingSports',
        googleFit: null,
        samsung: 9034,
        huawei: null,
        xiaomi: null
    },
    'swimming': {
        healthConnect: 50,
        fitbit: 90024,
        garmin: 'SWIMMING',
        apple: 'swimming',
        googleFit: null,
        samsung: 8001,
        huawei: null,
        xiaomi: null
    },
    'swimming_open_water': {
        healthConnect: 51,
        fitbit: null,
        garmin: 'OPEN_WATER_SWIMMING',
        apple: 'swimming',
        googleFit: null,
        samsung: 8003,
        huawei: null,
        xiaomi: null
    },
    'swimming_pool': {
        healthConnect: 52,
        fitbit: null,
        garmin: 'POOL_SWIMMING',
        apple: 'swimming',
        googleFit: null,
        samsung: 8002,
        huawei: null,
        xiaomi: null
    },

    // T
    'table_tennis': {
        healthConnect: 53,
        fitbit: null,
        garmin: 'TABLE_TENNIS',
        apple: 'tableTennis',
        googleFit: null,
        samsung: 6004,
        huawei: null,
        xiaomi: null
    },
    'tennis': {
        healthConnect: 75,
        fitbit: 19001,
        garmin: 'TENNIS',
        apple: 'tennis',
        googleFit: 82,
        samsung: 6002,
        huawei: 16,
        xiaomi: null,
        notes: 'HC usa 75 vs Google Fit 82. Fitbit 19001, Huawei 16.'
    },

    // V
    'volleyball': {
        healthConnect: 54,
        fitbit: null,
        garmin: 'VOLLEYBALL',
        apple: 'volleyball',
        googleFit: null,
        samsung: 5001,
        huawei: null,
        xiaomi: null
    },

    // W
    'walking': {
        healthConnect: 79,
        fitbit: 90013,
        garmin: 'WALKING',
        apple: 'walking',
        googleFit: 7,
        samsung: 1001,
        huawei: 2,
        xiaomi: 1,
        notes: 'HC usa 79 vs Google Fit 7'
    },
    'walking_indoor': {
        healthConnect: null,
        fitbit: null,
        garmin: 'INDOOR_WALKING',
        apple: 'walking',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'water_polo': {
        healthConnect: 55,
        fitbit: null,
        garmin: null,
        apple: 'waterPolo',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },
    'weightlifting': {
        healthConnect: 58,
        fitbit: 90004,
        garmin: null,
        apple: 'traditionalStrengthTraining',
        googleFit: null,
        samsung: 9013,
        huawei: null,
        xiaomi: null
    },
    'wheelchair': {
        healthConnect: 59,
        fitbit: null,
        garmin: null,
        apple: 'wheelchairWalkPace',
        googleFit: null,
        samsung: null,
        huawei: null,
        xiaomi: null
    },

    // Y
    'yoga': {
        healthConnect: 80,
        fitbit: 52001,
        garmin: 'YOGA',
        apple: 'yoga',
        googleFit: 100,
        samsung: 9010,
        huawei: 14,
        xiaomi: null,
        notes: 'HC usa 80 vs Google Fit 100.'
    },

    // Other
    'other': {
        healthConnect: 81,
        fitbit: null,
        garmin: 'OTHER',
        apple: 'other',
        googleFit: 108,
        samsung: 0,
        huawei: 255,
        xiaomi: null,
        notes: 'ID genérico para actividades no clasificadas'
    }
};

/**
 * Obtener información de un deporte por su ID en una plataforma específica
 * @param {string} platform - Plataforma (healthConnect, fitbit, garmin, etc.)
 * @param {number|string} id - ID del deporte en esa plataforma
 * @returns {object|null} Información del deporte o null si no se encuentra
 */
export function getSportByPlatformId(platform, id) {
    for (const [sportKey, sportData] of Object.entries(SPORTS_DICTIONARY)) {
        if (sportData[platform] === id) {
            return {
                key: sportKey,
                ...sportData
            };
        }
    }
    return null;
}

/**
 * Obtener el ID de un deporte para una plataforma específica
 * @param {string} sportKey - Clave del deporte (ej: 'yoga', 'running')
 * @param {string} platform - Plataforma (healthConnect, fitbit, garmin, etc.)
 * @returns {number|string|null} ID del deporte en esa plataforma o null
 */
export function getSportId(sportKey, platform) {
    const sport = SPORTS_DICTIONARY[sportKey];
    return sport ? sport[platform] : null;
}

/**
 * Normalizar nombre de actividad desde cualquier plataforma
 * @param {string} platform - Plataforma de origen
 * @param {number|string} id - ID de la actividad
 * @returns {string} Nombre normalizado del deporte
 */
export function normalizeSportName(platform, id) {
    const sport = getSportByPlatformId(platform, id);
    if (sport) {
        // Convertir snake_case a Title Case
        return sport.key
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    return 'Actividad Física'; // Fallback amigable
}

/**
 * Obtener lista de deportes soportados por una plataforma
 * @param {string} platform - Plataforma
 * @returns {Array} Lista de deportes con sus IDs
 */
export function getSupportedSports(platform) {
    const supported = [];
    for (const [sportKey, sportData] of Object.entries(SPORTS_DICTIONARY)) {
        if (sportData[platform] !== null) {
            supported.push({
                key: sportKey,
                id: sportData[platform],
                name: normalizeSportName(platform, sportData[platform])
            });
        }
    }
    return supported;
}

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
    window.SPORTS_DICTIONARY = SPORTS_DICTIONARY;
    window.getSportByPlatformId = getSportByPlatformId;
    window.getSportId = getSportId;
    window.normalizeSportName = normalizeSportName;
    window.getSupportedSports = getSupportedSports;
}
