import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPORTS_DICTIONARY } from '../utils/sportsDictionaryMaster.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../resources/sport_specs');

// 📚 MAPA TÉCNICO DE CAMPOS POR API Y PLATAFORMA
const API_FIELD_MAP = {
    googleFit: {
        logId: 'id',
        activityId: 'activityType (int)',
        activityName: 'name',
        startTime: 'startTimeMillis',
        duration: 'durationMillis',
        calories: 'calories (kcal)',
        distance: 'distance (meters)',
        steps: 'step_count.delta',
        averageHeartRate: 'heart_rate.bpm (avg)',
        heartRateZones: 'heart_rate.bpm (distribution)',
        activeDuration: 'active_time_millis',
        elevationGain: 'N/A (Derived)',
        speed: 'speed (m/s)',
        logType: 'activityDataSource'
    },
    healthConnect: {
        logId: 'metadata.id',
        activityId: 'activityType (int)',
        activityName: 'title',
        startTime: 'startTime',
        duration: 'endTime - startTime',
        calories: 'energy.total',
        distance: 'distance',
        steps: 'count',
        averageHeartRate: 'heartRate.average',
        heartRateZones: 'heartRate (series)',
        activeDuration: 'activeTime',
        elevationGain: 'elevation.gain',
        speed: 'velocity',
        logType: 'metadata.recordingMethod'
    },
    fitbit: {
        logId: 'logId',
        activityId: 'activityId (int)',
        activityName: 'activityName',
        startTime: 'startTime',
        duration: 'duration (ms)',
        calories: 'calories',
        distance: 'distance (km)',
        steps: 'steps',
        averageHeartRate: 'averageHeartRate',
        heartRateZones: 'heartRateZones',
        activeDuration: 'activeDuration',
        elevationGain: 'elevationGain',
        speed: 'speed',
        logType: 'logType'
    },
    appleHealth: {
        logId: 'uuid',
        activityId: 'HKWorkoutActivityType',
        activityName: 'HKWorkoutActivityType (Name)',
        startTime: 'startDate',
        duration: 'duration',
        calories: 'activeEnergyBurned',
        distance: 'distanceWalkingRunning',
        steps: 'stepCount',
        averageHeartRate: 'heartRate (avg)',
        heartRateZones: 'N/A',
        activeDuration: 'duration',
        elevationGain: 'flightsClimbed',
        speed: 'walkingSpeed',
        logType: 'metadata.source'
    },
    // HUAWEI HEALTH - WEB API (Health Kit Cloud)
    huaweiWeb: {
        logId: 'summaryId',
        activityId: 'type (int)',
        activityName: 'N/A (Mapped)',
        startTime: 'startTime',
        duration: 'duration',
        calories: 'calorie',
        distance: 'distance',
        steps: 'steps',
        averageHeartRate: 'avgHeartRate',
        heartRateZones: 'heartRate (array)',
        activeDuration: 'activeTime',
        elevationGain: 'ascentTotal',
        speed: 'avgSpeed',
        logType: 'appId'
    },
    // HUAWEI HEALTH - APP SDK (Android Java)
    huaweiApp: {
        logId: 'getActivityId()',
        activityId: 'getSportType()',
        activityName: 'N/A (Mapped)',
        startTime: 'getStartTime()',
        duration: 'getDuration()',
        calories: 'getCaloriesTotal()',
        distance: 'getDistance()',
        steps: 'getSteps()',
        averageHeartRate: 'getAvgHeartRate()',
        heartRateZones: 'N/A',
        activeDuration: 'getActiveTime()',
        elevationGain: 'getTotalAscent()',
        speed: 'getAvgSpeed()',
        logType: 'getAppId()'
    },
    // SAMSUNG HEALTH - WEB API (Server API)
    samsungWeb: {
        logId: 'data_uuid',
        activityId: 'exercise_type (int)',
        activityName: 'exercise_type (Mapped)',
        startTime: 'start_time',
        duration: 'duration',
        calories: 'calorie',
        distance: 'distance',
        steps: 'count',
        averageHeartRate: 'mean_heart_rate',
        heartRateZones: 'heart_rate (series)',
        activeDuration: 'active_time', // Corregido
        elevationGain: 'total_ascent', // Corregido
        speed: 'mean_speed',
        logType: 'deviceuuid'
    },
    // SAMSUNG HEALTH - APP SDK (Android SDK)
    samsungApp: {
        logId: 'getUuid()',
        activityId: 'getExerciseType()',
        activityName: 'N/A (Mapped)',
        startTime: 'getStartTime()',
        duration: 'getDuration()',
        calories: 'getCalorie()',
        distance: 'getDistance()',
        steps: 'getCount()',
        averageHeartRate: 'getMeanHeartRate()',
        heartRateZones: 'N/A',
        activeDuration: 'getActiveTime()', // Corregido
        elevationGain: 'getTotalAscent()', // Corregido
        speed: 'getMeanSpeed()',
        logType: 'getSourcePackageName()'
    }
};

const FIELDS_ORDER = [
    'logId',
    'activityId',
    'activityName',
    'activityTypeId',
    'startTime',
    'duration',
    'calories',
    'distance',
    'steps',
    'averageHeartRate',
    'heartRateZones',
    'activeDuration',
    'elevationGain',
    'speed',
    'logType'
];

async function fillGrids() {
    console.log(`🚀 Actualizando ${Object.keys(SPORTS_DICTIONARY).length} archivos con columnas Web vs App...`);

    // Headers actualizados según tu imagen
    const headers = 'Campo,Google Fit,Health Connect,Fitbit,Apple Health,Huawei Health Web,Huawei Health App,Samsung Health Web,Samsung Health App,Wellnessfy';

    for (const [sportKey, ids] of Object.entries(SPORTS_DICTIONARY)) {
        let csvContent = headers + '\n';

        FIELDS_ORDER.forEach(field => {
            let row = [field];

            // Google Fit
            row.push(field === 'activityTypeId' ? (ids.googleFit || 'N/A') : (API_FIELD_MAP.googleFit[field] || ''));

            // Health Connect
            row.push(field === 'activityTypeId' ? (ids.healthConnect || 'N/A') : (API_FIELD_MAP.healthConnect[field] || ''));

            // Fitbit
            row.push(field === 'activityTypeId' ? (ids.fitbit || 'N/A') : (API_FIELD_MAP.fitbit[field] || ''));

            // Apple Health
            row.push(field === 'activityTypeId' ? (ids.apple || 'N/A') : (API_FIELD_MAP.appleHealth[field] || ''));

            // Huawei WEB
            row.push(field === 'activityTypeId' ? (ids.huawei || 'N/A') : (API_FIELD_MAP.huaweiWeb[field] || ''));

            // Huawei APP (Usa los mismos IDs que web generalmente)
            row.push(field === 'activityTypeId' ? (ids.huawei || 'N/A') : (API_FIELD_MAP.huaweiApp[field] || ''));

            // Samsung WEB
            row.push(field === 'activityTypeId' ? (ids.samsung || 'N/A') : (API_FIELD_MAP.samsungWeb[field] || ''));

            // Samsung APP (Usa los mismos IDs que web generalmente)
            row.push(field === 'activityTypeId' ? (ids.samsung || 'N/A') : (API_FIELD_MAP.samsungApp[field] || ''));

            // Wellnessfy (Vacío)
            row.push('');

            csvContent += row.join(',') + '\n';
        });

        const filePath = path.join(OUTPUT_DIR, `${sportKey}.csv`);
        fs.writeFileSync(filePath, csvContent);
    }

    console.log('✅ ¡Archivos actualizados con todas las columnas Web/App!');
}

fillGrids();
