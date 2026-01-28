
import { AppState } from '../utils/state.js';
import { connectHealthProvider, getActiveProviderName } from '../utils/healthSync.js';

/**
 * Componente unificado para gestionar las conexiones de salud
 * Basado en el diseño premium de cards con switches
 */
export function renderHealthConnections() {
    const activeProvider = getActiveProviderName();

    const providers = [
        {
            id: 'googleFit',
            name: 'Google Fit',
            icon: 'https://www.gstatic.com/images/branding/product/1x/gfit_512dp.png',
            description: 'Sincroniza pasos, calorías y actividades de tu cuenta de Google.'
        },
        {
            id: 'fitbit',
            name: 'Fitbit',
            icon: 'src/resources/fitbit_logo_new.png',
            description: 'Obtén datos detallados de sueño y ejercicio de tus dispositivos Fitbit.'
        }
        /*
        ,
        {
            id: 'samsung',
            name: 'Samsung Health',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Samsung_Health_icon.png/120px-Samsung_Health_icon.png',
            description: 'Conecta con el ecosistema Galaxy para tus registros diarios.'
        },
        {
            id: 'huawei',
            name: 'Huawei Health',
            icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Huawei_Health_icon.svg/100px-Huawei_Health_icon.svg.png',
            description: 'Sincroniza tus relojes y bandas Huawei.'
        },
        {
            id: 'apple',
            name: 'Apple Health',
            icon: 'heart', // Placeholder emoji logic
            isComingSoon: true,
            description: 'Próximamente: Integración nativa para usuarios de iPhone.'
        }
        */
    ];

    return `
        <div class="health-connections-container space-y-4">
            <h3 class="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span class="material-symbols-outlined text-[#00f5d4]">monitor_heart</span>
                Conexiones de Salud
            </h3>
            
            <div class="grid gap-3">
                ${providers.map(p => renderConnectionCard(p, activeProvider)).join('')}
            </div>
            
            <p class="text-[10px] text-white/40 mt-4 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                <span class="font-bold text-[#00f5d4]">Nota:</span> Solo puedes tener una fuente de datos activa a la vez para evitar duplicidad de pasos y calorías. Al activar una nueva, se desactivará la anterior.
            </p>
        </div>
    `;
}

function renderConnectionCard(provider, activeProviderId) {
    const isConnected = activeProviderId === provider.id;
    const isComingSoon = provider.isComingSoon;

    // Logic for Apple Health icon (emoji)
    const iconContent = provider.id === 'apple'
        ? `<div class="size-10 rounded-2xl bg-gradient-to-b from-pink-400 to-red-500 flex items-center justify-center text-xl">❤️</div>`
        : `<div class="size-10 rounded-full bg-white flex items-center justify-center p-1.5 border border-white/10">
             <img src="${provider.icon}" class="size-full object-contain" alt="${provider.name}">
           </div>`;

    return `
        <div class="health-card group relative transition-all duration-300 ${isComingSoon ? 'opacity-50' : ''}">
            <div class="glass-card rounded-2xl p-4 flex items-center justify-between border ${isConnected ? 'border-[#00f5d4]/50 bg-[#00f5d4]/5' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}">
                <div class="flex items-center gap-4">
                    ${iconContent}
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-sm font-bold text-white">${provider.name}</span>
                            ${isConnected ? '<span class="size-1.5 rounded-full bg-[#00f5d4] animate-pulse"></span>' : ''}
                        </div>
                        <p class="text-[10px] ${isConnected ? 'text-[#00f5d4] font-bold' : 'text-white/40'} tracking-tight">
                            ${isComingSoon ? 'Próximamente' : (isConnected ? 'Conectado y Sincronizando' : 'Desconectado')}
                        </p>
                    </div>
                </div>
                
                ${isComingSoon ? `
                    <div class="w-10 h-5 bg-gray-800 rounded-full"></div>
                ` : `
                    <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" 
                               class="sr-only peer" 
                               ${isConnected ? 'checked' : ''} 
                               onchange="window.handleGlobalProviderToggle('${provider.id}', this.checked)">
                        <div class="w-11 h-6 bg-gray-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f5d4] peer-checked:shadow-[0_0_15px_rgba(0,245,212,0.4)]"></div>
                    </label>
                `}
            </div>
        </div>
    `;
}

