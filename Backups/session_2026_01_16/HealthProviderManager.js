/**
 * 🏥 Health Provider Manager
 * Gestor centralizado para todos los proveedores de salud
 */

import { fitbitProvider } from './FitbitProvider.js';
import { googleFitProvider } from './GoogleFitProvider.js';
// Corregido: Importar Clases, no instancias inexistentes
import { SamsungHealthProvider } from './SamsungHealthProvider.js';
import { HuaweiHealthProvider } from './HuaweiHealthProvider.js';

// Instanciar localmente
const samsungHealthProvider = new SamsungHealthProvider();
const huaweiHealthProvider = new HuaweiHealthProvider();

export class HealthProviderManager {
    constructor() {
        this.providers = {
            fitbit: fitbitProvider,
            googleFit: googleFitProvider,
            samsung: samsungHealthProvider,
            huawei: huaweiHealthProvider,
        };

        this.activeProvider = null;
        this.loadActiveProvider();
    }

    /**
     * Obtener proveedor activo
     */
    getActiveProvider() {
        if (!this.activeProvider) {
            return null;
        }
        return this.providers[this.activeProvider];
    }

    /**
     * Establecer proveedor activo
     */
    setActiveProvider(providerName) {
        if (!this.providers[providerName]) {
            throw new Error(`Provider ${providerName} not found`);
        }

        this.activeProvider = providerName;
        localStorage.setItem('active_health_provider', providerName);
        console.log(`✅ Proveedor activo: ${providerName}`);
    }

    /**
     * Cargar proveedor activo desde localStorage
     */
    loadActiveProvider() {
        const saved = localStorage.getItem('active_health_provider');
        if (saved && this.providers[saved]) {
            this.activeProvider = saved;
        }
    }

    /**
     * Verificar si hay un proveedor autenticado
     */
    hasAuthenticatedProvider() {
        const provider = this.getActiveProvider();
        return provider && provider.isAuthenticated;
    }

    /**
     * Sincronizar datos del proveedor activo
     */
    async syncActiveProvider() {
        const provider = this.getActiveProvider();

        if (!provider) {
            throw new Error('No active provider set');
        }

        if (!provider.isAuthenticated) {
            throw new Error('Provider not authenticated');
        }

        console.log(`🔄 Sincronizando datos de ${provider.name}...`);

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        try {
            // Obtener todos los datos en paralelo
            const [activities, steps, heartRate, sleep, calories] = await Promise.all([
                provider.getActivities(sevenDaysAgo, now),
                provider.getSteps(now),
                provider.getHeartRate(now),
                provider.getSleep(now),
                provider.getCalories(now)
            ]);

            const syncedData = {
                activities,
                todayStats: {
                    steps,
                    heartRate,
                    sleep,
                    calories
                },
                lastSync: Date.now(),
                source: provider.name
            };

            console.log(`✅ Sincronización completada:`, {
                activities: activities.length,
                steps,
                calories
            });

            return syncedData;

        } catch (error) {
            console.error(`❌ Error sincronizando ${provider.name}:`, error);
            throw error;
        }
    }

    /**
     * Obtener lista de proveedores disponibles
     */
    getAvailableProviders() {
        return Object.keys(this.providers).map(key => ({
            id: key,
            name: this.providers[key].name,
            isAuthenticated: this.providers[key].isAuthenticated,
            isActive: key === this.activeProvider
        }));
    }

    /**
     * Autenticar con un proveedor específico
     */
    async authenticateProvider(providerName) {
        const provider = this.providers[providerName];

        if (!provider) {
            throw new Error(`Provider ${providerName} not found`);
        }

        try {
            const success = await provider.authenticate();

            if (success) {
                this.setActiveProvider(providerName);
            }

            return success;
        } catch (error) {
            console.error(`Error authenticating with ${providerName}:`, error);
            throw error;
        }
    }

    /**
     * Cerrar sesión de un proveedor
     */
    logoutProvider(providerName) {
        const provider = this.providers[providerName];

        if (provider) {
            provider.logout();

            if (this.activeProvider === providerName) {
                this.activeProvider = null;
                localStorage.removeItem('active_health_provider');
            }
        }
    }

    /**
     * Cerrar sesión de todos los proveedores
     */
    logoutAll() {
        Object.values(this.providers).forEach(provider => {
            provider.logout();
        });

        this.activeProvider = null;
        localStorage.removeItem('active_health_provider');
    }
}

// Exportar instancia singleton
export const healthProviderManager = new HealthProviderManager();

// Exponer globalmente para debugging
window.healthProviderManager = healthProviderManager;
