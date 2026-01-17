/**
 * 🏃 Fitbit Provider
 * Integración con Fitbit Web API v1.2
 * Documentación: https://dev.fitbit.com/build/reference/web-api/
 */

import { HealthProvider } from './HealthProviderInterface.js';
import { HEALTH_PROVIDERS_CONFIG, debugLog } from '../../config/features.js';

export class FitbitProvider extends HealthProvider {
    constructor() {
        super('fitbit');

        // Cargar configuración desde features.js
        const config = HEALTH_PROVIDERS_CONFIG.fitbit;

        if (!config.enabled) {
            debugLog('⚠️ Fitbit provider está deshabilitado en features.js');
        }

        // Configuración OAuth 2.0
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.redirectUri = config.redirectUri;
        this.scope = config.scope;
        this.requiresOAuth = config.requiresOAuth; // <--- ERROR CORREGIDO: Esto faltaba

        // Endpoints de Fitbit API
        this.baseUrl = 'https://api.fitbit.com/1';
        this.authUrl = 'https://www.fitbit.com/oauth2/authorize';
        this.tokenUrl = 'https://api.fitbit.com/oauth2/token';

        // Firebase Cloud Function Proxy (soluciona CORS)
        this.proxyUrl = 'https://us-central1-wellnessfy-cbc1b.cloudfunctions.net/fitbitProxy';

        // Cargar token si existe
        this.loadToken();

        debugLog('Fitbit Provider inicializado', {
            clientId: this.clientId.substring(0, 6) + '...',
            redirectUri: this.redirectUri
        });
    }

    /**
     * Iniciar flujo de autenticación OAuth 2.0
     */
    /**
     * Iniciar flujo de autenticación OAuth 2.0 (Implicit Flow)
     */
    async authenticate() {
        console.log('🔐 Iniciando autenticación con Fitbit (Implicit Flow)...');

        // Generar state para seguridad
        const state = this.generateRandomString(16);
        localStorage.setItem('fitbit_oauth_state', state);

        // Construir URL de autorización
        const authParams = new URLSearchParams({
            client_id: this.clientId,
            response_type: 'token',
            scope: this.scope,
            redirect_uri: this.redirectUri,
            state: state,
            expires_in: '2592000' // 30 días
        });

        const authorizationUrl = `${this.authUrl}?${authParams.toString()}`;

        // Abrir ventana de autorización
        const width = 500;
        const height = 700;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popup = window.open(
            authorizationUrl,
            'Fitbit Authorization',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!popup) {
            return Promise.reject(new Error('Popup bloqueado. Por favor permite popups para este sitio.'));
        }

        // Esperar respuesta via postMessage (opener) O storage (backup)
        return new Promise((resolve, reject) => {
            const cleanup = () => {
                window.removeEventListener('message', handleMessage);
                window.removeEventListener('storage', handleStorage);
                clearInterval(checkClosed);
            };

            const processAuthData = (data) => {
                const { token, state: returnedState, userId } = data;

                // Verificar state anti-CSRF
                const savedState = localStorage.getItem('fitbit_oauth_state');
                if (returnedState !== savedState) {
                    console.error('State mismatch', { sent: savedState, received: returnedState });
                    cleanup();
                    popup.close();
                    reject(new Error('Error de seguridad: Estado inválido (CSRF)'));
                    return;
                }

                console.log('✅ Token recibido de Fitbit');
                this.saveToken(token, 2592000, userId); // Guardar token

                cleanup();
                // Opcional: Cerrar popup si no se cerró solo
                // popup.close();

                resolve(true);
            };

            // Handler 1: PostMessage
            const handleMessage = (event) => {
                if (event.data?.type === 'FITBIT_AUTH_SUCCESS') {
                    debugLog('📩 Auth recibida por postMessage');
                    processAuthData(event.data);
                }
            };

            // Handler 2: LocalStorage (Backup)
            const handleStorage = (event) => {
                if (event.key === 'fitbit_pending_auth' && event.newValue) {
                    debugLog('💾 Auth detectada en localStorage');
                    try {
                        const data = JSON.parse(event.newValue);
                        if (data.type === 'FITBIT_AUTH_SUCCESS') {
                            // Limpiar inmediatamente
                            localStorage.removeItem('fitbit_pending_auth');
                            processAuthData(data);
                        }
                    } catch (e) { console.error(e); }
                }
            };

            window.addEventListener('message', handleMessage);
            window.addEventListener('storage', handleStorage);

            // Detectar cierre manual de la ventana
            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    // Dar un pequeño margen por si el storage event llega justo al cerrar
                    setTimeout(() => {
                        if (!this.isAuthenticated) {
                            cleanup();
                            console.warn('Usuario cerró el popup de Fitbit sin terminar');
                            reject(new Error('Autenticación cancelada por el usuario'));
                        }
                    }, 500);
                }
            }, 1000);
        });
    }

    /**
     * Guardar token y sesión
     */
    saveToken(token, expiresInSeconds, userId) {
        this.accessToken = token;
        this.token = token; // Sincronizar con clase base
        this.isAuthenticated = true;

        const expiryTime = Date.now() + (expiresInSeconds * 1000);

        localStorage.setItem('fitbit_access_token', token);
        localStorage.setItem('fitbit_token_expiry', expiryTime);
        if (userId) localStorage.setItem('fitbit_user_id', userId);

        debugLog('💾 Token Fitbit guardado. Expira:', new Date(expiryTime).toLocaleString());
    }

    /**
     * Cargar token desde localStorage
     * (Sobrescribe método de HealthProvider para usar las keys correctas)
     */
    loadToken() {
        const token = localStorage.getItem('fitbit_access_token');
        const expiry = localStorage.getItem('fitbit_token_expiry');

        if (token && expiry) {
            const now = Date.now();
            if (now < parseInt(expiry)) {
                this.accessToken = token;
                this.token = token; // Sincronizar con clase base
                this.isAuthenticated = true;
                debugLog('✅ Token Fitbit cargado de memoria');
                return true;
            } else {
                debugLog('⚠️ Token Fitbit expirado en memoria');
            }
        }
        return false;
    }

    /**
     * Intercambiar código de autorización por access token
     */
    async exchangeCodeForToken(code) {
        const tokenParams = new URLSearchParams({
            client_id: this.clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri
        });

        // Crear header de autenticación básica
        const credentials = btoa(`${this.clientId}:${this.clientSecret}`);

        const response = await fetch(this.tokenUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams.toString()
        });

        if (!response.ok) {
            throw new Error('Failed to exchange code for token');
        }

        const data = await response.json();

        this.token = data.access_token;
        this.refreshToken = data.refresh_token;
        this.isAuthenticated = true;

        // Guardar tokens
        this.saveToken();
        localStorage.setItem('fitbit_refresh_token', this.refreshToken);

        console.log('✅ Autenticación con Fitbit exitosa');
    }

    /**
     * Obtener actividades en un rango de fechas
     */
    async getActivities(startDate, endDate) {
        if (!this.hasValidToken()) {
            throw new Error('Not authenticated with Fitbit');
        }

        console.log('📊 Obteniendo actividades de Fitbit...');

        const activities = [];
        const currentDate = new Date(startDate);

        // Iterar por cada día en el rango
        while (currentDate <= endDate) {
            const dateStr = this.formatDate(currentDate);

            try {
                const dayActivities = await this.getActivitiesForDate(dateStr);
                // Inject date context because Fitbit API often returns time without date
                dayActivities.forEach(act => act._parentDate = dateStr);
                activities.push(...dayActivities);
            } catch (error) {
                console.error(`Error obteniendo actividades para ${dateStr}:`, error);
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        console.log(`✅ ${activities.length} actividades obtenidas de Fitbit`);
        return activities.map(a => this.normalizeActivity(a));
    }

    /**
     * Obtener actividades de un día específico
     * Usa proxy CORS temporal para desarrollo
     */
    async getActivitiesForDate(dateStr) {
        const fitbitUrl = `${this.baseUrl}/user/-/activities/date/${dateStr}.json`;

        // TEMPORAL: Usar proxy CORS público mientras se activa Firebase Functions
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fitbitUrl)}`;

        console.log(`🔄 Solicitando actividades vía CORS proxy para: ${dateStr}`);

        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.error('Fitbit API error:', response.status, errorText);
            throw new Error(`Fitbit API error: ${response.status}`);
        }

        const data = await response.json();
        return data.activities || [];
    }

    /**
     * Obtener pasos de un día
     */
    async getSteps(date) {
        const dateStr = this.formatDate(date);
        const fitbitUrl = `${this.baseUrl}/user/-/activities/steps/date/${dateStr}/1d.json`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fitbitUrl)}`;

        const response = await fetch(proxyUrl, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) return 0;
        const data = await response.json();
        return parseInt(data['activities-steps']?.[0]?.value || 0);
    }

    /**
     * Obtener frecuencia cardíaca
     */
    async getHeartRate(date) {
        const dateStr = this.formatDate(date);
        const fitbitUrl = `${this.baseUrl}/user/-/activities/heart/date/${dateStr}/1d.json`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fitbitUrl)}`;

        const response = await fetch(proxyUrl, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) return { resting: null, zones: [] };
        const data = await response.json();
        const heartData = data['activities-heart']?.[0]?.value;

        return {
            resting: heartData?.restingHeartRate || null,
            zones: heartData?.heartRateZones || []
        };
    }

    /**
     * Obtener datos de sueño para una fecha específica (Single Date)
     */
    /**
     * Obtener datos de sueño para una fecha específica (Single Date)
     */
    async getSleep(date) {
        const dateStr = this.formatDate(date);
        // Note: Fitbit Sleep API often typically uses v1.2, but v1 works for basic summary
        const fitbitUrl = `https://api.fitbit.com/1.2/user/-/sleep/date/${dateStr}.json`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fitbitUrl)}`;

        const response = await fetch(proxyUrl, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        const data = await response.json();
        const sleep = data.sleep?.[0];

        if (!sleep) return null;

        // Calcular Sueño Real (Restando tiempo despierto)
        // La API v1.2 suele devolver 'minutesAsleep' directamente, que es lo más preciso.
        // Si no, calculamos (duration - wake).
        let realMinutes = 0;
        if (sleep.minutesAsleep) {
            realMinutes = sleep.minutesAsleep; // Preferencia 1: Dato directo de Fitbit
        } else {
            const totalMinutes = sleep.duration / 60000;
            const wakeMinutes = sleep.levels?.summary?.wake?.minutes || 0;
            realMinutes = Math.max(0, totalMinutes - wakeMinutes);
        }

        return {
            duration: realMinutes, // Guardamos minutos reales de sueño
            timeInBed: sleep.timeInBed || (sleep.duration / 60000), // Dato extra por si acaso
            efficiency: sleep.efficiency,
            stages: {
                deep: sleep.levels?.summary?.deep?.minutes || 0,
                light: sleep.levels?.summary?.light?.minutes || 0,
                rem: sleep.levels?.summary?.rem?.minutes || 0,
                wake: sleep.levels?.summary?.wake?.minutes || 0
            }
        };
    }

    /**
     * Obtener datos de sueño para un rango de fechas
     * @param {Date} startDate 
     * @param {Date} endDate 
     */
    async getSleepRange(startDate, endDate) {
        if (!this.hasValidToken()) return [];

        const startStr = this.formatDate(startDate);
        const endStr = this.formatDate(endDate);

        // Fitbit API v1.2 soporta rangos
        const fitbitUrl = `https://api.fitbit.com/1.2/user/-/sleep/date/${startStr}/${endStr}.json`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fitbitUrl)}`;

        console.log(`💤 Solicitando sueño (Rango) para: ${startStr} a ${endStr}`);

        try {
            const response = await fetch(proxyUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                console.warn('Error fetching sleep range:', response.status);
                return [];
            }

            const data = await response.json();
            const sleepLogs = data.sleep || [];

            // Procesar y normalizar logs de sueño
            // Puede haber múltiples logs por día (siestas), los agrupamos por fecha
            const dailySleepMap = {};

            sleepLogs.forEach(log => {
                const date = log.dateOfSleep;
                if (!dailySleepMap[date]) {
                    dailySleepMap[date] = { duration: 0, date: date };
                }

                // Calcular Sueño Real EN HORAS
                let realHours = 0;
                if (log.minutesAsleep) {
                    realHours = log.minutesAsleep / 60;
                } else {
                    const totalMinutes = log.duration / 60000;
                    const wakeMinutes = log.levels?.summary?.wake?.minutes || 0;
                    realHours = Math.max(0, totalMinutes - wakeMinutes) / 60;
                }

                dailySleepMap[date].duration += realHours;
            });

            // Convertir a array
            return Object.values(dailySleepMap);

        } catch (error) {
            console.error('Error in getSleepRange:', error);
            return [];
        }
    }

    /**
     * Obtener calorías quemadas
     */
    async getCalories(date) {
        const dateStr = this.formatDate(date);
        const fitbitUrl = `${this.baseUrl}/user/-/activities/calories/date/${dateStr}/1d.json`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(fitbitUrl)}`;

        const response = await fetch(proxyUrl, {
            headers: {
                'Authorization': `Bearer ${this.token}`
            }
        });

        if (!response.ok) return 0;
        const data = await response.json();
        return parseInt(data['activities-calories']?.[0]?.value || 0);
    }

    /**
     * Normalizar actividad de Fitbit al formato de Wellnessfy
     */
    normalizeActivity(fitbitActivity) {
        // Corrección de mapeo de campos basado en diagnóstico
        const activityTypeId = fitbitActivity.activityId || fitbitActivity.activityTypeId; // API usa activityId
        const activityName = fitbitActivity.name || fitbitActivity.activityName || fitbitActivity.activityParentName; // API usa name

        return {
            id: `fitbit_${fitbitActivity.logId}`,
            name: activityName,
            type: this.mapActivityType(activityTypeId),
            startTime: this.parseFitbitDate(fitbitActivity.startTime, fitbitActivity._parentDate),
            endTime: new Date(this.parseFitbitDate(fitbitActivity.startTime, fitbitActivity._parentDate).getTime() + fitbitActivity.duration),
            duration: fitbitActivity.duration / 60000, // ms a minutos
            distance: (fitbitActivity.distance || 0) / 1000, // metros a km
            calories: fitbitActivity.calories || 0,
            heartRate: fitbitActivity.averageHeartRate ? {
                avg: fitbitActivity.averageHeartRate,
                min: null,
                max: null
            } : null,
            source: 'fitbit',
            rawData: fitbitActivity
        };
    }

    /**
     * Mapear Activity Type ID de Fitbit a tipo estándar
     */
    mapActivityType(activityTypeId) {
        const typeMap = {
            90009: 'running',
            90013: 'walking',
            1071: 'cycling',
            15000: 'yoga',
            2050: 'strength_training',
            3000: 'swimming',
            // Agregar más según necesidad
        };

        return typeMap[activityTypeId] || 'other';
    }

    /**
     * Cerrar sesión y limpiar tokens
     */
    logout() {
        debugLog('👋 Cerrando sesión de Fitbit...');
        localStorage.removeItem('fitbit_access_token');
        localStorage.removeItem('fitbit_refresh_token');
        localStorage.removeItem('fitbit_user_id');
        localStorage.removeItem('fitbit_token_expiry');
        this.accessToken = null;
        this.refreshToken = null;
    }

    /**
     * Formatear fecha para API de Fitbit (YYYY-MM-DD)
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Helper para parsear fechas de Fitbit que pueden venir solo como hora
     */
    parseFitbitDate(timeStr, parentDateStr) {
        // Si no hay timeStr, usar parentDateStr (asumir actividad de todo el día o inicio del día)
        if (!timeStr) {
            return parentDateStr ? new Date(parentDateStr + 'T00:00:00') : new Date();
        }

        // Si ya es una fecha completa ISO, usarla directamente
        if (timeStr.includes('T')) {
            return new Date(timeStr);
        }

        // Si es solo hora (HH:MM o HH:MM:SS) y tenemos fecha padre
        if (parentDateStr) {
            // Asegurar formato HH:MM:SS
            const fullTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
            // Construir ISO string manualmente para evitar interpretación de zona horaria errónea
            // Asumimos que la fecha/hora entregada por Fitbit es "Local" del usuario
            return new Date(`${parentDateStr}T${fullTime}`);
        }

        // Fallback inseguro (usará fecha de hoy + hora dada)
        return new Date(`${new Date().toISOString().split('T')[0]}T${timeStr}`);
    }

    /**
     * Generar string aleatorio para OAuth state
     */
    generateRandomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}

// Exportar instancia singleton
export const fitbitProvider = new FitbitProvider();
