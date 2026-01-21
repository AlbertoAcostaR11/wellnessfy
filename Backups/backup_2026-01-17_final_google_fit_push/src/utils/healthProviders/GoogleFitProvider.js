
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

    async getSleep(date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const body = {
            "aggregateBy": [{ "dataTypeName": "com.google.sleep.segment" }],
            "startTimeMillis": start.getTime(),
            "endTimeMillis": end.getTime()
        };

        const response = await fetch(`${this.baseUrl}/dataset:aggregate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${this.token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) return null;
        const data = await response.json();
        let totalMillis = 0;

        if (data.bucket?.[0]?.dataset?.[0]?.point) {
            data.bucket[0].dataset[0].point.forEach(p => {
                const type = p.value[0].intVal;
                if (type !== 1 && type !== 3) { // Excluir awake y out-of-bed
                    totalMillis += Number((BigInt(p.endTimeNanos) - BigInt(p.startTimeNanos)) / 1000000n);
                }
            });
        }

        return totalMillis > 0 ? (totalMillis / (1000 * 60 * 60)).toFixed(1) : null;
    }

    /**
     * Obtener totales diarios para un rango (Nuevo para el Motor V2)
     */
    async getDailyTotalsRange(startDate, endDate) {
        const body = {
            "aggregateBy": [
                { "dataTypeName": "com.google.step_count.delta" },
                { "dataTypeName": "com.google.calories.expended" },
                { "dataTypeName": "com.google.distance.delta" }
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

        return data.bucket.map(b => ({
            date: new Date(parseInt(b.startTimeMillis)),
            steps: b.dataset[0].point[0]?.value[0].intVal || 0,
            calories: Math.round(b.dataset[1].point[0]?.value[0].fpVal || 0),
            distance: (b.dataset[2].point[0]?.value[0].fpVal || 0) / 1000 // m a km
        }));
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
