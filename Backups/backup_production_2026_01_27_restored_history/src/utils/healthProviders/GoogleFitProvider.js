
/**
 * 🏥 Google Fit Provider
 * Implementación completa del proveedor de salud para Google Fit
 */

import { HealthProvider } from './HealthProviderInterface.js';
import { requestGoogleSync } from '../googleHealth.js';

export class GoogleFitProvider extends HealthProvider {
    constructor() {
        super('googleFit');
        this.id = 'googleFit';
        this.requiresOAuth = true;
        this.baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
        this.loadToken();
        this.name = 'Google Fit'; // Nombre legible para UI
    }

    /**
     * Cargar token desde el sistema legacy
     */
    loadToken() {
        const token = localStorage.getItem('google_health_token');
        const expiry = localStorage.getItem('google_health_token_expiry');

        if (token && expiry) {
            const isExpired = Date.now() >= parseInt(expiry);
            console.log(`[GoogleFit] Token encontrado. Expira en: ${new Date(parseInt(expiry)).toLocaleTimeString()}. ¿Expirado?: ${isExpired}`);

            if (!isExpired) {
                this.token = token;
                this.isAuthenticated = true;
                return true;
            }
        }
        console.warn('[GoogleFit] Token no encontrado o expirado');
        this.isAuthenticated = false;
        return false;
    }

    hasValidToken() {
        return this.loadToken();
    }

    /**
     * Autenticación (Usa el flujo legacy que ya funciona)
     */
    async authenticate() {
        console.log('🔐 Iniciando autenticación con Google Fit...');

        return new Promise((resolve, reject) => {
            // Activar el flujo legacy de googleHealth.js
            requestGoogleSync();

            // Polling para detectar cuando se guarde el token
            let attempts = 0;
            const checkInterval = setInterval(() => {
                attempts++;
                if (this.loadToken()) {
                    clearInterval(checkInterval);
                    resolve(true);
                }
                if (attempts > 120) { // 2 minutos timeout
                    clearInterval(checkInterval);
                    reject(new Error('Timeout esperando autenticación de Google'));
                }
            }, 1000);
        });
    }

    /**
     * Obtener actividades (Dataset aggregate)
     */
    async getActivities(startDate, endDate) {
        if (!this.hasValidToken()) throw new Error('AUTH_ERROR: No autenticado con Google Fit');

        console.log('📊 [GoogleFit] Solicitando actividades...');

        const body = {
            "aggregateBy": [{ "dataTypeName": "com.google.activity.segment" }],
            "bucketByTime": { "durationMillis": 86400000 },
            "startTimeMillis": startDate.getTime(),
            "endTimeMillis": endDate.getTime()
        };

        const response = await fetch(`${this.baseUrl}/dataset:aggregate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) throw new Error(`Google Fit API Error: ${response.status}`);

        const data = await response.json();
        const activities = [];

        if (data.bucket) {
            data.bucket.forEach(bucket => {
                const dataset = bucket.dataset[0];
                if (dataset && dataset.point) {
                    dataset.point.forEach(point => {
                        const typeId = point.value[0].intVal;
                        // Omitir actividades pasivas o irrelevantes (ej: en vehículo = 0, quieto = 3)
                        if (typeId === 0 || typeId === 3) return;

                        activities.push({
                            activityType: typeId,
                            duration: point.value[1]?.intVal || 0, // ms, el normalizador lo dividirá
                            startTime: new Date(Number(BigInt(point.startTimeNanos) / 1000000n)),
                            endTime: new Date(Number(BigInt(point.endTimeNanos) / 1000000n)),
                            calories: 0,
                            steps: 0
                        });
                    });
                }
            });
        }

        return activities;
    }

    /**
     * Métricas individuales
     */
    async getSteps(date) {
        const data = await this._getAggregate(date, "com.google.step_count.delta");
        return data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.intVal || 0;
    }

    async getCalories(date) {
        const data = await this._getAggregate(date, "com.google.calories.expended");
        return Math.round(data.bucket?.[0]?.dataset?.[0]?.point?.[0]?.value?.[0]?.fpVal || 0);
    }

    async getHeartRate(date) {
        const data = await this._getAggregate(date, "com.google.heart_rate.bpm");
        const point = data.bucket?.[0]?.dataset?.[0]?.point?.[0];
        if (!point) return null;
        return Math.round(point.value[0].fpVal); // Retornar solo el promedio para el dashboard
    }

    /**
     * Obtener datos de sueño para una fecha específica (Single Date)
     * Mejorado para ser consistente con el Motor V2
     */
    async getSleep(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        // Usar la lógica de rango para un solo día para mayor precisión
        const sleepData = await this.getSleepRange(start, end);

        if (sleepData && sleepData.length > 0) {
            // Buscar el registro que coincida con la fecha solicitada
            const targetDateStr = start.toISOString().split('T')[0];
            const dayEntry = sleepData.find(d => d.date === targetDateStr) || sleepData[0];

            return {
                duration: Math.round(dayEntry.duration * 60),
                date: dayEntry.date
            };
        }

        return null;
    }

    /**
     * Obtener datos de sueño para un rango de fechas (Motor V2)
     * Implementación robusta basada en sesiones y segmentos detallados
     */
    async getSleepRange(startDate, endDate) {
        if (!this.hasValidToken()) return [];

        console.log(`💤 [GoogleFit] Solicitando sueño (Rango): ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`);

        try {
            // 1. Obtener sesiones de sueño (activityType=72)
            const sessionsUrl = `${this.baseUrl}/sessions?startTime=${startDate.toISOString()}&endTime=${endDate.toISOString()}&activityType=72`;
            const response = await fetch(sessionsUrl, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });

            if (!response.ok) throw new Error(`Google Fit Sessions Error: ${response.status}`);
            const data = await response.json();

            if (!data.session || data.session.length === 0) return [];

            // 2. Para cada sesión, obtener sus segmentos detallados para calcular el sueño "real"
            const dailySleepMap = {};

            // Fuentes de datos para segmentos de sueño (orden de prioridad)
            const dataSourceIds = [
                'derived:com.google.sleep.segment:merged',
                'derived:com.google.sleep.segment:com.google.android.gms:merged',
                'raw:com.google.sleep.segment:com.fitbit.FitbitMobile:'
            ];

            const segmentPromises = data.session.map(async (session) => {
                const startNanos = parseInt(session.startTimeMillis) * 1000000;
                const endNanos = parseInt(session.endTimeMillis) * 1000000;
                let sessionSleepMillis = 0;
                let foundSegments = false;

                // Intentar cada data source
                for (const dsId of dataSourceIds) {
                    try {
                        const segResp = await fetch(
                            `${this.baseUrl}/dataSources/${dsId}/datasets/${startNanos}-${endNanos}`,
                            { headers: { 'Authorization': `Bearer ${this.token}` } }
                        );
                        const segData = await segResp.json();

                        if (segData.point && segData.point.length > 0) {
                            segData.point.forEach(p => {
                                const type = p.value[0].intVal;
                                // 1=Awake, 2=Sleep (General), 3=Out-of-bed, 4=Light, 5=Deep, 6=REM
                                // Excluimos 1 (Awake) y 3 (Out-of-bed)
                                if (type !== 1 && type !== 3) {
                                    const pStart = Number(BigInt(p.startTimeNanos) / 1000000n);
                                    const pEnd = Number(BigInt(p.endTimeNanos) / 1000000n);
                                    sessionSleepMillis += (pEnd - pStart);
                                }
                            });
                            foundSegments = true;
                            break; // Encontramos datos válidos, no seguir con otros data sources
                        }
                    } catch (e) { continue; }
                }

                // Fallback: Si no hay segmentos, usar la duración total de la sesión (menos preciso)
                if (!foundSegments) {
                    sessionSleepMillis = parseInt(session.endTimeMillis) - parseInt(session.startTimeMillis);
                }

                // Agrupar por la fecha en que terminó el sueño (despertar)
                const wakeUpDate = new Date(parseInt(session.endTimeMillis));
                const dateKey = wakeUpDate.toISOString().split('T')[0];

                if (!dailySleepMap[dateKey]) dailySleepMap[dateKey] = 0;
                dailySleepMap[dateKey] += (sessionSleepMillis / (1000 * 60 * 60)); // Acumular en HORAS
            });

            await Promise.all(segmentPromises);

            // Convertir el mapa a un array en el formato esperado
            return Object.keys(dailySleepMap).map(date => ({
                date: date,
                duration: dailySleepMap[date] // Horas decimales
            }));

        } catch (error) {
            console.error('❌ Error en GoogleFit getSleepRange:', error);
            return [];
        }
    }

    /**
     * Obtener totales diarios para un rango (Nuevo para el Motor V2)
     */
    async getActivitiesRange(startDate, endDate) {
        return this.getActivities(startDate, endDate);
    }

    /**
     * Obtener totales diarios para un rango (Nuevo para el Motor V2)
     */
    async getDailyTotalsRange(startDate, endDate) {
        const body = {
            "aggregateBy": [
                { "dataTypeName": "com.google.step_count.delta" },
                { "dataTypeName": "com.google.calories.expended" },
                { "dataTypeName": "com.google.distance.delta" },
                { "dataTypeName": "com.google.active_minutes" } // Try fetching active minutes too if available
            ],
            "bucketByTime": { "durationMillis": 86400000 },
            "startTimeMillis": startDate.getTime(),
            "endTimeMillis": endDate.getTime()
        };

        const response = await fetch(`${this.baseUrl}/dataset:aggregate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) return [];
        const data = await response.json();

        return data.bucket.map(b => {
            const d = new Date(parseInt(b.startTimeMillis));
            const dateStr = d.toISOString().split('T')[0]; // Return YYYY-MM-DD string

            return {
                date: dateStr,
                steps: b.dataset[0].point[0]?.value[0].intVal || 0,
                calories: Math.round(b.dataset[1].point[0]?.value[0].fpVal || 0),
                distance: (b.dataset[2].point[0]?.value[0].fpVal || 0) / 1000,
                activeMinutes: b.dataset[3]?.point[0]?.value[0].intVal || 0
            };
        });
    }

    /**
     * Helper para agregados simples
     */
    async _getAggregate(date, dataTypeName) {
        if (!this.hasValidToken()) return {};

        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const body = {
            "aggregateBy": [{ "dataTypeName": dataTypeName }],
            "bucketByTime": { "durationMillis": 86400000 },
            "startTimeMillis": start.getTime(),
            "endTimeMillis": end.getTime()
        };

        const response = await fetch(`${this.baseUrl}/dataset:aggregate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        return response.ok ? await response.json() : {};
    }

    logout() {
        localStorage.removeItem('google_health_token');
        localStorage.removeItem('google_health_token_expiry');
        this.token = null;
        this.isAuthenticated = false;
    }
}

export const googleFitProvider = new GoogleFitProvider();
