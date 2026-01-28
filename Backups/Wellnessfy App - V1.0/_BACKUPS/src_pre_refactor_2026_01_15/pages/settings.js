
import { AppState } from '../utils/state.js';
import { switchHealthProvider, getActiveProviderName } from '../utils/healthSync.js';

export function renderSettingsPage() {
    const user = AppState.currentUser;
    const activeProvider = getActiveProviderName();

    // Check permission states
    const cameraPermission = localStorage.getItem('camera_permission') === 'granted';
    const locationPermission = localStorage.getItem('location_permission') === 'granted';

    return `
        <div class="glass-header sticky top-0 z-50 mb-6 bg-[#020617]/80 backdrop-blur-xl -mx-4 px-4 py-4 border-b border-white/5 flex items-center gap-4">
             <button onclick="window.history.back()" class="size-10 rounded-full glass-card flex items-center justify-center active:scale-95 transition-all text-white/70 hover:text-white">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 class="text-xl font-bold text-white tracking-tight">Configuración</h2>
        </div>

        <div class="space-y-6 animate-fade-in pb-20">
            
            <!-- Perfil / Privacidad -->
            <section class="glass-card rounded-3xl p-1 border border-white/5 overflow-hidden">
                <div class="p-4 border-b border-white/5 bg-white/5">
                    <h3 class="text-sm font-bold text-[#00f5d4] uppercase tracking-widest">Privacidad y Cuenta</h3>
                </div>
                <div class="divide-y divide-white/5">
                    <!-- Correo -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white/50">mail</span>
                            <div>
                                <p class="text-sm font-bold text-white">Correo</p>
                                <p class="text-[10px] text-white/50">${user.email || 'No disponible'}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Switch Perfil Público -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white/50">public</span>
                            <div>
                                <p class="text-sm font-bold text-white">Perfil Público</p>
                                <p class="text-[10px] text-white/50">Visible para todos los usuarios</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="publicProfileToggle" ${user?.isPublic !== false ? 'checked' : ''} class="sr-only peer" onchange="window.toggleProfileVisibility(this.checked)">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                        </label>
                    </div>
                </div>
            </section>

             <!-- Permisos -->
            <section class="glass-card rounded-3xl p-1 border border-white/5 overflow-hidden">
                <div class="p-4 border-b border-white/5 bg-white/5">
                    <h3 class="text-sm font-bold text-[#ff9f43] uppercase tracking-widest">Permisos</h3>
                </div>
                <div class="divide-y divide-white/5">
                    <!-- Cámara / Galería -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white/50">photo_camera</span>
                            <div>
                                <p class="text-sm font-bold text-white">Cámara / Galería</p>
                                <p class="text-[10px] text-white/50">Acceso para subir fotos y videos</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="cameraPermissionToggle" ${cameraPermission ? 'checked' : ''} class="sr-only peer" onchange="window.requestCameraPermission(this.checked)">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9f43]"></div>
                        </label>
                    </div>

                    <!-- Ubicación -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white/50">location_on</span>
                            <div>
                                <p class="text-sm font-bold text-white">Ubicación</p>
                                <p class="text-[10px] text-white/50">Para encontrar actividades cercanas</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="locationPermissionToggle" ${locationPermission ? 'checked' : ''} class="sr-only peer" onchange="window.requestLocationPermission(this.checked)">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff9f43]"></div>
                        </label>
                    </div>
                </div>
            </section>

             <!-- Sincronización / Conexiones (Switches) -->
            <section class="glass-card rounded-3xl p-1 border border-white/5 overflow-hidden">
                <div class="p-4 border-b border-white/5 bg-white/5">
                    <h3 class="text-sm font-bold text-[#00d2ff] uppercase tracking-widest">Conexiones</h3>
                </div>
                <div class="divide-y divide-white/5">
                    <!-- Google Fit -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="size-8 rounded-full bg-white flex items-center justify-center p-1.5 border-2 ${activeProvider === 'googleFit' ? 'border-[#00f5d4]' : 'border-transparent'}">
                                <img src="https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png" class="size-full object-contain" alt="Google Fit">
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">Google Fit</p>
                                <p class="text-[10px] ${activeProvider === 'googleFit' ? 'text-[#00f5d4]' : 'text-white/50'}">
                                    ${activeProvider === 'googleFit' ? 'Conectado' : 'Desconectado'}
                                </p>
                            </div>
                        </div>
                        
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="toggle-googleFit" ${activeProvider === 'googleFit' ? 'checked' : ''} class="sr-only peer" onchange="window.handleProviderToggle('googleFit', this.checked)">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                        </label>
                    </div>

                    <!-- Fitbit -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="size-8 rounded-full bg-white flex items-center justify-center p-1.5 border-2 ${activeProvider === 'fitbit' ? 'border-[#00f5d4]' : 'border-transparent'}">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Fitbit_logo_2016.svg" class="size-full object-contain" alt="Fitbit">
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">Fitbit</p>
                                <p class="text-[10px] ${activeProvider === 'fitbit' ? 'text-[#00f5d4]' : 'text-white/50'}">
                                    ${activeProvider === 'fitbit' ? 'Conectado' : 'Desconectado'}
                                </p>
                            </div>
                        </div>
                        
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="toggle-fitbit" ${activeProvider === 'fitbit' ? 'checked' : ''} class="sr-only peer" onchange="window.handleProviderToggle('fitbit', this.checked)">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                        </label>
                    </div>

                    <!-- Apple Health -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors opacity-50">
                        <div class="flex items-center gap-3">
                            <div class="size-8 rounded-2xl bg-gradient-to-b from-pink-400 to-red-500 flex items-center justify-center">
                                <span class="text-2xl">❤️</span>
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">Apple Health</p>
                                <p class="text-[10px] text-white/50">Próximamente</p>
                            </div>
                        </div>
                         <!-- Disabled toggle -->
                         <div class="w-11 h-6 bg-gray-800 rounded-full opacity-50"></div>
                    </div>
                </div>
            </section>

             <!-- Notificaciones -->
            <section class="glass-card rounded-3xl p-1 border border-white/5 overflow-hidden">
                <div class="p-4 border-b border-white/5 bg-white/5">
                    <h3 class="text-sm font-bold text-[#7000ff] uppercase tracking-widest">Notificaciones</h3>
                </div>
                <div class="divide-y divide-white/5">
                     <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white/50">notifications_active</span>
                            <p class="text-sm font-bold text-white">Push Notifications</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked class="sr-only peer">
                             <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7000ff]"></div>
                        </label>
                    </div>
                </div>
            </section>

            <!-- Danger Zone -->
            <div class="pt-4">
                <button onclick="logout()" class="w-full glass-card border border-rose-500/30 bg-rose-500/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-rose-500/20 transition-all">
                    <span class="text-rose-500 font-bold text-sm">Cerrar Sesión</span>
                    <span class="material-symbols-outlined text-rose-500 group-hover:translate-x-1 transition-transform">logout</span>
                </button>
                 <p class="text-center text-[10px] text-white/20 mt-4">Wellnessfy v1.0.2 modular</p>
            </div>
        </div>
    `;
}

// Handle Provider Toggle (Exclusive Selection)
window.handleProviderToggle = async function (providerName, isChecked) {
    // Si el usuario apaga el toggle, desconectamos y cerramos sesión
    if (!isChecked) {
        console.log(`Desactivando ${providerName}...`);
        localStorage.removeItem('selectedHealthProvider');

        // Cerrar sesión real para olvidar tokens
        if (window.healthProviderManager) {
            window.healthProviderManager.logoutProvider(providerName);
            if (window.showToast) window.showToast(`Desconectado de ${providerName}`, 'info');
        }

        // Re-render
        const main = document.getElementById('mainContent');
        if (main) main.innerHTML = renderSettingsPage();
        return;
    }

    // Si el usuario enciende el toggle, iniciamos conexión
    console.log(`Activando ${providerName}...`);

    // 1. Apagar visualmente los otros toggles inmediatamente (UX)
    const otherProvider = providerName === 'googleFit' ? 'fitbit' : 'googleFit';
    const otherToggle = document.getElementById(`toggle-${otherProvider}`);
    if (otherToggle) otherToggle.checked = false;

    try {
        if (window.showToast) window.showToast(`Conectando con ${providerName}...`, 'info');

        // 2. Conectar y Autenticar
        if (window.connectHealthProvider) {
            // Force new connection to ensure auth popup appears
            await window.connectHealthProvider(providerName, true);
        } else {
            // Fallback
            await switchHealthProvider(providerName);
        }

        if (window.showToast) {
            window.showToast(`Conectado exitosamente a ${providerName}`, 'success');
        }

        // Re-render final para asegurar estado correcto
        const main = document.getElementById('mainContent');
        if (main) main.innerHTML = renderSettingsPage();

    } catch (error) {
        console.error('Error connecting provider:', error);
        if (window.showToast) {
            window.showToast(`Error de conexión: ${error.message}`, 'error');
        }

        // Revertir toggle si falló
        const toggle = document.getElementById(`toggle-${providerName}`);
        if (toggle) toggle.checked = false;

        // Limpiar selección si falló
        if (getActiveProviderName() === providerName) {
            localStorage.removeItem('selectedHealthProvider');
        }
    }
};

// Toggle profile visibility (public/private)
window.toggleProfileVisibility = async function (isPublic) {
    const user = AppState.currentUser;
    if (!user) return;

    // Update local state
    user.isPublic = isPublic;
    AppState.currentUser = user;

    // Save to localStorage
    if (window.saveUserData) {
        window.saveUserData();
    }

    // Update in Firestore
    if (window.db && user.uid) {
        try {
            await window.db.collection('users').doc(user.uid).update({
                isPublic: isPublic
            });

            const statusText = isPublic ? 'público' : 'privado';
            if (window.showToast) {
                window.showToast(`Perfil ahora es ${statusText}`, 'success');
            }
            console.log(`✅ Perfil actualizado a ${statusText}`);
        } catch (error) {
            console.error('Error actualizando visibilidad del perfil:', error);
            if (window.showToast) {
                window.showToast('Error al actualizar configuración', 'error');
            }
            // Revert toggle on error
            document.getElementById('publicProfileToggle').checked = !isPublic;
        }
    }
};

// Request Camera/Gallery Permission
window.requestCameraPermission = async function (enable) {
    if (!enable) {
        // User disabled permission
        localStorage.setItem('camera_permission', 'denied');
        if (window.showToast) {
            window.showToast('Permiso de cámara desactivado', 'info');
        }
        return;
    }

    try {
        // Request camera permission using MediaDevices API
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // Permission granted - stop the stream immediately
        stream.getTracks().forEach(track => track.stop());

        localStorage.setItem('camera_permission', 'granted');
        document.getElementById('cameraPermissionToggle').checked = true;

        if (window.showToast) {
            window.showToast('Permiso de cámara concedido', 'success');
        }
        console.log('✅ Permiso de cámara concedido');
    } catch (error) {
        console.error('Error solicitando permiso de cámara:', error);
        localStorage.setItem('camera_permission', 'denied');
        document.getElementById('cameraPermissionToggle').checked = false;

        if (window.showToast) {
            window.showToast('Permiso de cámara denegado', 'error');
        }
    }
};

// Request Location Permission
window.requestLocationPermission = async function (enable) {
    if (!enable) {
        // User disabled permission
        localStorage.setItem('location_permission', 'denied');
        if (window.showToast) {
            window.showToast('Permiso de ubicación desactivado', 'info');
        }
        return;
    }

    try {
        // Request location permission using Geolocation API
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Permission granted
                localStorage.setItem('location_permission', 'granted');
                localStorage.setItem('user_location', JSON.stringify({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                document.getElementById('locationPermissionToggle').checked = true;

                if (window.showToast) {
                    window.showToast('Permiso de ubicación concedido', 'success');
                }
                console.log('✅ Permiso de ubicación concedido:', position.coords);
            },
            (error) => {
                // Permission denied or error
                console.error('Error solicitando permiso de ubicación:', error);
                localStorage.setItem('location_permission', 'denied');
                document.getElementById('locationPermissionToggle').checked = false;

                if (window.showToast) {
                    window.showToast('Permiso de ubicación denegado', 'error');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } catch (error) {
        console.error('Error con geolocalización:', error);
        localStorage.setItem('location_permission', 'denied');
        document.getElementById('locationPermissionToggle').checked = false;

        if (window.showToast) {
            window.showToast('Error al solicitar ubicación', 'error');
        }
    }
};
