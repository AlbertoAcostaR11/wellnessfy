import { AppState } from '../utils/state.js';
import { navigateTo } from '../router.js';
import { ExploreModule } from '../utils/challengesExplore.js';
import { mountSportSelector } from '../utils/sportSelectorInit.js';

// ==========================================
// 1. PÁGINA DE LISTADO (TABBED INTERFACE)
// ==========================================

let currentTab = 'mine'; // 'mine' | 'explore'

// Datos Mock para pestaña Explorar
const PUBLIC_CHALLENGES = [
    // Retos públicos reales vendrán de la base de datos
];

export function renderChallenges() {
    return `
        <div class="flex flex-col h-full">
            <!-- Header Fijo + Tabs -->
            <div class="glass-header sticky top-0 z-50 bg-[#050b12]/80 backdrop-blur-xl border-b border-white/5 pb-0">
                <div class="flex items-center justify-between py-4 px-4">
                    <h1 class="text-2xl font-bold tracking-tight text-white">Desafíos</h1>
                    <button class="btn-primary-sm flex items-center gap-2 bg-[#00f5d4] text-[#0f172a] px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,245,212,0.3)] hover:scale-105 transition-transform" onclick="showCreateChallengeModal()">
                        <span class="material-symbols-outlined text-sm">add</span>
                        Crear
                    </button>
                </div>

                <!-- Tabs de Navegación -->
                <div class="flex w-full px-4 border-b border-white/5">
                    <button class="flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${currentTab === 'mine' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                            onclick="switchChallengeTab('mine')">
                        Mis Desafíos
                    </button>
                    <button class="flex-1 pb-3 text-sm font-bold uppercase tracking-widest transition-all ${currentTab === 'explore' ? 'text-[#00f5d4] border-b-2 border-[#00f5d4]' : 'text-gray-500 hover:text-white'}" 
                            onclick="switchChallengeTab('explore')">
                        Explorar
                    </button>
                </div>
            </div>

            <!-- Contenedor Dinámico -->
            <div id="challengesContent" class="flex-1 p-4 pb-24 overflow-y-auto">
                ${currentTab === 'mine' ? renderMyChallengesTab() : renderExploreTab()}
            </div>
        </div>
    `;
}

window.switchChallengeTab = function (tab) {
    currentTab = tab;
    // Simple re-render logic handling
    const container = document.getElementById('mainContent'); // Assuming mainContent is the wrapper
    container.innerHTML = renderChallenges();

    // Init Explore Module if tab is active
    if (tab === 'explore') {
        setTimeout(() => ExploreModule.init(), 100);
    }
};

// --- SUBMÓDULO: MIS DESAFÍOS ---
function renderMyChallengesTab() {
    // Filter Challenges: Created by me OR Joined by me
    const myId = AppState.currentUser.id;
    const myUsername = AppState.currentUser.username;
    const myName = AppState.currentUser.name;

    const myChallenges = AppState.challenges.filter(c => {
        const isCreator = (c.creator?.id === myId) ||
            (c.creator?.username === myUsername) ||
            (c.creator?.name === myName) ||
            (c.creator?.name === 'Usuario' && myName === 'Usuario'); // Fallback for new empty profiles

        const isParticipant = Array.isArray(c.participantsList) && c.participantsList.includes(myId);

        return isCreator || isParticipant;
    });

    return `
        <div class="animate-fade-in space-y-4">
            <!-- Filtros Locales -->
            <div class="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-2">
                <button class="badge badge-primary cursor-pointer">Todos</button>
                <button class="badge badge-secondary cursor-pointer">Grupales</button>
                <button class="badge badge-purple cursor-pointer">Individuales</button>
                <button class="badge badge-pink cursor-pointer">Activos</button>
            </div>

            <!-- Lista -->
            <div class="space-y-4">
                ${myChallenges.length > 0 ?
            myChallenges.map(challenge => renderChallengeCard(challenge, true)).join('') :
            `<div class="text-center py-10 opacity-50">
                        <span class="material-symbols-outlined text-4xl mb-2">emoji_events</span>
                        <p class="text-sm font-bold">No tienes desafíos activos</p>
                        <p class="text-xs">¡Crea uno nuevo para empezar!</p>
                     </div>`
        }
            </div>
        </div>
    `;
}

// Estado de filtros
let activeSportFilter = 'all';
let activeDistFilter = 'all';

// Componente: Lista Resultados
function renderFilteredResults() {
    // Si tuviéramos datos reales, aquí filtraríamos PUBLIC_CHALLENGES usando las vars activeSportFilter y activeDistFilter
    // Por ahora, como está vacío, solo mostramos el estado vacío.

    // Simulación de filtrado (para cuando haya datos):
    // const filtered = PUBLIC_CHALLENGES.filter(c => 
    //    (activeSportFilter === 'all' || c.category.toLowerCase() === activeSportFilter) &&
    //    (activeDistFilter === 'all' || c.metric.includes(activeDistFilter.replace('k', '')))
    // );

    const filtered = PUBLIC_CHALLENGES;

    return `
        <div class="space-y-4" id="resultsList">
             ${filtered.length > 0 ?
            filtered.map(challenge => renderChallengeCard(challenge, false)).join('') :
            `<div class="text-center py-12 opacity-50 animate-fade-in">
                    <span class="material-symbols-outlined text-4xl mb-3">search_off</span>
                    <p class="text-sm font-bold">No hay desafíos de ${activeSportFilter === 'all' ? 'este tipo' : activeSportFilter.toUpperCase()}</p>
                    <p class="text-xs">¡Sé el primero en crear uno!</p>
                 </div>`
        }
        </div>
    `;
}

// Handler Functions
window.toggleSportFilter = function (sport) {
    activeSportFilter = (activeSportFilter === sport) ? 'all' : sport;
    // Update UI
    const container = document.getElementById('exploreContent');
    if (container) container.innerHTML = renderExploreInner();
}

window.toggleDistFilter = function (dist) {
    activeDistFilter = (activeDistFilter === dist) ? 'all' : dist;
    // Update UI
    const container = document.getElementById('exploreContent');
    if (container) container.innerHTML = renderExploreInner();
}

// Render Inner Content Wrapper
function renderExploreTab() {
    return `<div id="exploreContent" class="animate-fade-in space-y-6">${ExploreModule.getTemplate()}</div>`;
}

function renderExploreInner() {
    return `
            <!-- 1. Filtro Deporte (Visual) -->
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Deporte</label>
                <div class="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    ${renderSportFilterIcon('run', 'Running', 'directions_run', activeSportFilter === 'run')}
                    ${renderSportFilterIcon('bike', 'Ciclismo', 'directions_bike', activeSportFilter === 'bike')}
                    ${renderSportFilterIcon('swim', 'Natación', 'pool', activeSportFilter === 'swim')}
                    ${renderSportFilterIcon('walk', 'Caminata', 'directions_walk', activeSportFilter === 'walk')}
                    ${renderSportFilterIcon('gym', 'Gimnasio', 'fitness_center', activeSportFilter === 'gym')}
                </div>
            </div>

            <!-- 2. Filtro Distancia (Chips) -->
            <div class="space-y-2">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Distancia</label>
                <div class="flex flex-wrap gap-2">
                    ${['5k', '10k', '20k', '50k', '100k'].map(km => `
                        <button onclick="toggleDistFilter('${km}')" class="px-3 py-1.5 rounded-lg border transition-all text-xs font-bold capitalize ${activeDistFilter === km ? 'bg-[#00f5d4] text-[#0f172a] border-[#00f5d4]' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}">
                            ${km}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="border-t border-white/5 my-2"></div>

            <!-- 3. Resultados -->
            ${renderFilteredResults()}
    `;
}

function renderSportFilterIcon(id, name, icon, active = false) {
    return `
        <div onclick="toggleSportFilter('${id}')" class="flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl border cursor-pointer transition-all ${active ? 'bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}">
            <span class="material-symbols-outlined text-xl mb-1">${icon}</span>
            <span class="text-[9px] font-bold uppercase">${name}</span>
        </div>
    `;
}


// ==========================================
// 2. COMPONENTE TARJETA (Modificado para acciones)
// ==========================================

function renderChallengeCard(challenge, isMine = true) {
    // Check ownership to enable live updates of creator name
    const currentUserName = AppState.currentUser.name || 'Usuario';
    const currentUserUsername = AppState.currentUser.username;

    // Is Owner Check (Try username match first, then name fallback)
    let isOwner = false;
    if (challenge.creator.username && currentUserUsername) {
        isOwner = challenge.creator.username === currentUserUsername;
    } else {
        isOwner = challenge.creator.name === currentUserName || challenge.creator.name === 'Usuario';
    }

    // Dynamic Creator Name (Live Update)
    let creatorName = challenge.creator.name;
    if (isOwner) {
        creatorName = currentUserName;
    }

    // Badge logic
    let badgeHtml = '';
    if (challenge.isPro) {
        badgeHtml = `<span class="absolute bottom-3 left-3 bg-[#00f5d4] text-[#0f172a] text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_10px_rgba(0,245,212,0.4)] uppercase tracking-widest flex items-center gap-1">Pro</span>`;
    }

    // Type Text
    let typeText = 'Personal';
    let typeIcon = 'person';
    if (challenge.type === 'group') {
        typeIcon = 'groups';
        typeText = 'Grupal';
    }

    // Render Controls
    let controlsHtml = '';
    if (isMine) {
        // ... (Menú existente)
        controlsHtml = `
            <div class="absolute top-3 right-3 flex items-center gap-2">
                <div class="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <span class="text-[9px] font-bold text-white uppercase tracking-wider">${creatorName}</span>
                    ${challenge.creator.isBrand ? '<span class="material-symbols-outlined text-[12px] text-[#00d2ff]" style="font-variation-settings: \'FILL\' 1">verified</span>' : ''}
                </div>
                <button class="size-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-20"
                        onclick="event.stopPropagation(); showChallengeMenu('${challenge.id}')">
                    <span class="material-symbols-outlined text-sm text-white">more_vert</span>
                </button>
            </div>
            
            <!-- Dropdown -->
            <div id="menu-${challenge.id}" class="hidden absolute top-10 right-3 w-40 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden animate-fade-in">
                <button onclick="event.stopPropagation(); editChallenge('${challenge.id}')" class="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2 border-b border-white/5">
                    <span class="material-symbols-outlined text-sm text-[#00f5d4]">edit</span>
                    Editar
                </button>
                ${isOwner ? `
                    <button onclick="event.stopPropagation(); deleteChallenge('${challenge.id}')" class="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">delete</span>
                        Eliminar
                    </button>
                ` : `
                    <button onclick="event.stopPropagation(); deleteChallenge('${challenge.id}')" class="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">logout</span>
                        Abandonar
                    </button>
                `}
            </div>
         `;
    } else {
        // Botón UNIRSE
        controlsHtml = `
            <div class="absolute top-3 right-3 flex items-center gap-2">
                 <div class="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                    <span class="text-[9px] font-bold text-white uppercase tracking-wider">${creatorName}</span>
                    ${challenge.creator.isBrand ? '<span class="material-symbols-outlined text-[12px] text-[#00d2ff]" style="font-variation-settings: \'FILL\' 1">verified</span>' : ''}
                </div>
                <!-- Join Button Action handled by parent click or specific logic -->
            </div>
         `;
    }

    return `
        <div class="glass-card rounded-3xl overflow-hidden cursor-pointer group hover:border-[#00f5d4]/50 transition-all duration-300 relative" onclick="showChallengeDetails('${challenge.id}')">
            <!-- Header Image -->
            <div class="h-32 w-full relative" style="background: ${challenge.imageGradient || 'linear-gradient(135deg, #00f5d4 0%, #00d2ff 100%)'}; background-size: cover; background-position: center;">
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

                ${badgeHtml}
                ${controlsHtml}
            </div>

            <!-- Body -->
            <div class="p-5 relative">
                <!-- Category & Type -->
                <div class="flex items-center justify-between mb-1.5">
                    <div class="text-[10px] font-bold text-[#00d2ff] uppercase tracking-widest">${challenge.category}</div>
                    <div class="flex items-center gap-1 text-[9px] text-white/50 font-bold uppercase tracking-wider">
                         <span class="material-symbols-outlined text-[10px]">${typeIcon}</span>
                         ${typeText}
                    </div>
                </div>
                
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
                        ${challenge.period}
                    </div>
                </div>

                <!-- Footer Action for Explore -->
                ${!isMine ? `
                    <button class="w-full py-2 bg-[#00f5d4]/10 border border-[#00f5d4]/30 rounded-xl text-[#00f5d4] text-xs font-bold uppercase tracking-widest hover:bg-[#00f5d4] hover:text-[#0f172a] transition-all" onclick="event.stopPropagation(); joinChallenge('${challenge.id}')">
                        Unirse al Reto
                    </button>
                ` : ''}

                <!-- Progress Bar (Only Mine) -->
                ${isMine && challenge.progress !== undefined ? `
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

// =======================
// 3. PÁGINA CREACIÓN / EDICIÓN
// =======================

const CHALLENGE_IMAGES = [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', // Gym
    'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&q=80', // Running track
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', // Walking / Hiking
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80', // Cycling/Yoga
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80', // Fitness
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&q=80'  // Exercise
];

import { getLocalISOString } from '../utils/dateHelper.js';

// Variable temporal para edición
let editingChallengeId = null;

export function renderCreateChallengePage(challengeIdToEdit = null) {
    const today = getLocalISOString();
    editingChallengeId = challengeIdToEdit;

    let initialData = {
        name: '', desc: '', image: CHALLENGE_IMAGES[0], sports: ['run'],
        unit: 'km', goal: '', start: today, end: '', type: 'personal', privacy: 'private',
        goalType: 'cumulative', dailyThreshold: '', targetDays: ''
    };

    if (editingChallengeId) {
        const challenge = AppState.challenges.find(c => c.id === editingChallengeId);
        if (challenge) {
            const [qty, unit] = challenge.metric.split(' ');

            // Compatibilidad: Si es un desafío viejo con category string, lo convertimos a array
            // Si es nuevo, ya tendrá array allowedSports O category será 'MIXED' y buscaremos en otro lado.
            // Para este MVP, asumimos que category puede ser una lista o un solo deporte.
            let loadedSports = [];
            if (challenge.allowedSports && Array.isArray(challenge.allowedSports)) {
                loadedSports = challenge.allowedSports;
            } else {
                loadedSports = [challenge.category.toLowerCase()];
            }

            // Detectar si es frecuencia
            let gType = challenge.goalType || 'cumulative';
            let tDays = '';
            let dThreshold = '';

            if (gType === 'frequency') {
                // metric: "10 days", dailyThreshold: 1, unit: 'km'
                tDays = challenge.metric.split(' ')[0]; // "10"
                dThreshold = challenge.dailyThreshold;
            }

            initialData = {
                name: challenge.name,
                desc: challenge.description,
                image: challenge.imageGradient.match(/url\(['"]?(.*?)['"]?\)/)[1],
                sports: loadedSports,
                unit: unit, // Unidad base (ej: km)
                goal: qty,  // Si es cumulative, es la meta. Si es frequency, ignorar (usar tDays)
                start: challenge.startDate.split('T')[0],
                end: challenge.endDate.split('T')[0],
                type: challenge.type,
                privacy: challenge.privacy,
                goalType: gType,
                dailyThreshold: dThreshold,
                targetDays: tDays
            };
        }
    }

    setTimeout(() => {
        if (editingChallengeId) {
            const safeSelect = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
            safeSelect('challengeName', initialData.name);
            safeSelect('challengeDesc', initialData.desc);
            safeSelect('challengeGoal', initialData.goal);
            safeSelect('startDate', initialData.start);
            safeSelect('endDate', initialData.end); // Fecha fin no se auto-rellenaba antes porque safeSelect estaba missing

            // window.selectSport(initialData.sport, ...); // Ya no se llama aqui manualmente, se hace via selector init
            const unitSelect = document.getElementById('challengeUnit');
            if (unitSelect) unitSelect.value = initialData.unit;

            window.selectImage(initialData.image, null);
            window.selectChallengeType(initialData.type, document.getElementById(initialData.type === 'personal' ? 'btnTypePersonal' : 'btnTypeGroup'));
            if (initialData.type === 'group') {
                window.selectPrivacy(initialData.privacy, document.getElementById(initialData.privacy === 'private' ? 'btnPrivPrivate' : 'btnPrivPublic'));
            }
            // Restaurar Tipo de Meta
            if (initialData.goalType) {
                window.setGoalType(initialData.goalType);
                if (initialData.goalType === 'frequency') {
                    safeSelect('challengeDays', initialData.targetDays);
                    safeSelect('challengeDailyMin', initialData.dailyThreshold);
                    const dailyUnit = document.getElementById('challengeDailyUnit');
                    if (dailyUnit) dailyUnit.value = initialData.unit;
                }
            }
            window.validateDates();
        }

        // Montar Sport Selector (Universal)
        // Montar Sport Selector (Universal - Modo Múltiple)
        mountSportSelector('create-challenge-sport-selector', {
            mode: 'multiple',
            initialSelection: initialData.sports,
            placeholder: 'Elige uno o más deportes (ej: Correr y Bici)...',
            maxSelections: 5,
            onSelect: (selectedSports) => {
                window.updateChallengeUnits(selectedSports);
            }
        });
    }, 100);

    return `
        <div class="glass-header sticky top-0 z-50 mb-6 bg-[#050b12]/80 backdrop-blur-xl border-b border-white/5">
            <div class="flex items-center justify-between py-4 px-4 max-w-2xl mx-auto w-full">
                <button class="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all hover:bg-white/10" onclick="navigateTo('challenges')">
                    <span class="material-symbols-outlined text-white">arrow_back</span>
                </button>
                <h1 class="text-lg font-bold uppercase tracking-widest text-white">${editingChallengeId ? 'Editar Desafío' : 'Nuevo Desafío'}</h1>
                <div class="size-10"></div>
            </div>
        </div>

        <div class="space-y-8 max-w-xl mx-auto pb-32 px-4">
             <!-- 1. Datos del Desafío + Portada -->
            <div class="space-y-4">
                <label class="section-label">1. Datos del Desafío</label>
                
                <!-- Nombre -->
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Nombre</label>
                    <input type="text" id="challengeName" placeholder="Ej: Maratón de Verano" class="input-field text-lg font-bold">
                </div>

                <!-- Descripción -->
                <div class="space-y-2">
                     <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Descripción</label>
                    <textarea id="challengeDesc" rows="2" placeholder="¿Cuál es el objetivo? (Ej: El primero en llegar gana...)" class="input-field text-sm"></textarea>
                </div>

                <!-- Portada -->
                <div class="space-y-2 mt-4">
                     <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Portada</label>
                    <!-- Preview Grande -->
                    <div id="imagePreview" class="w-full h-40 rounded-2xl bg-cover bg-center border border-white/10 shadow-lg relative transition-all group overflow-hidden" 
                        style="background-image: url('${CHALLENGE_IMAGES[0]}');">
                        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                        
                        <!-- Botón flotante subir -->
                        <label class="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-2 border border-white/10">
                            <span class="material-symbols-outlined text-[#00f5d4] text-xs">add_photo_alternate</span>
                            <span class="text-[9px] font-bold text-white uppercase tracking-wider">Cambiar Foto</span>
                            <input type="file" accept="image/*" class="hidden" onchange="handleImageUpload(this)">
                        </label>
                    </div>
                    <input type="hidden" id="selectedImage" value="${CHALLENGE_IMAGES[0]}">

                    <!-- Selector Grid (Miniaturas) -->
                    <div class="grid grid-cols-6 gap-2 mt-2">
                        ${CHALLENGE_IMAGES.map((img, i) => `
                            <div class="aspect-square rounded-lg bg-cover bg-center cursor-pointer border-2 ${i === 0 ? 'border-[#00f5d4]' : 'border-transparent'} hover:border-white transition-all opacity-80 hover:opacity-100"
                                style="background-image: url('${img}');"
                                onclick="selectImage('${img}', this)"></div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- 2. Deporte y Meta -->
            <div class="space-y-4">
                <label class="section-label">2. Elige tu Deporte y Meta</label>
                
                <!-- Selector Visual de Deportes -->
                <!-- Selector Universal de Deportes -->
                <div id="create-challenge-sport-selector" class="mb-4">
                    <div class="h-12 bg-white/5 rounded-xl animate-pulse"></div>
                </div>
                <!-- Input oculto para guardar array como JSON -->
                <input type="hidden" id="selectedSports" value='["run"]'>
                
                <!-- Feedback visual de Multideporte -->
                <div id="multiSportFeedback" class="hidden text-xs text-[#00f5d4] font-bold mb-4 bg-[#00f5d4]/10 p-3 rounded-lg border border-[#00f5d4]/20">
                    <span class="material-symbols-outlined text-sm align-bottom mr-1">layers</span>
                    Desafío Multideporte activado
                </div>

                <!-- Meta Configurador -->
                <!-- Tipo de Meta Toggle -->
                <div class="flex bg-white/5 p-1 rounded-xl mb-4">
                   <button id="btnGoalCumulative" onclick="setGoalType('cumulative')" class="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all text-[#00f5d4] bg-white/10 shadow">Acumular Total</button>
                   <button id="btnGoalFrequency" onclick="setGoalType('frequency')" class="flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all text-gray-500 hover:bg-white/5">Crear Hábito</button>
                </div>
                <input type="hidden" id="goalType" value="cumulative">

                <!-- Meta Configurador -->
                <div class="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
                    
                    <!-- BLOQUE ACUMULATIVO -->
                    <div id="goal-cumulative" class="grid grid-cols-2 gap-4 animate-fade-in">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-gray-500 uppercase">Unidad</label>
                            <select id="challengeUnit" class="input-field bg-[#0f172a]" onchange="updateGoalPlaceholder()">
                                <option value="km">Km</option>
                                <option value="hours">Horas</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-gray-500 uppercase">Meta Total</label>
                            <input type="number" id="challengeGoal" placeholder="00" class="input-field font-mono text-xl font-bold text-right text-[#00f5d4]">
                        </div>
                    </div>

                    <!-- BLOQUE FRECUENCIA (HÁBITO) -->
                    <div id="goal-frequency" class="hidden space-y-4 animate-fade-in">
                        <div class="space-y-2">
                            <label class="text-[10px] font-bold text-gray-500 uppercase">Días a Completar</label>
                            <div class="relative">
                                <input type="number" id="challengeDays" placeholder="Ej: 10" class="input-field font-mono text-xl font-bold text-right text-[#00f5d4]">
                                <span class="absolute left-3 top-3 text-xs font-bold text-gray-500 uppercase">Días</span>
                            </div>
                        </div>
                        
                        <div class="space-y-2 border-t border-white/5 pt-3">
                            <label class="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2">
                                <span class="material-symbols-outlined text-sm">check_circle</span>
                                Mínimo Diario para contar
                            </label>
                            <div class="grid grid-cols-2 gap-4">
                                <select id="challengeDailyUnit" class="input-field bg-[#0f172a]">
                                    <!-- Se llena igual que challengeUnit -->
                                </select>
                                <input type="number" id="challengeDailyMin" placeholder="Mínimo" class="input-field font-mono text-lg font-bold text-right text-white">
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- 3. Duración -->
            <div class="space-y-4">
                <label class="section-label">3. Duración</label>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] font-bold text-gray-500 uppercase">Fecha Inicio</label>
                        <input type="date" id="startDate" class="input-field" min="${today}" value="${today}" onchange="validateDates()">
                    </div>
                    <div class="space-y-2">
                         <label class="text-[10px] font-bold text-gray-500 uppercase">Fecha Fin</label>
                        <input type="date" id="endDate" class="input-field" min="${today}" onchange="validateDates()">
                    </div>
                </div>
                <!-- Feedback Duración -->
                 <div class="flex justify-end mt-1">
                    <span id="durationFeedback" class="text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 px-2 py-1 rounded">-- Días</span>
                 </div>
            </div>
            
            <!-- 4. Tipo de Desafío (Personal/Grupal) -->
            <div class="space-y-4">
                <label class="section-label">4. Tipo de Desafío</label>
                <div class="grid grid-cols-2 gap-4">
                    <!-- Personal -->
                    <div class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4]"
                         onclick="selectChallengeType('personal', this)" id="btnTypePersonal">
                        <span class="material-symbols-outlined text-2xl">person</span>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase">Personal</span>
                            <span class="text-[9px] opacity-70">Privado</span>
                        </div>
                    </div>
                    <!-- Grupal -->
                    <div class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                         onclick="selectChallengeType('group', this)" id="btnTypeGroup">
                        <span class="material-symbols-outlined text-2xl">groups</span>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase">Grupal</span>
                            <span class="text-[9px] opacity-70">Social</span>
                        </div>
                    </div>
                </div>
                <input type="hidden" id="challengeType" value="personal">

                <!-- Opciones de Privacidad (Solo Grupal) -->
                <div id="privacyOptions" class="hidden animate-fade-in mt-2 ml-1 border-l-2 border-white/10 pl-4">
                    <label class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Visibilidad del Grupo</label>
                    <div class="flex gap-3">
                        <button class="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white text-xs font-bold transition-all"
                             onclick="selectPrivacy('private', this)" id="btnPrivPrivate">
                            <span class="material-symbols-outlined text-sm">lock</span>
                            Privado
                        </button>
                        <button class="flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent text-gray-500 text-xs font-bold hover:bg-white/5 transition-all"
                             onclick="selectPrivacy('public', this)" id="btnPrivPublic">
                            <span class="material-symbols-outlined text-sm">public</span>
                            Público
                        </button>
                    </div>
                </div>
                <input type="hidden" id="challengePrivacy" value="private">
            </div>

            <!-- Botón Crear / Guardar -->
            <button class="cta-button mt-8" onclick="handleCreateChallenge()">
                <span class="material-symbols-outlined text-xl">${editingChallengeId ? 'save' : 'rocket_launch'}</span>
                ${editingChallengeId ? 'Guardar Cambios' : 'Crear Desafío'}
            </button>
        </div>

        <style>
            /* Force dark scheme */
            .input-field { color-scheme: dark; }
            .input-field option { background-color: #0f172a; color: white; }
            .section-label { font-size: 0.75rem; font-weight: 900; color: #00f5d4; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 0.8rem; border-left: 3px solid #00f5d4; padding-left: 8px; }
            .input-field { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.75rem; padding: 0.75rem 1rem; color: white; outline: none; transition: all 0.2s; }
            .input-field:focus { border-color: #00f5d4; background: rgba(255,255,255,0.1); }
            .cta-button { width: 100%; height: 56px; background: linear-gradient(135deg, #00f5d4 0%, #00d2ff 100%); color: #020617; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; border-radius: 1rem; box-shadow: 0 0 25px rgba(0,245,212,0.3); display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: all 0.2s; }
            .cta-button:active { transform: scale(0.98); }
        </style>
    `;
}


function renderSportOption(id, name, icon, isSelected = false) {
    return `
        <div class="flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4]' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'}"
             onclick="selectSport('${id}', this)" data-sport-id="${id}">
            <span class="material-symbols-outlined text-2xl mb-1">${icon}</span>
            <span class="text-[10px] font-bold uppercase">${name}</span>
        </div>
    `;
}

// =======================
// HELPERS DEL FORMULARIO
// =======================

window.selectChallengeType = function (type, el) {
    document.getElementById('challengeType').value = type;
    const personalBtn = document.getElementById('btnTypePersonal');
    const groupBtn = document.getElementById('btnTypeGroup');
    const privacyOptions = document.getElementById('privacyOptions');
    const inactiveClass = "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all bg-white/5 border-white/5 text-gray-400 hover:bg-white/10";
    const activeClass = "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4]";

    if (type === 'personal') {
        personalBtn.className = activeClass;
        groupBtn.className = inactiveClass;
        privacyOptions.classList.add('hidden');
    } else {
        groupBtn.className = activeClass;
        personalBtn.className = inactiveClass;
        privacyOptions.classList.remove('hidden');
    }
};

window.selectPrivacy = function (privacy, el) {
    document.getElementById('challengePrivacy').value = privacy;
    const privBtn = document.getElementById('btnPrivPrivate');
    const pubBtn = document.getElementById('btnPrivPublic');
    const activeClass = "flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/10 text-white text-xs font-bold transition-all shadow-inner";
    const inactiveClass = "flex items-center gap-2 px-3 py-2 rounded-lg border border-transparent text-gray-500 text-xs font-bold hover:bg-white/5 transition-all opacity-60";

    if (privacy === 'private') {
        privBtn.className = activeClass;
        pubBtn.className = inactiveClass;
    } else {
        pubBtn.className = activeClass;
        privBtn.className = inactiveClass;
    }
};

window.setGoalType = function (type) {
    document.getElementById('goalType').value = type;
    const btnCum = document.getElementById('btnGoalCumulative');
    const btnFreq = document.getElementById('btnGoalFrequency');
    const divCum = document.getElementById('goal-cumulative');
    const divFreq = document.getElementById('goal-frequency');

    const activeClass = "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all text-[#00f5d4] bg-white/10 shadow";
    const inactiveClass = "flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all text-gray-500 hover:bg-white/5";

    if (type === 'cumulative') {
        btnCum.className = activeClass;
        btnFreq.className = inactiveClass;
        divCum.classList.remove('hidden');
        divFreq.classList.add('hidden');
    } else {
        btnFreq.className = activeClass;
        btnCum.className = inactiveClass;
        divFreq.classList.remove('hidden');
        divCum.classList.add('hidden');
    }
};

window.updateChallengeUnits = function (selectedSports) {
    // Guardar selección
    document.getElementById('selectedSports').value = JSON.stringify(selectedSports);

    // Feedback UI
    const feedback = document.getElementById('multiSportFeedback');
    if (feedback) feedback.classList.toggle('hidden', selectedSports.length <= 1);

    const unitSelect = document.getElementById('challengeUnit');
    if (!unitSelect) return;

    // Guardar unidad actual
    const currentUnit = unitSelect.value;
    unitSelect.innerHTML = '';

    if (selectedSports.length === 0) {
        unitSelect.add(new Option('Selecciona deporte', ''));
        return;
    }

    // Definición de capacidades 
    const DISTANCE_SPORTS = [
        'running', 'cycling', 'swimming', 'walking', 'hiking', 'rowing',
        'skiing', 'snowboarding', 'skating', 'wheelchair',
        'run', 'bike', 'swim', 'walk', 'kayaking', 'canoeing'
    ];

    const STEPS_SPORTS = ['walking', 'running', 'hiking', 'walk', 'run'];

    // Lógica de Intersección
    let supportsDistance = true;
    let supportsSteps = true;

    selectedSports.forEach(sport => {
        if (!DISTANCE_SPORTS.includes(sport) && !sport.includes('running') && !sport.includes('biking')) {
            supportsDistance = false;
        }
        if (!STEPS_SPORTS.includes(sport)) {
            supportsSteps = false;
        }
    });

    const options = [];

    if (supportsDistance) {
        options.push({ val: 'km', text: 'Kilómetros' });
        options.push({ val: 'meters', text: 'Metros' });
    }

    options.push({ val: 'hours', text: 'Horas' });
    options.push({ val: 'minutes', text: 'Minutos' });
    options.push({ val: 'calories', text: 'Calorías' });

    if (supportsSteps) {
        options.push({ val: 'steps', text: 'Pasos' });
    }

    options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.val;
        o.text = opt.text;
        unitSelect.add(o);
    });

    // Restaurar selección
    const exists = options.some(o => o.val === currentUnit);
    if (exists) {
        unitSelect.value = currentUnit;
    } else if (options.length > 0) {
        unitSelect.value = options[0].val;
    }

    // CLONAR A DAILY UNIT (Para modo Frecuencia)
    const dailyUnitSelect = document.getElementById('challengeDailyUnit');
    if (dailyUnitSelect) {
        const currentDaily = dailyUnitSelect.value;
        dailyUnitSelect.innerHTML = '';
        // Clona las opciones
        Array.from(unitSelect.options).forEach(opt => {
            dailyUnitSelect.add(new Option(opt.text, opt.value));
        });
        // Restaurar
        if (options.some(o => o.val === currentDaily)) {
            dailyUnitSelect.value = currentDaily;
        } else if (options.length > 0) {
            dailyUnitSelect.value = options[0].val;
        }
    }

    if (window.updateGoalPlaceholder) window.updateGoalPlaceholder();
};

window.selectSport = function (sportId) {
    window.updateChallengeUnits([sportId]);
};

window.selectImage = function (url, el) {
    document.getElementById('selectedImage').value = url;
    document.getElementById('imagePreview').style.backgroundImage = `url('${url}')`;
    const grid = document.querySelector('.grid.grid-cols-6');
    if (grid) grid.querySelectorAll('div').forEach(d => d.style.borderColor = 'transparent');
    if (el) el.style.borderColor = '#00f5d4';
};

window.handleImageUpload = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) { window.selectImage(e.target.result, null); window.showToast('Imagen cargada'); };
        reader.readAsDataURL(input.files[0]);
    }
};

window.validateDates = function () {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const feedback = document.getElementById('durationFeedback');

    if (start && end) {
        if (new Date(end) < new Date(start)) {
            feedback.innerText = "Error fechas";
            feedback.className = "text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded";
            return false;
        }
        const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
        feedback.innerText = `Duración: ${diff} días`;
        feedback.className = "text-[10px] font-bold text-[#00f5d4] uppercase tracking-widest bg-[#00f5d4]/10 px-2 py-1 rounded";
        return true;
    }
    return false;
};

// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, increment } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

window.updateGoalPlaceholder = function () { };

window.handleCreateChallenge = async function () {
    const btn = event.target.closest('button'); // Get button for Loading State check
    if (btn && btn.disabled) return;

    const type = document.getElementById('challengeType').value;
    const privacy = document.getElementById('challengePrivacy').value;

    // Obtener array de deportes
    let sports = [];
    try {
        sports = JSON.parse(document.getElementById('selectedSports').value);
    } catch (e) {
        sports = ['run']; // fallback
    }

    const name = document.getElementById('challengeName').value;
    const goal = document.getElementById('challengeGoal').value;
    const unit = document.getElementById('challengeUnit').value;
    const desc = document.getElementById('challengeDesc').value;
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;
    const image = document.getElementById('selectedImage').value;

    if (!name || !start || !end || sports.length === 0) { window.showToast('Por favor completa todos los campos requeridos', 'error'); return; }
    if (new Date(end) < new Date(start)) { window.showToast('Fechas inválidas', 'error'); return; }

    const goalType = document.getElementById('goalType').value; // 'cumulative' | 'frequency'
    let finalMetric = '';
    let finalUnit = '';
    let dailyThresholdVal = 0;

    if (goalType === 'cumulative') {
        const goal = document.getElementById('challengeGoal').value;
        const unit = document.getElementById('challengeUnit').value;

        // Validación Cumulative
        const goalNumber = parseFloat(goal);
        if (isNaN(goalNumber) || goalNumber <= 0 || !goal) { window.showToast('Meta total inválida', 'error'); return; }

        finalMetric = `${goal} ${unit}`;
        finalUnit = unit;

    } else {
        // FREQUENCY
        const days = document.getElementById('challengeDays').value;
        const dailyMin = document.getElementById('challengeDailyMin').value;
        const dailyUnit = document.getElementById('challengeDailyUnit').value;

        // Validación Frequency
        const daysNum = parseInt(days);
        const dailyMinNum = parseFloat(dailyMin);

        if (isNaN(daysNum) || daysNum <= 0) { window.showToast('Número de días inválido', 'error'); return; }
        if (isNaN(dailyMinNum) || dailyMinNum <= 0) { window.showToast('Mínimo diario inválido', 'error'); return; }

        // Verificar que los días no superen duración
        const startD = new Date(start);
        const endD = new Date(end);
        const diffDays = Math.ceil((endD - startD) / (1000 * 60 * 60 * 24)) + 1;

        if (daysNum > diffDays) {
            window.showToast(`La meta (${daysNum} días) no puede ser mayor a la duración (${diffDays} días)`, 'error');
            return;
        }

        finalMetric = `${days} days`; // La meta visible principal son LOS DÍAS
        finalUnit = dailyUnit;       // La unidad de esfuerzo
        dailyThresholdVal = dailyMinNum;
    }

    const options = { month: 'short', day: 'numeric' };
    const periodText = `${new Date(start).toLocaleDateString('es-ES', options)} - ${new Date(end).toLocaleDateString('es-ES', options)}`;

    // Definir categoría principal
    // Si es 1 -> el nombre del deporte (ej: RUNNING)
    // Si son mas -> 'MULTISPORT'
    const mainCategory = sports.length === 1 ? sports[0].toUpperCase() : 'MULTISPORT';

    // Generar descripción por defecto inteligente
    let defaultDesc = `Desafío de ${sports.length > 1 ? 'Múltiples Deportes' : mainCategory} para romper tus límites.`;
    if (sports.length > 1 && sports.length <= 3) {
        // Ej: Desafío de Running, Cycling y Swimming...
        defaultDesc = `Desafío de ${sports.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')} para romper tus límites.`;
    }

    const challengeData = {
        name: name,
        description: desc || defaultDesc,
        category: mainCategory,
        allowedSports: sports,
        metric: finalMetric,
        unit: finalUnit, // Guardamos la unidad base explícitamente
        goalType: goalType,
        dailyThreshold: dailyThresholdVal,
        period: periodText,
        imageGradient: `url('${image}') center/cover no-repeat`,
        type: type,
        privacy: type === 'group' ? privacy : 'private',
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),
        updatedAt: Date.now()
    };

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-xl">progress_activity</span> Guardando...';
    }

    // Intentar obtener geolocalización (No bloqueante, timeout corto)
    let userGeo = null;
    try {
        const getGeo = () => new Promise((resolve, reject) => {
            if (!navigator.geolocation) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => resolve(null), // Si falla o rechaza, seguimos sin geo (no bloqueamos)
                { timeout: 3000 } // Máximo 3s de espera
            );
        });
        userGeo = await getGeo();
    } catch (e) {
        console.warn("No se pudo obtener geo location", e);
    }

    // Añadir Geo al objeto
    if (userGeo) {
        challengeData.location = userGeo;
    }

    try {
        if (editingChallengeId) {
            // EDITAR CLOUD
            const challengeRef = doc(db, "challenges", editingChallengeId);
            await updateDoc(challengeRef, challengeData);

            // Actualizar Local
            const index = AppState.challenges.findIndex(c => c.id === editingChallengeId);
            if (index !== -1) {
                AppState.challenges[index] = { ...AppState.challenges[index], ...challengeData };
            }
            window.showToast('Desafío Actualizado');
        } else {
            // CREAR CLOUD
            const newChallenge = {
                participants: 1,
                progress: 0,
                creator: { name: AppState.currentUser.name || 'Tú', isBrand: false },
                createdAt: Date.now(),
                ...challengeData
            };

            const docRef = await addDoc(collection(db, "challenges"), newChallenge);

            // Actualizar Local
            newChallenge.id = docRef.id;
            AppState.challenges.unshift(newChallenge);
            window.showToast('¡Desafío Creado!');
        }

        if (window.saveUserData) window.saveUserData(); // Backup LocalStorage
        navigateTo('challenges');

    } catch (e) {
        console.error("Error saving challenge:", e);
        window.showToast('Error de conexión. Intenta de nuevo.', 'error');
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<span class="material-symbols-outlined text-xl">error</span> Reintentar';
        }
    }
};


// HELPERS ACCIONES DESAFÍO
window.showChallengeMenu = function (id) {
    document.querySelectorAll('[id^="menu-"]').forEach(el => {
        if (el.id !== `menu-${id}`) el.classList.add('hidden');
    });
    const menu = document.getElementById(`menu-${id}`);
    if (menu) menu.classList.toggle('hidden');

    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.classList.add('hidden');
                document.removeEventListener('click', closeMenu);
            }
        }, { once: true });
    }, 0);
};

window.deleteChallenge = async function (id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este desafío?')) return;

    try {
        await deleteDoc(doc(db, "challenges", id));

        AppState.challenges = AppState.challenges.filter(c => c.id !== id);
        if (window.saveUserData) window.saveUserData();

        window.showToast('Desafío eliminado');
        navigateTo('challenges');
    } catch (e) {
        console.error("Error deleting challenge:", e);
        window.showToast('Error al eliminar', 'error');
    }
};

window.showChallengeDetails = function (id) {
    if (!id) return;
    const challenge = AppState.challenges.find(c => c.id === id);
    if (challenge) {
        AppState.activeChallengeId = id;
        // Persistir inmediatamente el ID del desafío activo
        localStorage.setItem('active_challenge_id', id);
        navigateTo('challenge-detail');
    } else {
        // Fallback for explore/mock challenges
        AppState.activeChallengeId = id;
        localStorage.setItem('active_challenge_id', id);
        navigateTo('challenge-detail');
    }
};



window.joinChallenge = async function (id) {
    if (!id) return;
    if (!confirm('¿Quieres unirte a este desafío?')) return;

    try {
        const challengeRef = doc(db, "challenges", id);

        await updateDoc(challengeRef, {
            participantsList: arrayUnion(AppState.currentUser.id),
            participants: increment(1)
        });

        // Optimistic UI Update
        const challenge = AppState.challenges.find(c => c.id === id);
        if (challenge) {
            challenge.participants = (challenge.participants || 0) + 1;
            if (!challenge.participantsList) challenge.participantsList = [];
            challenge.participantsList.push(AppState.currentUser.id);
        }

        window.showToast('¡Te has unido al reto!');
        // Refresh to affect tabs
        navigateTo('challenges');

    } catch (e) {
        console.error("Error joining challenge:", e);
        window.showToast('Error al unirse', 'error');
    }
};

window.editChallenge = function (id) {
    navigateTo('create-challenge', id);
};
// Navegación
export function showCreateChallengeModal() {
    navigateTo('create-challenge');
}

// Export renderChallengeCard explicitly if needed, but renderChallenges is already exported.
export { renderChallengeCard };
