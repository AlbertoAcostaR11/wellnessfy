
import { AppState } from '../utils/state.js';
import { mountSportSelector } from '../utils/sportSelectorInit.js';

// ==========================================
// CONTROLADOR PRINCIPAL DE CÍRCULOS (SOCIAL)
// ==========================================

// Estado local para la navegación interna (Tabs)
let currentTab = 'discover'; // 'discover' | 'circles'

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
                    <button class="flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${currentTab === 'discover' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                            onclick="switchSocialTab('discover')">
                        Descubrir
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

    // Initialize map and selectors if switching to discover tab
    if (tab === 'discover') {
        if (window.initializeExploreMap) {
            setTimeout(window.initializeExploreMap, 300);
        }
        // Montar selector de deportes
        setTimeout(() => {
            mountSportSelector('circles-explore-sport-selector', {
                mode: 'multiple',
                placeholder: 'Filtrar radar...',
                onSelect: (selected) => {
                    console.log('Filtrando radar por:', selected);
                }
            });
        }, 100);
    }
};


function renderCurrentTab() {
    switch (currentTab) {
        case 'discover': return renderDiscoverTab();
        case 'circles': return renderMyCirclesTab();
        default: return renderMyCirclesTab();
    }
}

// ==========================================
// PESTAÑA UNIFICADA: DESCUBRIR
// (Buscador + Sugerencias + Radar)
// ==========================================
function renderDiscoverTab() {
    const searchResults = window.searchResults || [];
    const isSearching = window.isSearching || false;

    return `
        <div class="space-y-8 animate-fade-in relative">
            
            <!-- 1. SEARCH BAR (Sticky Header) -->
            <div class="sticky top-0 z-40 bg-[#050b12]/95 backdrop-blur-xl pt-2 pb-4 border-b border-white/5 -mx-4 px-4 shadow-lg shadow-black/20">
                <div class="relative w-full">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                    <input 
                        type="text" 
                        id="searchInput"
                        value="${window.lastSearchQuery || ''}"
                        placeholder="Buscar personas o clubes..." 
                        class="w-full bg-white/5 border border-white/10 text-white pl-12 pr-12 py-3.5 rounded-xl outline-none focus:border-[#00f5d4] focus:bg-white/10 transition-all placeholder:text-gray-600 font-medium"
                        onkeydown="if(event.key==='Enter') window.searchUsers()"
                        oninput="window.lastSearchQuery = this.value"
                    >
                    <button 
                        class="absolute right-2 top-1/2 -translate-y-1/2 bg-[#00f5d4]/10 text-[#00f5d4] p-1.5 rounded-lg hover:bg-[#00f5d4]/20 transition-colors"
                        onclick="window.searchUsers()"
                    >
                        <span class="material-symbols-outlined text-lg">${isSearching ? 'progress_activity animate-spin' : 'arrow_forward'}</span>
                    </button>
                </div>
            </div>

            <!-- RESULTADOS DE BÚSQUEDA (Condicional) -->
            ${searchResults.length > 0 || isSearching ? `
                <div id="searchResultsSection" class="animate-fade-in">
                    ${renderSearchResultsList(searchResults, isSearching)}
                </div>
            ` : `
                <!-- CONTENIDO DE DESCUBRIMIENTO (Solo si no hay búsqueda activa) -->
                
                <!-- 2. SUGERENCIAS INTELIGENTES -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between px-1">
                        <h2 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span class="material-symbols-outlined text-[#00f5d4] text-sm">auto_awesome</span>
                            Sugerencias para ti
                        </h2>
                    </div>
                    
                    <!-- Carrusel Horizontal -->
                    <div class="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                        <!-- Mock Users -->
                        ${renderUserSuggestionCard('Ana García', '@anarunner', 'Running', 'https://i.pravatar.cc/150?u=a042581f4e29026024d')}
                        ${renderUserSuggestionCard('Carlos M.', '@charlybike', 'Ciclismo', 'https://i.pravatar.cc/150?u=a04258a2462d826712d')}
                        ${renderUserSuggestionCard('Sofía Fit', '@sofiayoga', 'Yoga', 'https://i.pravatar.cc/150?u=a042581f4e29026704d')}
                        ${renderUserSuggestionCard('David Throw', '@davidcross', 'Crossfit', 'https://i.pravatar.cc/150?u=a048581f4e29026704d')}
                    </div>
                </div>

                <div class="border-t border-white/5"></div>

                <!-- 3. RADAR DEPORTIVO (Antiguo Explorar) -->
                <div class="space-y-4">
                    <div class="flex items-center justify-between px-1">
                        <h2 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <span class="material-symbols-outlined text-[#00f5d4] text-sm">radar</span>
                            Radar Deportivo
                        </h2>
                        <span class="text-[9px] font-bold text-[#00f5d4] bg-[#00f5d4]/10 px-2 py-1 rounded-full">En tu zona</span>
                    </div>

                    <!-- Filtro Deporte -->
                    <div class="space-y-2">
                        <div id="circles-explore-sport-selector">
                            <div class="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                        </div>
                    </div>

                    <!-- Mapa / Radar Visual -->
                    <div id="exploreMap" class="relative w-full aspect-video bg-[#0f172a] rounded-2xl border border-white/10 overflow-hidden shadow-inner group cursor-pointer hover:border-[#00f5d4]/30 transition-colors">
                         <!-- Placeholder Radar Animation -->
                         <div class="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <div class="absolute size-64 rounded-full border border-[#00f5d4]/20 animate-ping" style="animation-duration: 3s"></div>
                            <div class="absolute size-40 rounded-full border border-[#00f5d4]/30 animate-ping" style="animation-duration: 3s; animation-delay: 1s"></div>
                            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,245,212,0.1),transparent_70%)]"></div>
                         </div>
                         
                         <div class="absolute inset-0 flex items-center justify-center text-white/50 z-10">
                            <div class="text-center">
                                <span class="material-symbols-outlined text-3xl mb-2 text-[#00f5d4]">location_on</span>
                                <p class="text-[10px] uppercase font-bold tracking-widest">Explorando cerca de ti</p>
                            </div>
                        </div>
                    </div>
                </div>
            `}
        </div>
     `;
}

function renderUserSuggestionCard(name, username, sport, img) {
    return `
        <div class="min-w-[140px] snap-center bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer relative group">
            <button class="absolute top-2 right-2 size-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-[#00f5d4] hover:bg-[#00f5d4]/20 transition-all">
                <span class="material-symbols-outlined text-sm">person_add</span>
            </button>
            <div class="size-16 rounded-full bg-cover bg-center border-2 border-white/10 group-hover:border-[#00f5d4]" style="background-image: url('${img}');"></div>
            <div class="text-center w-full">
                <h3 class="font-bold text-white text-xs truncate w-full">${name}</h3>
                <p class="text-[10px] text-[#00f5d4] truncate">${sport}</p>
            </div>
        </div>
    `;
}

// Helper para renderizar lista de búsqueda
function renderSearchResultsList(results, isSearching) {
    if (isSearching) {
        return `
            <div class="text-center py-10">
                <span class="material-symbols-outlined text-4xl mb-2 animate-spin text-[#00f5d4]">progress_activity</span>
                <p class="text-sm font-bold uppercase tracking-widest text-white/60">Buscando...</p>
            </div>
        `;
    }

    if (results.length === 0) {
        return `
            <div class="text-center py-12 opacity-50 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                <span class="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                <p class="text-xs font-bold uppercase tracking-widest text-white">No se encontraron resultados</p>
            </div>
        `;
    }

    return `
        <div class="space-y-3">
             <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                ${results.length} resultados encontrados
            </label>
            ${results.map(user => `
                <div class="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer" onclick="window.viewUserProfile('${user.uid}')">
                    <div class="size-12 rounded-full bg-cover bg-center border-2 border-[#00f5d4]/30" style="background-image: url('${user.avatar || 'https://i.pravatar.cc/300?img=12'}')"></div>
                    <div class="flex-1">
                        <div class="flex items-center gap-1.5">
                            <span class="text-sm font-bold text-white">${user.name || 'Usuario'}</span>
                        </div>
                        <div class="text-[10px] text-[#00f5d4] font-bold tracking-tight">${user.username || '@usuario'}</div>
                    </div>
                     <button 
                        class="size-10 rounded-full bg-[#00f5d4]/20 text-[#00f5d4] flex items-center justify-center hover:bg-[#00f5d4] hover:text-black transition-all active:scale-95"
                        onclick="event.stopPropagation(); window.sendFriendRequest('${user.uid || user.id}')"
                        title="Enviar solicitud de amistad"
                    >
                        <span class="material-symbols-outlined text-lg">person_add</span>
                    </button>
                </div>
            `).join('')}
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
                             <p class="text-[10px] text-gray-400 uppercase tracking-wider">${circle.members || 1} Miembros</p>
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

// Helpers globales

export function showCreateCircleModal() {
    const existingModal = document.getElementById('create-circle-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'create-circle-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-0 sm:p-4';
    modal.innerHTML = `
        <div class="bg-[#0b121f] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl border-t sm:border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-white/5">
                <button class="size-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors" onclick="this.closest('#create-circle-modal').remove()">
                    <span class="material-symbols-outlined text-white/40 text-sm">close</span>
                </button>
                <h3 class="font-black text-white text-[10px] uppercase tracking-[0.2em]">Crear Círculo</h3>
                <div class="size-8"></div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6 overflow-y-auto">
                <div class="text-center">
                    <p class="text-xs font-bold text-[#00f5d4] uppercase tracking-widest mb-1">Nuevo Grupo</p>
                    <p class="text-white/40 text-[9px] uppercase font-medium">Crea un espacio para compartir con amigos</p>
                </div>

                <!-- Circle Image -->
                <div class="flex flex-col items-center gap-3">
                    <div id="circleImagePreview" class="size-24 rounded-full bg-gradient-to-br from-[#00f5d4] to-[#00b8ff] border-2 border-white/10 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform" onclick="document.getElementById('circleImageInput').click()">
                        <span class="material-symbols-outlined text-white text-3xl">add_a_photo</span>
                    </div>
                    <input type="file" id="circleImageInput" accept="image/*" class="hidden" onchange="handleCircleImage(this)">
                    <p class="text-[9px] text-white/40 uppercase font-medium">Toca para cambiar imagen</p>
                </div>

                <!-- Circle Name -->
                <div class="space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Nombre del Círculo</label>
                    <input type="text" id="circleName" placeholder="Ej: Runners de la Ciudad" 
                           class="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-[#00f5d4] focus:bg-white/10 transition-all placeholder:text-gray-600">
                </div>

                <!-- Circle Description -->
                <div class="space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Descripción</label>
                    <textarea id="circleDescription" placeholder="Describe tu círculo..." 
                              class="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-[#00f5d4] focus:bg-white/10 transition-all placeholder:text-gray-600 resize-none h-20"></textarea>
                </div>

                <!-- Privacy Settings -->
                <div class="space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest block">Privacidad</label>
                    <div class="flex gap-3">
                        <button class="flex-1 p-3 rounded-xl bg-[#00f5d4]/20 border-2 border-[#00f5d4] text-white transition-all" id="privacyPublic" onclick="selectPrivacy('public')">
                            <span class="material-symbols-outlined text-2xl mb-1">public</span>
                            <p class="text-[9px] font-bold uppercase">Público</p>
                        </button>
                        <button class="flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all" id="privacyPrivate" onclick="selectPrivacy('private')">
                            <span class="material-symbols-outlined text-2xl mb-1">lock</span>
                            <p class="text-[9px] font-bold uppercase">Privado</p>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Footer Action -->
            <div class="p-6 bg-black/20">
                <button class="w-full h-14 bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all text-[#0f172a] font-black uppercase tracking-widest text-sm"
                        onclick="submitCreateCircle()" id="btnCreateCircle">
                    <span class="material-symbols-outlined">add_circle</span>
                    Crear Círculo
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Initialize state
    window.circleFormData = {
        image: null,
        privacy: 'public'
    };
}

let currentCircleImage = null;

window.handleCircleImage = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentCircleImage = e.target.result;
            const preview = document.getElementById('circleImagePreview');
            preview.style.backgroundImage = `url('${currentCircleImage}')`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.innerHTML = '';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.selectPrivacy = function (privacy) {
    window.circleFormData.privacy = privacy;

    const publicBtn = document.getElementById('privacyPublic');
    const privateBtn = document.getElementById('privacyPrivate');

    if (privacy === 'public') {
        publicBtn.className = 'flex-1 p-3 rounded-xl bg-[#00f5d4]/20 border-2 border-[#00f5d4] text-white transition-all';
        privateBtn.className = 'flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all';
    } else {
        publicBtn.className = 'flex-1 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 transition-all';
        privateBtn.className = 'flex-1 p-3 rounded-xl bg-[#00f5d4]/20 border-2 border-[#00f5d4] text-white transition-all';
    }
};

window.submitCreateCircle = async function () {
    const name = document.getElementById('circleName').value.trim();
    const description = document.getElementById('circleDescription').value.trim();
    const btn = document.getElementById('btnCreateCircle');

    if (!name) {
        window.showToast('Por favor ingresa un nombre para el círculo', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';

    try {
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const newCircle = {
            name: name,
            description: description,
            image: currentCircleImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=200`,
            neonColor: '#00f5d4',
            privacy: window.circleFormData.privacy,
            members: 1,
            createdBy: AppState.currentUser.uid || AppState.currentUser.id,
            createdByName: AppState.currentUser.name,
            createdAt: serverTimestamp(),
            membersList: [AppState.currentUser.uid || AppState.currentUser.id]
        };

        const docRef = await addDoc(collection(db, 'circles'), newCircle);
        newCircle.id = docRef.id;

        // Add to local state
        AppState.circles.push(newCircle);

        // Save to localStorage
        localStorage.setItem('my_circles', JSON.stringify(AppState.circles));

        window.showToast('¡Círculo creado exitosamente!', 'success');
        document.getElementById('create-circle-modal').remove();

        // Reset image state
        currentCircleImage = null;

        // Refresh
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.innerHTML = renderCircles();

    } catch (error) {
        console.error('Error creando círculo:', error);
        window.showToast('Error al crear el círculo', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">add_circle</span> Crear Círculo';
    }
};

export function showCircleDetail(id) {
    const circle = AppState.circles.find(c => c.id === id);
    if (!circle) return;

    const currentUserId = AppState.currentUser.uid || AppState.currentUser.id;
    const isCreator = circle.createdBy === currentUserId;
    const isMember = circle.membersList?.includes(currentUserId);

    const existingModal = document.getElementById('circle-detail-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'circle-detail-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-0 sm:p-4';
    // ... UI Detalle Simplificada ...
    modal.innerHTML = `
        <div class="bg-[#0b121f] w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl border-t sm:border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
             <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-white/5">
                <button class="size-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors" onclick="this.closest('#circle-detail-modal').remove()">
                    <span class="material-symbols-outlined text-white/40 text-sm">close</span>
                </button>
                <h3 class="font-black text-white text-[10px] uppercase tracking-[0.2em]">Detalles</h3>
                ${isCreator ? `
                    <button class="size-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors" onclick="editCircle('${circle.id}')">
                        <span class="material-symbols-outlined text-white/40 text-sm">edit</span>
                    </button>
                ` : '<div class="size-8"></div>'}
            </div>
            
            <div class="p-6 space-y-6 overflow-y-auto">
                 <div class="flex flex-col items-center text-center gap-4">
                    <div class="size-32 rounded-full bg-cover bg-center border-4 border-[${circle.neonColor}] shadow-[0_0_20px_${circle.neonColor}40]" style="background-image: url('${circle.image}');"></div>
                    <div>
                        <h2 class="text-2xl font-bold text-white mb-1">${circle.name}</h2>
                         <p class="text-sm text-gray-400">${circle.description || ''}</p>
                    </div>
                </div>
                 <!-- Stats -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                        <p class="text-2xl font-black text-white">${circle.members || 1}</p>
                        <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Miembros</p>
                    </div>
                </div>
            </div>

            <div class="p-6 bg-black/20 border-t border-white/5 space-y-3">
                ${isCreator ? `
                    <button class="w-full h-12 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold text-sm uppercase" onclick="deleteCircle('${circle.id}')">Eliminar</button>
                ` : isMember ? `
                    <button class="w-full h-12 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold text-sm uppercase" onclick="leaveCircle('${circle.id}')">Salir del Grupo</button>
                ` : `
                    <button class="w-full h-12 bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-xl text-[#0f172a] font-black text-sm uppercase" onclick="joinCircle('${circle.id}')">Unirse</button>
                `}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Edit Circle Functions 
window.editCircle = function (circleId) {
    const circle = AppState.circles.find(c => c.id === circleId);
    if (!circle) return;
    document.getElementById('circle-detail-modal')?.remove();
    // Reutilizamos showCreateCircleModal pre-cargando datos (simplificación)
    // En V2 implementaremos modal de edit dedicado si es necesario
    // Por ahora mostramos un toast
    window.showToast("Función de edición en mantenimiento", "info");
};

// CRUD ACTIONS REIMPLEMENTED

window.deleteCircle = function (circleId) {
    if (!confirm("¿Seguro que quieres eliminar este círculo?")) return;

    // Optimistic UI update
    AppState.circles = AppState.circles.filter(c => c.id !== circleId);
    localStorage.setItem('my_circles', JSON.stringify(AppState.circles));

    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.innerHTML = renderCircles();
    document.getElementById('circle-detail-modal')?.remove();

    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js')
        .then(({ getFirestore, doc, deleteDoc }) => {
            const db = getFirestore();
            deleteDoc(doc(db, 'circles', circleId)).then(() => {
                window.showToast("Círculo eliminado", "success");
            });
        });
};

window.joinCircle = async function (circleId) {
    const currentUserId = AppState.currentUser.uid || AppState.currentUser.id;
    if (!currentUserId) return;

    // Optimistic
    const circle = AppState.circles.find(c => c.id === circleId);
    if (circle) {
        circle.members = (circle.members || 0) + 1;
        circle.membersList = [...(circle.membersList || []), currentUserId];
    }
    document.getElementById('circle-detail-modal')?.remove();

    // Firebase Update
    try {
        const { getFirestore, doc, updateDoc, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        await updateDoc(doc(db, 'circles', circleId), {
            members: (circle.members || 1),
            membersList: arrayUnion(currentUserId)
        });
        window.showToast("Te uniste al círculo", "success");
        // Reload
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.innerHTML = renderCircles();
    } catch (e) {
        console.error(e);
        window.showToast("Error al unirse", "error");
    }
};

window.leaveCircle = async function (circleId) {
    const currentUserId = AppState.currentUser.uid || AppState.currentUser.id;

    // Optimistic
    const circle = AppState.circles.find(c => c.id === circleId);
    if (circle) {
        circle.members = Math.max(0, (circle.members || 1) - 1);
        circle.membersList = (circle.membersList || []).filter(id => id !== currentUserId);
    }
    document.getElementById('circle-detail-modal')?.remove();

    // Firebase Update
    try {
        const { getFirestore, doc, updateDoc, arrayRemove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        await updateDoc(doc(db, 'circles', circleId), {
            members: circle.members,
            membersList: arrayRemove(currentUserId)
        });
        window.showToast("Saliste del círculo", "success");
        // Reload
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.innerHTML = renderCircles();
    } catch (e) {
        console.error(e);
    }
};


// SEARCH USERS IMPLEMENTATION
window.searchUsers = async function () {
    const query = document.getElementById('searchInput').value.trim().toLowerCase();

    if (!query) {
        window.searchResults = [];
        renderContent();
        return;
    }

    window.isSearching = true;
    renderContent();

    try {
        const { getFirestore, collection, query: q, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const usersRef = collection(db, 'users');
        const qRef = q(usersRef, limit(50));

        const snapshot = await getDocs(qRef);
        const results = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const u = { ...data, uid: doc.id };

            const matchName = (u.name || '').toLowerCase().includes(query);
            const matchUser = (u.username || '').toLowerCase().includes(query);

            if (matchName || matchUser) {
                if (u.uid !== (AppState.currentUser.uid || AppState.currentUser.id)) {
                    results.push(u);
                }
            }
        });

        window.searchResults = results;

    } catch (error) {
        console.error("Error buscando usuarios:", error);
        window.showToast("Error al buscar", "error");
        window.searchResults = [];
    } finally {
        window.isSearching = false;
        renderContent();

        const input = document.getElementById('searchInput');
        if (input) {
            input.focus();
            input.value = query;
        }
    }
};

function renderContent() {
    const mainContainer = document.getElementById('socialContent');
    if (currentTab === 'discover') {
        const input = document.getElementById('searchInput');
        const val = input ? input.value : '';

        mainContainer.innerHTML = renderDiscoverTab();

        const newInput = document.getElementById('searchInput');
        if (newInput) {
            newInput.value = val;
            newInput.focus();
        }
    }
}
