// Wellnessfy App - Main Application Logic
// removed import
// removed import

// Firebase removed

// ============================================
// STATE MANAGEMENT
// ============================================

// Load user data from localStorage
function loadUserData() {
    const savedUser = localStorage.getItem('wellnessfy_user');
    if (savedUser) {
        try {
            const userData = JSON.parse(savedUser);
            // Merge saved data with default data
            AppState.currentUser = { ...AppState.currentUser, ...userData };
        } catch (e) {
            console.error('Error loading user data:', e);
        }
    }
}

// Save user data to localStorage and Firestore
function saveUserData() { localStorage.setItem("wellnessfy_user", JSON.stringify(AppState.currentUser)); }

const AppState = {
    currentUser: {
        id: '',
        name: '',
        username: '',
        avatar: 'https://i.pravatar.cc/300?img=12',
        bio: '',
        isPublic: true,
        interests: [],
        stats: { steps: 0, activeMinutes: 0, sleepHours: 0, calories: 0, heartRate: 0 },
        goals: { steps: 10000, activeMinutes: 60, sleepHours: 8 },
        averages: { steps: 0, activeMinutes: 0, sleepHours: 0 },
        badges: []
    },
    currentPage: 'dashboard',
    challenges: [],
    circles: [],
    feedPosts: [],
    wellnessApps: [],
    notifications: []
};

// ============================================
// NAVIGATION
// ============================================

function navigateTo(page) {
    if (!page) page = 'dashboard';
    AppState.currentPage = page;
    localStorage.setItem('wellnessfy_last_page', page);

    // Update active nav button (Mobile)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });

    // Update active nav button (Desktop Sidebar)
    document.querySelectorAll('.nav-btn-desktop').forEach(btn => {
        btn.classList.remove('active', 'bg-white/10', 'text-primary');
        if (btn.dataset.page === page) {
            btn.classList.add('active', 'bg-white/10', 'text-primary');
        }
    });

    // Load page content
    const mainContent = document.getElementById('mainContent');

    switch (page) {

        case 'challenges':
            mainContent.innerHTML = renderChallenges();
            break;
        case 'challenge-detail':
            mainContent.innerHTML = renderChallengeDetailPage();
            break;
        case 'circles':
            mainContent.innerHTML = renderCircles();
            break;
        case 'feed':
            mainContent.innerHTML = renderFeed();
            break;
        case 'profile':
            mainContent.innerHTML = renderProfilePage();
            break;
        default:
            mainContent.innerHTML = renderFeed();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// EXPOSE CRITICAL GLOBALS EARLY
// ==========================================
// These need to be available immediately for HTML onclick handlers
window.navigateTo = navigateTo;
window.AppState = AppState;
window.saveUserData = saveUserData;

// Stub functions for HTML handlers (to be implemented)
window.sharePost = function (type) { console.log('sharePost:', type); };
window.showNotifications = function () { navigateTo('notifications'); };
window.showCreateModal = function () { console.log('Create modal - to be implemented'); };
window.showProfile = function () { navigateTo('profile'); };
window.showChallengeOptions = function (id) { console.log('Challenge options:', id); };
window.showCircleDetail = function (id) { console.log('Circle detail:', id); };
window.showEditProfile = function (onboarding) { console.log('Edit profile'); };
window.searchFriends = function (query) { console.log('Search:', query); };
window.addFriend = function (id) { console.log('Add friend:', id); };
window.showChallengeDetails = function (id) {
    AppState.activeChallengeId = id;
    navigateTo('challenge-detail');
};
window.showCreateChallengeModal = function () { console.log('Create challenge'); };
window.showCreateCircleModal = function () { console.log('Create circle'); };
window.createChallenge = function () { console.log('Creating challenge...'); };
window.createCircle = function () { console.log('Creating circle...'); };
window.closeModal = function () {
    const modal = document.getElementById('modalsContainer');
    if (modal) modal.innerHTML = '';
};
window.showToast = function (message, type = 'info') {
    console.log(`Toast [${type}]:`, message);
    // Simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full glass-card border-white/20 text-white text-sm font-medium z-50 animate-fade-in`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
};

// ============================================
// DASHBOARD PAGE
// ============================================

// ============================================
// COMPONENT RENDERERS
// ============================================

function showChallengeDetails(id) {
    AppState.activeChallengeId = id;
    navigateTo('challenge-detail');
}

function renderChallengeDetailPage() {
    const challenge = AppState.challenges.find(c => c.id === AppState.activeChallengeId) || AppState.challenges[0];

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

function renderDashboard_DISABLED() {
    const { stats, badges } = AppState.currentUser;
    const activeChallenge = AppState.challenges[0];

    return `
        <!-- Today's Vitals -->
        <section class="glass-card rounded-3xl p-6 mb-6">
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-lg font-bold tracking-tight">Estadísticas de Hoy</h3>
                <span class="badge badge-primary">
                    <span class="material-symbols-outlined text-xs">sync</span>
                    En Vivo
                </span>
            </div>
            
            <!-- Circular Progress -->
            <div class="flex flex-col items-center gap-8">
                <div class="relative size-56">
                    <svg class="size-full">
                        <defs>
                            <linearGradient id="neon-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
                                <stop offset="0%" stop-color="#00f5d4"></stop>
                                <stop offset="100%" stop-color="#00d2ff"></stop>
                            </linearGradient>
                        </defs>
                        <circle class="stroke-slate-800/50" cx="112" cy="112" fill="transparent" r="95" stroke-width="12"></circle>
                        <circle class="stroke-slate-800/50" cx="112" cy="112" fill="transparent" r="75" stroke-width="12"></circle>
                        <circle class="stroke-slate-800/50" cx="112" cy="112" fill="transparent" r="55" stroke-width="12"></circle>
                        <circle class="progress-ring-circle" cx="112" cy="112" fill="transparent" r="95" stroke="url(#neon-gradient)" stroke-dasharray="597" stroke-dashoffset="120" stroke-linecap="round" stroke-width="12"></circle>
                        <circle class="progress-ring-circle" cx="112" cy="112" fill="transparent" r="75" stroke="#00d2ff" stroke-dasharray="471" stroke-dashoffset="180" stroke-linecap="round" stroke-width="12"></circle>
                        <circle class="progress-ring-circle" cx="112" cy="112" fill="transparent" r="55" stroke="#7000ff" stroke-dasharray="345" stroke-dashoffset="60" stroke-linecap="round" stroke-width="12"></circle>
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-4xl neon-text-glow" style="font-variation-settings: 'FILL' 1">bolt</span>
                        <span class="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-[0.2em]">Energía</span>
                    </div>
                </div>
                
                <!-- Stats Grid -->
                <div class="grid grid-cols-3 gap-3 w-full">
                    <!-- Pasos (Cian #00f5d4 similar al anillo exterior) -->
                    <div class="flex flex-col items-center p-3 glass-card rounded-2xl hover:border-[#00f5d4]/30 transition-colors cursor-pointer" onclick="showGoalSettings('steps')">
                        <span class="material-symbols-outlined text-[#00f5d4] text-xl mb-1 drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]" style="font-variation-settings: 'FILL' 1">directions_walk</span>
                        <span class="text-[10px] font-bold text-[#00f5d4] uppercase mb-1 tracking-wider">Pasos</span>
                        <span class="text-sm font-bold text-[#00f5d4]">${stats.steps.toLocaleString()}</span>
                    </div>
                    
                    <!-- Activo (Azul #00d2ff igual al anillo medio) -->
                    <div class="flex flex-col items-center p-3 glass-card rounded-2xl hover:border-[#00d2ff]/30 transition-colors cursor-pointer" onclick="showGoalSettings('activeMinutes')">
                        <span class="material-symbols-outlined text-[#00d2ff] text-xl mb-1 drop-shadow-[0_0_8px_rgba(0,210,255,0.5)]" style="font-variation-settings: 'FILL' 1">fitness_center</span>
                        <span class="text-[10px] font-bold text-[#00d2ff] uppercase mb-1 tracking-wider">Activo</span>
                        <span class="text-sm font-bold text-[#00d2ff]">${stats.activeMinutes}<span class="text-[10px] ml-0.5 opacity-60">m</span></span>
                    </div>
                    
                    <!-- Sueño (Púrpura #7000ff igual al anillo interior) -->
                    <div class="flex flex-col items-center p-3 glass-card rounded-2xl hover:border-[#7000ff]/30 transition-colors cursor-pointer" onclick="showGoalSettings('sleepHours')">
                        <span class="material-symbols-outlined text-[#9d4edd] text-xl mb-1 drop-shadow-[0_0_8px_rgba(157,78,221,0.5)]" style="font-variation-settings: 'FILL' 1">bedtime</span>
                        <span class="text-[10px] font-bold text-[#9d4edd] uppercase mb-1 tracking-wider">Sueño</span>
                        <span class="text-sm font-bold text-[#9d4edd]">${Math.floor(stats.sleepHours)}<span class="text-[10px] ml-0.5 opacity-60">h</span> ${Math.round((stats.sleepHours % 1) * 60)}</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 gap-4 mb-8">
            <!-- Calorías (Naranja #ff9e00) -->
            <div class="flex flex-col items-center p-5 glass-card rounded-3xl hover:border-[#ff9e00]/30 transition-colors">
                <span class="material-symbols-outlined text-[#ff9e00] text-3xl mb-2 drop-shadow-[0_0_10px_rgba(255,158,0,0.5)]" style="font-variation-settings: 'FILL' 1">local_fire_department</span>
                <span class="text-[10px] font-bold text-[#ff9e00] uppercase mb-1 tracking-widest">Calorías</span>
                <span class="text-2xl font-bold text-[#ff9e00]">${stats.calories.toLocaleString()}</span>
                <div class="flex items-center gap-1 mt-1">
                    <span class="material-symbols-outlined text-[#ff9e00]/80 text-xs">trending_up</span>
                    <p class="text-[9px] text-[#ff9e00]/80 font-bold uppercase tracking-tighter">+12% pico</p>
                </div>
            </div>
            
            <!-- Corazón (Rosa #ff006e) -->
            <div class="flex flex-col items-center p-5 glass-card rounded-3xl hover:border-[#ff006e]/30 transition-colors">
                <span class="material-symbols-outlined text-[#ff006e] text-3xl mb-2 drop-shadow-[0_0_10px_rgba(255,0,110,0.5)]" style="font-variation-settings: 'FILL' 1">favorite</span>
                <span class="text-[10px] font-bold text-[#ff006e] uppercase mb-1 tracking-widest">Corazón</span>
                <div class="flex items-center gap-2">
                    <span class="text-2xl font-bold text-[#ff006e]">${stats.heartRate}</span>
                    <div class="size-2 bg-[#ff006e] rounded-full animate-pulse shadow-[0_0_8px_rgba(255,0,110,0.8)]"></div>
                </div>
                <p class="text-[9px] text-[#ff006e]/60 mt-1 font-bold uppercase tracking-tighter">BPM Reposo</p>
            </div>
        </div>

        <!-- Active Challenge -->
        <div class="flex items-center justify-between px-1 mb-4">
            <h2 class="text-xl font-bold tracking-tight">Desafío Activo</h2>
        </div>
        
        <div class="mb-8">
            ${renderChallengeCard(activeChallenge)}
        </div>

        <!-- Recent Badges -->
        <div class="flex items-center justify-between px-1 mb-4">
            <h2 class="text-xl font-bold tracking-tight">Insignias Recientes</h2>
            <span class="text-primary text-sm font-bold uppercase tracking-widest text-[10px] cursor-pointer" onclick="showProfile()">Ver Todas</span>
        </div>
        
        <div class="grid grid-cols-3 gap-3 mb-8">
            ${badges.slice(0, 3).map(badge => `
                <div class="glass-card rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary/30 transition-all">
                    <div class="size-12 rounded-full bg-gradient-to-br from-${badge.color === 'primary' ? 'primary' : badge.color === 'orange' ? '[#ff9e00]' : '[#fbbf24]'} to-${badge.color === 'primary' ? 'secondary' : badge.color === 'orange' ? '[#ff6b00]' : '[#f59e0b]'} flex items-center justify-center shadow-lg">
                        <span class="material-symbols-outlined text-navy-900 text-xl" style="font-variation-settings: 'FILL' 1">${badge.icon}</span>
                    </div>
                    <span class="text-[9px] font-bold text-white/80 text-center uppercase tracking-tight">${badge.name}</span>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// CHALLENGES PAGE
// ============================================

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

// ============================================
// CIRCLES PAGE
// ============================================

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

// ============================================
// FEED PAGE
// ============================================




function renderProfilePage() {
    const user = AppState.currentUser;
    // Mock counts for layout
    const postsCount = AppState.feedPosts.filter(p => p.author.username === user.username).length;
    const followersCount = "0";
    const followingCount = "0";

    return `
        <!-- Custom Header for Profile Page -->
        <div class="sticky top-0 bg-navy-900/80 backdrop-blur-lg z-40 -mx-4 -mt-6 px-4 py-4 mb-6 border-b border-white/5 flex items-center justify-between lg:hidden">
            <div class="flex items-center gap-2">
                <span class="font-bold text-xl tracking-tight">${user.username.replace('@', '')}</span>
                <span class="material-symbols-outlined text-primary text-lg" style="font-variation-settings: 'FILL' 1">verified</span>
            </div>
            <div class="flex items-center gap-4">
                <span class="material-symbols-outlined cursor-pointer">add_box</span>
                <span class="material-symbols-outlined cursor-pointer">menu</span>
            </div>
        </div>

        <section class="px-4">
            <!-- Large Avatar Centered -->
            <div class="flex flex-col items-center mb-4">
                <div class="size-28 rounded-full bg-gradient-to-tr from-primary to-secondary p-[3px] mb-3 shadow-[0_0_25px_rgba(0,245,212,0.3)]">
                    <div class="bg-navy-900 rounded-full size-full overflow-hidden">
                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-full" style="background-image: url('${user.avatar}');"></div>
                    </div>
                </div>
            </div>

            <!-- Name -->
            <h1 class="font-bold text-base text-center mb-1">${user.name}</h1>

            <!-- Stats Row -->
            <div class="flex justify-center gap-6 mb-4">
                <div class="text-center">
                    <p class="font-bold text-base">${postsCount}</p>
                    <p class="text-xs text-white/60">publicaciones</p>
                </div>
                <div class="text-center">
                    <p class="font-bold text-base">${followersCount}</p>
                    <p class="text-xs text-white/60">seguidores</p>
                </div>
                <div class="text-center">
                    <p class="font-bold text-base">${followingCount}</p>
                    <p class="text-xs text-white/60">seguidos</p>
                </div>
            </div>

            <!-- Bio -->
            <div class="mb-4 text-center">
                <p class="text-sm text-white/90 leading-relaxed">${user.bio}</p>
            </div>

            <!-- Link -->
            ${user.link ? `
            <div class="flex items-center justify-center gap-2 mb-4">
                <span class="material-symbols-outlined text-primary text-sm">link</span>
                <a href="${user.link}" target="_blank" class="text-sm text-primary font-medium">${user.link.replace('https://', '').replace('http://', '')}</a>
                <span class="material-symbols-outlined text-white/40 text-sm cursor-pointer" onclick="navigator.clipboard.writeText('${user.link}'); showToast('Link copiado')">content_copy</span>
            </div>
            ` : ''}

            <!-- Public Profile Switch -->
            <div class="glass-card rounded-xl p-3 mb-6 flex items-center justify-between mx-auto max-w-sm border-white/5 bg-white/5">
                <div class="flex-1 pr-4">
                    <h3 class="text-xs font-bold text-white mb-0.5 flex items-center gap-1">
                        Perfil Público
                        <span class="material-symbols-outlined text-xs text-primary">public</span>
                    </h3>
                    <p class="text-[10px] text-white/50 leading-tight">Aparecerás en recomendaciones para otros usuarios</p>
                </div>
                <label class="toggle-switch-label">
                    <input type="checkbox" class="toggle-switch-checkbox" ${user.isPublic ? 'checked' : ''} onchange="togglePublicProfile(this.checked)">
                    <span class="toggle-switch-slider"></span>
                </label>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 mb-6">
                <button class="flex-1 py-2.5 rounded-xl glass-card border-white/10 text-sm font-bold active:scale-95 transition-transform" onclick="showEditProfile()">Editar perfil</button>
                <button class="flex-1 py-2.5 rounded-xl glass-card border-white/10 text-sm font-bold active:scale-95 transition-transform" onclick="sharePost('profile')">Ver archivo</button>
            </div>

            <!-- Tipo de Actividad -->
            ${user.activities && user.activities.length > 0 ? `
            <div class="mb-6">
                <div class="flex items-center justify-center gap-2 flex-wrap px-4">
                    ${[
                { id: 'gym', icon: 'fitness_center', name: 'Gym' },
                { id: 'run', icon: 'directions_run', name: 'Correr' },
                { id: 'bike', icon: 'directions_bike', name: 'Ciclismo' },
                { id: 'walk', icon: 'directions_walk', name: 'Caminata' },
                { id: 'soccer', icon: 'sports_soccer', name: 'Fútbol' },
                { id: 'swim', icon: 'pool', name: 'Natación' },
                { id: 'yoga', icon: 'self_improvement', name: 'Yoga' },
                { id: 'cal', icon: 'local_fire_department', name: 'Calorías' },
                { id: 'dance', icon: 'music_note', name: 'Baile' },
                { id: 'tennis', icon: 'sports_tennis', name: 'Tenis' },
                { id: 'basket', icon: 'sports_basketball', name: 'Básquet' },
                { id: 'calisthenics', icon: 'sports_martial_arts', name: 'Calistenia' }
            ].filter(a => user.activities.includes(a.id)).map(activity => `
                        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card border-white/10">
                            <span class="material-symbols-outlined text-sm text-white/80">${activity.icon}</span>
                            <span class="text-xs font-semibold">${activity.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- Highlights (Badges) -->
            <div class="overflow-x-auto no-scrollbar mb-6 pb-2">
                <div class="flex gap-4 px-1">
                     ${user.badges ? user.badges.map(b => `
                        <div class="flex flex-col items-center gap-2 flex-shrink-0">
                            <div class="size-16 rounded-full glass-card border-white/10 flex items-center justify-center p-1">
                                <div class="size-full rounded-full bg-white/5 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-white text-xl">${b.icon}</span>
                                </div>
                            </div>
                            <span class="text-[10px] font-medium text-white/60">${b.name}</span>
                        </div>
                     `).join('') : ''}
                    <div class="flex flex-col items-center gap-2 flex-shrink-0">
                        <div class="size-16 rounded-full glass-card border-white/20 flex items-center justify-center p-1">
                            <div class="size-full rounded-full bg-white/5 flex items-center justify-center">
                                <span class="material-symbols-outlined text-white/30 text-xl">add</span>
                            </div>
                        </div>
                        <span class="text-[10px] font-medium text-white/60">Nuevo</span>
                    </div>
                </div>
            </div>
        </section>

        <!-- Tabs -->
        <div class="flex border-t border-white/5">
            <button class="flex-1 py-3 border-b-2 border-white flex justify-center">
                <span class="material-symbols-outlined text-2xl">grid_on</span>
            </button>
            <button class="flex-1 py-3 border-b-2 border-transparent text-white/40 flex justify-center">
                <span class="material-symbols-outlined text-2xl">emoji_events</span>
            </button>
            <button class="flex-1 py-3 border-b-2 border-transparent text-white/40 flex justify-center">
                <span class="material-symbols-outlined text-2xl">play_circle</span>
            </button>
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-3 gap-[2px]">
            <!-- Dynamic posts + Placeholders to fill grid -->
            ${AppState.feedPosts.map(post => `
                <div class="aspect-square bg-navy-800 bg-cover bg-center relative group cursor-pointer" style="background-image: url('${post.image || (post.media && post.media[0]) || 'https://via.placeholder.com/150'}')">
                     ${post.type === 'video' ? '<span class="material-symbols-outlined absolute top-1 right-1 text-white shadow-black drop-shadow-md">play_arrow</span>' : ''}
                </div>
            `).join('')}

        </div>

        <!-- Health Connect -->
         <section class="mt-8 mb-10">
            <div class="glass-card rounded-2xl p-4 border-primary/20">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="font-bold text-sm">Health Connect</h3>
                        <p class="text-[10px] text-white/50">Sincroniza tu actividad biométrica</p>
                    </div>
                    <span class="material-symbols-outlined text-primary">sync</span>
                </div>
                <div class="grid grid-cols-3 gap-2">
                    <button class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
                        <span class="material-symbols-outlined text-rose-500 text-xl">favorite</span>
                        <span class="text-[8px] font-bold uppercase">Apple</span>
                    </button>
                     <button class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
                        <span class="material-symbols-outlined text-blue-400 text-xl">fitbit</span>
                        <span class="text-[8px] font-bold uppercase">Google</span>
                    </button>
                     <button class="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/5">
                        <span class="material-symbols-outlined text-orange-500 text-xl">exercise</span>
                        <span class="text-[8px] font-bold uppercase">Huawei</span>
                    </button>
                </div>
            </div>
        </section>
    `;
}


function renderFeed() {
    const { avatar } = AppState.currentUser;

    return `
        <div class="flex items-center justify-between mb-6">
            <h1 class="text-2xl font-bold tracking-tight">Inicio</h1>
            <button class="btn-icon" onclick="showCreatePostModal()">
                <span class="material-symbols-outlined">add_photo_alternate</span>
            </button>
        </div>

        <!-- Quick Create Post Widget -->
        <div class="glass-card rounded-3xl p-4 mb-6 create-post-card" onclick="showCreatePostModal()">
            <div class="flex items-center gap-3">
                <div class="avatar-ring size-12 flex-shrink-0">
                    <div class="avatar size-full" style="background-image: url('${avatar}')"></div>
                </div>
                <div class="flex-1">
                    <p class="text-white/60 text-sm">¿Cuál es tu meta de bienestar hoy?</p>
                </div>
                <div class="flex items-center gap-2">
                    <button class="attachment-btn" onclick="event.stopPropagation(); showCreatePostModal()">
                        <span class="material-symbols-outlined text-sm">image</span>
                    </button>
                    <button class="btn-primary px-4 py-2 text-xs">
                        Publicar
                    </button>
                </div>
            </div>
        </div>

        <!-- Circle Filter -->
        <div class="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
            <button class="badge badge-primary cursor-pointer">Todos</button>
            ${AppState.circles.map(circle => `
                <button class="badge badge-secondary cursor-pointer">${circle.name}</button>
            `).join('')}
        </div>

        <!-- Feed Posts -->
        <div class="space-y-6">
            ${AppState.feedPosts.map(post => {
        const isVideo = post.type === 'video';
        const hasMedia = post.media && post.media.length > 0;

        return `
                <article class="glass-card rounded-3xl overflow-hidden">
                    <!-- Post Header -->
                    <div class="p-4 flex items-center gap-3">
                        <div class="avatar-ring size-12">
                            <div class="avatar size-full" style="background-image: url('${post.author.avatar}')"></div>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-bold text-sm">${post.author.name}</h4>
                            <p class="text-xs text-white/60">${post.author.username} • ${post.timestamp}</p>
                        </div>
                        <button class="btn-icon">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>

                    <!-- Post Media (Carousel or Video) -->
                    ${hasMedia ? `
                        <div class="relative w-full bg-black/50">
                            ${isVideo ? `
                                <video src="${post.media[0]}" controls class="w-full max-h-[500px] object-contain"></video>
                            ` : `
                                <div class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar" style="scroll-behavior: smooth;">
                                    ${post.media.map(src => `
                                        <div class="flex-shrink-0 w-full snap-center aspect-[4/3] bg-cover bg-center" style="background-image: url('${src}')"></div>
                                    `).join('')}
                                </div>
                                ${post.media.length > 1 ? `
                                    <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                                        ${post.media.map((_, i) => `<div class="w-1.5 h-1.5 rounded-full bg-white/50 ${i === 0 ? 'bg-white' : ''}"></div>`).join('')}
                                    </div>
                                    <div class="absolute top-4 right-4 bg-black/60 px-2 py-1 rounded-full text-[10px] font-bold">
                                        1/${post.media.length}
                                    </div>
                                ` : ''}
                            `}
                        </div>
                    ` : ''} 
                     ${!hasMedia && post.image ? `
                         <div class="relative aspect-[4/3] bg-cover bg-center" style="background-image: url('${post.image}')">
                            <div class="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent"></div>
                        </div>
                     ` : ''}

                    <!-- Post Content -->
                    <div class="p-4">
                        <p class="text-sm mb-4 leading-relaxed">${post.content}</p>
                        
                        <!-- Reactions Bar -->
                        <div class="flex items-center justify-between mb-4 border-t border-white/5 pt-3">
                            <div class="flex items-center gap-1 bg-white/5 rounded-full p-1 pl-1 pr-3">
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'like')" title="Me gusta">
                                    <span class="text-lg">👍</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.like || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'support')" title="Apoyo">
                                    <span class="text-lg">💪</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.support || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'funny')" title="Me divierte">
                                    <span class="text-lg">😂</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.funny || 0}</span>
                                </button>
                                <button class="flex items-center gap-1 hover:bg-white/10 rounded-full py-1 px-2 transition-all active:scale-95" onclick="reactToPost('${post.id}', 'angry')" title="Me enoja">
                                    <span class="text-lg">😡</span>
                                    <span class="text-[10px] font-bold text-white/60">${post.reactions?.angry || 0}</span>
                                </button>
                            </div>
                            <span class="text-xs text-white/40 font-bold">${post.likes || 0} total</span>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center gap-4">
                             <button class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors" onclick="toggleComments('${post.id}')">
                                <span class="material-symbols-outlined text-sm">chat_bubble</span>
                                <span class="text-xs font-bold">Comentar (${post.comments || 0})</span>
                            </button>
                            <button class="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-white/5 transition-colors" onclick="sharePost('${post.id}')">
                                <span class="material-symbols-outlined text-sm">share</span>
                                <span class="text-xs font-bold">Compartir (${post.shares || 0})</span>
                            </button>
                        </div>
                        
                         <!-- Comments Section (Placeholder) -->
                        <div id="comments-${post.id}" class="hidden mt-4 pt-4 border-t border-white/5">
                             <div class="flex items-center gap-3 mb-4">
                                <div class="size-8 rounded-full bg-white/10 bg-cover bg-center" style="background-image: url('${avatar}')"></div>
                                <input type="text" placeholder="Escribe un comentario..." class="flex-1 bg-white/5 border-none rounded-full px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none" onkeydown="addComment('${post.id}', event)">
                             </div>
                             ${post.commentsList ? post.commentsList.map(c => {
            const cId = c.id || 'comm_' + Math.random().toString(36).substr(2, 9);
            c.id = cId; // Ensure ID exists for interaction
            return `
                                <div class="flex gap-3 mb-3 group">
                                     <div class="size-8 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${c.avatar}')"></div>
                                     <div class="flex-1">
                                         <div class="bg-white/5 rounded-2xl p-3 rounded-tl-sm inline-block min-w-[200px]">
                                            <p class="text-xs font-bold text-white/80 mb-0.5">${c.user}</p>
                                            <p class="text-xs text-white/60">${c.text}</p>
                                         </div>
                                         
                                         <!-- Comment Actions -->
                                         <div class="flex items-center gap-3 mt-1 ml-2">
                                            <div class="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5">
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'like')" title="Me gusta">
                                                    <span>👍</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.like || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'support')" title="Apoyo">
                                                    <span>💪</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.support || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'funny')" title="Me divierte">
                                                    <span>😂</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.funny || 0}</span>
                                                </button>
                                                <button class="text-[10px] hover:scale-110 transition-transform flex items-center gap-0.5" onclick="reactToComment('${post.id}', '${cId}', 'angry')" title="Me enoja">
                                                    <span>😡</span>
                                                    <span class="font-bold text-white/50">${c.reactions?.angry || 0}</span>
                                                </button>
                                            </div>
                                            <button class="text-[10px] text-white/40 font-bold hover:text-white transition-colors" onclick="toggleReplyInput('${cId}')">
                                                Responder
                                            </button>
                                         </div>

                                         <!-- Replies -->
                                         ${c.replies && c.replies.length > 0 ? `
                                            <div class="mt-2 pl-2 border-l border-white/10 space-y-2">
                                                ${c.replies.map(r => `
                                                    <div class="flex gap-2">
                                                        <div class="size-6 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${r.avatar}')"></div>
                                                        <div class="bg-white/5 rounded-xl p-2 rounded-tl-sm">
                                                            <p class="text-[10px] font-bold text-white/80 mb-0.5">${r.user}</p>
                                                            <p class="text-[10px] text-white/60">${r.text}</p>
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                         ` : ''}

                                         <!-- Reply Input -->
                                         <div id="reply-input-${cId}" class="hidden mt-2 flex items-center gap-2">
                                              <div class="size-6 rounded-full bg-white/10 bg-cover bg-center flex-shrink-0" style="background-image: url('${avatar}')"></div>
                                              <input type="text" placeholder="Responder..." class="flex-1 bg-white/5 border-none rounded-full px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none" onkeydown="submitReply('${post.id}', '${cId}', event)">
                                         </div>
                                     </div>
                                </div>
                             `}).join('') : '<p class="text-center text-xs text-white/20 py-2">Sé el primero en comentar</p>'}
                        </div>

                    </div>
                </article>
            `;
    }).join('')}
        </div>

        <!-- Load More -->
        <div class="mt-6 text-center">
            <button class="btn-secondary">
                Cargar Más Publicaciones
            </button>
        </div>
    `;
}

function reactToPost(postId, type) {
    // Visual feedback only for now
    showToast(`Reaccionaste con ${type === 'like' ? '👍' : type === 'support' ? '💪' : type === 'funny' ? '😂' : '😡'}`);
}

function toggleComments(postId) {
    const el = document.getElementById(`comments-${postId}`);
    if (el) el.classList.toggle('hidden');
}

function sharePost(postId) {
    if (navigator.share) {
        navigator.share({
            title: 'Wellnessfy Post',
            text: 'Mira esta publicación en Wellnessfy',
            url: window.location.href
        }).then(() => showToast('¡Compartido!')).catch(console.error);
    } else {
        showToast('Enlace copiado al portapapeles');
    }
}

function addComment(postId, event) {
    if (event.key === 'Enter') {
        const text = event.target.value.trim();
        if (!text) return;

        const post = AppState.feedPosts.find(p => p.id === postId);
        if (post) {
            if (!post.commentsList) post.commentsList = [];

            post.commentsList.push({
                id: 'c_' + Date.now(),
                user: AppState.currentUser.name,
                avatar: AppState.currentUser.avatar,
                text: text,
                reactions: { like: 0, support: 0, funny: 0, angry: 0 },
                replies: []
            });
            post.comments++;

            event.target.value = '';
            showToast('Comentario añadido');
            navigateTo('feed');
            setTimeout(() => toggleComments(postId), 100);
        }
    }
}

function reactToComment(postId, commentId, type) {
    const post = AppState.feedPosts.find(p => p.id === postId);
    if (!post || !post.commentsList) return;

    const comment = post.commentsList.find(c => c.id === commentId);
    if (comment) {
        if (!comment.reactions) comment.reactions = { like: 0, support: 0, funny: 0, angry: 0 };

        // Simple increment for demo. In real app, toggle user specific reaction.
        comment.reactions[type] = (comment.reactions[type] || 0) + 1;

        navigateTo('feed');
        setTimeout(() => toggleComments(postId), 100);
    }
}

function toggleReplyInput(commentId) {
    const el = document.getElementById(`reply-input-${commentId}`);
    if (el) {
        el.classList.toggle('hidden');
        if (!el.classList.contains('hidden')) {
            el.querySelector('input')?.focus();
        }
    }
}

function submitReply(postId, commentId, event) {
    if (event.key === 'Enter') {
        const text = event.target.value.trim();
        if (!text) return;

        const post = AppState.feedPosts.find(p => p.id === postId);
        if (!post) return;

        const comment = post.commentsList.find(c => c.id === commentId);
        if (comment) {
            if (!comment.replies) comment.replies = [];

            comment.replies.push({
                id: 'r_' + Date.now(),
                user: AppState.currentUser.name,
                avatar: AppState.currentUser.avatar,
                text: text
            });

            event.target.value = '';
            showToast('Respuesta enviada');
            navigateTo('feed');
            setTimeout(() => toggleComments(postId), 100);
        }
    }
}


// ============================================
// PROFILE & BADGES
// ============================================

// ============================================
// PROFILE
// ============================================

function showProfile() {
    navigateTo('profile');
}



// ============================================


function showEditProfile(isOnboarding = false) {
    const user = AppState.currentUser;
    const modal = `
    <div class="modal-overlay" style="z-index: 200;" onclick="${isOnboarding ? '' : 'closeModal(event)'}">
        <div class="modal-content overflow-hidden flex flex-col max-h-[90vh] h-full" onclick="event.stopPropagation()">
            <!-- Header -->
            <header class="flex items-center justify-between px-4 py-4 sticky top-0 bg-navy-900/80 backdrop-blur-lg z-40 border-b border-white/5 shrink-0">
                <button class="text-white text-base font-medium ${isOnboarding ? 'invisible' : ''}" onclick="closeModal()">${isOnboarding ? '' : 'Cancel'}</button>
                <h1 class="font-bold text-lg tracking-tight">${isOnboarding ? 'Complete tu Perfil' : 'Edit Profile'}</h1>
                <button class="text-primary text-base font-bold" onclick="handleEditProfileSubmit(${isOnboarding})">${isOnboarding ? 'Siguiente' : 'Done'}</button>
            </header>
            
            <!-- Scrollable Content -->
            <main class="flex-1 overflow-y-auto no-scrollbar pb-10">
                <section class="flex flex-col items-center py-8">
                    <div class="relative group">
                        <div class="size-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-[3px] mb-3 shadow-[0_0_20px_rgba(0,245,212,0.3)]">
                            <div class="bg-navy-900 rounded-full size-full overflow-hidden">
                                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-full" style='background-image: url("${user.avatar}");'></div>
                            </div>
                        </div>
                        <button class="absolute bottom-3 right-0 bg-primary text-navy-900 size-7 rounded-full flex items-center justify-center border-2 border-navy-900 shadow-lg">
                            <span class="material-symbols-outlined text-lg font-bold">photo_camera</span>
                        </button>
                        <input type="file" id="editProfilePhotoInput" class="hidden" accept="image/*" onchange="previewCircleImage(this, 'editProfilePhotoInput')"> 
                        <!-- Reusing previewCircleImage logic if applicable, or generic preview -->
                    </div>
                    <button class="text-primary text-sm font-semibold mt-2" onclick="document.getElementById('editProfilePhotoInput').click()">Change Profile Photo</button>
                </section>

                <section class="px-5 space-y-6">
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Name</label>
                        <input id="editName" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-0 focus:border-primary transition-colors" type="text" value="${user.name}"/>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Username</label>
                        <div class="relative">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">@</span>
                            <input id="editUsername" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-sm font-medium focus:ring-0 focus:border-primary transition-colors" type="text" value="${user.username.replace('@', '')}"/>
                        </div>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Bio</label>
                        <textarea id="editBio" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-0 focus:border-primary transition-colors resize-none leading-relaxed" rows="3">${user.bio}</textarea>
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Link</label>
                        <input id="editLink" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-0 focus:border-primary transition-colors" type="url" placeholder="https://" value="${user.link || ''}"/>
                    </div>

                    <!-- Personal Info Section -->
                    <div class="space-y-1.5">
                        <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Fecha de Nacimiento</label>
                        <input id="editBirthdate" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:ring-0 focus:border-primary transition-colors" type="date" value="${user.birthdate || ''}"/>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1.5">
                            <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Peso</label>
                            <div class="relative">
                                <input id="editWeight" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-sm font-medium focus:ring-0 focus:border-primary transition-colors" type="number" step="0.1" placeholder="70" value="${user.weight || ''}"/>
                                <div class="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-navy-900/80 rounded-lg p-1">
                                    <button type="button" onclick="toggleWeightUnit('kg')" id="weightUnitKg" class="px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!user.weightUnit || user.weightUnit === 'kg' ? 'bg-primary text-navy-900 shadow-lg shadow-primary/30' : 'text-white/30 hover:text-white/60'}">kg</button>
                                    <button type="button" onclick="toggleWeightUnit('lbs')" id="weightUnitLbs" class="px-3 py-1.5 text-xs font-bold rounded-md transition-all ${user.weightUnit === 'lbs' ? 'bg-primary text-navy-900 shadow-lg shadow-primary/30' : 'text-white/30 hover:text-white/60'}">lbs</button>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-white/40 text-xs font-semibold ml-1 uppercase tracking-wider">Altura</label>
                            <div class="relative">
                                <input id="editHeight" class="w-full glass-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-24 text-sm font-medium focus:ring-0 focus:border-primary transition-colors" type="number" step="0.1" placeholder="175" value="${user.height || ''}"/>
                                <div class="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1 bg-navy-900/80 rounded-lg p-1">
                                    <button type="button" onclick="toggleHeightUnit('cm')" id="heightUnitCm" class="px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!user.heightUnit || user.heightUnit === 'cm' ? 'bg-primary text-navy-900 shadow-lg shadow-primary/30' : 'text-white/30 hover:text-white/60'}">cm</button>
                                    <button type="button" onclick="toggleHeightUnit('in')" id="heightUnitIn" class="px-3 py-1.5 text-xs font-bold rounded-md transition-all ${user.heightUnit === 'in' ? 'bg-primary text-navy-900 shadow-lg shadow-primary/30' : 'text-white/30 hover:text-white/60'}">in</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sports (Tipo de Actividad) -->
                    <div class="space-y-4">
                        <label class="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">Tipo de Actividad</label>
                        <div class="grid grid-cols-4 gap-2">
                            ${[
            { id: 'gym', name: 'GYM', icon: 'fitness_center' },
            { id: 'run', name: 'CORRER', icon: 'directions_run' },
            { id: 'bike', name: 'CICLISMO', icon: 'directions_bike' },
            { id: 'walk', name: 'CAMINATA', icon: 'directions_walk' },
            { id: 'soccer', name: 'FÚTBOL', icon: 'sports_soccer' },
            { id: 'swim', name: 'NATACIÓN', icon: 'pool' },
            { id: 'yoga', name: 'YOGA', icon: 'self_improvement' },
            { id: 'cal', name: 'CALORÍAS', icon: 'local_fire_department' },
            { id: 'dance', name: 'BAILE', icon: 'music_note' },
            { id: 'tennis', name: 'TENIS', icon: 'sports_tennis' },
            { id: 'basket', name: 'BÁSQUET', icon: 'sports_basketball' },
            { id: 'calisthenics', name: 'CALISTENIA', icon: 'sports_martial_arts' }
        ].map(sport => `
                                <button type="button" id="sport_${sport.id}" data-sport-id="${sport.id}" onclick="toggleSportSelection(this)" class="aspect-square glass-card rounded-2xl flex flex-col items-center justify-center gap-2 p-2 border transition-all group ${user.activities && user.activities.includes(sport.id) ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'}">
                                    <span class="material-symbols-outlined text-2xl group-hover:text-white/90 ${user.activities && user.activities.includes(sport.id) ? 'text-primary' : 'text-white/60'}">${sport.icon}</span>
                                    <span class="text-[8px] font-bold tracking-wider ${user.activities && user.activities.includes(sport.id) ? 'text-white' : 'text-white/40'}">${sport.name}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                </section>
            </main>
        </div>
    </div>
    `;
    document.getElementById('modalsContainer').innerHTML = modal;
}

function toggleWeightUnit(unit) {
    const kgBtn = document.getElementById('weightUnitKg');
    const lbsBtn = document.getElementById('weightUnitLbs');

    if (unit === 'kg') {
        kgBtn.classList.add('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        kgBtn.classList.remove('text-white/30', 'hover:text-white/60');
        lbsBtn.classList.remove('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        lbsBtn.classList.add('text-white/30', 'hover:text-white/60');
    } else {
        lbsBtn.classList.add('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        lbsBtn.classList.remove('text-white/30', 'hover:text-white/60');
        kgBtn.classList.remove('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        kgBtn.classList.add('text-white/30', 'hover:text-white/60');
    }
}

function toggleHeightUnit(unit) {
    const cmBtn = document.getElementById('heightUnitCm');
    const inBtn = document.getElementById('heightUnitIn');

    if (unit === 'cm') {
        cmBtn.classList.add('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        cmBtn.classList.remove('text-white/30', 'hover:text-white/60');
        inBtn.classList.remove('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        inBtn.classList.add('text-white/30', 'hover:text-white/60');
    } else {
        inBtn.classList.add('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        inBtn.classList.remove('text-white/30', 'hover:text-white/60');
        cmBtn.classList.remove('bg-primary', 'text-navy-900', 'shadow-lg', 'shadow-primary/30');
        cmBtn.classList.add('text-white/30', 'hover:text-white/60');
    }
}

function handleEditProfileSubmit(isOnboarding = false) {
    const newName = document.getElementById('editName').value;
    const newUsername = "@" + document.getElementById('editUsername').value;
    const newBio = document.getElementById('editBio').value;
    const newLink = document.getElementById('editLink').value;
    const newBirthdate = document.getElementById('editBirthdate').value;
    const newWeight = document.getElementById('editWeight').value;
    const newHeight = document.getElementById('editHeight').value;

    // Get selected units from toggle buttons
    const newWeightUnit = document.getElementById('weightUnitKg').classList.contains('bg-primary') ? 'kg' : 'lbs';
    const newHeightUnit = document.getElementById('heightUnitCm').classList.contains('bg-primary') ? 'cm' : 'in';

    // Get selected activities
    const selectedActivities = [];
    document.querySelectorAll('[data-sport-id]').forEach(btn => {
        if (btn.classList.contains('border-primary')) {
            selectedActivities.push(btn.dataset.sportId);
        }
    });

    // Simple update logic
    if (newName) AppState.currentUser.name = newName;
    if (newUsername) AppState.currentUser.username = newUsername;
    if (newBio) AppState.currentUser.bio = newBio;
    if (newLink) AppState.currentUser.link = newLink;
    if (newBirthdate) AppState.currentUser.birthdate = newBirthdate;
    if (newWeight) AppState.currentUser.weight = newWeight;
    if (newWeightUnit) AppState.currentUser.weightUnit = newWeightUnit;
    if (newHeight) AppState.currentUser.height = newHeight;
    if (newHeightUnit) AppState.currentUser.heightUnit = newHeightUnit;
    AppState.currentUser.activities = selectedActivities;

    // Save to localStorage
    saveUserData();

    // Close modal
    closeModal();

    if (isOnboarding) {
        // Onboarding flow: go to Circles to find friends
        showToast('¡Perfil completado! Ahora busca amigos', 'success');
        navigateTo('circles');
        // Mark onboarding as complete
        localStorage.setItem('wellnessfy_onboarding_complete', 'true');
    } else {
        // Normal edit: go back to profile
        navigateTo('profile');
        showToast('Perfil actualizado con éxito', 'success');
    }
}

function toggleSportSelection(btn) {
    // Toggle UI state
    const isSelected = btn.classList.contains('border-primary');
    const icon = btn.querySelector('.material-symbols-outlined');
    const text = btn.querySelector('span:last-child');

    if (isSelected) {
        // Deselect
        btn.classList.remove('border-primary', 'bg-primary/10');
        btn.classList.add('border-white/5');
        icon.classList.remove('text-primary');
        icon.classList.add('text-white/60');
        text.classList.remove('text-white');
        text.classList.add('text-white/40');
    } else {
        // Select
        btn.classList.remove('border-white/5');
        btn.classList.add('border-primary', 'bg-primary/10');
        icon.classList.remove('text-white/60');
        icon.classList.add('text-primary');
        text.classList.remove('text-white/40');
        text.classList.add('text-white');
    }
}


// ============================================
// WELLNESS HUB
// ============================================

function showWellnessHub() {
    const modal = `
    < div class="modal-overlay" onclick = "closeModal(event)" >
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Hub de Bienestar</h2>
                    <button class="btn-icon" onclick="closeModal()">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <p class="text-sm text-white/60 mb-6">Integra apps adicionales para un seguimiento completo de tu bienestar</p>

                <!-- Apps Grid -->
                <div class="space-y-4">
                    ${AppState.wellnessApps.map(app => `
                            <div class="glass-card rounded-2xl p-4">
                                <div class="flex items-start gap-4">
                                    <div class="size-14 rounded-2xl bg-gradient-to-br from-${app.color} to-${app.color === 'primary' ? 'secondary' : app.color} flex items-center justify-center flex-shrink-0">
                                        <span class="material-symbols-outlined text-navy-900 text-2xl" style="font-variation-settings: 'FILL' 1">${app.icon}</span>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 class="font-bold text-sm mb-1">${app.name}</h3>
                                                <p class="text-xs text-white/60">${app.category}</p>
                                            </div>
                                            ${app.isPremium ? '<span class="badge badge-pink text-[9px]">Premium</span>' : '<span class="badge badge-primary text-[9px]">Gratis</span>'}
                                        </div>
                                        <p class="text-xs text-white/80 mb-3">${app.description}</p>
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3 text-xs text-white/60">
                                                <span class="flex items-center gap-1">
                                                    <span class="material-symbols-outlined text-yellow-400 text-sm">star</span>
                                                    ${app.rating}
                                                </span>
                                                <span>${app.users} usuarios</span>
                                            </div>
                                            <button class="btn-primary text-xs py-2 px-4" onclick="integrateApp('${app.id}')">
                                                Integrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
        </div >
    `;

    document.getElementById('modalsContainer').innerHTML = modal;
}

// ============================================
// MODALS & INTERACTIONS
// ============================================

function showCreateModal() {
    const modal = `
    < div class="modal-overlay" onclick = "closeModal(event)" >
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Crear Nuevo</h2>
                    <button class="btn-icon" onclick="closeModal()">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="space-y-3">
                    <button class="glass-card rounded-2xl p-4 w-full flex items-center gap-4 hover:border-primary/30 transition-all" onclick="showCreatePostModal()">
                        <span class="material-symbols-outlined text-3xl text-white/90">add_photo_alternate</span>
                        <div class="text-left">
                            <h3 class="font-bold">Publicación</h3>
                            <p class="text-xs text-white/60">Comparte tu progreso</p>
                        </div>
                    </button>

                    <button class="glass-card rounded-2xl p-4 w-full flex items-center gap-4 hover:border-secondary/30 transition-all" onclick="showCreateChallengeModal()">
                        <span class="material-symbols-outlined text-3xl text-white/90">emoji_events</span>
                        <div class="text-left">
                            <h3 class="font-bold">Desafío</h3>
                            <p class="text-xs text-white/60">Crea un reto individual o grupal</p>
                        </div>
                    </button>

                    <button class="glass-card rounded-2xl p-4 w-full flex items-center gap-4 hover:border-purple-400/30 transition-all" onclick="showCreateCircleModal()">
                        <span class="material-symbols-outlined text-3xl text-white/90">groups</span>
                        <div class="text-left">
                            <h3 class="font-bold">Círculo</h3>
                            <p class="text-xs text-white/60">Organiza tus contactos</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
        </div >
    `;

    document.getElementById('modalsContainer').innerHTML = modal;
}

function showNotifications() {
    const modal = `
    < div class="modal-overlay" onclick = "closeModal(event)" >
        <div class="modal-content" onclick="event.stopPropagation()">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Notificaciones</h2>
                    <button class="btn-icon" onclick="closeModal()">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="space-y-3">
                    ${AppState.notifications.map(notif => `
                            <div class="glass-card rounded-2xl p-4 ${notif.unread ? 'border-primary/30' : ''}">
                                <div class="flex items-start gap-3">
                                    <div class="size-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                                        <span class="material-symbols-outlined text-navy-900 text-sm">
                                            ${notif.type === 'challenge' ? 'emoji_events' : notif.type === 'badge' ? 'military_tech' : 'chat_bubble'}
                                        </span>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm mb-1">${notif.message}</p>
                                        <p class="text-xs text-white/40">${notif.time}</p>
                                    </div>
                                    ${notif.unread ? '<div class="size-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>' : ''}
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
        </div>
        </div >
    `;

    document.getElementById('modalsContainer').innerHTML = modal;
}

function closeModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('modalsContainer').innerHTML = '';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateFriendSuggestions() {
    return [
        { id: 'f1', name: 'Ana Rodríguez', avatar: 'https://i.pravatar.cc/300?img=1', mutualFriends: 12 },
        { id: 'f2', name: 'Carlos Méndez', avatar: 'https://i.pravatar.cc/300?img=7', mutualFriends: 8 },
        { id: 'f3', name: 'Diana López', avatar: 'https://i.pravatar.cc/300?img=9', mutualFriends: 15 }
    ];
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type} `;
    toast.innerHTML = `
    < div class="flex items-center gap-3" >
            <span class="material-symbols-outlined text-${type === 'success' ? 'primary' : 'rose-500'}">
                ${type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span class="text-sm font-medium">${message}</span>
        </div >
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Placeholder functions for interactions
// Circle Interactions
function showCircleDetail(id) {
    const circle = AppState.circles.find(c => c.id === id);
    if (!circle) return;

    // Use placeholder data for members if not full
    const members = [
        { name: 'Sarah Jenkins', status: 'Active now', time: '', avatar: 'https://i.pravatar.cc/150?img=5', isActive: true },
        { name: 'David Chen', status: 'Active now', time: '', avatar: 'https://i.pravatar.cc/150?img=11', isActive: true },
        { name: 'Jessica Miller', status: 'Active 12m ago', time: '12m ago', avatar: 'https://i.pravatar.cc/150?img=9', isActive: false },
        { name: 'Elena Kostic', status: 'Active 2h ago', time: '2h ago', avatar: 'https://i.pravatar.cc/150?img=1', isActive: false }
    ];

    const modal = `
    < div class="modal-overlay" onclick = "closeModal(event)" >
        <div class="modal-content w-full h-full max-w-md mx-auto bg-[#070b14] overflow-y-auto" onclick="event.stopPropagation()">
            <!-- Header -->
            <div class="sticky top-0 z-50 bg-[#070b14]/80 backdrop-blur-xl border-b border-white/5">
                <div class="flex items-center p-4 justify-between">
                    <button class="text-white flex size-12 shrink-0 items-center justify-center rounded-full active:bg-white/10" onclick="closeModal()">
                        <span class="material-symbols-outlined">arrow_back_ios_new</span>
                    </button>
                    <h2 class="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">Circle Details</h2>
                    <div class="flex w-12 items-center justify-end relative group">
                        <button class="flex cursor-pointer items-center justify-center rounded-xl size-12 text-white/80 hover:bg-white/10 transition-colors" onclick="showCircleOptions('${circle.id}')">
                            <span class="material-symbols-outlined">more_vert</span>
                        </button>
                    </div>
                </div>
            </div>

            <main class="pb-32">
                <div class="flex flex-col items-center pt-8 pb-6 px-6">
                    <div class="relative">
                        <div class="w-32 h-32 rounded-full p-1" style="background: linear-gradient(135deg, ${circle.neonColor}, transparent); box-shadow: 0 0 15px ${circle.neonColor}40;">
                            <div class="w-full h-full rounded-full bg-center bg-cover border-4 border-[#070b14]" style="background-image: url('${circle.image}');"></div>
                        </div>
                        <div class="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-4 border-[#070b14]"></div>
                    </div>

                    <h1 class="text-3xl font-bold mt-6 text-white tracking-tight">${circle.name}</h1>
                    <p class="text-slate-400 text-center mt-2 max-w-[280px] text-sm leading-relaxed">
                        A community for high-performance training and weekend adventures.
                    </p>

                    <div class="flex gap-8 mt-6">
                        <div class="text-center">
                            <p class="text-white font-bold text-lg">${circle.members}</p>
                            <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Members</p>
                        </div>
                        <div class="w-px h-8 bg-white/10 my-auto"></div>
                        <div class="text-center">
                            <p class="text-white font-bold text-lg">Jan 12</p>
                            <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Created</p>
                        </div>
                    </div>
                </div>

                <div class="px-4 mb-8">
                    <div class="flex w-full items-stretch rounded-2xl h-12 bg-white/5 border border-white/5">
                        <div class="text-neon-teal flex items-center justify-center pl-4">
                            <span class="material-symbols-outlined text-lg">search</span>
                        </div>
                        <input class="w-full bg-transparent border-none text-white focus:ring-0 px-4 text-sm placeholder:text-slate-500" placeholder="Find members...">
                    </div>
                </div>

                <section>
                    <div class="flex items-center justify-between px-5 pb-4">
                        <h3 class="text-white/60 text-[11px] uppercase tracking-[0.2em] font-bold">Members</h3>
                        <span class="text-neon-teal text-[11px] font-bold">8 Online</span>
                    </div>

                    <div class="flex flex-col gap-3 px-4 mb-12">
                        ${members.map(m => `
                                <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 ${!m.isActive ? 'opacity-70' : ''}">
                                    <div class="relative">
                                        <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12 border border-white/10" style="background-image: url('${m.avatar}');"></div>
                                        ${m.isActive ? '<div class="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-[#1e293b]"></div>' : ''}
                                    </div>
                                    <div class="flex flex-col flex-1">
                                        <p class="text-white text-base font-semibold leading-none">${m.name}</p>
                                        <p class="${m.isActive ? 'text-neon-teal' : 'text-slate-500'} text-[11px] mt-1.5 font-medium">${m.status}</p>
                                    </div>
                                    <button class="text-slate-500 hover:text-white transition-colors"><span class="material-symbols-outlined">chat_bubble</span></button>
                                </div>
                            `).join('')}
                    </div>
                </section>
            </main>

            <div class="fixed bottom-0 left-0 right-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-t border-white/5 pb-8 pt-4 md:absolute">
                <div class="flex flex-col items-center gap-3 max-w-md mx-auto px-6">
                    <button class="w-full h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-neon-teal/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[#070b14]"
                        style="background: linear-gradient(135deg, ${circle.neonColor}, #ffffff);"
                        onclick="showToast('Invitación enviada')">
                        <span class="material-symbols-outlined text-xl">person_add</span>
                        Invite Friends
                    </button>
                    <button class="text-slate-500 hover:text-red-500 transition-colors py-1 flex items-center gap-1.5 active:scale-95" onclick="leaveCircle('${circle.id}')">
                        <span class="material-symbols-outlined text-sm">logout</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest">Leave Circle</span>
                    </button>
                </div>
            </div>
        </div>
        </div >
    `;
    document.getElementById('modalsContainer').innerHTML = modal;
}

// Palette mapping for new modal
const circlePalettes = {
    'neon-teal': { color: 'primary', neon: '#00f2fe', icon: 'group' },
    'neon-pink': { color: 'pink', neon: '#ff00e5', icon: 'favorite' },
    'neon-orange': { color: 'orange', neon: '#ff8a00', icon: 'local_fire_department' },
    'neon-lime': { color: 'green', neon: '#bcff00', icon: 'eco' },
    'neon-purple': { color: 'secondary', neon: '#a800ff', icon: 'auto_awesome' }
};

function showCreateCircleModal(mode = 'create', circleId = null) {
    let circle = {};
    let selectedPalette = 'neon-teal'; // Default

    if (mode === 'edit' && circleId) {
        circle = AppState.circles.find(c => c.id === circleId) || {};
        // Reverse lookup palette from neon color if editing
        const foundPalette = Object.entries(circlePalettes).find(([key, val]) => val.neon === circle.neonColor);
        if (foundPalette) selectedPalette = foundPalette[0];
    }

    const modal = `
    < div class="modal-overlay" onclick = "closeModal(event)" >
            <style>
                .color-radio:checked + .color-indicator {
                    transform: scale(1.1);
                    ring-width: 2px;
                    --tw-ring-offset-width: 2px;
                    --tw-ring-offset-color: #070b14;
                    --tw-ring-color: #ffffff;
                    box-shadow: 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color), 0 0 0 calc(var(--tw-ring-offset-width) + 2px) var(--tw-ring-color);
                }
            </style>
            <div class="modal-content w-full h-full max-w-md mx-auto bg-[#070b14] overflow-y-auto" onclick="event.stopPropagation()">
                <!-- Sticky Header -->
                <div class="sticky top-0 z-50 bg-[#070b14]/85 backdrop-blur-xl border-b border-white/5">
                    <div class="flex items-center p-4 justify-between max-w-md mx-auto">
                        <button class="text-white flex size-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors" onclick="closeModal()">
                            <span class="material-symbols-outlined">arrow_back_ios</span>
                        </button>
                        <h2 class="text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">${mode === 'create' ? 'Create New Circle' : 'Edit Circle'}</h2>
                        <div class="w-10"></div>
                    </div>
                </div>

                <main class="max-w-md mx-auto px-6 py-8 pb-40">
                    <form id="circleForm" onsubmit="handleCircleSubmit(event, '${mode}', '${circleId || ''}')" class="space-y-8">
                        <div class="flex flex-col items-center">
                            <div class="relative group cursor-pointer" onclick="document.getElementById('circleImageInput').click()">
                                <input type="file" id="circleImageInput" class="hidden" accept="image/*" onchange="previewCircleImage(this)">
                                <div id="circleImagePreview" class="w-28 h-28 rounded-full glass-card border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                                    ${circle.image ?
            `<img src="${circle.image}" class="w-full h-full object-cover">` :
            `<span class="material-symbols-outlined text-4xl text-white/20">add_a_photo</span>`
        }
                                </div>
                                <button class="absolute bottom-0 right-0 bg-[#00f2fe] text-slate-900 w-9 h-9 rounded-full flex items-center justify-center border-4 border-[#070b14] shadow-lg" type="button">
                                    <span class="material-symbols-outlined text-lg font-bold">edit</span>
                                </button>
                            </div>
                            <p class="mt-3 text-xs font-bold text-white/40 uppercase tracking-widest">Circle Profile Photo</p>
                        </div>

                        <div class="space-y-2">
                            <label class="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">Circle Name</label>
                            <div class="glass-card rounded-2xl p-1">
                                <input name="name" value="${circle.name || ''}" class="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 px-4 py-3 text-base" placeholder="e.g. Morning Runners" type="text" required/>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">Description</label>
                            <div class="glass-card rounded-2xl p-1">
                                <textarea name="description" class="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-white/20 px-4 py-3 text-base resize-none" placeholder="Tell us what this circle is about..." rows="4">${circle.description || ''}</textarea>
                            </div>
                        </div>

                        <div class="space-y-3">
                            <label class="text-[11px] font-bold text-white/60 uppercase tracking-[0.2em] ml-1">Color Palette</label>
                            <div class="flex justify-between items-center glass-card rounded-2xl px-6 py-4">
                                <label class="cursor-pointer relative">
                                    <input ${selectedPalette === 'neon-teal' ? 'checked' : ''} class="sr-only color-radio" name="palette" value="neon-teal" type="radio"/>
                                    <div class="color-indicator w-8 h-8 rounded-full shadow-[0_0_10px_rgba(0,242,254,0.4)] transition-all bg-[#00f2fe]"></div>
                                </label>
                                <label class="cursor-pointer relative">
                                    <input ${selectedPalette === 'neon-pink' ? 'checked' : ''} class="sr-only color-radio" name="palette" value="neon-pink" type="radio"/>
                                    <div class="color-indicator w-8 h-8 rounded-full shadow-[0_0_10px_rgba(255,0,229,0.4)] transition-all bg-[#ff00e5]"></div>
                                </label>
                                <label class="cursor-pointer relative">
                                    <input ${selectedPalette === 'neon-orange' ? 'checked' : ''} class="sr-only color-radio" name="palette" value="neon-orange" type="radio"/>
                                    <div class="color-indicator w-8 h-8 rounded-full shadow-[0_0_10px_rgba(255,138,0,0.4)] transition-all bg-[#ff8a00]"></div>
                                </label>
                                <label class="cursor-pointer relative">
                                    <input ${selectedPalette === 'neon-lime' ? 'checked' : ''} class="sr-only color-radio" name="palette" value="neon-lime" type="radio"/>
                                    <div class="color-indicator w-8 h-8 rounded-full shadow-[0_0_10px_rgba(188,255,0,0.4)] transition-all bg-[#bcff00]"></div>
                                </label>
                                <label class="cursor-pointer relative">
                                    <input ${selectedPalette === 'neon-purple' ? 'checked' : ''} class="sr-only color-radio" name="palette" value="neon-purple" type="radio"/>
                                    <div class="color-indicator w-8 h-8 rounded-full shadow-[0_0_10_rgba(168,0,255,0.4)] transition-all bg-[#a800ff]"></div>
                                </label>
                            </div>
                        </div>

                        <div class="glass-card rounded-2xl p-5 flex items-center justify-between">
                            <div class="flex flex-col">
                                <span class="text-white text-base font-semibold">Public Circle</span>
                                <span class="text-white/40 text-[10px] uppercase tracking-wider mt-0.5">Anyone can find and join</span>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input ${circle.isPublic !== false ? 'checked' : ''} name="isPublic" class="sr-only peer" type="checkbox"/>
                                <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f2fe]"></div>
                            </label>
                        </div>
                    </form>
                </main>

                <div class="fixed bottom-0 left-0 right-0 p-6 bg-[#070b14]/90 backdrop-blur-xl border-t border-white/5 md:absolute">
                    <div class="max-w-md mx-auto">
                        <button onclick="document.getElementById('circleForm').dispatchEvent(new Event('submit', {cancelable: true}))" class="w-full bg-neon-gradient text-slate-900 py-4 rounded-2xl text-base font-black uppercase tracking-[0.1em] shadow-[0_4px_20px_rgba(0,242,254,0.4)] active:scale-[0.98] transition-all" style="background: linear-gradient(135deg, #00d4c1 0%, #00f2fe 100%);">
                            ${mode === 'create' ? 'Save Circle' : 'Update Circle'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    `;
    document.getElementById('modalsContainer').innerHTML = modal;
}

function previewCircleImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewContainer = document.getElementById('circleImagePreview');
            previewContainer.innerHTML = `< img src = "${e.target.result}" class="w-full h-full object-cover" > `;
            document.getElementById('circleForm').dataset.newImage = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function handleCircleSubmit(e, mode, circleId) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const paletteKey = formData.get('palette') || 'neon-teal';
    const paletteData = circlePalettes[paletteKey];
    const isPublic = formData.get('isPublic') === 'on';

    // Check if new image was uploaded
    const newImage = e.target.dataset.newImage;

    if (mode === 'create') {
        const newCircle = {
            id: 'circle_' + Date.now(),
            name: formData.get('name'),
            description: formData.get('description'),
            icon: paletteData.icon,
            color: paletteData.color,
            neonColor: paletteData.neon,
            isPublic: isPublic,
            image: newImage || `https://source.unsplash.com/random/400x400/?${paletteData.color}`,
            members: 1,
            membersList: [AppState.currentUser.name]
        };
        AppState.circles.push(newCircle);
        showToast('Círculo creado exitosamente');
    } else {
        const circle = AppState.circles.find(c => c.id === circleId);
        if (circle) {
            circle.name = formData.get('name');
            circle.description = formData.get('description');
            circle.icon = paletteData.icon;
            circle.color = paletteData.color;
            circle.neonColor = paletteData.neon;
            circle.isPublic = isPublic;
            if (newImage) circle.image = newImage;
            showToast('Círculo actualizado');
        }
    }
    closeModal();
    navigateTo('circles');
}

function showCircleOptions(id) {
    const modal = `
         <div class="modal-overlay" style="z-index: 100;" onclick="closeModal()">
            <div class="modal-content max-w-xs w-[90%] bg-[#070b14] border border-white/10 rounded-2xl overflow-hidden p-2 space-y-1" onclick="event.stopPropagation()">
                <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold flex items-center gap-3 text-white" onclick="showCreateCircleModal('edit', '${id}')">
                    <span class="material-symbols-outlined text-white/80">edit</span>
                    Editar Círculo
                </button>
                 <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold flex items-center gap-3 text-red-500" onclick="deleteCircle('${id}')">
                    <span class="material-symbols-outlined">delete</span>
                    Eliminar Círculo
                </button>
            </div>
        </div>
    `;
    // Just append to body for simple dropdown simulation or replace overlay
    // For simplicity, we replace functionality since we are in a modal already is tricky. 
    // We will assume this replaces the current view or is a toast-like overlay.
    // Let's replace the modal container content temporarily or overlay it.
    // A better approach for this app structure is to replace the innerHTML of a specific 'dropdown' container or just alert for now.
    // Given the constraints, I'll replace the main modal for options.
    document.getElementById('modalsContainer').innerHTML = modal;
}

function deleteCircle(id) {
    showConfirmationModal(
        'Eliminar Círculo',
        '¿Estás seguro? Esta acción eliminará el grupo permanentemente.',
        `executeDeleteCircle('${id}')`,
        'Eliminar',
        true
    );
}

function executeDeleteCircle(id) {
    AppState.circles = AppState.circles.filter(c => c.id !== id);
    showToast('Círculo eliminado');
    closeModal();
    navigateTo('circles');
}

function leaveCircle(id) {
    showConfirmationModal(
        'Abandonar Círculo',
        '¿Deseas salir de este círculo? Ya no podrás ver sus actualizaciones.',
        `executeLeaveCircle('${id}')`,
        'Abandonar',
        true
    );
}

function executeLeaveCircle(id) {
    AppState.circles = AppState.circles.filter(c => c.id !== id);
    showToast('Has abandonado el círculo');
    closeModal();
    navigateTo('circles');
}

function showCreatePostModal() {
    closeModal();
    const { avatar } = AppState.currentUser;
    // We will use dataset to store media content for simplicity in this demo without global state overhead,
    // or just reset the form logically.

    const modal = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal-content max-w-2xl" onclick="event.stopPropagation()">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold">Crear Publicación</h2>
                        <button class="btn-icon" onclick="closeModal()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form id="createPostForm" onsubmit="publishPost(event)">
                        <div class="glass-card rounded-3xl p-6 mb-4">
                            <div class="flex gap-4 mb-4">
                                <div class="avatar-ring size-14 flex-shrink-0">
                                    <div class="avatar size-full" style="background-image: url('${avatar}')"></div>
                                </div>
                                <div class="flex-1">
                                    <textarea id="postContent" name="content" placeholder="¿Qué quieres compartir hoy?" class="w-full bg-transparent border-none outline-none text-white text-base resize-none" rows="3"></textarea>
                                </div>
                            </div>

                             <!-- Audience Selection -->
                            <div class="mb-4">
                                <p class="text-xs text-white/60 mb-3 uppercase tracking-wider font-bold">Compartir con:</p>
                                <div class="flex gap-2 flex-wrap">
                                    <button type="button" class="audience-btn active" data-audience="Public" onclick="toggleAudience('Public')">
                                        <span class="material-symbols-outlined text-sm">public</span>
                                        <span>Público</span>
                                    </button>
                                    <button type="button" class="audience-btn" data-audience="Familia" onclick="toggleAudience('Familia')">
                                        <span class="material-symbols-outlined text-sm">home</span>
                                        <span>Familia</span>
                                    </button>
                                    <button type="button" class="audience-btn" data-audience="Amigos" onclick="toggleAudience('Amigos')">
                                        <span class="material-symbols-outlined text-sm">group</span>
                                        <span>Amigos</span>
                                    </button>
                                    <button type="button" class="audience-btn" data-audience="Trabajo" onclick="toggleAudience('Trabajo')">
                                        <span class="material-symbols-outlined text-sm">work</span>
                                        <span>Trabajo</span>
                                    </button>
                                </div>
                            </div>

                            <!-- Media Preview Grid -->
                            <div id="mediaPreviewGrid" class="grid grid-cols-2 gap-2 mb-4 hidden"></div>

                            <div class="flex items-center justify-between pt-4 border-t border-white/10">
                                <div class="flex items-center gap-2">
                                    <button type="button" class="attachment-btn" onclick="document.getElementById('postMediaInput').click()">
                                        <span class="material-symbols-outlined text-green-400">photo_library</span>
                                    </button>
                                     <button type="button" class="attachment-btn" onclick="document.getElementById('postVideoInput').click()">
                                        <span class="material-symbols-outlined text-red-400">videocam</span>
                                    </button>
                                    <input type="file" id="postMediaInput" multiple accept="image/*" class="hidden" onchange="handlePostMedia(this, 'image')">
                                    <input type="file" id="postVideoInput" accept="video/*" class="hidden" onchange="handlePostMedia(this, 'video')">
                                </div>
                                <button type="submit" class="btn-primary px-8">Publicar</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalsContainer').innerHTML = modal;
}

let currentPostMedia = []; // Temporary store for the modal current session

function handlePostMedia(input, type) {
    const grid = document.getElementById('mediaPreviewGrid');
    if (!input.files || input.files.length === 0) return;

    grid.classList.remove('hidden');

    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const wrapper = document.createElement('div');
            wrapper.className = 'relative rounded-xl overflow-hidden aspect-video bg-black/50 group';

            if (type === 'video') {
                wrapper.innerHTML = `
                    <video src="${e.target.result}" class="w-full h-full object-cover"></video>
                    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span class="material-symbols-outlined text-white/80 text-3xl">play_circle</span>
                    </div>
                `;
            } else {
                wrapper.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            }

            // Add remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity';
            removeBtn.innerHTML = '<span class="material-symbols-outlined text-xs">close</span>';
            removeBtn.onclick = () => { wrapper.remove(); }; // Simplified removal from UI
            wrapper.appendChild(removeBtn);

            grid.appendChild(wrapper);

            // Push to temporary store
            currentPostMedia.push({ type: type, src: e.target.result });
        };
        reader.readAsDataURL(file);
    });
}


function publishPost(e) {
    if (e) e.preventDefault();
    // Support both form submission (event) and direct button click (reading by ID if needed)
    // Since we use a form now, e.target.content.value is best, but let's be robust
    const content = e ? e.target.content.value : document.getElementById('postContent').value;

    if (!content && currentPostMedia.length === 0) {
        showToast('Escribe algo o añade multimedia', 'error');
        return;
    }

    // Get selected audiences
    const selectedAudiences = Array.from(document.querySelectorAll('.audience-btn.active'))
        .map(btn => btn.dataset.audience);

    const newPost = {
        id: 'post_' + Date.now(),
        author: {
            name: AppState.currentUser.name,
            username: AppState.currentUser.username,
            avatar: AppState.currentUser.avatar
        },
        timestamp: 'Just now',
        content: content,
        type: currentPostMedia.length > 0 ? (currentPostMedia[0].type === 'video' ? 'video' : 'image') : 'text',
        // If multiple images are supported in backend/renderFeed, pass them all. 
        // For renderFeed in Step 205, it checks `post.media` (array) or `post.image` (single string fallback)
        media: currentPostMedia.map(m => m.src),
        image: (currentPostMedia.length > 0 && currentPostMedia[0].type === 'image') ? currentPostMedia[0].src : null, // Fallback for legacy
        likes: 0,
        comments: 0,
        circles: selectedAudiences.length > 0 ? selectedAudiences : ['Public']
    };

    AppState.feedPosts.unshift(newPost);
    currentPostMedia = []; // Reset
    closeModal();
    navigateTo('feed');
    showToast('Publicado con éxito');
}

// Helper functions for post creation
function toggleAudience(audience) {
    const buttons = document.querySelectorAll('.audience-btn');
    const clickedBtn = document.querySelector(`[data-audience="${audience}"]`);

    if (audience === 'Public') {
        // If Public is clicked, deselect all others
        buttons.forEach(btn => btn.classList.remove('active'));
        clickedBtn.classList.add('active');
    } else {
        // If other audience is clicked, deselect Public
        const publicBtn = document.querySelector('[data-audience="Public"]');
        publicBtn.classList.remove('active');
        clickedBtn.classList.toggle('active');

        // If no audience selected, default to Public
        const anyActive = Array.from(buttons).some(btn => btn.classList.contains('active'));
        if (!anyActive) {
            publicBtn.classList.add('active');
        }
    }
}







function showGoalSettings(type) {
    closeModal(); // Close any other open modal
    const goals = AppState.currentUser.goals;
    const currentGoal = goals[type];

    let title, unit;
    if (type === 'steps') { title = 'Objetivo de Pasos'; unit = 'pasos'; }
    else if (type === 'activeMinutes') { title = 'Actividad Diaria'; unit = 'minutos'; }
    else if (type === 'sleepHours') { title = 'Horas de Sueño'; unit = 'horas'; }

    const modal = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal-content max-w-sm" onclick="event.stopPropagation()">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold">${title}</h2>
                        <button class="btn-icon" onclick="closeModal()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <div class="glass-card rounded-2xl p-6 mb-6 text-center border border-white/10">
                        <div class="text-xs font-bold text-white/60 uppercase mb-2 tracking-wider">Meta Actual</div>
                        <div class="text-4xl font-bold text-primary mb-1 neon-text-glow">${currentGoal}</div>
                        <div class="text-sm text-white/40 font-medium uppercase tracking-widest">${unit}</div>
                    </div>

                    <div class="mb-6">
                        <label class="text-xs font-bold text-white/80 mb-3 block uppercase tracking-wider">Establecer Nuevo Objetivo</label>
                        <div class="relative">
                            <input type="number" id="newGoalValue" value="${currentGoal}" class="w-full border border-white/20 rounded-xl px-4 py-3 font-bold text-lg text-center focus:border-primary focus:outline-none focus:shadow-[0_0_15px_rgba(0,245,212,0.2)] transition-all placeholder-white/50" min="0" style="background-color: #0f172a !important; color: white !important;">
                        </div>
                    </div>

                    <button class="btn-primary w-full py-3" onclick="updateGoal('${type}')">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('modalsContainer').innerHTML = modal;
}

function updateGoal(type) {
    const input = document.getElementById('newGoalValue');
    const nV = parseFloat(input.value); // Fixed typo

    if (input.value && !isNaN(nV) && nV > 0) {
        AppState.currentUser.goals[type] = nV;
        showToast('¡Objetivo actualizado correctamente!');
        closeModal();
        navigateTo(AppState.currentPage); // Refresh page to update colors
    } else {
        showToast('Por favor ingresa un valor válido', 'error');
    }
}

function likePost(id) { showToast('¡Post liked!'); }
function showComments(id) { showToast('Abriendo comentarios...'); }
function sharePost(id) { showToast('Compartiendo post...'); }
function addFriend(id) { showToast('Solicitud de amistad enviada'); }
function searchFriends(query) { console.log('Searching:', query); }
function searchFriendsForChallenge(query) {
    if (query.length > 2) showToast(`Buscando a "${query}"...`);
}
function integrateApp(id) { showToast('Integrando aplicación...'); closeModal(); }




function showChallengeOptions(id) {
    const challenge = AppState.challenges.find(c => c.id === id);
    if (!challenge) return;

    const isCreator = challenge.creator.name === AppState.currentUser.name || challenge.creator.name === AppState.currentUser.name.split(' ')[0];

    const modal = `
        <div class="modal-overlay" onclick="closeModal(event)">
            <div class="modal-content max-w-xs" onclick="event.stopPropagation()">
                <div class="p-2 space-y-1">
                    ${isCreator ? `
                        <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold flex items-center gap-3" onclick="openChallengeModal('edit', '${id}')">
                            <span class="material-symbols-outlined text-white/80">edit</span>
                            Editar Desafío
                        </button>
                        <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-bold text-red-500 flex items-center gap-3" onclick="deleteChallenge('${id}')">
                            <span class="material-symbols-outlined">delete</span>
                            Eliminar Desafío
                        </button>
                    ` : `
                        <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-bold text-red-500 flex items-center gap-3" onclick="leaveChallenge('${id}')">
                            <span class="material-symbols-outlined">logout</span>
                            Abandonar Desafío
                        </button>
                    `}
                    <button class="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm font-bold flex items-center gap-3" onclick="closeModal()">
                        <span class="material-symbols-outlined text-white/80">close</span>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('modalsContainer').innerHTML = modal;
}

// Custom Confirmation Modal
function showConfirmationModal(title, message, actionFunctionStr, actionLabel = 'Confirmar', isDestructive = false) {
    const modal = `
        <div class="modal-overlay" style="z-index: 100;" onclick="closeModal()">
            <div class="modal-content max-w-sm w-[90%] bg-[#050b12] border border-white/10" onclick="event.stopPropagation()">
                <div class="p-6 text-center">
                    <div class="size-16 rounded-full bg-${isDestructive ? 'red-500/10' : 'white/5'} flex items-center justify-center mx-auto mb-4">
                        <span class="material-symbols-outlined text-3xl text-${isDestructive ? 'red-500' : 'neon-teal'}">${isDestructive ? 'warning' : 'help'}</span>
                    </div>
                    
                    <h3 class="text-xl font-bold text-white mb-2">${title}</h3>
                    <p class="text-sm text-white/60 mb-6 leading-relaxed">${message}</p>
                    
                    <div class="flex gap-3">
                        <button class="flex-1 py-3 rounded-xl bg-white/5 text-white text-sm font-bold hover:bg-white/10 transition-colors" onclick="closeModal()">
                            Cancelar
                        </button>
                        <button class="flex-1 py-3 rounded-xl ${isDestructive ? 'bg-red-500 hover:bg-red-600' : 'bg-neon-teal hover:bg-neon-teal/80 text-black'} transition-colors text-sm font-bold shadow-lg" onclick="${actionFunctionStr}">
                            ${actionLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    // We append to body to ensure it's on top, or replace modal container
    document.getElementById('modalsContainer').innerHTML = modal;
}

function deleteChallenge(id) {
    showConfirmationModal(
        'Eliminar Desafío',
        '¿Estás seguro de que quieres eliminar este desafío permanentemente? Esta acción no se puede deshacer.',
        `executeDeleteChallenge('${id}')`,
        'Eliminar',
        true
    );
}

function executeDeleteChallenge(id) {
    AppState.challenges = AppState.challenges.filter(c => c.id !== id);
    showToast('Desafío eliminado');
    closeModal();
    navigateTo('challenges');
}

function leaveChallenge(id) {
    showConfirmationModal(
        'Abandonar Desafío',
        '¿Estás seguro de que deseas salir de este grupo? Perderás tu progreso actual.',
        `executeLeaveChallenge('${id}')`,
        'Abandonar',
        true
    );
}

function executeLeaveChallenge(id) {
    AppState.challenges = AppState.challenges.filter(c => c.id !== id);
    showToast('Has abandonado el desafío');
    closeModal();
    navigateTo('challenges');
}

function showCreateChallengeModal() {
    openChallengeModal('create');
}

function openChallengeModal(mode = 'create', challengeId = null) {
    closeModal();

    let challenge = {};
    if (mode === 'edit' && challengeId) {
        challenge = AppState.challenges.find(c => c.id === challengeId) || {};
    }

    // Styles from user provided code
    const styles = `
    <style>
        .neon-shadow { box-shadow: 0 0 15px rgba(0, 245, 225, 0.3); }
        .neon-gradient { background: linear-gradient(135deg, #00f5e1 0%, #00b8ff 100%); }
        .bet-card-glow { box-shadow: 0 0 20px rgba(0, 245, 225, 0.15); border: 1px solid rgba(0, 245, 225, 0.3); }
        input::placeholder { color: rgba(255, 255, 255, 0.3); }
        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1) sepia(100%) saturate(10000%) hue-rotate(130deg);
            opacity: 0.7; cursor: pointer;
        }
        .text-neon-teal { color: #00f5e1; }
        .bg-neon-teal { background-color: #00f5e1; }
        .border-neon-teal { border-color: #00f5e1; }
        .focus\\:ring-neon-teal:focus { --tw-ring-color: #00f5e1; }
        .text-gold { color: #ffd700; }
        .bg-gold\\/20 { background-color: rgba(255, 215, 0, 0.2); }
        .border-gold\\/30 { border-color: rgba(255, 215, 0, 0.3); }
    </style>
    `;

    const today = new Date().toISOString().split('T')[0];

    const modal = `
        <div class="modal-overlay" onclick="closeModal(event)">
            ${styles}
            <div class="modal-content w-full max-w-lg overflow-y-auto max-h-[90vh] bg-[#050b12]" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="sticky top-0 z-50 bg-[#050b12]/95 backdrop-blur-xl border-b border-white/5">
                    <div class="flex items-center p-4 justify-between">
                        <button class="flex size-10 items-center justify-center rounded-full bg-white/5 text-white active:scale-90 transition-transform" onclick="closeModal()">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                        <h1 class="text-white text-lg font-bold">${mode === 'create' ? 'Create New Challenge' : 'Edit Challenge'}</h1>
                        <div class="w-10"></div>
                    </div>
                </div>

                <form onsubmit="handleChallengeFormSubmit(event, '${mode}', '${challengeId || ''}')" class="p-4 space-y-6 pb-12">
                    <section class="glass-card rounded-2xl p-5">
                        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Challenge Name</label>
                        <input name="name" value="${challenge.name || ''}" class="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-neon-teal focus:border-neon-teal outline-none transition-all placeholder:text-gray-600" placeholder="e.g. Summer Shred 2024" type="text" required />
                    </section>

                    <section class="glass-card rounded-2xl p-5">
                        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Descripción (Max 140)</label>
                        <textarea name="description" maxlength="140" class="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-neon-teal focus:border-neon-teal outline-none transition-all placeholder:text-gray-600 resize-none h-24" placeholder="Describe el objetivo de tu desafío..." required>${challenge.description || ''}</textarea>
                    </section>

                    <section class="glass-card rounded-2xl p-5">
                        <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-4">Tipo de Actividad</label>
                        <input type="hidden" name="category" id="selectedCategory" value="${challenge.category || 'Gym'}">
                        <div class="grid grid-cols-3 sm:grid-cols-4 gap-3" id="categoryGrid">
                             ${[
            { id: 'Gym', label: 'Gym', icon: 'fitness_center', unit: 'min' },
            { id: 'Run', label: 'Correr', icon: 'directions_run', unit: 'km' },
            { id: 'Cycle', label: 'Ciclismo', icon: 'directions_bike', unit: 'km' },
            { id: 'Walk', label: 'Caminata', icon: 'directions_walk', unit: 'km' },
            { id: 'Soccer', label: 'Fútbol', icon: 'sports_soccer', unit: 'min' },
            { id: 'Swim', label: 'Natación', icon: 'pool', unit: 'm' },
            { id: 'Yoga', label: 'Yoga', icon: 'self_improvement', unit: 'min' },
            { id: 'Calories', label: 'Calorías', icon: 'local_fire_department', unit: 'kcal' },
            { id: 'Dance', label: 'Baile', icon: 'music_note', unit: 'min' },
            { id: 'Tennis', label: 'Tenis', icon: 'sports_tennis', unit: 'min' },
            { id: 'Basket', label: 'Básquet', icon: 'sports_basketball', unit: 'min' },
            { id: 'Calisthenics', label: 'Calistenia', icon: 'sports_gymnastics', unit: 'reps' }
        ].map(cat => {
            const isSelected = (challenge.category || 'Gym') === cat.id;
            return `
                                    <button type="button" data-unit="${cat.unit}" class="flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${isSelected ? 'bg-neon-teal/10 border-neon-teal text-neon-teal shadow-[0_0_15px_rgba(0,245,225,0.15)]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'}" onclick="selectCategory(this, '${cat.id}')">
                                        <span class="material-symbols-outlined text-2xl mb-1">${cat.icon}</span>
                                        <span class="text-[10px] font-bold uppercase tracking-wider">${cat.label}</span>
                                    </button>
                                `;
        }).join('')}
                        </div>
                    </section>

                    <section class="glass-card rounded-2xl p-5 space-y-5">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Meta del Objetivo</label>
                            <div class="relative">
                                <input name="metricValue" value="${challenge.metric ? challenge.metric.split(' ')[0] : ''}" class="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-neon-teal focus:border-neon-teal outline-none transition-all" placeholder="Ej. 100" type="number" required />
                                <span id="metricUnitLabel" class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 uppercase">${challenge.metric ? challenge.metric.split(' ')[1] : 'min'}</span>
                                <input type="hidden" name="metricUnit" id="metricUnitInput" value="${challenge.metric ? challenge.metric.split(' ')[1] : 'min'}">
                            </div>
                            <div class="mt-2 flex items-center gap-2">
                                <input type="checkbox" id="caloricGoal" class="accent-neon-teal bg-white/10 border-white/20 rounded size-4" onchange="toggleCaloricGoal(this)">
                                <label for="caloricGoal" class="text-xs text-gray-400 font-bold uppercase tracking-wide">Usar Calorías</label>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Fecha Inicio</label>
                                <div class="relative">
                                    <input name="startDate" min="${today}" class="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-neon-teal focus:border-neon-teal outline-none transition-all text-xs" type="date" value="${challenge.startDate || today}" />
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Fecha Fin</label>
                                <div class="relative">
                                    <input name="endDate" min="${today}" class="w-full bg-white/5 border-white/10 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-neon-teal focus:border-neon-teal outline-none transition-all text-xs" type="date" value="${challenge.endDate || '2026-02-15'}" />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="glass-card rounded-2xl p-5 space-y-5">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Tipo de Desafío</label>
                            <input type="hidden" name="type" id="selectedType" value="${challenge.type || 'individual'}">
                            <div class="flex p-1 bg-white/5 rounded-xl mb-4">
                                <button type="button" class="flex-1 py-2 text-xs font-bold rounded-lg ${challenge.type === 'individual' ? 'bg-neon-teal text-black shadow-lg shadow-neon-teal/20' : 'text-gray-500'}" onclick="selectType(this, 'individual')">Individual</button>
                                <button type="button" class="flex-1 py-2 text-xs font-bold rounded-lg ${challenge.type === 'group' ? 'bg-neon-teal text-black shadow-lg shadow-neon-teal/20' : 'text-gray-500'}" onclick="selectType(this, 'group')">Grupal</button>
                            </div>

                            <div id="privacyOptions" class="${challenge.type === 'group' ? '' : 'hidden'} glass-card p-4 rounded-xl border border-white/10 bg-[#0f172a]/50">
                                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-3">Privacidad</label>
                                <div class="flex items-center gap-4">
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="privacy" value="public" class="accent-neon-teal" checked>
                                        <span class="text-sm text-white">Público</span>
                                    </label>
                                    <label class="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="privacy" value="private" class="accent-neon-teal">
                                        <span class="text-sm text-white">Privado</span>
                                    </label>
                                </div>
                                <p class="text-[10px] text-white/40 mt-2 italic" id="privacyHelpText">Cualquiera puede unirse desde Discovery.</p>
                            </div>
                        </div>

                        <div class="p-3 rounded-xl bg-white/5 border border-white/5">
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-xs font-bold">Límite de Miembros</p>
                                ${AppState.currentUser?.isPro ? '<span class="text-[10px] font-black text-gold uppercase bg-gold/10 px-2 py-0.5 rounded border border-gold/30">PREMIUM</span>' : ''}
                            </div>
                            <div>
                                ${AppState.currentUser?.isPro
            ? '<span class="text-sm font-bold text-white">Límite premium hasta 100 participantes</span>'
            : `
                                        <span class="text-sm font-bold text-white">Límite hasta 25 participantes</span>
                                        <p class="text-[10px] text-gray-400 mt-1">Aumenta hasta 100 con premium</p>
                                    `
        }
                            </div>
                        </div>
                    </section>

                    <div class="pt-4 px-2">
                        <button type="submit" class="w-full neon-gradient text-black py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-neon-teal/40 active:scale-[0.98] transition-all">
                            ${mode === 'create' ? 'Lanzar Desafío' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('modalsContainer').innerHTML = modal;
}

function selectCategory(btn, value) {
    document.getElementById('selectedCategory').value = value;
    const btns = document.getElementById('categoryGrid').querySelectorAll('button');
    btns.forEach(b => {
        b.className = 'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10';
    });
    btn.className = 'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 bg-neon-teal/10 border-neon-teal text-neon-teal shadow-[0_0_15px_rgba(0,245,225,0.15)]';

    // Auto update unit if Calories is NOT checked
    const isCaloric = document.getElementById('caloricGoal').checked;
    if (!isCaloric) {
        const unit = btn.dataset.unit || 'min';
        document.getElementById('metricUnitLabel').innerText = unit;
        document.getElementById('metricUnitInput').value = unit;
    }
}

function selectType(btn, value) {
    document.getElementById('selectedType').value = value;
    const parent = btn.parentElement;
    parent.querySelectorAll('button').forEach(b => {
        b.className = 'flex-1 py-2 text-xs font-bold rounded-lg text-gray-500';
    });
    btn.className = 'flex-1 py-2 text-xs font-bold rounded-lg bg-neon-teal text-black shadow-lg shadow-neon-teal/20';

    // Toggle Privacy Options
    const privacyOptions = document.getElementById('privacyOptions');
    if (value === 'group') {
        privacyOptions.classList.remove('hidden');
    } else {
        privacyOptions.classList.add('hidden');
    }
}

function toggleCaloricGoal(checkbox) {
    const label = document.getElementById('metricUnitLabel');
    const input = document.getElementById('metricUnitInput');

    if (checkbox.checked) {
        label.innerText = 'CAL';
        input.value = 'CAL';
    } else {
        // Revert to selected category unit
        const selectedCat = document.getElementById('selectedCategory').value;
        const activeBtn = document.querySelector(`button[onclick="selectCategory(this, '${selectedCat}')"]`);
        if (activeBtn) {
            const unit = activeBtn.dataset.unit || 'min';
            label.innerText = unit;
            input.value = unit;
        }
    }
}

function handleChallengeFormSubmit(e, mode, challengeId) {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Gradient Logic
    const gradients = [
        'linear-gradient(135deg, #FF6B00 0%, #FF2E00 100%)',
        'linear-gradient(135deg, #7000FF 0%, #B794F4 100%)',
        'linear-gradient(135deg, #00F5D4 0%, #00D2FF 100%)',
        'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)'
    ];

    let challenge;

    if (mode === 'create') {
        challenge = {
            id: 'ch_' + Date.now(),
            creator: { name: AppState.currentUser.name.split(' ')[0], isBrand: false },
            participants: 1,
            participantsAvatars: [4],
            progress: 0,
            imageGradient: gradients[Math.floor(Math.random() * gradients.length)],
            isPro: false
        };
    } else {
        challenge = AppState.challenges.find(c => c.id === challengeId) || {};
    }

    // Update fields
    challenge.name = formData.get('name');
    challenge.description = formData.get('description');
    challenge.category = formData.get('category');
    challenge.type = formData.get('type');

    const metricVal = formData.get('metricValue');
    const metricUnit = formData.get('metricUnit');
    challenge.metric = `${metricVal} ${metricUnit}`;

    challenge.endDate = formData.get('endDate');
    challenge.startDate = formData.get('startDate'); // Save start date too
    challenge.privacy = formData.get('privacy') || 'public'; // Capture privacy

    // Calculate period text
    const start = new Date(formData.get('startDate'));
    const end = new Date(formData.get('endDate'));
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    challenge.period = `${diffDays} días`;

    if (mode === 'create') {
        AppState.challenges.unshift(challenge);
        showToast('¡Desafío creado con éxito!', 'success');
    } else {
        showToast('Cambios guardados', 'success');
    }

    closeModal();
    if (AppState.currentPage === 'challenge-detail' && challenge.id === AppState.activeChallengeId) {
        navigateTo('challenge-detail'); // Refresh detail view
    } else {
        navigateTo('challenges');
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('wellnessfy_logged_in');
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // Load saved user data from localStorage
    loadUserData();

    // Set user info in header and sidebar
    const headerGreeting = document.getElementById('headerGreeting');
    if (headerGreeting) headerGreeting.textContent = `Hola, ${AppState.currentUser.name.split(' ')[0]} `;

    // Header Avatar (Mobile)
    const headerAvatar = document.getElementById('headerAvatar');
    if (headerAvatar) headerAvatar.style.backgroundImage = `url('${AppState.currentUser.avatar}')`;

    // Sidebar Avatar (Desktop)
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) sidebarAvatar.style.backgroundImage = `url('${AppState.currentUser.avatar}')`;

    // Check if this is a new user (onboarding flow)
    const isNewUser = localStorage.getItem('wellnessfy_is_new_user');
    const onboardingComplete = localStorage.getItem('wellnessfy_onboarding_complete');

    if (isNewUser === 'true' && onboardingComplete !== 'true') {
        // Start onboarding: Show edit profile modal
        setTimeout(() => {
            showEditProfile(true); // true = onboarding mode
        }, 500);
    } else {
        // Load initial page from storage or default (Feed is now "Inicio")
        const savedPage = localStorage.getItem('wellnessfy_last_page');
        navigateTo(savedPage || 'feed');
    }

    console.log('🎉 Wellnessfy App initialized successfully!');
});

// Toggle Public Profile
window.togglePublicProfile = function (isPublic) {
    if (!AppState.currentUser) return;

    AppState.currentUser.isPublic = isPublic;
    saveUserData();

    if (isPublic) {
        showToast('Tu perfil ahora es público 🌎');
    } else {
        showToast('Tu perfil ahora es privado 🔒');
    }
};

