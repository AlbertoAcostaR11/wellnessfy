/**
 * 🏥 Health Provider Interface
 * Interfaz común para todos los proveedores de salud
 * (Google Fit, Fitbit, Apple Health, Garmin, etc.)
 */

export class HealthProvider {
    constructor(name) {
        this.name = name;
        this.isAuthenticated = false;
        this.token = null;
    }

    /**
     * Autenticación con el proveedor
     * @returns {Promise<boolean>} True si la autenticación fue exitosa
     */
    async authenticate() {
        throw new Error('authenticate() must be implemented by subclass');
    }

    /**
     * Obtener actividades en un rango de fechas
     * @param {Date} startDate - Fecha de inicio
     * @param {Date} endDate - Fecha de fin
     * @returns {Promise<Array>} Array de actividades normalizadas
     */
    async getActivities(startDate, endDate) {
        throw new Error('getActivities() must be implemented by subclass');
    }

    /**
     * Obtener pasos de un día específico
     * @param {Date} date - Fecha
     * @returns {Promise<number>} Número de pasos
     */
    async getSteps(date) {
        throw new Error('getSteps() must be implemented by subclass');
    }

    /**
     * Obtener frecuencia cardíaca de un día
     * @param {Date} date - Fecha
     * @returns {Promise<Object>} Datos de frecuencia cardíaca
     */
    async getHeartRate(date) {
        throw new Error('getHeartRate() must be implemented by subclass');
    }

    /**
     * Obtener datos de sueño
     * @param {Date} date - Fecha
     * @returns {Promise<Object>} Datos de sueño
     */
    async getSleep(date) {
        throw new Error('getSleep() must be implemented by subclass');
    }

    /**
     * Obtener calorías quemadas
     * @param {Date} date - Fecha
     * @returns {Promise<number>} Calorías quemadas
     */
    async getCalories(date) {
        throw new Error('getCalories() must be implemented by subclass');
    }

    /**
     * Normalizar actividad al formato estándar de Wellnessfy
     * @param {Object} rawActivity - Actividad cruda del proveedor
     * @returns {Object} Actividad normalizada
     */
    normalizeActivity(rawActivity) {
        return {
            id: rawActivity.id || `${this.name}_${Date.now()}`,
            name: rawActivity.name || 'Actividad',
            type: rawActivity.type || 'other',
            startTime: rawActivity.startTime,
            endTime: rawActivity.endTime,
            duration: rawActivity.duration || 0, // en minutos
            distance: rawActivity.distance || 0, // en km
            calories: rawActivity.calories || 0,
            heartRate: rawActivity.heartRate || null,
            source: this.name,
            rawData: rawActivity // Guardar datos originales por si acaso
        };
    }

    /**
     * Verificar si el token es válido
     * @returns {boolean}
     */
    hasValidToken() {
        return this.token !== null && this.token !== undefined;
    }

    /**
     * Guardar token en localStorage
     */
    saveToken() {
        if (this.token) {
            localStorage.setItem(`${this.name}_token`, this.token);
            localStorage.setItem(`${this.name}_token_timestamp`, Date.now().toString());
        }
    }

    /**
     * Cargar token desde localStorage
     */
    loadToken() {
        const token = localStorage.getItem(`${this.name}_token`);
        const timestamp = localStorage.getItem(`${this.name}_token_timestamp`);

        if (token && timestamp) {
            // Verificar si el token no ha expirado (24 horas)
            const now = Date.now();
            const tokenAge = now - parseInt(timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 horas

            if (tokenAge < maxAge) {
                this.token = token;
                this.isAuthenticated = true;
                return true;
            }
        }

        return false;
    }

    /**
     * Cerrar sesión y limpiar tokens
     */
    logout() {
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem(`${this.name}_token`);
        localStorage.removeItem(`${this.name}_token_timestamp`);
    }
}

/**
 * Formato estándar de actividad de Wellnessfy
 */
export const ActivitySchema = {
    id: String,           // ID único
    name: String,         // Nombre de la actividad
    type: String,         // Tipo (running, cycling, gym, etc.)
    startTime: Date,      // Hora de inicio
    endTime: Date,        // Hora de fin
    duration: Number,     // Duración en minutos
    distance: Number,     // Distancia en km
    calories: Number,     // Calorías quemadas
    heartRate: Object,    // { avg, min, max }
    source: String,       // Proveedor (fitbit, google, etc.)
    rawData: Object       // Datos originales del proveedor
};
