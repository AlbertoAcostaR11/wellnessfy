import { AppState } from '../utils/state.js';
// Mock global handlers
export function showCreateCircleModal() { console.log('Create Circle'); }
export function showCircleDetail(id) { console.log('Circle Detail', id); }
export function searchFriends(val) { console.log('Search Friends', val); }

function renderCircles() {
    return `
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold tracking-tight">Mis Círculos</h1>
            <button class="btn-primary" onclick="showCreateCircleModal()">
                <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">add</span>
                    Crear
                </span>
            </button>
        </div>

        <!-- Search Bar -->
        <div class="mb-8">
            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Buscar amigos o círculos</label>
            <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                <input type="text" placeholder="Buscar..." class="w-full bg-white/5 border border-white/10 text-white px-12 py-3 rounded-full outline-none focus:border-neon-teal focus:bg-white/10 transition-all placeholder:text-gray-600 shadow-inner" onkeyup="searchFriends(this.value)">
            </div>
        </div>

        <!-- Circles Grid (Round Cards) -->
        <div class="grid grid-cols-2 gap-6 mb-8">
            ${AppState.circles.map(circle => `
                <div class="flex flex-col items-center gap-3 group cursor-pointer" onclick="showCircleDetail('${circle.id}')">
                    <!-- Circular Card Image -->
                    <div class="relative size-32 rounded-full p-1 transition-transform duration-300 group-hover:scale-105" 
                         style="background: linear-gradient(135deg, ${circle.neonColor}, transparent); box-shadow: 0 0 20px ${circle.neonColor}40;">
                        <div class="size-full rounded-full bg-cover bg-center border-4 border-[#050b12]" 
                             style="background-image: url('${circle.image}');">
                             <!-- Overlay for Icon if needed, or just let image show -->
                             <div class="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span class="material-symbols-outlined text-white text-3xl drop-shadow-lg">${circle.icon}</span>
                             </div>
                        </div>
                        <!-- Notification Badge (Mock) -->
                        <div class="absolute top-0 right-1 size-6 bg-[#050b12] rounded-full flex items-center justify-center">
                            <div class="size-4 bg-red-500 rounded-full border-2 border-[#050b12]"></div>
                        </div>
                    </div>
                    
                    <!-- Label -->
                    <div class="text-center">
                        <h3 class="font-bold text-white text-sm mb-0.5 tracking-wide group-hover:text-[${circle.neonColor}] transition-colors">${circle.name}</h3>
                        <p class="text-[10px] font-bold text-white/40 uppercase tracking-wider">${circle.members} Miembros</p>
                    </div>
                </div>
            `).join('')}
        </div>



    `;
}

export { renderCircles };
