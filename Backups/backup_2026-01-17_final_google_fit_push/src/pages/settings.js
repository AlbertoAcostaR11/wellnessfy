
import { AppState } from '../utils/state.js';
import { switchHealthProvider, getActiveProviderName } from '../utils/healthSync.js';
// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyC9K_nqcTRPGtTpUfWDvkFhnAESaJ3I7Vs",
    authDomain: "wellnessfy-cbc1b.firebaseapp.com",
    projectId: "wellnessfy-cbc1b",
    storageBucket: "wellnessfy-cbc1b.firebasestorage.app",
    messagingSenderId: "232789372708",
    appId: "1:232789372708:web:e7d5fcffa0ba39cf6e0db1",
    measurementId: "G-0V7MV5E1CF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

import { renderHealthConnections } from '../components/HealthConnections.js';

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

             <!-- Sincronización / Conexiones (Nuevo Componente Centralizado) -->
            <section class="glass-card rounded-3xl p-6 border border-white/5 overflow-hidden">
                ${renderHealthConnections()}
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
                            <div>
                                <p class="text-sm font-bold text-white">Notificaciones Nativas</p>
                                <p class="text-[10px] text-white/50">Alertas en tiempo real incluso con la app cerrada</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="pushNotificationsToggle" ${Notification.permission === 'granted' ? 'checked' : ''} class="sr-only peer" onchange="window.requestNotificationPermission()">
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
    if (db && user.uid) {
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                isPublic: isPublic
            });

            const statusText = isPublic ? 'público' : 'privado';
            if (window.showToast) {
                window.showToast(`Perfil ahora es ${statusText} `, 'success');
            }
            console.log(`✅ Perfil actualizado a ${statusText} `);
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
