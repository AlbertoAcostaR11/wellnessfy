/**
 * Feature Flags - Control de características experimentales
 * 
 * Permite activar/desactivar funcionalidades sin modificar código
 */

export const FEATURES = {
    // Integración con Fitbit API
    ENABLE_FITBIT: true, // Cambiar a false si hay problemas

    // Integración con Apple Health (futuro)
    ENABLE_APPLE_HEALTH: false,

    // Integración con Samsung Health (futuro)
    ENABLE_SAMSUNG_HEALTH: false,

    // Integración con Huawei Health
    ENABLE_HUAWEI_HEALTH: false,

    // Integración con Garmin (futuro)
    ENABLE_GARMIN: false,

    // Debug mode
    DEBUG_MODE: true, // Logs detallados en consola
};

/**
 * Configuración de proveedores de salud
 */
export const HEALTH_PROVIDERS_CONFIG = {
    googleFit: {
        enabled: true,
        name: 'Google Fit',
        icon: 'favorite',
        color: '#4285F4',
        requiresOAuth: true
    },
    fitbit: {
        enabled: FEATURES.ENABLE_FITBIT,
        name: 'Fitbit',
        icon: 'fitness_center',
        color: '#00B0B9',
        requiresOAuth: true,
        // Credenciales de Fitbit Developer Console
        clientId: '23TX6C',
        clientSecret: 'dae2ea946c3ce3be2727159012d4d444',
        redirectUri: window.location.origin + '/fitbit-callback.html',
        scope: 'activity heartrate sleep weight profile'
    },
    appleHealth: {
        enabled: FEATURES.ENABLE_APPLE_HEALTH,
        name: 'Apple Health',
        icon: 'favorite',
        color: '#000000',
        requiresOAuth: false // Usa HealthKit nativo
    },
    samsungHealth: {
        enabled: FEATURES.ENABLE_SAMSUNG_HEALTH,
        name: 'Samsung Health',
        icon: 'favorite',
        color: '#1428A0',
        requiresOAuth: true
    },
    huaweiHealth: {
        enabled: FEATURES.ENABLE_HUAWEI_HEALTH,
        name: 'Huawei Health',
        icon: 'favorite',
        color: '#CF0A2C', // Huawei Red
        requiresOAuth: true
    },
    garmin: {
        enabled: FEATURES.ENABLE_GARMIN,
        name: 'Garmin Connect',
        icon: 'directions_run',
        color: '#007CC3',
        requiresOAuth: true
    }
};

/**
 * Obtener proveedores habilitados
 */
export function getEnabledProviders() {
    return Object.entries(HEALTH_PROVIDERS_CONFIG)
        .filter(([_, config]) => config.enabled)
        .map(([key, config]) => ({
            key,
            ...config
        }));
}

/**
 * Verificar si un proveedor está habilitado
 */
export function isProviderEnabled(providerKey) {
    return HEALTH_PROVIDERS_CONFIG[providerKey]?.enabled || false;
}

/**
 * Log de debug (solo si DEBUG_MODE está activo)
 */
export function debugLog(message, ...args) {
    if (FEATURES.DEBUG_MODE) {
        console.log(`🔍 [DEBUG] ${message}`, ...args);
    }
}

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
    window.FEATURES = FEATURES;
    window.HEALTH_PROVIDERS_CONFIG = HEALTH_PROVIDERS_CONFIG;
    window.getEnabledProviders = getEnabledProviders;
}
