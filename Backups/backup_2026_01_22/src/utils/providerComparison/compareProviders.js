/**
 * 📊 Módulo de comparativas entre proveedores de datos de actividad.
 *
 * Este módulo permite comparar, para un deporte concreto, los campos que
 * cada proveedor (Google Fit, Fitbit, Apple Health, Huawei, Samsung) devuelve.
 * La estructura base está definida en `sportProviderSchema.js` (SPORT_PROVIDER_SCHEMA).
 *
 * Uso típico:
 *   import { compareSportProviders } from './utils/providerComparison/compareProviders.js';
 *   const result = compareSportProviders('soccer', providerRawData);
 *
 * `providerRawData` es un objeto con la forma:
 *   {
 *     googleFit: {...},
 *     fitbit:    {...},
 *     apple:     {...},
 *     huawei:    {...},
 *     samsung:   {...}
 *   }
 * Cada sub‑objeto contiene los campos del esquema (logId, activityId, …).
 */

import { SPORT_PROVIDER_SCHEMA } from '../sportProviderSchema.js';

/**
 * Deep‑clone de un objeto simple (solo valores primitivos / arrays).
 */
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Genera una tabla comparativa para un deporte.
 *
 * @param {string} sportKey - Nombre del deporte tal como aparece en
 *   `SPORTS_DICTIONARY` (ej. 'soccer', 'basketball').
 * @param {object} providerData - Datos crudos de cada proveedor.
 * @returns {object} Un objeto con la forma:
 *   {
 *     sport: sportKey,
 *     fields: {
 *       logId: { googleFit: ..., fitbit: ..., apple: ..., huawei: ..., samsung: ... },
 *       activityId: { ... },
 *       ...
 *     }
 *   }
 */
export function compareSportProviders(sportKey, providerData) {
    if (!SPORT_PROVIDER_SCHEMA[sportKey]) {
        console.warn(`⚠️ Deporte desconocido: ${sportKey}`);
        return null;
    }

    // Inicializamos la estructura de salida con los campos del esquema.
    const comparison = {
        sport: sportKey,
        fields: {}
    };

    const fieldNames = Object.keys(SPORT_PROVIDER_SCHEMA[sportKey].googleFit);

    fieldNames.forEach((field) => {
        comparison.fields[field] = {
            googleFit: providerData.googleFit?.[field] ?? null,
            fitbit: providerData.fitbit?.[field] ?? null,
            apple: providerData.apple?.[field] ?? null,
            huawei: providerData.huawei?.[field] ?? null,
            samsung: providerData.samsung?.[field] ?? null,
            wellnessfy: null // Wellnessfy no aporta datos crudos
        };
    });

    return comparison;
}

/**
 * Helper para comparar varios deportes a la vez.
 *
 * @param {object} allProviderData - Objeto con la forma:
 *   { sportKey1: providerData1, sportKey2: providerData2, ... }
 * @returns {object[]} Array de comparativas por deporte.
 */
export function compareMultipleSports(allProviderData) {
    return Object.entries(allProviderData).map(([sportKey, data]) =>
        compareSportProviders(sportKey, data)
    ).filter(Boolean);
}

// Exportamos también la lista de campos para quien lo necesite.
export const SCHEMA_FIELDS = Object.keys(SPORT_PROVIDER_SCHEMA[Object.keys(SPORT_PROVIDER_SCHEMA)[0]].googleFit);
