// Google Health Connect Integration

const CLIENT_ID = '251804832640-0sepumqghs8rr54l0g3c5mk6gcqccv7b.apps.googleusercontent.com';
const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
].join(' ');

let tokenClient;
let accessToken = null;
let isInitializing = false;
let initRetryCount = 0;
const MAX_INIT_RETRIES = 5;

// Cargar token guardado al iniciar
function loadSavedToken() {
    const saved = localStorage.getItem('google_health_token');
    const expiry = localStorage.getItem('google_health_token_expiry');

    if (saved && expiry) {
        const expiryTime = parseInt(expiry);
        if (Date.now() < expiryTime) {
            accessToken = saved;
            console.log('✅ Token de Google Health cargado desde localStorage');
            return true;
        } else {
            console.log('⚠️ Token expirado, se requiere nueva autenticación');
            clearSavedToken();
        }
    }
    return false;
}

// Guardar token
function saveToken(token, expiresIn = 3600) {
    accessToken = token;
    localStorage.setItem('google_health_token', token);
    // Guardar con 50 minutos de validez (3000 segundos) para estar seguros
    const expiryTime = Date.now() + (expiresIn - 600) * 1000;
    localStorage.setItem('google_health_token_expiry', expiryTime.toString());
    console.log('✅ Token guardado. Expira en:', new Date(expiryTime).toLocaleTimeString());
}

// Limpiar token guardado
function clearSavedToken() {
    accessToken = null;
    localStorage.removeItem('google_health_token');
    localStorage.removeItem('google_health_token_expiry');
}

// Función auxiliar para mostrar toasts
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message} `);
    }
}

export function initGoogleIdentity() {
    if (isInitializing) {
        console.log('⏳ Ya se está inicializando Google Identity...');
        return;
    }

    if (tokenClient) {
        console.log('✅ Google Identity ya está inicializado');
        return;
    }

    if (!window.google?.accounts?.oauth2) {
        console.warn('⚠️ Google Identity SDK no disponible aún. Reintento:', initRetryCount + 1);

        if (initRetryCount < MAX_INIT_RETRIES) {
            isInitializing = true;
            initRetryCount++;
            setTimeout(() => {
                isInitializing = false;
                initGoogleIdentity();
            }, 1000 * initRetryCount); // Backoff exponencial
            return;
        } else {
            console.error('❌ Google Identity SDK no se pudo cargar después de', MAX_INIT_RETRIES, 'intentos');
            updateSyncUI('error', 'SDK no disponible');
            return;
        }
    }

    try {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: (tokenResponse) => {
                console.log('📥 Respuesta de autenticación recibida:', tokenResponse);

                if (tokenResponse.error) {
                    console.error('❌ Error en autenticación:', tokenResponse.error);
                    updateSyncUI('error', 'Error de autenticación');

                    if (tokenResponse.error === 'access_denied') {
                        showToast('Acceso denegado. Por favor, acepta los permisos para sincronizar.', 'error');
                    }
                    return;
                }

                if (tokenResponse.access_token) {
                    console.log('✅ Token de acceso recibido');
                    saveToken(tokenResponse.access_token, tokenResponse.expires_in || 3600);
                    fetchFitnessData();
                    fetchWeeklyData(); // Obtener datos semanales inmediatamente
                }
            },
            error_callback: (error) => {
                console.error('❌ Error en el callback de Google:', error);
                updateSyncUI('error', 'Error de conexión');
                showToast('Error al conectar con Google Health', 'error');
            }
        });

        console.log('✅ Google Identity inicializado correctamente');
        initRetryCount = 0;

        // Intentar cargar token guardado
        if (loadSavedToken()) {
            updateSyncUI('ready', 'Listo');
        }

    } catch (error) {
        console.error('❌ Error al inicializar Google Identity:', error);
        updateSyncUI('error', 'Error de inicialización');
    }
}

export function requestGoogleSync() {
    console.log('🔄 Solicitando sincronización...');

    if (!tokenClient) {
        console.warn('⚠️ Token client no inicializado, intentando inicializar...');
        updateSyncUI('connecting', 'Inicializando...');

        initGoogleIdentity();

        // Reintentar después de un momento
        setTimeout(() => {
            if (tokenClient) {
                requestGoogleSync();
            } else {
                updateSyncUI('error', 'Error de inicialización');
                showToast('No se pudo inicializar Google Health. Recarga la página.', 'error');
            }
        }, 2000);
        return;
    }

    // Si ya tenemos un token válido, usarlo directamente
    if (accessToken) {
        console.log('✅ Usando token existente');
        updateSyncUI('syncing', 'Sincronizando...');
        fetchFitnessData();
        fetchWeeklyData(); // Obtener datos semanales también
    } else {
        console.log('🔐 Solicitando nuevo token de acceso...');
        updateSyncUI('connecting', 'Conectando...');

        try {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } catch (error) {
            console.error('❌ Error al solicitar token:', error);
            updateSyncUI('error', 'Error de conexión');
            showToast('Error al conectar con Google', 'error');
        }
    }
}

async function fetchFitnessData() {
    console.log('📊 Obteniendo datos de fitness...');
    updateSyncUI('syncing', 'Sincronizando...');

    try {
        // Define time range: Start of today to now
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const endOfDay = now.getTime();

        console.log('📅 Rango de tiempo:', {
            inicio: new Date(startOfDay).toLocaleString(),
            fin: new Date(endOfDay).toLocaleString()
        });

        const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken} `,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "aggregateBy": [
                    { "dataTypeName": "com.google.step_count.delta" },
                    { "dataTypeName": "com.google.calories.expended" },
                    { "dataTypeName": "com.google.heart_rate.bpm" },
                    { "dataTypeName": "com.google.active_minutes" },
                    { "dataTypeName": "com.google.sleep.segment" }
                ],
                "bucketByTime": { "durationMillis": 86400000 }, // 1 day bucket
                "startTimeMillis": startOfDay,
                "endTimeMillis": endOfDay
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText} `);
        }

        const data = await response.json();
        console.log('📥 Respuesta de Google Fit API:', data);

        if (data.error) {
            console.error('❌ Error de API:', data.error);

            // Si el token expiró, limpiar y pedir nuevo
            if (data.error.code === 401 || data.error.status === 'UNAUTHENTICATED') {
                console.log('🔄 Token expirado, limpiando y solicitando nuevo...');
                clearSavedToken();
                updateSyncUI('error', 'Token expirado');
                showToast('Sesión expirada. Por favor, sincroniza de nuevo.', 'warning');
            } else {
                updateSyncUI('error', 'Error API');
                showToast(`Error de API: ${data.error.message || 'Desconocido'} `, 'error');
            }
            return;
        }

        processFitnessData(data);
        updateSyncUI('success', 'Sincronizado ✓');

        // Guardar timestamp de última sincronización
        localStorage.setItem('last_health_sync', Date.now().toString());

    } catch (error) {
        console.error('❌ Error al obtener datos de fitness:', error);
        updateSyncUI('error', 'Error de red');

        // Verificar si es un error de red o de autenticación
        if (error.message.includes('401')) {
            clearSavedToken();
            showToast('Sesión expirada. Sincroniza de nuevo.', 'warning');
        } else {
            showToast(`Error de sincronización: ${error.message} `, 'error');
        }
    }
}

function processFitnessData(data) {
    console.log('🔍 Procesando datos de fitness...');

    // Default values
    let steps = 0;
    let calories = 0;
    let heartRate = '--';
    let activeMinutes = 0;
    let sleepHours = 0;

    if (data.bucket && data.bucket.length > 0) {
        const dataset = data.bucket[0].dataset;
        console.log('📊 Datasets encontrados:', dataset.length);

        // 0: Steps
        if (dataset[0]?.point?.length > 0) steps = dataset[0].point[0].value[0].intVal || 0;

        // 1: Calories
        if (dataset[1]?.point?.length > 0) calories = Math.round(dataset[1].point[0].value[0].fpVal || 0);

        // 2: Heart Rate (Avg)
        if (dataset[2]?.point?.length > 0 && dataset[2].point[0].value.length > 0) {
            heartRate = Math.round(dataset[2].point[0].value[0].fpVal || 0);
        }

        // 3: Active Minutes
        if (dataset[3]?.point?.length > 0) activeMinutes = dataset[3].point[0].value[0].intVal || 0;

        // 4: Sleep (Nuevo)
        if (dataset[4]?.point?.length > 0) {
            let totalSleepMillis = 0;
            dataset[4].point.forEach(point => {
                try {
                    const type = point.value[0].intVal;
                    const start = BigInt(point.startTimeNanos);
                    const end = BigInt(point.endTimeNanos);
                    const duration = Number((end - start) / 1000000n);

                    if (type !== 1 && type !== 112) {
                        totalSleepMillis += duration;
                    }
                } catch (e) { console.error(e); }
            });
            sleepHours = (totalSleepMillis / (1000 * 60 * 60)).toFixed(1);
        }
    } else {
        console.log('⚠️ No se encontraron datos en los buckets');
    }

    // Update UI
    updateUI('valSteps', steps.toLocaleString());
    updateUI('valCalories', calories.toLocaleString());
    updateUI('valHeart', heartRate);
    updateUI('valActive', activeMinutes);
    // updateUI('valSleep', sleepHours + 'h'); // Desactivado: El sueño se actualiza desde fetchWeeklyActivityStats con mayor precisión

    // Guardar en AppState si está disponible
    if (window.AppState?.currentUser) {
        window.AppState.currentUser.stats = {
            ...window.AppState.currentUser.stats,
            steps,
            calories,
            heartRate: heartRate !== '--' ? heartRate : 0,
            activeMinutes
        };

        if (window.saveUserData) {
            window.saveUserData();
            console.log('💾 Datos guardados en AppState');
        }
    }

    showToast(`✅ Sincronizado: ${steps.toLocaleString()} pasos`, 'success');
}

function updateUI(id, val) {
    const el = document.getElementById(id);
    if (el) {
        // Simple animation
        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0';
        setTimeout(() => {
            el.innerText = val;
            el.style.opacity = '1';
        }, 300);
    }
}

function updateSyncUI(status, text) {
    const label = document.getElementById('syncLabel');
    const icon = document.getElementById('syncIcon');
    const btn = document.getElementById('syncBtn');

    if (label) label.innerText = text;

    if (icon && btn) {
        // Remover clases anteriores
        icon.classList.remove('animate-spin', 'text-[#00f5d4]', 'text-red-500', 'text-green-500', 'text-yellow-500');
        btn.classList.remove('opacity-60', 'cursor-not-allowed');

        switch (status) {
            case 'connecting':
            case 'syncing':
                icon.classList.add('animate-spin', 'text-[#00f5d4]');
                btn.classList.add('opacity-60', 'cursor-not-allowed');
                break;
            case 'success':
                icon.classList.add('text-green-500');
                setTimeout(() => {
                    updateSyncUI('ready', 'Sincronizar');
                }, 3000);
                break;
            case 'error':
                icon.classList.add('text-red-500');
                break;
            case 'ready':
            default:
                icon.classList.add('text-[#00f5d4]');
                break;
        }
    }
}

// Sincronización automática al cargar si hay token válido
export function autoSyncIfReady() {
    if (loadSavedToken()) {
        console.log('🔄 Sincronización automática iniciada...');
        setTimeout(() => {
            fetchFitnessData();
            fetchWeeklyData(); // También obtener datos semanales
        }, 1000);
    }
}

// =========================================================
// MÓDULO 1: ESTADÍSTICAS SEMANALES (Datos Seguros)
// =========================================================
async function fetchWeeklyActivityStats(startDate, endDate, accessToken) {
    console.log('📊 Solicitando Módulo: Estadísticas Semanales (+Sueño)...');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Rango Diario: 7 días (6 días atrás + Hoy)
    const startWeekly = startOfToday - (6 * 24 * 60 * 60 * 1000);
    // Para sesiones de sueño, pedimos un día extra atrás
    const startSessions = startOfToday - (7 * 24 * 60 * 60 * 1000);
    const endWeekly = startOfToday + (24 * 60 * 60 * 1000); // Fin de hoy

    // Rango Horario: SOLO HOY (para "Actividad por Hora")
    const startHourly = startOfToday;
    const endHourly = endWeekly;

    const bodyDaily = {
        "aggregateBy": [
            { "dataTypeName": "com.google.step_count.delta" },
            { "dataTypeName": "com.google.calories.expended" },
            { "dataTypeName": "com.google.activity.segment" }
        ],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": startWeekly,
        "endTimeMillis": endWeekly
    };

    const bodyHourly = {
        "aggregateBy": [{ "dataTypeName": "com.google.step_count.delta" }],
        "bucketByTime": { "durationMillis": 3600000 }, // 1 hora
        "startTimeMillis": startHourly,
        "endTimeMillis": endHourly
    };

    try {
        const [dailyResp, hourlyResp, sleepResp] = await Promise.all([
            fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyDaily)
            }),
            fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyHourly)
            }),
            fetch(`https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(startSessions).toISOString()}&endTime=${new Date(endWeekly).toISOString()}&activityType=72`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${accessToken}` }
            })
        ]);

        const dailyData = await dailyResp.json();
        const hourlyData = await hourlyResp.json();
        const sleepSessionsData = await sleepResp.json();

        if (dailyData.error) throw new Error(`Google API Error: ${dailyData.error.message}`);

        // Obtener segmentos detallados de sueño para cada sesión
        let detailedSleepSegments = [];
        if (sleepSessionsData.session && sleepSessionsData.session.length > 0) {
            console.log('🔍 Obteniendo segmentos detallados de sueño...');

            // Intentar múltiples data sources (merged, platform-specific, raw)
            const dataSourceIds = [
                'derived:com.google.sleep.segment:merged',
                'raw:com.google.sleep.segment:com.fitbit.FitbitMobile:',
                'derived:com.google.sleep.segment:com.google.android.gms:merged'
            ];

            // Hacer peticiones en paralelo para todos los segmentos
            const segmentPromises = sleepSessionsData.session.map(async (session) => {
                if (session.activityType === 72) {
                    const startNanos = parseInt(session.startTimeMillis) * 1000000;
                    const endNanos = parseInt(session.endTimeMillis) * 1000000;

                    // Intentar cada data source hasta encontrar uno que funcione
                    for (const dsId of dataSourceIds) {
                        try {
                            const segResp = await fetch(
                                `https://www.googleapis.com/fitness/v1/users/me/dataSources/${dsId}/datasets/${startNanos}-${endNanos}`,
                                { headers: { 'Authorization': `Bearer ${accessToken}` } }
                            );
                            const segData = await segResp.json();

                            if (segData.point && segData.point.length > 0) {
                                console.log(`✅ Encontrados ${segData.point.length} segmentos en ${dsId}`);
                                return {
                                    sessionStart: parseInt(session.startTimeMillis),
                                    sessionEnd: parseInt(session.endTimeMillis),
                                    segments: segData.point
                                };
                            }
                        } catch (e) {
                            // Continuar con el siguiente data source
                        }
                    }
                    console.warn(`⚠️ No se encontraron segmentos para sesión ${new Date(session.endTimeMillis).toLocaleDateString()}`);
                }
                return null;
            });

            const results = await Promise.all(segmentPromises);
            detailedSleepSegments = results.filter(r => r !== null);
            console.log(`✅ Obtenidos ${detailedSleepSegments.length} conjuntos de segmentos detallados`);
        }

        // Procesar
        const stats = processWeeklyData(hourlyData, dailyData, sleepSessionsData, detailedSleepSegments);

        if (window.renderWeeklyTotals) window.renderWeeklyTotals(stats.weeklyTotals);
        if (window.renderHourlyActivity) window.renderHourlyActivity(stats.activityByHour);
        if (window.renderExerciseDays) window.renderExerciseDays(stats.exerciseDays);
        if (window.renderWeeklySleep) window.renderWeeklySleep(stats.sleepData);
        if (window.renderMindfulnessCharts) window.renderMindfulnessCharts(stats.mindfulness);

        // Guardar en AppState y actualizar UI globalmente
        if (window.AppState) {
            window.AppState.weeklyStats = stats;
            // Actualizar también el anillo de sueño 'En Vivo' con el ÚLTIMO dato disponible (asumimos que es hoy/ayer)
            if (stats.sleepData && stats.sleepData.length > 0) {
                const latestSleep = stats.sleepData[stats.sleepData.length - 1];
                const sleepElem = document.getElementById('valSleep');
                // Solo actualizar si es reciente (últimos 2 días)
                const isRecent = (new Date() - new Date(latestSleep.date)) < (48 * 60 * 60 * 1000); // Check laxo

                if (sleepElem && latestSleep.hours > 0) {
                    // Convertir decimal a horas y minutos
                    const totalHours = Math.floor(latestSleep.hours);
                    const totalMinutes = Math.round((latestSleep.hours - totalHours) * 60);
                    sleepElem.textContent = `${totalHours}h ${totalMinutes}m`;
                }
            }
            if (window.saveUserData) window.saveUserData();
        }
        window.dispatchEvent(new CustomEvent('weeklyStatsUpdated', { detail: stats }));

        console.log('✅ Módulo Actividad actualizado correctamente.');

    } catch (error) {
        console.error('❌ Error en Módulo Actividad:', error);
    }
}

// =========================================================
// MÓDULO 2: BIENESTAR MENTAL (Datos Sensibles/Riesgosos)
// =========================================================
async function fetchMentalWellbeingData(accessToken) {
    console.log('🧠 Solicitando Módulo: Bienestar Mental (Solo HRV)...');

    // Fix: Align to midnight to ensure buckets correspond to calendar days
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Rango: 7 días completos
    const start = startOfToday - (6 * 24 * 60 * 60 * 1000);
    const end = now.getTime(); // Revertir a 'ahora' para evitar error 400 en HRV

    const body = {
        "aggregateBy": [
            { "dataTypeName": "com.google.heart_rate.variability.rmssd" }
        ],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": start,
        "endTimeMillis": end
    };

    try {
        const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (data.error) {
            console.warn('⚠️ No hay datos de HRV disponibles:', data.error.message);
            updateStressUI(null);
            return;
        }

        let totalStress = 0;
        let count = 0;

        if (data.bucket) {
            data.bucket.forEach(bucket => {
                if (bucket.dataset[0]?.point?.length > 0) {
                    const hrv = bucket.dataset[0].point[0].value[0].fpVal || 0;
                    if (hrv > 0) {
                        let dailyStress = Math.max(0, Math.min(100, 100 - hrv));
                        totalStress += dailyStress;
                        count++;
                    }
                }
            });
        }

        const avgStress = count > 0 ? Math.round(totalStress / count) : null;
        updateStressUI(avgStress);
        console.log('✅ Módulo Bienestar Mental actualizado. Stress Score:', avgStress);

    } catch (error) {
        console.error('❌ Error en Módulo Bienestar Mental:', error);
        updateStressUI(null);
    }
}

function updateStressUI(score) {
    const stressText = document.getElementById('stressText');
    const stressBar = document.getElementById('stressBar');

    if (score !== null) {
        if (stressText) stressText.textContent = `${score}/100`;
        if (stressBar) {
            stressBar.style.width = `${score}%`;
            if (score > 70) stressBar.className = "h-full bg-red-500 transition-all duration-500";
            else if (score > 40) stressBar.className = "h-full bg-orange-400 transition-all duration-500";
            else stressBar.className = "h-full bg-green-400 transition-all duration-500";
        }
    } else {
        if (stressText) stressText.textContent = "No disponible";
        if (stressBar) stressBar.style.width = "0%";
    }
}

// Orquestador Principal
async function fetchWeeklyData() {
    const token = accessToken || localStorage.getItem('google_health_token');
    if (!token) return;

    fetchWeeklyActivityStats(null, null, token);
    fetchMentalWellbeingData(token);
}

// Procesar datos semanales
function processWeeklyData(hourlyData, dailyData, sleepSessionData, detailedSleepSegments) {
    const stats = {
        activityByHour: [],
        exerciseDays: [],
        sleepData: [],
        weeklyTotals: { steps: 0, distance: 0, calories: 0 },
        mindfulness: { yoga: 0, meditation: 0, breathing: 0, stress: null }
    };

    // Procesar actividad por hora (SOLO HOY)
    const hoursMap = new Array(24).fill(0);
    if (hourlyData.bucket && hourlyData.bucket.length > 0) {
        hourlyData.bucket.forEach(bucket => {
            const date = new Date(parseInt(bucket.startTimeMillis));
            const steps = bucket.dataset[0]?.point?.[0]?.value?.[0]?.intVal || 0;
            hoursMap[date.getHours()] = steps;
        });
    }
    stats.activityByHour = hoursMap.map((totalSteps, hour) => ({
        hour: hour,
        steps: totalSteps,
        active: totalSteps > 500
    }));

    // 1. Preparar Mapa de Sesiones usando los segmentos detallados
    const sleepMap = {};

    if (detailedSleepSegments && detailedSleepSegments.length > 0) {
        console.log(`🔍 Procesando ${detailedSleepSegments.length} sesiones con segmentos detallados`);

        detailedSleepSegments.forEach(sessionData => {
            const wakeUpDate = new Date(sessionData.sessionEnd);
            const dateKey = wakeUpDate.toLocaleDateString();

            let totalSleepMillis = 0;

            sessionData.segments.forEach(seg => {
                const type = seg.value[0].intVal;
                const segStart = parseInt(seg.startTimeNanos) / 1000000;
                const segEnd = parseInt(seg.endTimeNanos) / 1000000;
                const duration = segEnd - segStart;

                console.log(`   ${dateKey} - Tipo: ${type}, Duración: ${(duration / 1000 / 60).toFixed(1)}min`);

                // Excluir Awake (1) y Out of Bed (3)
                // 1=Awake, 2=Sleep, 3=Out-of-bed, 4=Light, 5=Deep, 6=REM
                if (type !== 1 && type !== 3) {
                    totalSleepMillis += duration;
                }
            });

            const hours = totalSleepMillis / (1000 * 60 * 60);
            console.log(`   ✅ ${dateKey}: ${hours.toFixed(2)}h de sueño real`);

            if (!sleepMap[dateKey]) sleepMap[dateKey] = 0;
            sleepMap[dateKey] += hours;
        });
    } else if (sleepSessionData && sleepSessionData.session) {
        // Fallback: usar duración de sesión completa si no hay segmentos
        console.log('⚠️ No hay segmentos detallados, usando duración de sesiones');
        sleepSessionData.session.forEach(session => {
            if (session.activityType === 72) {
                const wakeUpTime = parseInt(session.endTimeMillis);
                const startTime = parseInt(session.startTimeMillis);
                const wakeUpDate = new Date(wakeUpTime);
                const dateKey = wakeUpDate.toLocaleDateString();
                const durationHours = (wakeUpTime - startTime) / (1000 * 60 * 60);

                if (!sleepMap[dateKey]) sleepMap[dateKey] = 0;
                sleepMap[dateKey] += durationHours;
            }
        });
    }


    // Procesar datos diarios finales para la gráfica
    if (dailyData.bucket && dailyData.bucket.length > 0) {
        dailyData.bucket.forEach(bucket => {
            const date = new Date(parseInt(bucket.startTimeMillis));
            const dateKey = date.toLocaleDateString();
            const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];

            // 1. Pasos
            let steps = 0;
            if (bucket.dataset[0]?.point?.length > 0) steps = bucket.dataset[0].point[0].value[0].intVal || 0;

            // 2. Calorías
            let calories = 0;
            if (bucket.dataset[1]?.point?.length > 0) calories = Math.round(bucket.dataset[1].point[0].value[0].fpVal || 0);

            // 3. Actividades (Yoga, etc.)
            if (bucket.dataset[2]?.point?.length > 0) {
                bucket.dataset[2].point.forEach(point => {
                    const activityType = point.value[0].intVal;
                    const duration = point.value[1].intVal || 0;
                    if (activityType === 100) stats.mindfulness.yoga += duration;
                    else if (activityType === 45) stats.mindfulness.meditation += duration;
                    else if (activityType === 106) stats.mindfulness.breathing += duration;
                });
            }

            // 4. Sueño (Usar cálculo preciso)
            const sleepHours = sleepMap[dateKey] || 0;

            stats.exerciseDays.push({
                day: dayName,
                date: dateKey, // Guardamos dateKey para buscar el 'hoy' luego
                hasExercise: steps > 5000,
                steps: steps,
                distance: 0,
                calories: calories
            });

            stats.sleepData.push({
                day: dayName,
                date: dateKey,
                hours: sleepHours
            });

            stats.weeklyTotals.steps += steps;
            stats.weeklyTotals.calories += calories;
        });
    }

    return stats;
}

// Global exposure
window.initGoogleIdentity = initGoogleIdentity;
window.fetchWeeklyData = fetchWeeklyData;
