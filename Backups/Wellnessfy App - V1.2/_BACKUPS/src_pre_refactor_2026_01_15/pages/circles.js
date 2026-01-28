import { AppState } from '../utils/state.js';

// ==========================================
// CONTROLADOR PRINCIPAL DE CÍRCULOS (SOCIAL)
// ==========================================

// Estado local para la navegación interna (Tabs)
let currentTab = 'circles'; // 'search' | 'explore' | 'circles'

export function renderCircles() {
    return `
        <div class="flex flex-col h-full">
            <!-- Header Fijo -->
            <div class="glass-header sticky top-0 z-50 bg-[#050b12]/80 backdrop-blur-xl border-b border-white/5 pb-0">
                <div class="flex items-center justify-between py-4 px-4 sticky top-0">
                     <h1 class="text-2xl font-bold tracking-tight text-white">Comunidad</h1>
                    <!-- Acciones globales (opcional) -->
                    <div class="size-10"></div>
                </div>

                <!-- Tabs de Navegación -->
                <div class="flex w-full px-4 border-b border-white/5">
                    <button class="flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${currentTab === 'search' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                            onclick="switchSocialTab('search')">
                        Buscar
                    </button>
                    <button class="flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${currentTab === 'explore' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                            onclick="switchSocialTab('explore')">
                        Explorar
                    </button>
                    <button class="flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${currentTab === 'circles' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                            onclick="switchSocialTab('circles')">
                        Mis Círculos
                    </button>
                </div>
            </div>

            <!-- Contenedor Dinámico -->
            <div id="socialContent" class="flex-1 p-4 pb-24 overflow-y-auto">
                ${renderCurrentTab()}
            </div>
        </div>
    `;
}

// Router Interno para cambiar pestañas
window.switchSocialTab = function (tab) {
    currentTab = tab;
    // Re-renderizamos toda la vista para actualizar los tabs activos y el contenido
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = renderCircles();

    // Initialize map if switching to explore tab
    if (tab === 'explore' && window.initializeExploreMap) {
        setTimeout(window.initializeExploreMap, 300);
    }
};


function renderCurrentTab() {
    switch (currentTab) {
        case 'search': return renderSearchTab();
        case 'explore': return renderExploreTab();
        case 'circles': return renderMyCirclesTab();
        default: return renderMyCirclesTab();
    }
}

// ==========================================
// SUBMÓDULO 1: BUSCAR
// ==========================================
function renderSearchTab() {
    const searchResults = window.searchResults || [];
    const isSearching = window.isSearching || false;

    return `
        <div class="space-y-6 animate-fade-in">
            <div class="text-center py-4">
                <h2 class="text-lg font-bold text-white mb-1">Encuentra Amigos</h2>
                <p class="text-xs text-gray-500">Busca por nombre, usuario o correo</p>
            </div>

            <!-- Search Bar -->
            <div class="relative max-w-md mx-auto">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                <input 
                    type="text" 
                    id="searchInput"
                    placeholder="Ej: AlbertoAcostaR o usuario@email.com" 
                    class="w-full bg-white/5 border border-white/10 text-white px-12 py-4 rounded-xl outline-none focus:border-[#00f5d4] focus:bg-white/10 transition-all placeholder:text-gray-600"
                    onkeydown="if(event.key==='Enter') window.searchUsers()"
                >
                <button 
                    class="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00f5d4]/10 text-[#00f5d4] p-2 rounded-lg hover:bg-[#00f5d4]/20 transition-colors"
                    onclick="window.searchUsers()"
                >
                    <span class="material-symbols-outlined text-lg">${isSearching ? 'progress_activity' : 'arrow_forward'}</span>
                </button>
            </div>

            <!-- Resultados -->
            <div id="searchResults">
                ${searchResults.length > 0 ? `
                    <div class="space-y-3">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                            ${searchResults.length} resultado${searchResults.length > 1 ? 's' : ''} encontrado${searchResults.length > 1 ? 's' : ''}
                        </label>
                        ${searchResults.map(user => `
                            <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer" onclick="window.viewUserProfile('${user.uid}')">
                                <div class="size-12 rounded-full bg-cover bg-center border-2 border-[#00f5d4]/30" style="background-image: url('${user.avatar || 'https://i.pravatar.cc/300?img=12'}')"></div>
                                <div class="flex-1">
                                    <div class="text-sm font-bold text-white">${user.name || 'Usuario'}</div>
                                    <div class="text-[10px] text-gray-400">${user.email}</div>
                                    ${user.bio ? `<div class="text-xs text-white/60 mt-1">${user.bio}</div>` : ''}
                                </div>
                                <button 
                                    class="size-10 rounded-full bg-[#00f5d4]/20 text-[#00f5d4] flex items-center justify-center hover:bg-[#00f5d4] hover:text-black transition-all active:scale-95"
                                    onclick="event.stopPropagation(); window.sendFriendRequest('${user.uid}')"
                                    title="Enviar solicitud de amistad"
                                >
                                    <span class="material-symbols-outlined text-lg">person_add</span>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : isSearching ? `
                    <div class="text-center py-10">
                        <span class="material-symbols-outlined text-4xl mb-2 animate-spin text-[#00f5d4]">progress_activity</span>
                        <p class="text-sm font-bold uppercase tracking-widest text-white/60">Buscando...</p>
                    </div>
                ` : `
                    <div class="text-center py-10 opacity-30">
                        <span class="material-symbols-outlined text-4xl mb-2">person_search</span>
                        <p class="text-sm font-bold uppercase tracking-widest">Esperando búsqueda...</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// ==========================================
// SUBMÓDULO 2: EXPLORAR
// ==========================================
function renderExploreTab() {
    return `
        <div class="space-y-6 animate-fade-in">
            <div class="text-center py-4">
                <h2 class="text-lg font-bold text-white mb-1">Radar Deportivo</h2>
                <p class="text-xs text-gray-500">Descubre gente activa cerca de ti</p>
            </div>

            <!-- 1. Selector Deporte -->
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Filtro de Deporte</label>
                <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    <!-- Mocks visuales -->
                    <div class="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl bg-[#00f5d4]/20 border border-[#00f5d4] text-[#00f5d4] cursor-pointer">
                        <span class="material-symbols-outlined mb-1">directions_run</span>
                        <span class="text-[9px] font-bold uppercase">Run</span>
                    </div>
                    <div class="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 cursor-pointer hover:bg-white/10">
                        <span class="material-symbols-outlined mb-1">directions_bike</span>
                        <span class="text-[9px] font-bold uppercase">Bike</span>
                    </div>
                    <div class="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 cursor-pointer hover:bg-white/10">
                        <span class="material-symbols-outlined mb-1">fitness_center</span>
                        <span class="text-[9px] font-bold uppercase">Gym</span>
                    </div>
                    <div class="flex flex-col items-center justify-center min-w-[80px] p-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 cursor-pointer hover:bg-white/10">
                        <span class="material-symbols-outlined mb-1">self_improvement</span>
                        <span class="text-[9px] font-bold uppercase">Yoga</span>
                    </div>
                </div>
            </div>

            <!-- 2. Google Maps -->
            <div id="exploreMap" class="relative w-full aspect-square max-h-[300px] bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden">
                <div class="absolute inset-0 flex items-center justify-center text-white/50">
                    <span class="material-symbols-outlined animate-spin">progress_activity</span>
                </div>
            </div>

            <!-- 3. Resultados Lista -->
            <div class="space-y-3">
                 <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Usuarios Encontrados</label>
                 <div class="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div class="size-10 rounded-full bg-gray-700"></div>
                    <div>
                        <div class="text-sm font-bold text-white">Usuario Demo</div>
                        <div class="text-[10px] text-gray-400">A 800m • Running</div>
                    </div>
                    <button class="ml-auto size-8 rounded-full bg-[#00f5d4]/20 text-[#00f5d4] flex items-center justify-center hover:bg-[#00f5d4] hover:text-black transition-colors">
                        <span class="material-symbols-outlined text-sm">person_add</span>
                    </button>
                 </div>
            </div>

        </div>
    `;
}

// ==========================================
// SUBMÓDULO 3: MIS CÍRCULOS (Existente)
// ==========================================
function renderMyCirclesTab() {
    return `
        <div class="space-y-6 animate-fade-in">
             <div class="flex items-center justify-between">
                 <h2 class="text-lg font-bold text-white">Tus Grupos</h2>
                 <button class="btn-primary-sm flex items-center gap-2 bg-[#00f5d4] text-[#0f172a] px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,245,212,0.3)] hover:scale-105 transition-transform" onclick="showCreateCircleModal()">
                    <span class="material-symbols-outlined text-sm">add_circle</span>
                    Crear Nuevo
                 </button>
            </div>

            <!-- Circles Grid -->
            <div class="grid grid-cols-2 gap-4">
                ${AppState.circles.length > 0 ? AppState.circles.map(circle => `
                    <div class="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer" onclick="showCircleDetail('${circle.id}')">
                        <div class="size-20 rounded-full bg-cover bg-center border-2 border-[${circle.neonColor}] shadow-[0_0_10px_${circle.neonColor}40]" style="background-image: url('${circle.image}');"></div>
                        <div class="text-center">
                             <h3 class="font-bold text-white text-sm line-clamp-1">${circle.name}</h3>
                             <p class="text-[10px] text-gray-400 uppercase tracking-wider">${circle.members} Miembros</p>
                        </div>
                    </div>
                `).join('') : `
                    <div class="col-span-2 text-center py-10 opacity-50">
                        <p class="text-sm text-white">No tienes círculos aún.</p>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Helpers globales (Mocks antiguos o nuevos handlers)
export function showCreateCircleModal() {
    window.showToast('Próximamente: Crear Círculo');
}
export function showCircleDetail(id) {
    console.log('Circle Detail', id);
}
export function searchFriends(val) {
    console.log('Search Friends', val);
}

// Search Users Function
window.searchUsers = async function () {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
        window.showToast('Escribe un nombre o correo', 'error');
        return;
    }

    // Set searching state
    window.isSearching = true;
    window.searchResults = [];

    // Re-render to show loading
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = renderCircles();

    try {
        // Import Firestore
        const { getFirestore, collection, getDocs, query: firestoreQuery, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = window.db || getFirestore();

        // Search by email (exact match) or name (contains)
        const usersRef = collection(db, 'users');
        const allUsersSnapshot = await getDocs(usersRef);

        const results = [];
        const currentUserEmail = window.AppState?.currentUser?.email;

        allUsersSnapshot.forEach((doc) => {
            const userData = doc.data();
            const userEmail = userData.email?.toLowerCase() || '';
            const userName = userData.name?.toLowerCase() || '';
            const userUsername = userData.username?.toLowerCase() || '';

            // Don't include current user in results
            if (userEmail === currentUserEmail) return;

            // Search by email, name, or username
            if (userEmail.includes(query) || userName.includes(query) || userUsername.includes(query)) {
                results.push({
                    uid: doc.id,
                    ...userData
                });
            }
        });

        window.searchResults = results;
        window.isSearching = false;

        if (results.length === 0) {
            window.showToast('No se encontraron usuarios', 'info');
        } else {
            window.showToast(`${results.length} usuario${results.length > 1 ? 's' : ''} encontrado${results.length > 1 ? 's' : ''}`, 'success');
        }

        // Re-render with results
        mainContent.innerHTML = renderCircles();

    } catch (error) {
        console.error('Error buscando usuarios:', error);
        window.isSearching = false;
        window.searchResults = [];
        window.showToast('Error al buscar usuarios', 'error');

        // Re-render
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = renderCircles();
    }
};

// Send Friend Request Function
window.sendFriendRequest = async function (targetUserId) {
    if (!targetUserId) return;

    const currentUser = window.AppState?.currentUser;
    if (!currentUser) {
        window.showToast('Debes iniciar sesión', 'error');
        return;
    }

    try {
        // Import Firestore
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = window.db || getFirestore();

        // Create friend request document
        await addDoc(collection(db, 'friendRequests'), {
            from: currentUser.uid,
            fromName: currentUser.name,
            fromAvatar: currentUser.avatar,
            fromEmail: currentUser.email,
            to: targetUserId,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        window.showToast('Solicitud de amistad enviada', 'success');
        console.log('✅ Solicitud enviada a:', targetUserId);

    } catch (error) {
        console.error('Error enviando solicitud:', error);
        window.showToast('Error al enviar solicitud', 'error');
    }
};

// View User Profile Function
window.viewUserProfile = function (userId) {
    if (!userId) return;

    // Import navigateTo
    import('../router.js').then(({ navigateTo }) => {
        navigateTo('profile', userId);
    });
};
