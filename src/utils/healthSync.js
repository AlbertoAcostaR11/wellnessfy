/**
 * 🔄 Health Data Sync - Capa de abstracción para sincronización multi-plataforma
 * 
 * Maneja la sincronización de datos de salud desde diferentes proveedores
 * (Google Fit, Fitbit, Apple Health, etc.) de forma unificada
 */

import { healthProviderManager } from './healthProviders/HealthProviderManager.js';
export { healthProviderManager };
import { FEATURES, debugLog, isProviderEnabled } from '../config/features.js';
import { getSportByPlatformId, normalizeSportName } from './sportsDictionaryMaster.js';

/**
 * Inicializar proveedor de salud
 * Carga el proveedor guardado o usa Google Fit por defecto
 */
export async function initializeHealthProvider() {
    let savedProvider = localStorage.getItem('selectedHealthProvider');

    if (!savedProvider) {
        // Auto-detección: Si no hay selección pero hay tokens, elegir fitbit o googleFit
        if (localStorage.getItem('fitbit_access_token') || localStorage.getItem('fitbit_token')) {
            savedProvider = 'fitbit';
        } else if (localStorage.getItem('google_health_token') || localStorage.getItem('google_access_token')) {
            savedProvider = 'googleFit';
        }

        if (savedProvider) {
            debugLog(`✨ Auto-detectado proveedor con token: ${savedProvider}`);
            localStorage.setItem('selectedHealthProvider', savedProvider);
        } else {
            debugLog('⚪ Ningún proveedor de salud configurado previamente.');
            healthProviderManager.activeProvider = null;
            return null;
        }
    }

    debugLog(`🔍 Proveedor activo: ${savedProvider}`);

    if (!isProviderEnabled(savedProvider)) {
        console.warn(`⚠️ Proveedor ${savedProvider} está deshabilitado.`);
        return null;
    }

    try {
        healthProviderManager.setActiveProvider(savedProvider);
        debugLog(`✅ Proveedor activo configurado: ${savedProvider}`);
        return savedProvider;
    } catch (e) {
        console.error('Error inicializando proveedor:', e);
        return null;
    }
}

/**
 * Sincronizar datos de salud del proveedor activo
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Object} Datos normalizados
 */
import { UniversalDataNormalizer } from './normalization/UniversalDataNormalizer.js';

// Inicializar motor de normalización
const normalizer = new UniversalDataNormalizer();

// ...

export async function syncHealthData(startDate, endDate) {
    let provider = healthProviderManager.getActiveProvider();

    // Si no hay proveedor activo, intentar cargar el último usado o usar fitbit por defecto
    if (!provider) {
        debugLog('⚠️ No hay proveedor activo. Intentando inicializar...');
        await initializeHealthProvider();
        provider = healthProviderManager.getActiveProvider();
    }

    if (!provider) {
        throw new Error('No se ha seleccionado ningún proveedor de salud (Fitbit/Google Fit)');
    }

    const providerName = provider.name.toLowerCase().includes('google') ? 'googleFit' : provider.name.toLowerCase();

    debugLog(`📥 Sincronizando desde: ${providerName} (Motor V2)`, { startDate, endDate });

    try {
        // Verificar autenticación
        if (!provider.hasValidToken()) {
            console.warn(`⚠️ [SYNC] Intento de sincronización sin token válido para: ${providerName}`);
            const error = new Error('AUTH_ERROR');
            error.providerId = providerName;
            throw error;
        }

        // Obtener datos raw del proveedor
        const rawActivities = await provider.getActivities(startDate, endDate);

        debugLog(`📊 ${rawActivities.length} actividades CRUDAS obtenidas de ${providerName}`);

        // DEBUG: Buscar fútbol en la data cruda antes de normalizar
        rawActivities.forEach(act => {
            const name = (act.name || act.activityName || '').toLowerCase();
            const id = act.activityId || act.activityTypeId;
            if (name.includes('fut') || name.includes('socc') || name.includes('foot') || id == 1010 || id == 90013) {
                console.log('⚽ [SOCCER_DEBUG] Actividad sospechosa encontrada en RAW:', { name, id, duration: act.duration, date: act.startTime });
            }
        });

        // --- NUEVO MOTOR DE NORMALIZACIÓN ---
        const normalizedActivities = normalizer.normalizeActivities(providerName, rawActivities);

        // DEBUG: Ver resultado de la normalización para el fútbol
        normalizedActivities.forEach(act => {
            if (act.sportKey === 'football_soccer' || act.name.toLowerCase().includes('fútbol')) {
                console.log('✅ [SOCCER_DEBUG] Actividad NORMALIZADA correctamente:', { sportKey: act.sportKey, name: act.name, duration: act.duration });
            }
        });

        debugLog(`✨ ${normalizedActivities.length} actividades NORMALIZADAS por Motor Universal`);
        // ------------------------------------

        // Categorizar actividades (Mantener lógica de categorización por ahora)
        const categorized = categorizeActivities(normalizedActivities);

        // Obtener métricas del día actual (para el dashboard)
        const today = new Date();
        let todayMetrics = {};

        try {
            debugLog('📊 Obteniendo métricas del día...');
            const [steps, calories, sleep, heartRate] = await Promise.all([
                provider.getSteps(today).catch(e => { console.warn('Error getting steps:', e); return 0; }),
                provider.getCalories(today).catch(e => { console.warn('Error getting calories:', e); return 0; }),
                provider.getSleep(today).catch(e => { console.warn('Error getting sleep:', e); return null; }),
                provider.getHeartRate(today).catch(e => { console.warn('Error getting heart rate:', e); return null; })
            ]);

            todayMetrics = {
                steps,
                calories,
                sleep,
                heartRate,
                date: today
            };

            debugLog('✅ Métricas del día obtenidas:', todayMetrics);
        } catch (error) {
            console.error('Error obteniendo métricas del día:', error);
        }

        let sleepHistory = [];
        try {
            if (typeof provider.getSleepRange === 'function') {
                debugLog('💤 Obteniendo historial de sueño...');
                sleepHistory = await provider.getSleepRange(startDate, endDate);
                debugLog(`✅ ${sleepHistory.length} registros de sueño obtenidos`);
            }
        } catch (e) {
            console.warn('Error fetching sleep history:', e);
        }

        // NEW: Totales Diarios Reales (Pasos, Cal, Dist)
        let dailyTotals = [];
        try {
            if (typeof provider.getDailyTotalsRange === 'function') {
                debugLog('📊 Obteniendo totales diarios reales (TMB + Actividad)...');
                dailyTotals = await provider.getDailyTotalsRange(startDate, endDate);
                debugLog(`✅ ${dailyTotals.length} registros de totales diarios obtenidos`);
            }
        } catch (e) {
            console.warn('Error fetching daily totals:', e);
        }

        debugLog('✅ Datos sincronizados y normalizados', {
            total: normalizedActivities.length,
            sports: categorized.sports.length,
            mindfulness: categorized.mindfulness.length,
            todayMetrics: todayMetrics,
            sleepHistory: sleepHistory.length,
            dailyTotals: dailyTotals.length
        });

        // 💾 NUEVO: Guardar actividades en Firestore para persistencia
        try {
            const { syncActivities } = await import('./activityPersistence.js');
            const persistedActivities = await syncActivities(normalizedActivities);

            // Actualizar AppState con actividades persistidas
            AppState.activities = persistedActivities;

            console.log(`💾 Activities persisted: ${persistedActivities.length} total`);
        } catch (error) {
            console.warn('⚠️ Error persisting activities:', error);
            // Si falla la persistencia, al menos mantener en memoria
            AppState.activities = normalizedActivities;
        }

        // 🎯 Actualizar progreso de desafíos automáticamente
        try {
            const { updateAllChallengesProgress } = await import('./challengeProgressSync.js');
            await updateAllChallengesProgress();
        } catch (error) {
            console.warn('⚠️ Error updating challenges progress:', error);
        }

        return {
            raw: rawActivities,
            normalized: normalizedActivities,
            categorized: categorized,
            todayMetrics: todayMetrics,
            sleepHistory: sleepHistory,
            dailyTotals: dailyTotals,
            provider: providerName,
            syncTime: new Date()
        };
    } catch (error) {
        console.error(`❌ Error sincronizando con ${providerName}:`, error);
        throw error;
    }
}

/**
 * Normalizar actividades usando el diccionario maestro
 * @param {Array} rawActivities - Actividades raw del proveedor
 * @param {String} providerName - Nombre del proveedor (fitbit, googleFit, etc.)
 * @returns {Array} Actividades normalizadas
 */
function normalizeActivitiesData(rawActivities, providerName) {
    return rawActivities.map(activity => {
        // Obtener ID de actividad según el proveedor
        let activityId;
        if (providerName === 'fitbit') {
            activityId = activity.rawData?.activityTypeId || activity.type;
        } else if (providerName === 'googleFit') {
            activityId = activity.type || activity.activityType;
        } else {
            activityId = activity.type;
        }

        // Consultar diccionario maestro
        const sport = getSportByPlatformId(providerName, activityId);

        if (!sport) {
            debugLog(`⚠️ Deporte no encontrado: ${activityId} en ${providerName}`);
            // Fallback a datos raw
            return {
                ...activity,
                sportKey: 'other',
                sportName: activity.name || `Actividad ${activityId}`,
                category: 'other',
                normalized: false
            };
        }

        debugLog(`✅ ${activityId} → ${sport.key} (${normalizeSportName(providerName, activityId)})`);

        return {
            ...activity,
            sportKey: sport.key,
            sportName: normalizeSportName(providerName, activityId),
            category: determineCategoryFromSport(sport),
            icon: getIconForSport(sport.key),
            color: getColorForSport(sport.key),
            normalized: true
        };
    });
}

/**
 * Categorizar actividades según su tipo
 * @param {Array} activities - Actividades normalizadas
 * @returns {Object} Actividades categorizadas
 */
function categorizeActivities(activities) {
    const categorized = {
        sports: [],        // Para "Mis Deportes"
        mindfulness: [],   // Para "Bienestar Emocional"
        sleep: [],         // Para "Sueño"
        breathing: []      // Para "Respiración"
    };

    activities.forEach(activity => {
        const category = activity.category;

        // Sleep y breathing solo van a sus secciones específicas
        if (category === 'sleep') {
            categorized.sleep.push(activity);
            return;
        }

        if (category === 'breathing') {
            categorized.breathing.push(activity);
            return;
        }

        // Mindfulness va a deportes Y bienestar
        if (category === 'mindfulness') {
            categorized.sports.push(activity);
            categorized.mindfulness.push(activity);
            return;
        }

        // Todo lo demás va solo a deportes
        categorized.sports.push(activity);
    });

    return categorized;
}

/**
 * Determinar categoría desde objeto sport
 */
function determineCategoryFromSport(sport) {
    // Mapeo de categorías del diccionario a categorías de Wellnessfy
    const categoryMap = {
        'cardio': 'cardio',
        'strength': 'strength',
        'mindfulness': 'mindfulness',
        'team': 'team',
        'water': 'water',
        'outdoor': 'outdoor',
        'combat': 'combat',
        'racket': 'racket',
        'winter': 'winter',
        'intensity': 'intensity',
        'fun': 'fun',
        'other': 'other'
    };

    return categoryMap[sport.category] || 'other';
}

/**
 * Obtener ícono para un deporte
 */
function getIconForSport(sportKey) {
    const iconMap = {
        'yoga': 'self_improvement',
        'running': 'directions_run',
        'walking': 'directions_walk',
        'biking': 'directions_bike',
        'swimming': 'pool',
        'strength_training': 'fitness_center',
        'meditation': 'psychiatry',
        // Agregar más según necesidad
    };

    return iconMap[sportKey] || 'sports_tennis';
}

/**
 * Obtener color para un deporte
 */
function getColorForSport(sportKey) {
    const colorMap = {
        'yoga': '#a29bfe',
        'running': '#ff6b6b',
        'walking': '#00ff9d',
        'biking': '#4ecdc4',
        'swimming': '#00d2ff',
        'strength_training': '#ff9f43',
        'meditation': '#b19cd9',
        // Agregar más según necesidad
    };

    return colorMap[sportKey] || '#95a5a6';
}

/**
 * Cambiar proveedor de salud activo
 * @param {String} providerName - Nombre del proveedor (fitbit, googleFit, etc.)
 */
export async function switchHealthProvider(providerName) {
    debugLog(`🔄 Cambiando a proveedor: ${providerName}`);

    // Verificar si está habilitado
    if (!isProviderEnabled(providerName)) {
        throw new Error(`Proveedor ${providerName} no está habilitado`);
    }

    // Cambiar proveedor
    await healthProviderManager.setActiveProvider(providerName);

    // Guardar preferencia
    localStorage.setItem('selectedHealthProvider', providerName);

    debugLog(`✅ Proveedor cambiado a: ${providerName}`);

    return providerName;
}

/**
 * Conectar y autenticar con un proveedor de salud (Uso desde UI)
 * @param {String} providerName - Nombre del proveedor
 * @param {boolean} forceNewConnection - Forzar re-autenticación aunque exista token
 */
export async function connectHealthProvider(providerName, forceNewConnection = false) {
    debugLog(`🔌 Conectando proveedor: ${providerName} (Forzar: ${forceNewConnection})`);

    // Verificar si está habilitado
    if (!isProviderEnabled(providerName)) {
        throw new Error(`Proveedor ${providerName} no está habilitado`);
    }

    // 1. Establecer como activo temporalmente
    await healthProviderManager.setActiveProvider(providerName);
    const provider = healthProviderManager.getActiveProvider();

    // 2. Verificar si requiere auth y si necesitamos autenticar
    if (provider.requiresOAuth) {
        if (forceNewConnection || !provider.hasValidToken()) {
            debugLog(`🔐 Autenticación requerida para ${providerName}`);

            // Si forzamos, hacemos logout interno primero para limpiar cualquier estado parcial
            if (forceNewConnection && typeof provider.logout === 'function') {
                provider.logout();
            }

            try {
                await provider.authenticate();
                debugLog(`✅ Autenticación exitosa con ${providerName}`);
            } catch (error) {
                console.error(`❌ Error autenticando con ${providerName}:`, error);

                // Si falla la autenticación, revertimos al proveedor anterior guardado
                // Solo si el anterior era diferente al actual que falló
                const savedProvider = localStorage.getItem('selectedHealthProvider');
                if (savedProvider && savedProvider !== providerName) {
                    await healthProviderManager.setActiveProvider(savedProvider);
                } else if (!savedProvider) {
                    // Si no había ninguno guardado, quizás deseleccionar todo en UI
                    // Pero aquí solo gestionamos lógica interna
                }

                throw error;
            }
        } else {
            debugLog(`✅ Proveedor ${providerName} ya tiene token válido`);
        }
    }

    // 3. Guardar preferencia (solo si se conectó exitosamente)
    localStorage.setItem('selectedHealthProvider', providerName);
    debugLog(`✅ Proveedor guardado como activo: ${providerName}`);

    // Disparar evento global para UI reactiva
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('healthProviderChanged', {
            detail: { provider: providerName }
        }));
    }

    return true;
}

// Obtener nombre del proveedor activo
export function getActiveProviderName() {
    const provider = healthProviderManager.getActiveProvider();
    return provider ? provider.name : null;
}

// Exponer funciones globalmente para acceso desde HTML/UI
if (typeof window !== 'undefined') {
    window.syncHealthData = syncHealthData;
    window.switchHealthProvider = switchHealthProvider;
    window.getActiveProviderName = getActiveProviderName;
    window.initializeHealthProvider = initializeHealthProvider;
    window.connectHealthProvider = connectHealthProvider;
    window.healthProviderManager = healthProviderManager; // Exponer manager para logout

    /**
     * Handler global para los toggles de salud
     * Centraliza la lógica de conexión/desconexión para todas las páginas
     */
    window.handleGlobalProviderToggle = async function (providerId, isChecked) {
        console.log(`🔌 Global Health Toggle: ${providerId} -> ${isChecked}`);
        const { AppState } = await import('./state.js');

        if (!isChecked) {
            // ELIMINADO confirm() que fallaba. Desconexión directa por ahora.
            console.log(`🛑 Desconectando proveedor: ${providerId}`);

            // Limpiar todas las huellas de conexión
            localStorage.removeItem('selectedHealthProvider');
            localStorage.removeItem('active_health_provider');
            localStorage.removeItem(`${providerId}_access_token`);
            localStorage.removeItem(`${providerId}_token`);

            if (window.healthProviderManager) {
                window.healthProviderManager.logoutProvider(providerId);
                // Asegurar que el manager realmente no tenga activo nada
                window.healthProviderManager.activeProvider = null;
            }

            if (window.showToast) window.showToast(`Desconectado de ${providerId}`, 'info');
        } else {
            try {
                if (window.showToast) window.showToast(`Conectando con ${providerId}...`, 'info');
                await connectHealthProvider(providerId, true);
                if (window.showToast) window.showToast(`Conectado a ${providerId}`, 'success');
            } catch (error) {
                console.error('Error connecting provider:', error);
                if (window.showToast) window.showToast(`Error: ${error.message}`, 'error');
            }
        }

        // RE-RENDER OBLIGATORIO PARA ACTUALIZAR DASHBOARD Y SWITCHES
        const page = AppState.currentPage;
        const main = document.getElementById('mainContent');

        if (main) {
            console.log(`🔄 Refrescando vista tras cambio de salud: ${page}`);
            if (page === 'settings') {
                const { renderSettingsPage } = await import('../pages/settings.js');
                main.innerHTML = renderSettingsPage();
            } else if (page === 'profile') {
                const { renderProfilePage } = await import('../pages/profile.js');
                main.innerHTML = await renderProfilePage();
            } else if (page === 'activity') {
                const { renderActivity } = await import('../pages/activity.js');
                main.innerHTML = renderActivity();
            }
        }
    };
}
