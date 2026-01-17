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
        if (!rawData) return null;

        // 1. Identificar el Deporte (ID Mapping)
        const rawId = this.extractRawId(provider, rawData);
        let sportKey = this.reverseMap[`${provider}_${rawId}`] || 'unknown';

        // 1.1 Fallback por Nombre (Si ID falla, intentar adivinar por texto)
        if (sportKey === 'unknown') {
            const nameHint = (rawData.name || rawData.activityName || rawData.activityParentName || '').toLowerCase();

            // Mapeo específico para nombres comunes de Fitbit
            if (nameHint.includes('weightlifting') || nameHint.includes('halterofilia')) {
                sportKey = 'weightlifting';
            } else if (nameHint.includes('structured workout') || nameHint.includes('entrenamiento estructurado')) {
                sportKey = 'strength_training';
            } else if (nameHint.includes('walk') || nameHint.includes('camin') || nameHint.includes('paseo')) {
                sportKey = 'walking';
            } else if (nameHint.includes('run') || nameHint.includes('corr') || nameHint.includes('trot')) {
                sportKey = 'running';
            } else if (nameHint.includes('yoga')) {
                sportKey = 'yoga';
            } else if (nameHint.includes('relax') || nameHint.includes('breath') || nameHint.includes('respiraci') || nameHint.includes('mindfulness')) {
                sportKey = 'guided_breathing';
            } else if (nameHint.includes('pilates')) {
                sportKey = 'pilates';
            } else if (nameHint.includes('swim') || nameHint.includes('nadar')) {
                sportKey = 'swimming';
            } else if (nameHint.includes('bic') || nameHint.includes('cycl')) {
                sportKey = 'cycling';
            } else if (nameHint.includes('gym') || nameHint.includes('pesa') || nameHint.includes('fuerza') || nameHint.includes('strength')) {
                sportKey = 'strength_training';
            }

            // Log para debugging
            if (sportKey !== 'unknown') {
                console.log(`🔄 Fallback por nombre: "${rawData.name}" (ID ${rawId}) → "${sportKey}"`);
            }
        }

        // 2. Cargar reglas de mapeo
        const spec = this.specs[sportKey];
        if (!spec && sportKey !== 'unknown') {
            console.warn(`No specs found for sport: ${sportKey}`);
        }

        // 3. Extraer campos básicos usando el mapa
        const defaults = { startTime: 'startTime', duration: 'duration', calories: 'calories', steps: 'steps', distance: 'distance' };
        const mappings = spec ? spec.fields : defaults;

        // 4. Construir objeto estandarizado
        const normalized = {
            id: rawData.logId || rawData.id || `gen-${Math.random()}`,
            originalId: rawId,
            provider: provider,
            sportKey: sportKey, // Clave interna de Wellnessfy (ej: 'tennis')
            name: this.inferName(sportKey, rawData), // Nombre bonito para UI

            // Métricas Base
            startTime: this.extractDate(rawData, mappings.startTime || 'startTime', provider),
            duration: this.extractDuration(rawData, mappings.activeDuration || mappings.duration || 'duration', provider),
            calories: this.extractNumber(rawData, mappings.calories || 'calories', provider),
            steps: this.extractNumber(rawData, mappings.steps || 'steps', provider),
            distance: this.extractDistance(rawData, mappings.distance || 'distance', provider), // Normalizado a KM

            // Metadatos extra
            rawSource: rawData
        };

        return normalized;
    }

    // --- Helpers de Extracción ---

    extractRawId(provider, data) {
        if (provider === 'fitbit') {
            // Fitbit usa 'activityId' como el ID del tipo de actividad
            // (no confundir con 'logId' que es el ID único del registro)
            return data.activityId || data.activityTypeId;
        }
        if (provider === 'googleFit') return data.activityType;
        if (provider.includes('samsung')) return data.exercise_type || data.type;
        if (provider.includes('huawei')) return data.type || data.activityType;
        return null;
    }

    /**
     * Extrae fecha manejando casos especiales como Fitbit time-only
     */
    extractDate(data, fieldKey, provider) {
        let val = this.extractValue(data, fieldKey);
        // Si no hay valor en el campo principal, buscar fallbacks comunes
        if (!val) val = data.startTime || data.time;
        if (!val) return null;

        // Fitbit fix: Si es solo hora (HH:MM) y tenemos fecha padre inyectada
        if (provider === 'fitbit' && typeof val === 'string' && !val.includes('T')) {
            // "11:49" o "11:49:00"
            if (data._parentDate) {
                const fullTime = val.length === 5 ? `${val}:00` : val;
                return new Date(`${data._parentDate}T${fullTime}`);
            }
        }

        return new Date(val);
    }

    extractValue(data, fieldKey, provider) {
        if (!fieldKey) return null;
        // Soporte para caminos anidados "metric.summary.value" (futuro)
        return data[fieldKey] !== undefined ? data[fieldKey] : null;
    }

    extractNumber(data, fieldKey, provider) {
        let val = this.extractValue(data, fieldKey);

        // Intelligent Fallbacks (Self-Healing)
        if (!val || val === 0) {
            const key = String(fieldKey).toLowerCase();
            // Calorías: fitbit usa 'activityCalories' o 'caloriesOut' a veces
            if (key.includes('calorie')) {
                val = data.activityCalories || data.calories || data.caloriesOut || data.energy || 0;
            }
            // Pasos: fitbit logs manuales a veces usan 'steps' aunque mapping sea otro
            if (key.includes('step')) {
                val = data.steps || data.stepCount || 0;
            }
            // Distancia:
            if (key.includes('distance')) {
                val = data.distance || data.distanceKm || 0;
            }
        }

        return val ? parseFloat(val) : 0;
    }

    /**
     * Extrae duración y la convierte a MINUTOS (Unidad estándar UI)
     */
    extractDuration(data, fieldKey, provider) {
        let val = this.extractNumber(data, fieldKey);
        if (!val) {
            // Fallback si el mapeo falló pero el dato existe en propiedad común
            val = data.duration || data.activeDuration;
        }
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
