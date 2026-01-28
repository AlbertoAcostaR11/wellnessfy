/**
 * 🔄 Auto-Reconnection System
 * 
 * Sistema de reconexión automática para proveedores de salud
 * cuando el token expira o se pierde la conexión.
 */

import { healthProviderManager } from './healthProviders/HealthProviderManager.js';
import { AppState } from './state.js';

/**
 * Configuración de reconexión
 */
const RECONNECTION_CONFIG = {
    // Intentar reconectar automáticamente
    autoReconnect: true,

    // Tiempo antes de expiración para renovar (en ms)
    renewBeforeExpiry: 30 * 60 * 1000, // 30 minutos

    // Intervalo de verificación (en ms)
    checkInterval: 5 * 60 * 1000, // 5 minutos

    // Máximo de intentos automáticos
    maxRetries: 3,

    // Tiempo entre reintentos (en ms)
    retryDelay: 2000
};

/**
 * Estado del sistema de reconexión
 */
let reconnectionState = {
    isChecking: false,
    lastCheck: null,
    retryCount: 0,
    checkIntervalId: null
};

/**
 * Verifica si el token está próximo a expirar
 * @param {string} providerName - Nombre del proveedor
 * @returns {boolean}
 */
function isTokenExpiringSoon(providerName) {
    const expiryKey = `${providerName}_token_expiry`;
    const expiry = localStorage.getItem(expiryKey);

    if (!expiry) return true;

    const expiryTime = parseInt(expiry);
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    return timeUntilExpiry < RECONNECTION_CONFIG.renewBeforeExpiry;
}

/**
 * Intenta reconectar automáticamente con el proveedor
 * @param {string} providerName - Nombre del proveedor
 * @returns {Promise<boolean>}
 */
async function attemptAutoReconnect(providerName) {
    console.log(`🔄 Intentando reconexión automática con ${providerName}...`);

    try {
        const provider = healthProviderManager.getActiveProvider();

        if (!provider || provider.name.toLowerCase() !== providerName.toLowerCase()) {
            console.warn(`⚠️ Proveedor ${providerName} no está activo`);
            return false;
        }

        // Verificar si el proveedor tiene método de refresh
        if (typeof provider.refreshToken === 'function') {
            console.log('🔑 Intentando refresh token...');
            await provider.refreshToken();
            console.log('✅ Token renovado exitosamente');
            return true;
        }

        // Si no hay refresh token, mostrar notificación al usuario
        console.log('⚠️ Proveedor no soporta refresh automático');
        showReconnectionPrompt(providerName);
        return false;

    } catch (error) {
        console.error(`❌ Error en reconexión automática:`, error);
        return false;
    }
}

/**
 * Muestra un prompt al usuario para reconectar
 * @param {string} providerName - Nombre del proveedor
 */
function showReconnectionPrompt(providerName) {
    // Evitar mostrar múltiples prompts
    if (document.getElementById('reconnection-prompt')) {
        return;
    }

    const prompt = document.createElement('div');
    prompt.id = 'reconnection-prompt';
    prompt.className = 'fixed top-4 right-4 z-[9999] max-w-sm';
    prompt.innerHTML = `
        <div class="glass-card bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 shadow-2xl animate-fade-in">
            <div class="flex items-start gap-3">
                <div class="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <span class="material-symbols-outlined text-yellow-500 text-xl">warning</span>
                </div>
                <div class="flex-1">
                    <h3 class="text-sm font-bold text-white mb-1">Reconexión Necesaria</h3>
                    <p class="text-xs text-gray-400 mb-3">
                        Tu sesión con ${providerName} ha expirado. Reconecta para seguir sincronizando actividades.
                    </p>
                    <div class="flex gap-2">
                        <button 
                            onclick="reconnectProvider('${providerName}')" 
                            class="flex-1 px-3 py-2 bg-[#00f5d4] text-[#0f172a] rounded-lg text-xs font-bold hover:bg-[#00d4b8] transition-colors">
                            Reconectar Ahora
                        </button>
                        <button 
                            onclick="dismissReconnectionPrompt()" 
                            class="px-3 py-2 bg-white/5 text-white rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                            Más Tarde
                        </button>
                    </div>
                </div>
                <button onclick="dismissReconnectionPrompt()" class="text-gray-400 hover:text-white transition-colors">
                    <span class="material-symbols-outlined text-sm">close</span>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(prompt);

    // Auto-dismiss después de 30 segundos
    setTimeout(() => {
        dismissReconnectionPrompt();
    }, 30000);
}

/**
 * Reconectar con el proveedor (llamado desde el prompt)
 */
window.reconnectProvider = async function (providerName) {
    dismissReconnectionPrompt();

    try {
        if (window.showToast) {
            window.showToast(`Reconectando con ${providerName}...`, 'info');
        }

        const { connectHealthProvider } = await import('./healthSync_v2.js');
        await connectHealthProvider(providerName, true);

        if (window.showToast) {
            window.showToast(`✅ Reconectado con ${providerName}`, 'success');
        }

        // Sincronizar automáticamente después de reconectar
        if (window.syncHealthData) {
            await window.syncHealthData();
        }

    } catch (error) {
        console.error('Error reconectando:', error);
        if (window.showToast) {
            window.showToast(`Error: ${error.message}`, 'error');
        }
    }
};

/**
 * Cerrar el prompt de reconexión
 */
window.dismissReconnectionPrompt = function () {
    const prompt = document.getElementById('reconnection-prompt');
    if (prompt) {
        prompt.remove();
    }
};

/**
 * Verificar estado de conexión de todos los proveedores
 */
async function checkConnectionStatus() {
    if (reconnectionState.isChecking) {
        console.log('⏳ Verificación ya en progreso...');
        return;
    }

    reconnectionState.isChecking = true;
    reconnectionState.lastCheck = Date.now();

    console.log('🔍 Verificando estado de conexión de proveedores...');

    try {
        const selectedProvider = localStorage.getItem('selectedHealthProvider');

        if (!selectedProvider) {
            console.log('⚪ No hay proveedor seleccionado');
            return;
        }

        // Verificar si el token está próximo a expirar
        if (isTokenExpiringSoon(selectedProvider)) {
            console.log(`⏰ Token de ${selectedProvider} próximo a expirar`);

            // Intentar reconexión automática
            const success = await attemptAutoReconnect(selectedProvider);

            if (!success) {
                reconnectionState.retryCount++;

                if (reconnectionState.retryCount >= RECONNECTION_CONFIG.maxRetries) {
                    console.log('❌ Máximo de reintentos alcanzado');
                    showReconnectionPrompt(selectedProvider);
                    reconnectionState.retryCount = 0;
                }
            } else {
                reconnectionState.retryCount = 0;
            }
        } else {
            console.log(`✅ Token de ${selectedProvider} válido`);
            reconnectionState.retryCount = 0;
        }

    } catch (error) {
        console.error('❌ Error verificando conexión:', error);
    } finally {
        reconnectionState.isChecking = false;
    }
}

/**
 * Iniciar monitoreo automático de conexión
 */
export function startConnectionMonitoring() {
    if (reconnectionState.checkIntervalId) {
        console.log('⚠️ Monitoreo ya está activo');
        return;
    }

    console.log('🔄 Iniciando monitoreo de conexión automático...');

    // Verificar inmediatamente
    checkConnectionStatus();

    // Configurar verificación periódica
    reconnectionState.checkIntervalId = setInterval(() => {
        checkConnectionStatus();
    }, RECONNECTION_CONFIG.checkInterval);

    console.log(`✅ Monitoreo activo (cada ${RECONNECTION_CONFIG.checkInterval / 60000} minutos)`);
}

/**
 * Detener monitoreo automático de conexión
 */
export function stopConnectionMonitoring() {
    if (reconnectionState.checkIntervalId) {
        clearInterval(reconnectionState.checkIntervalId);
        reconnectionState.checkIntervalId = null;
        console.log('🛑 Monitoreo de conexión detenido');
    }
}

/**
 * Verificar conexión manualmente
 */
export async function checkConnection() {
    await checkConnectionStatus();
}

/**
 * Obtener estado del sistema de reconexión
 */
export function getReconnectionState() {
    return {
        ...reconnectionState,
        isMonitoring: !!reconnectionState.checkIntervalId,
        config: RECONNECTION_CONFIG
    };
}
