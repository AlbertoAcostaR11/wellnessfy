import { AppState } from '../utils/state.js';
// Mock
export function showCreateChallengeModal() { console.log('Create Challenge Modal'); }

function renderChallengeCard(challenge) {
    // Badge logic
    let badgeHtml = '';
    if (challenge.isPro) {
        badgeHtml = `<span class="absolute bottom-3 left-3 bg-[#00f5d4] text-[#0f172a] text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(0,245,212,0.4)] uppercase tracking-widest flex items-center gap-1">Pro Challenge</span>`;
    }

    return `
        <div class="glass-card rounded-3xl overflow-hidden cursor-pointer group hover:border-[#00f5d4]/50 transition-all duration-300" onclick="showChallengeDetails('${challenge.id}')">
            <!-- Header Image -->
            <div class="h-32 w-full relative" style="background: ${challenge.imageGradient};">
                <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
                
                <!-- Glowing effect overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                ${badgeHtml}
                
                <!-- Creator Badge -->
                <div class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <span class="text-[9px] font-bold text-white uppercase tracking-wider">${challenge.creator.name}</span>
                    ${challenge.creator.isBrand ? '<span class="material-symbols-outlined text-[12px] text-[#00d2ff]" style="font-variation-settings: \'FILL\' 1">verified</span>' : ''}
                </div>
            </div>

            <!-- Body -->
            <div class="p-5 relative">
                <!-- Category -->
                <div class="text-[10px] font-bold text-[#00d2ff] uppercase tracking-widest mb-1.5">${challenge.category}</div>
                
                <!-- Title -->
                <h3 class="text-xl font-bold text-white mb-1 group-hover:text-[#00f5d4] transition-colors">${challenge.name}</h3>
                <p class="text-xs text-white/50 font-medium mb-4 line-clamp-1">${challenge.description}</p>
                
                <!-- Stats Row -->
                <div class="flex items-center gap-4 text-xs text-white/60 font-medium mb-4">
                    <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">group</span>
                        ${challenge.participants.toLocaleString()} participants
                    </div>
                     <div class="flex items-center gap-1.5">
                        <span class="material-symbols-outlined text-sm">schedule</span>
                        Termina en ${challenge.period}
                    </div>
                </div>

                <!-- Progress Bar (if available) -->
                ${challenge.progress !== undefined ? `
                <div class="mt-2">
                     <div class="flex justify-between items-end mb-1.5">
                        <p class="text-white/40 text-[9px] font-bold uppercase tracking-widest">
                            ${challenge.type === 'group' ? `Top ${challenge.rank}` : 'Tu Progreso'}
                        </p>
                        <p class="text-[#00f5d4] text-[10px] font-bold">${challenge.progress}%</p>
                    </div>
                    <div class="h-1.5 w-full bg-[#0f172a] rounded-full overflow-hidden border border-white/5">
                        <div class="h-full bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-full shadow-[0_0_10px_rgba(0,245,212,0.3)]" style="width: ${challenge.progress}%"></div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderChallenges() {
    return `
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold tracking-tight">Mis Desafíos</h1>
            <button class="btn-primary" onclick="showCreateChallengeModal()">
                <span class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-lg">add</span>
                    Crear
                </span>
            </button>
        </div>

        <!-- Challenge Filters -->
        <div class="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
            <button class="badge badge-primary cursor-pointer">Todos</button>
            <button class="badge badge-secondary cursor-pointer">Grupales</button>
            <button class="badge badge-purple cursor-pointer">Individuales</button>
            <button class="badge badge-pink cursor-pointer">Activos</button>
        </div>

        <!-- Challenges List -->
        <div class="space-y-4">
            ${AppState.challenges.map(challenge => renderChallengeCard(challenge)).join('')}
        </div>


    `;
}

export { renderChallenges, renderChallengeCard };
