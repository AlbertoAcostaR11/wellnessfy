import { AppState } from '../utils/state.js';
import { navigateTo } from '../router.js';
// Mock handlers
function showChallengeOptions(id) { console.log('Challenge Options'); }
function searchFriendsForChallenge(val) { console.log('Search:', val); }


function renderChallengeDetailPage() {
    const challenge = AppState.challenges.find(c => c.id === AppState.activeChallengeId) || AppState.challenges[0];
    if (!challenge) return '<div class="p-10 text-center">No challenge found</div>';

    return `
        <div class="glass-header sticky top-0 z-50">
            <div class="flex items-center justify-between p-4">
                <button class="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all hover:bg-white/10" onclick="navigateTo('challenges')">
                    <span class="material-symbols-outlined text-white">arrow_back_ios_new</span>
                </button>
                <h1 class="text-sm font-bold uppercase tracking-[0.2em] text-white">Detalles del Desafío</h1>
                <button class="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10" onclick="showChallengeOptions('${challenge.id}')">
                    <span class="material-symbols-outlined text-white">more_horiz</span>
                </button>
            </div>
        </div>

        <div class="pb-32">
            <!-- Header Image Area -->
            <div class="relative w-full h-[320px] max-w-2xl mx-auto">
                 <div class="w-full h-full bg-cover bg-center" style="background: ${challenge.imageGradient}"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/20 to-transparent"></div>
                
                <div class="absolute bottom-6 left-4 right-4 text-white">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-[#00f5d4]/20 text-[#00f5d4] border border-[#00f5d4]/30 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Activo Ahora</span>
                        ${challenge.isPro ? '<span class="bg-[#ffd700]/10 text-[#ffd700] border border-[#ffd700]/30 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Premium</span>' : ''}
                    </div>
                    <h2 class="text-3xl font-bold leading-tight mb-1 text-white drop-shadow-lg">${challenge.name}</h2>
                    <div class="flex items-center gap-2">
                        <p class="text-gray-300 text-sm">Creado por <span class="text-white font-semibold">${challenge.creator.name}</span></p>
                        <span class="size-1 w-1 rounded-full bg-gray-500"></span>
                        <p class="text-[#00f5d4] text-sm font-medium">${challenge.period}</p>
                    </div>
                    <p class="text-xs text-white/60 font-medium flex items-center gap-1 mt-1">
                        <span class="material-symbols-outlined text-xs">event</span>
                        Finaliza el ${new Date(challenge.endDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <!-- Content -->
            <div class="px-4 -mt-6 relative z-10 space-y-6 max-w-2xl mx-auto">
                <!-- Progress Card -->
                <div class="glass-card rounded-2xl p-5 border border-white/10 bg-[#0f172a]/80 backdrop-blur-xl">
                    <div class="flex justify-between items-end mb-3">
                        <div>
                            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Tu Progreso</p>
                            <p class="text-xl font-bold text-white">${challenge.progress || 0}% <span class="text-gray-500 text-sm font-medium">/ ${challenge.metric}</span></p>
                        </div>
                        <p class="text-[#00f5d4] font-black text-sm">${challenge.progress || 0}%</p>
                    </div>
                    <div class="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-[#00f5d4] to-[#00b8ff] shadow-[0_0_10px_rgba(0,245,212,0.5)]" style="width: ${challenge.progress || 0}%"></div>
                    </div>
                </div>

                <!-- Bet Card (if exists) -->
                ${challenge.bet && challenge.bet.active ? `
                <div class="bet-card-glow bg-gradient-to-br from-[#0f172a] to-black rounded-2xl p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-10">
                        <span class="material-symbols-outlined text-[100px] text-[#00f5d4]">emoji_events</span>
                    </div>
                    <div class="flex items-start justify-between mb-4 relative z-10">
                        <div class="flex items-center gap-3">
                            <div class="size-12 bg-[#00f5d4]/20 rounded-2xl flex items-center justify-center border border-[#00f5d4]/40 shadow-[0_0_15px_rgba(0,245,212,0.3)]">
                                <span class="material-symbols-outlined text-[#00f5d4] text-3xl" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                            </div>
                            <div>
                                <h3 class="text-xs font-black text-gray-400 uppercase tracking-[0.2em] leading-tight mb-1">Apuesta del Reto</h3>
                                <p class="text-lg font-bold text-white">${challenge.bet.prize || 'Premio Sorpresa'}</p>
                            </div>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-4 relative z-10">
                        ¡Alcanza la meta para ganar el premio!
                    </p>
                </div>
                ` : ''}

                <!-- Participants & Leaderboard -->
                <div>
                    <div class="flex items-center justify-between mb-4 px-1">
                        <h3 class="text-lg font-bold text-white">Participantes</h3>
                        <span class="text-[10px] font-black text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/10 uppercase">Total: ${challenge.participants}</span>
                    </div>

                    <!-- Search Friend Input -->
                    <div class="relative mb-4 group">
                        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-lg group-focus-within:text-primary transition-colors">person_add</span>
                        <input type="text" placeholder="Buscar amigo para invitar..." class="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all" onkeyup="searchFriendsForChallenge(this.value)">
                        <button class="absolute right-3 top-1/2 -translate-y-1/2 text-primary text-xs font-bold uppercase tracking-wider opacity-0 group-focus-within:opacity-100 transition-opacity" onclick="showToast('Invitación enviada')">
                            Invitar
                        </button>
                    </div>

                    <!-- Avatars Row (Mock) -->
                    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2" style="scrollbar-width: none;">
                        <div class="flex -space-x-3 mr-4 pl-2">
                             ${[1, 2, 3, 4, 5].map(i => `
                                <div class="size-10 rounded-full border-2 border-[#050b12] bg-gray-700 flex items-center justify-center text-xs text-white  bg-cover bg-center" style="background-image: url('https://i.pravatar.cc/150?img=${i + 10}')"></div>
                             `).join('')}
                             <div class="size-10 rounded-full border-2 border-[#050b12] bg-[#0f172a] flex items-center justify-center text-[10px] font-bold text-white">+${challenge.participants > 5 ? challenge.participants - 5 : 0}</div>
                        </div>
                        <button class="whitespace-nowrap bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all text-white hover:bg-white/10" onclick="showToast('Invitación enviada')">Invitar Amigos</button>
                    </div>

                    <!-- Leaderboard Table -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between px-1 mb-2">
                            <p class="text-[10px] font-black text-[#00f5d4] uppercase tracking-widest">Ranking Top</p>
                            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Puntaje</p>
                        </div>
                        
                        <!-- Rank 1 -->
                        <div class="leaderboard-row flex items-center justify-between p-3 rounded-2xl relative overflow-hidden group border-l-4 border-l-[#ffd700]">
                            <div class="flex items-center gap-4">
                                <span class="text-sm font-black text-[#ffd700] w-4 text-center">1</span>
                                <div class="relative">
                                    <div class="size-12 rounded-xl border border-[#ffd700]/30 bg-cover bg-center" style="background-image: url('https://i.pravatar.cc/150?img=12')"></div>
                                    <div class="absolute -top-2 -right-2 text-[#ffd700] bg-black rounded-full">
                                        <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
                                    </div>
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-white">Mike Chen</p>
                                    <p class="text-[10px] text-gray-500 font-medium">98% Streak</p>
                                </div>
                            </div>
                            <p class="text-sm font-black text-[#00f5d4]">100%</p>
                        </div>

                         <!-- Rank 2 (You) -->
                        <div class="leaderboard-row flex items-center justify-between p-3 rounded-2xl border border-[#00f5d4]/50 bg-[#00f5d4]/10 shadow-[0_0_15px_rgba(0,245,212,0.1)]">
                            <div class="flex items-center gap-4">
                                <span class="text-sm font-black text-white w-4 text-center">2</span>
                                <div class="size-12 rounded-xl border border-white/10 bg-cover bg-center" style="background-image: url('${AppState.currentUser.avatar}')"></div>
                                <div>
                                    <p class="text-sm font-bold text-white">Tú</p>
                                    <div class="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                                        <span class="material-symbols-outlined text-[12px]">trending_up</span>
                                        <span>Subiendo</span>
                                    </div>
                                </div>
                            </div>
                            <p class="text-sm font-black text-gray-300">${challenge.progress}%</p>
                        </div>

                        <!-- Rank 3 -->
                        <div class="leaderboard-row flex items-center justify-between p-3 rounded-2xl">
                            <div class="flex items-center gap-4">
                                <span class="text-sm font-black text-gray-400 w-4 text-center">3</span>
                                <div class="size-12 rounded-xl border border-white/10 bg-cover bg-center" style="background-image: url('https://i.pravatar.cc/150?img=20')"></div>
                                <div>
                                    <p class="text-sm font-bold text-white">Sarah K.</p>
                                    <p class="text-[10px] text-gray-500 font-medium">Active</p>
                                </div>
                            </div>
                            <p class="text-sm font-black text-gray-300">40%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Footer Action -->
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-[#050b12]/80 backdrop-blur-xl border-t border-white/5 z-50 md:ml-64">
            <div class="max-w-2xl mx-auto">
                <div class="flex items-center gap-4">
                    <button class="flex-[1] h-14 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all text-gray-400 hover:text-white" onclick="showToast('Compartir...')">
                        <span class="material-symbols-outlined">share</span>
                        <span class="text-[9px] font-bold uppercase tracking-widest">Share</span>
                    </button>
                    <button class="flex-[3] h-14 bg-gradient-to-r from-[#00f5d4] to-[#00b8ff] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all text-[#0f172a] hover:brightness-110" onclick="showToast('Registrando actividad...')">
                        <span class="material-symbols-outlined font-black">add_circle</span>
                        <span class="font-black uppercase tracking-widest text-sm">Registrar Actividad</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

export { renderChallengeDetailPage };
