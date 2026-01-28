
/**
 * 🏥 Google Fit Provider Adapter
 * Adapta la lógica legacy de googleHealth.js al nuevo sistema de proveedores.
 */

import { requestGoogleSync } from '../googleHealth.js';

export class GoogleFitProvider {
    constructor() {
        this.name = 'googleFit';
        this.requiresOAuth = true;
        this.isAuthenticated = false;
        this.checkToken();
    }

    checkToken() {
        const saved = localStorage.getItem('google_health_token');
        const expiry = localStorage.getItem('google_health_token_expiry');
        if (saved && expiry && Date.now() < parseInt(expiry)) {
            this.isAuthenticated = true;
        } else {
            this.isAuthenticated = false;
        }
    }

    hasValidToken() {
        this.checkToken();
        return this.isAuthenticated;
    }

    /**
     * Iniciar flujo de autenticación
     * Usa la función legacy requestGoogleSync y espera a que se guarde el token.
     */
    async authenticate() {
        console.log('🔄 Iniciando autenticación Google Fit (Legacy)...');

        return new Promise((resolve, reject) => {
            // Iniciar flujo legacy
            requestGoogleSync();

            // Polling para verificar éxito
            let attempts = 0;
            const maxAttempts = 60; // 60 segundos

            const interval = setInterval(() => {
                attempts++;
                this.checkToken();

                if (this.isAuthenticated) {
                    clearInterval(interval);
                    console.log('✅ Google Fit autenticado exitosamente');
                    resolve(true);
                }

                if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    // No rechazamos para no romper el flujo si el usuario cancela,
                    // simplemente resolvemos false
                    console.warn('⚠️ Timeout esperando autenticación Google Fit');
                    resolve(this.isAuthenticated);
                }
            }, 1000);
        });
    }

    async getActivities(startDate, endDate) {
        // Google Fit (Legacy) maneja sus propios datos y UI.
        // Retornamos vacío para no interferir con la lógica de normalización
        // en este punto, ya que la UI se actualiza via googleHealth.js
        return [];
    }

    async getSteps() { return 0; }
    async getHeartRate() { return 0; }
    async getSleep() { return 0; }
    async getCalories() { return 0; }

    logout() {
        console.log('👋 Cerrando sesión de Google Fit...');
        localStorage.removeItem('google_health_token');
        localStorage.removeItem('google_health_token_expiry');
        this.isAuthenticated = false;
    }
}

export const googleFitProvider = new GoogleFitProvider();
