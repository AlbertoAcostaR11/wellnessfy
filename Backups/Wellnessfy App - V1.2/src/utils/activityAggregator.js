/**
 * Activity Aggregator - Procesa sesiones de Google Fit para "Mis Deportes"
 * Convierte data cruda en gráficas semanales dinámicas
 */

import { getSportMetadata } from './sportsDictionary.js';

/**
 * Agrega segmentos de actividad por deporte y día
 * @param {array} rawActivitySegments - Array de segmentos de actividad de dailyData
 * @returns {object} Actividades agregadas listas para renderizar
 */
export function aggregateWeeklySports(rawActivitySegments) {
    console.log('🔄 Agregando actividades semanales...');

    if (!rawActivitySegments || rawActivitySegments.length === 0) {
        console.log('⚠️ No hay segmentos de actividad para agregar');
        return {};
    }

    // Obtener rango de 7 días (desde hace 6 días hasta hoy)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(startOfToday.getTime() - (6 * 24 * 60 * 60 * 1000));

    // Estructura: { "Running": { days: [0,5,0,3,0,0,2], total: 10, unit: 'km', metadata: {...} } }
    const sportsByType = {};

    // IDs a excluir (Solo Sleep segments: 1-6 y Respiración: 106)
    // Yoga, Meditación y otras actividades mindfulness SÍ se muestran
    const excludedActivityTypes = [1, 2, 3, 4, 5, 6, 106];

    // Procesar cada segmento
    rawActivitySegments.forEach(segment => {
        const activityTypeId = segment.activityType;

        // Filtrar sleep segments y mindfulness
        if (excludedActivityTypes.includes(activityTypeId)) {
            return; // Skip
        }

        const metadata = getSportMetadata(activityTypeId);
        const sportKey = metadata.name;

        // Inicializar deporte si no existe
        if (!sportsByType[sportKey]) {
            sportsByType[sportKey] = {
                activityTypeId: activityTypeId,
                days: [0, 0, 0, 0, 0, 0, 0], // 7 días
                total: 0,
                unit: metadata.unit,
                metric: metadata.metric,
                metadata: metadata
            };
        }

        // Calcular día de la semana (0=hace 6 días, 6=hoy)
        const segmentDate = segment.date;
        const daysDiff = Math.floor((segmentDate - weekStart) / (24 * 60 * 60 * 1000));

        // Solo procesar si está dentro del rango de 7 días
        if (daysDiff >= 0 && daysDiff < 7) {
            const durationMs = segment.duration;

            let value = 0;
            if (metadata.metric === 'distance') {
                // Para actividades de distancia, estimamos basado en duración
                // Google Fit no siempre provee distancia en activity.segment
                const hours = durationMs / (1000 * 60 * 60);
                if (activityTypeId === 9) value = hours * 10; // Running: 10 km/h
                else if (activityTypeId === 1) value = hours * 20; // Cycling: 20 km/h
                else if (activityTypeId === 7) value = hours * 5; // Walking: 5 km/h
                else if (activityTypeId === 8) value = hours * 10; // Treadmill: 10 km/h
                else value = hours * 8; // Genérico
            } else {
                // Tiempo: Convertir milisegundos a horas
                value = durationMs / (1000 * 60 * 60);
            }

            sportsByType[sportKey].days[daysDiff] += value;
            sportsByType[sportKey].total += value;
        }
    });

    // Filtrar deportes sin actividad y ordenar por total descendente
    const activeSports = Object.entries(sportsByType)
        .filter(([_, data]) => data.total > 0)
        .sort((a, b) => b[1].total - a[1].total)
        .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

    console.log(`✅ ${Object.keys(activeSports).length} deportes activos esta semana:`,
        Object.keys(activeSports).map(k => `${k} (${activeSports[k].total.toFixed(1)}${activeSports[k].unit})`).join(', ')
    );

    return activeSports;
}

/**
 * Genera labels de días para las gráficas (Lun, Mar, etc.)
 * @returns {array} Array de 7 strings con nombres de días
 */
export function getWeekDayLabels() {
    const now = new Date();
    const labels = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];
        labels.push(dayName);
    }

    return labels;
}

/**
 * Formatea un valor numérico para display
 * @param {number} value - Valor a formatear
 * @param {string} unit - Unidad (km/hr)
 * @returns {string} Valor formateado
 */
export function formatSportValue(value, unit) {
    if (value === 0) return `0 ${unit}`;

    if (unit === 'km') {
        return value < 1 ? `${(value * 1000).toFixed(0)} m` : `${value.toFixed(1)} km`;
    } else if (unit === 'hr') {
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        if (hours === 0) return `${minutes} min`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    }

    return `${value.toFixed(1)} ${unit}`;
}
