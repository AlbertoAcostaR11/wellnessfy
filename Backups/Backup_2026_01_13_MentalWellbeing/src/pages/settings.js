
import { AppState } from '../utils/state.js';

export function renderSettingsPage() {
    const user = AppState.currentUser;

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
                            <input type="checkbox" checked class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                        </label>
                    </div>

                    <!-- Permisos -->
                    <button class="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors text-left" onclick="showToast('Gestión de permisos próximamente')">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-white/50">security</span>
                            <div>
                                <p class="text-sm font-bold text-white">Permisos</p>
                                <p class="text-[10px] text-white/50">Administrar accesos de la app</p>
                            </div>
                        </div>
                        <span class="material-symbols-outlined text-white/30 text-sm">arrow_forward_ios</span>
                    </button>
                </div>
            </section>

            <!-- Sincronización -->
            <section class="glass-card rounded-3xl p-1 border border-white/5 overflow-hidden">
                <div class="p-4 border-b border-white/5 bg-white/5">
                    <h3 class="text-sm font-bold text-[#00d2ff] uppercase tracking-widest">Conexiones</h3>
                </div>
                <div class="divide-y divide-white/5">
                    <!-- Google Fit -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                        <div class="flex items-center gap-3">
                            <div class="size-8 rounded-full bg-white flex items-center justify-center p-1.5">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Google_Fit_icon_%282018%29.svg/1024px-Google_Fit_icon_%282018%29.svg.png" class="size-full" alt="Google">
                            </div>
                            <div>
                                <p class="text-sm font-bold text-white">Google Fit</p>
                                <p class="text-[10px] text-[#00f5d4]">Sincronizado</p>
                            </div>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked class="sr-only peer" onchange="syncHealthConnect()">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4]"></div>
                        </label>
                    </div>

                    <!-- Apple Health -->
                    <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors opacity-50">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-2xl text-white">health_and_safety</span>
                            <div>
                                <p class="text-sm font-bold text-white">Apple Health</p>
                                <p class="text-[10px] text-white/50">No disponible en este dispositivo</p>
                            </div>
                        </div>
                         <span class="text-[10px] border border-white/10 px-2 py-1 rounded text-white/30">N/A</span>
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
