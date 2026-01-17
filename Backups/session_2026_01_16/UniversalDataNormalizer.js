import { SPORT_SPECS, REVERSE_ID_MAP } from '../../config/SportSpecsDB.js';

/**
 * ⚙️ UNIVERSAL DATA NORMALIZER
 * 
 * El corazón de la nueva arquitectura de Wellnessfy.
 * Convierte datos crudos de CUALQUIER proveedor (Fitbit, Google, Samsung, Huawei)
 * en objetos estandarizados 'WellnessfyActivity' listos para la UI.
 */
export class UniversalDataNormalizer {

    constructor() {
        this.specs = SPORT_SPECS;
        this.reverseMap = REVERSE_ID_MAP;
    }

    /**
     * Normaliza una lista de actividades crudas
     * @param {string} providerName - 'fitbit', 'googleFit', 'samsung', etc.
     * @param {Array} rawActivities - Array de objetos originales de la API
     * @returns {Array} Array de objetos WellnessfyActivity
     */
    normalizeActivities(providerName, rawActivities) {
        if (!Array.isArray(rawActivities)) return [];

        console.log(`⚙️ Normalizando ${rawActivities.length} actividades de ${providerName}...`);

        return rawActivities.map(activity => {
            try {
                return this.processSingleActivity(providerName, activity);
            } catch (e) {
                console.warn('⚠️ Error normalizando actividad:', e);
                return null;
            }
        }).filter(item => item !== null);
    }

    /**
     * Procesa una única actividad
     */
    processSingleActivity(provider, rawData) {
        // 1. Identificar el Deporte (ID Mapping)
        const rawId = this.extractRawId(provider, rawData);
        const sportKey = this.reverseMap[`${provider}_${rawId}`] || 'unknown';

        // 2. Cargar reglas de mapeo
        const spec = this.specs[sportKey];
        if (!spec && sportKey !== 'unknown') {
            console.warn(`No specs found for sport: ${sportKey}`);
        }

        // 3. Extraer campos básicos usando el mapa
        const mappings = spec ? spec.fields : {};

        // 4. Construir objeto estandarizado
        const normalized = {
            id: rawData.logId || rawData.id || `gen-${Math.random()}`,
            originalId: rawId,
            provider: provider,
            sportKey: sportKey, // Clave interna de Wellnessfy (ej: 'tennis')
            name: this.inferName(sportKey, rawData), // Nombre bonito para UI

            // Métricas Base
            startTime: this.extractValue(rawData, mappings.startTime, provider),
            duration: this.extractDuration(rawData, mappings.activeDuration || mappings.duration, provider),
            calories: this.extractNumber(rawData, mappings.calories, provider),
            steps: this.extractNumber(rawData, mappings.steps, provider),
            distance: this.extractDistance(rawData, mappings.distance, provider), // Normalizado a KM

            // Metadatos extra
            rawSource: rawData
        };

        return normalized;
    }

    // --- Helpers de Extracción ---

    extractRawId(provider, data) {
        if (provider === 'fitbit') return data.activityTypeId || data.activityId;
        if (provider === 'googleFit') return data.activityType;
        if (provider.includes('samsung')) return data.exercise_type || data.type;
        if (provider.includes('huawei')) return data.type || data.activityType;
        return null;
    }

    extractValue(data, fieldKey, provider) {
        if (!fieldKey) return null;
        // Soporte para caminos anidados "metric.summary.value" (futuro)
        return data[fieldKey] !== undefined ? data[fieldKey] : null;
    }

    extractNumber(data, fieldKey, provider) {
        const val = this.extractValue(data, fieldKey);
        return val ? parseFloat(val) : 0;
    }

    /**
     * Extrae duración y la convierte a MINUTOS (Unidad estándar UI)
     */
    extractDuration(data, fieldKey, provider) {
        let val = this.extractNumber(data, fieldKey);
        if (!val) return 0;

        // Detección heurística de milisegundos vs segundos vs minutos
        // Si el valor es gigante (> 100000), probablemente son ms
        // Fitbit suele dar originalDuration en ms
        if (val > 10000) {
            return Math.round(val / 60000); // ms -> min
        }
        return val; // Asumimos minutos si es pequeño, o ajustar según provider
    }

    /**
     * Extrae distancia y la convierte a KM
     */
    extractDistance(data, fieldKey, provider) {
        let val = this.extractNumber(data, fieldKey);
        if (!val) return 0;

        // Si el proveedor da metros (casi todos), pasar a KM
        // Fitbit: 'distance' suele ser ya en la unidad del perfil, pero API devuelve KM a veces.
        // Google Fit: Metros.
        if (provider === 'googleFit' || provider.includes('samsung') || provider.includes('huawei')) {
            return parseFloat((val / 1000).toFixed(2));
        }
        return val;
    }

    inferName(sportKey, rawData) {
        if (sportKey !== 'unknown') {
            // Convertir 'tennis' -> 'Tennis'
            return sportKey.charAt(0).toUpperCase() + sportKey.slice(1).replace('_', ' ');
        }
        return rawData.activityName || rawData.name || 'Actividad Desconocida';
    }
}
