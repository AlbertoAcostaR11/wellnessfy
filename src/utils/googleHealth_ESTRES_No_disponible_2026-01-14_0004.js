// Google Health Connect Integration

const CLIENT_ID = '251804832640-0sepumqghs8rr54l0g3c5mk6gcqccv7b.apps.googleusercontent.com';
const SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.location.read'
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
                    { "dataTypeName": "com.google.active_minutes" }
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

    if (data.bucket && data.bucket.length > 0) {
        const dataset = data.bucket[0].dataset;
        console.log('📊 Datasets encontrados:', dataset.length);

        // 0: Steps
        if (dataset[0]?.point?.length > 0) {
            steps = dataset[0].point[0].value[0].intVal || 0;
            console.log('👣 Pasos:', steps);
        }

        // 1: Calories
        if (dataset[1]?.point?.length > 0) {
            calories = Math.round(dataset[1].point[0].value[0].fpVal || 0);
            console.log('🔥 Calorías:', calories);
        }

        // 2: Heart Rate (Avg)
        if (dataset[2]?.point?.length > 0) {
            if (dataset[2].point[0].value.length > 0) {
                heartRate = Math.round(dataset[2].point[0].value[0].fpVal || 0);
                console.log('❤️ Ritmo cardíaco:', heartRate);
            }
        }

        // 3: Active Minutes
        if (dataset[3]?.point?.length > 0) {
            activeMinutes = dataset[3].point[0].value[0].intVal || 0;
            console.log('⏱️ Minutos activos:', activeMinutes);
        }
    } else {
        console.log('⚠️ No se encontraron datos en los buckets');
    }

    // Update UI
    updateUI('valSteps', steps.toLocaleString());
    updateUI('valCalories', calories.toLocaleString());
    updateUI('valHeart', heartRate);
    updateUI('valActive', activeMinutes);

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
    console.log('📊 Solicitando Módulo: Estadísticas Semanales...');
    const end = new Date().getTime();
    const start = end - (7 * 24 * 60 * 60 * 1000);

    const body = {
        "aggregateBy": [
            { "dataTypeName": "com.google.step_count.delta" },
            { "dataTypeName": "com.google.calories.expended" },
            { "dataTypeName": "com.google.activity.segment" }
        ],
        "bucketByTime": { "durationMillis": 86400000 },
        "startTimeMillis": start,
        "endTimeMillis": end
    };

    const hourlyBody = {
        "aggregateBy": [{ "dataTypeName": "com.google.step_count.delta" }],
        "bucketByTime": { "durationMillis": 3600000 }, // 1 hora
        "startTimeMillis": start,
        "endTimeMillis": end
    };

    try {
        const [dailyResp, hourlyResp] = await Promise.all([
            fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }),
            fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(hourlyBody)
            })
        ]);

        const dailyData = await dailyResp.json();
        const hourlyData = await hourlyResp.json();

        if (dailyData.error) throw new Error(`Google API Error: ${dailyData.error.message}`);

        const stats = processWeeklyData(hourlyData, dailyData);

        if (window.renderWeeklyTotals) window.renderWeeklyTotals(stats.weeklyTotals);
        if (window.renderHourlyActivity) window.renderHourlyActivity(stats.activityByHour);
        if (window.renderExerciseDays) window.renderExerciseDays(stats.exerciseDays);
        if (window.renderFloorsClimbed) window.renderFloorsClimbed(stats.floorsClimbed);
        if (window.renderMindfulnessCharts) window.renderMindfulnessCharts(stats.mindfulness);

        // Guardar en AppState y actualizar UI
        if (window.AppState) {
            window.AppState.weeklyStats = stats;
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
    const end = new Date().getTime();
    const start = end - (7 * 24 * 60 * 60 * 1000);

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
function processWeeklyData(hourlyData, dailyData) {
    const stats = {
        activityByHour: [],
        exerciseDays: [],
        floorsClimbed: [],
        weeklyTotals: { steps: 0, distance: 0, calories: 0 },
        mindfulness: { yoga: 0, meditation: 0, breathing: 0, stress: null }
    };

    // Procesar actividad por hora (24h)
    const hoursMap = new Array(24).fill(0);
    if (hourlyData.bucket && hourlyData.bucket.length > 0) {
        hourlyData.bucket.forEach(bucket => {
            const date = new Date(parseInt(bucket.startTimeMillis));
            hoursMap[date.getHours()] += (bucket.dataset[0]?.point?.[0]?.value?.[0]?.intVal || 0);
        });
        stats.activityByHour = hoursMap.map((totalSteps, hour) => ({
            hour: hour,
            steps: totalSteps,
            active: totalSteps > 500
        }));
    }

    // Procesar datos diarios
    if (dailyData.bucket && dailyData.bucket.length > 0) {
        dailyData.bucket.forEach(bucket => {
            const date = new Date(parseInt(bucket.startTimeMillis));
            const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][date.getDay()];

            let steps = 0;
            if (bucket.dataset[0]?.point?.length > 0) steps = bucket.dataset[0].point[0].value[0].intVal || 0;

            let calories = 0;
            if (bucket.dataset[1]?.point?.length > 0) calories = Math.round(bucket.dataset[1].point[0].value[0].fpVal || 0);

            // Actividades
            if (bucket.dataset[2]?.point?.length > 0) {
                bucket.dataset[2].point.forEach(point => {
                    const activityType = point.value[0].intVal;
                    const duration = point.value[1].intVal || 0;
                    if (activityType === 100) stats.mindfulness.yoga += duration;
                    else if (activityType === 45) stats.mindfulness.meditation += duration;
                    else if (activityType === 106) stats.mindfulness.breathing += duration;
                });
            }

            stats.exerciseDays.push({
                day: dayName,
                date: date.toLocaleDateString(),
                hasExercise: steps > 5000,
                steps: steps,
                distance: 0,
                calories: calories
            });

            stats.floorsClimbed.push({ day: dayName, floors: 0 });

            stats.weeklyTotals.steps += steps;
            stats.weeklyTotals.calories += calories;
        });
    }

    return stats;
}

// Global exposure
window.initGoogleIdentity = initGoogleIdentity;
window.fetchWeeklyData = fetchWeeklyData;
