
import { AppState } from '../utils/state.js';
import { switchHealthProvider, getActiveProviderName } from '../utils/healthSync_v2.js';
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
import { renderNotificationsSettings } from '../components/NotificationsSettings.js';

let currentSettingsTab = 'personal'; // 'personal' | 'coach' | 'empresa'

export function renderSettingsPage(tab = 'personal') {
    currentSettingsTab = tab;
    return `
        <div class="glass-header sticky top-0 z-50 mb-4 bg-[#020617]/80 backdrop-blur-xl -mx-4 px-4 py-4 border-b border-white/5">
            <div class="flex items-center gap-4 mb-4">
                <button onclick="window.history.back()" class="size-10 rounded-full glass-card flex items-center justify-center active:scale-95 transition-all text-white/70 hover:text-white">
                    <span class="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 class="text-xl font-bold text-white tracking-tight">Mi Perfil</h2>
            </div>

            <!-- Tab Navigation -->
            <div class="flex w-full border-b border-white/5">
                <button class="flex-1 pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentSettingsTab === 'personal' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                        onclick="switchSettingsTab('personal')">
                    Personal
                </button>
                <button class="flex-1 pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentSettingsTab === 'coach' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                        onclick="switchSettingsTab('coach')">
                    Coach
                </button>
                <button class="flex-1 pb-3 text-[10px] font-black uppercase tracking-widest transition-all ${currentSettingsTab === 'empresa' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                        onclick="switchSettingsTab('empresa')">
                    Empresa
                </button>
            </div>
        </div>

        <div id="settingsTabContent" class="pb-24 animate-fade-in">
            ${renderCurrentTab()}
        </div>
    `;
}

function renderCurrentTab() {
    switch (currentSettingsTab) {
        case 'personal': return renderPersonalTab();
        case 'coach': return renderCoachTab();
        case 'empresa': return renderEmpresaTab();
        default: return renderPersonalTab();
    }
}

import { navigateTo } from '../router.js';

window.switchSettingsTab = function (tab) {
    navigateTo('settings', tab);
};

function renderPersonalTab() {
    const user = AppState.currentUser;
    // Check permission states
    const cameraPermission = localStorage.getItem('camera_permission') === 'granted';
    const locationPermission = localStorage.getItem('location_permission') === 'granted';

    return `
        <div class="space-y-6 animate-fade-in">
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

             <!-- Sincronización / Conexiones -->
            <section class="glass-card rounded-3xl p-6 border border-white/5 overflow-hidden">
                ${renderHealthConnections()}
            </section>

            <!-- Notificaciones -->
            <section class="glass-card rounded-3xl p-1 border border-white/5 overflow-hidden">
                ${renderNotificationsSettings()}
            </section>

            <!-- Danger Zone -->
            <div class="pt-4">
                <button onclick="logout()" class="w-full glass-card border border-rose-500/30 bg-rose-500/10 p-4 rounded-2xl flex items-center justify-between group hover:bg-rose-500/20 transition-all">
                    <span class="text-rose-500 font-bold text-sm">Cerrar Sesión</span>
                    <span class="material-symbols-outlined text-rose-500 group-hover:translate-x-1 transition-transform">logout</span>
                </button>
            </div>
        </div>
    `;
}

function renderCoachTab() {
    return `
        <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
            <div class="size-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)] border border-blue-500/30">
                <span class="material-symbols-outlined text-4xl text-blue-400">fitness_center</span>
            </div>
            <h3 class="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Perfiles Pro</h3>
            <p class="text-sm text-white/60 mb-8 max-w-xs">
                Wellnessfy para profesionales de Fitness, Nutrición, Yoga y Meditación. 
                <span class="block mt-2 font-bold text-blue-400">Próximamente disponible.</span>
            </p>
            <div class="w-full max-w-xs p-4 rounded-2xl border border-white/5 bg-white/5 text-left">
                <h4 class="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Características</h4>
                <ul class="space-y-3">
                    <li class="flex items-center gap-2 text-xs text-white/50">
                        <span class="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                        Gestión de clientes y círculos
                    </li>
                    <li class="flex items-center gap-2 text-xs text-white/50">
                        <span class="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                        Desafíos exclusivos de marca
                    </li>
                    <li class="flex items-center gap-2 text-xs text-white/50">
                        <span class="material-symbols-outlined text-blue-400 text-sm">check_circle</span>
                        Monetización de tu contenido
                    </li>
                </ul>
            </div>
        </div>
    `;
}

function renderEmpresaTab() {
    // Si el usuario ya tiene una empresa, mostramos el dashboard de gestión
    if (AppState.userCompany) {
        return renderCompanyDashboard();
    }

    // Si no tiene empresa, mostramos el flujo de venta / onboarding
    return `
        <div class="flex flex-col items-center justify-center py-8 px-6 text-center animate-fade-in pb-24">
            <div class="size-20 rounded-full bg-[#00f5d4]/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,245,212,0.2)] border border-[#00f5d4]/30">
                <span class="material-symbols-outlined text-4xl text-[#00f5d4]">corporate_fare</span>
            </div>
            <h3 class="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Wellnessfy Business</h3>
            
            <p class="text-sm text-white/70 mb-8 max-w-lg leading-relaxed">
                <span class="font-bold text-[#00f5d4]">Wellnessfy para Empresas</span> es la plataforma de gestión que conecta tu marca directamente con la comunidad activa de Wellnessfy. Transforma tu Empresa en un compañero de entrenamiento para tus clientes y colaboradores.
            </p>

            <h4 class="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 w-full text-left">Funciones Principales</h4>
            
            <div class="grid grid-cols-1 gap-4 w-full mb-10">
                <!-- Desafíos -->
                <div class="glass-card p-5 rounded-2xl border border-white/5 text-left flex items-start gap-4">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[#00f5d4]">trophy</span>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1">Desafíos de Marca 🏆</h4>
                        <p class="text-[10px] text-white/50 leading-normal">Crea retos patrocinados con tus propios premios, insignias y cupones de descuento automáticos.</p>
                    </div>
                </div>

                <!-- Analítica -->
                <div class="glass-card p-5 rounded-2xl border border-white/5 text-left flex items-start gap-4">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[#00f5d4]">monitoring</span>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1">Analítica de Impacto 📊</h4>
                        <p class="text-[10px] text-white/50 leading-normal">Dashboard con datos reales de alcance, demografía y fidelidad real vs. likes vacíos.</p>
                    </div>
                </div>

                <!-- Conversión -->
                <div class="glass-card p-5 rounded-2xl border border-white/5 text-left flex items-start gap-4">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[#00f5d4]">rocket_launch</span>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1">Herramientas de Conversión 🚀</h4>
                        <p class="text-[10px] text-white/50 leading-normal">Convierte el esfuerzo físico en tráfico web, reservas o ventas directas con botones personalizados.</p>
                    </div>
                </div>

                <!-- Corporate -->
                <div class="glass-card p-5 rounded-2xl border border-white/5 text-left flex items-start gap-4">
                    <div class="size-10 rounded-xl bg-[#00f5d4]/10 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-[#00f5d4]">groups_2</span>
                    </div>
                    <div>
                        <h4 class="text-xs font-bold text-white uppercase tracking-wider mb-1">Corporate Wellness 🏢</h4>
                        <p class="text-[10px] text-white/50 leading-normal">Fomenta la salud laboral con grupos privados y rankings validados por correo corporativo.</p>
                    </div>
                </div>
            </div>

            <div class="p-6 rounded-3xl bg-gradient-to-br from-[#00f5d4]/10 to-transparent border border-[#00f5d4]/20 mb-10">
                <p class="text-xs text-white/80 italic leading-relaxed">
                    "Con Wellnessfy para Empresas generas fidelidad asociando tu Marca con experiencias de bienestar y logro personal de tus clientes y colaboradores."
                </p>
            </div>

            <button onclick="navigateTo('create-company')" class="w-full h-14 bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-2xl text-[#020617] font-black uppercase tracking-widest text-xs shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">add_business</span>
                Crear una Empresa
            </button>
            <p class="text-[9px] text-white/20 mt-4 uppercase tracking-widest font-black">Control total desde tu Panel Business</p>
        </div>
    `;
}

function renderCompanyDashboard() {
    const company = AppState.userCompany;
    return `
        <div class="animate-fade-in pb-24">
            <!-- Company Mini Header -->
            <div class="glass-card rounded-3xl p-6 border border-[#00f5d4]/20 mb-6 bg-gradient-to-br from-[#00f5d4]/5 to-transparent">
                <div class="flex items-center gap-4 mb-6">
                    <div class="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        ${company.logoURL ? `<img src="${company.logoURL}" class="size-full object-cover">` : `<span class="material-symbols-outlined text-3xl text-white/20">business</span>`}
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-white uppercase tracking-tighter">${company.name}</h3>
                        <div class="flex items-center gap-2">
                             <span class="px-2 py-0.5 rounded-full bg-[#00f5d4]/10 text-[#00f5d4] text-[8px] font-black uppercase tracking-widest border border-[#00f5d4]/20">${company.plan}</span>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 mb-6">
                    <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p class="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Mis Desafíos</p>
                        <p class="text-xl font-black text-white">0</p>
                    </div>
                    <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p class="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1">Alcance Total</p>
                        <p class="text-xl font-black text-white">0</p>
                    </div>
                </div>

                <a href="https://business.wellnessfy.io" target="_blank" class="w-full h-14 bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-full text-[#020617] text-xs font-black uppercase tracking-widest shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    Ir al Panel Business
                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                </a>
            </div>

            <!-- Quick Actions -->
            <h4 class="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 ml-2">Gestión Rápida</h4>
            <div class="space-y-3">
                 <button class="w-full glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all text-left">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-[#00f5d4]">add_circle</span>
                        <span class="text-xs font-bold text-white uppercase tracking-wider">Nuevo Desafío de Marca</span>
                    </div>
                    <span class="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">chevron_right</span>
                </button>
                 <button class="w-full glass-card p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-all text-left">
                    <div class="flex items-center gap-3">
                        <span class="material-symbols-outlined text-white/50">settings</span>
                        <span class="text-xs font-bold text-white uppercase tracking-wider">Configurar Marca</span>
                    </div>
                    <span class="material-symbols-outlined text-white/20 group-hover:text-white transition-colors">chevron_right</span>
                </button>
            </div>
            
            <p class="text-center text-[9px] text-white/20 mt-8 uppercase tracking-[0.2em] font-black">Tu Marca está verificada y activa</p>
        </div>
    `;
}

window.toggleProfileVisibility = async function (isPublic) {
    const user = AppState.currentUser;
    if (!user) return;

    user.isPublic = isPublic;
    AppState.currentUser = user;

    if (window.saveUserData) {
        window.saveUserData();
    }

    if (db && (user.uid || user.id)) {
        try {
            const userRef = doc(db, 'users', user.uid || user.id);
            await updateDoc(userRef, {
                isPublic: isPublic
            });

            const statusText = isPublic ? 'público' : 'privado';
            if (window.showToast) {
                window.showToast(`Perfil ahora es ${statusText} `, 'success');
            }
        } catch (error) {
            console.error('Error actualizando visibilidad del perfil:', error);
            if (window.showToast) {
                window.showToast('Error al actualizar configuración', 'error');
            }
            const el = document.getElementById('publicProfileToggle');
            if (el) el.checked = !isPublic;
        }
    }
};

window.requestCameraPermission = async function (enable) {
    if (!enable) {
        localStorage.setItem('camera_permission', 'denied');
        if (window.showToast) window.showToast('Permiso de cámara desactivado', 'info');
        return;
    }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        localStorage.setItem('camera_permission', 'granted');
        if (window.showToast) window.showToast('Permiso de cámara concedido', 'success');
    } catch (error) {
        localStorage.setItem('camera_permission', 'denied');
        if (document.getElementById('cameraPermissionToggle')) document.getElementById('cameraPermissionToggle').checked = false;
        if (window.showToast) window.showToast('Permiso de cámara denegado', 'error');
    }
};

window.requestLocationPermission = async function (enable) {
    if (!enable) {
        localStorage.setItem('location_permission', 'denied');
        if (window.showToast) window.showToast('Permiso de ubicación desactivado', 'info');
        return;
    }
    try {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                localStorage.setItem('location_permission', 'granted');
                localStorage.setItem('user_location', JSON.stringify({ lat: position.coords.latitude, lng: position.coords.longitude }));
                if (window.showToast) window.showToast('Permiso de ubicación concedido', 'success');
            },
            () => {
                localStorage.setItem('location_permission', 'denied');
                if (document.getElementById('locationPermissionToggle')) document.getElementById('locationPermissionToggle').checked = false;
                if (window.showToast) window.showToast('Permiso de ubicación denegado', 'error');
            }
        );
    } catch (error) {
        localStorage.setItem('location_permission', 'denied');
    }
};
