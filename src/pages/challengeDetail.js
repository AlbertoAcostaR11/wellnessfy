import { AppState } from '../utils/state.js';
import { navigateTo } from '../router.js';
// Challenge Options Menu
window.showChallengeOptions = function (id) {
    const menu = document.getElementById(`challenge-options-menu`);
    if (menu) {
        menu.classList.toggle('hidden');
    }
};

function searchFriendsForChallenge(val) { console.log('Search:', val); }

// Share Challenge Function
window.shareChallenge = function (challengeId) {
    const challenge = AppState.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const shareText = `¡Únete a mi desafío "${challenge.name}" en Wellnessfy! 🚀\n\nMeta: ${challenge.metric}\nPeriodo: ${challenge.period}\nFinaliza: ${new Date(challenge.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}\n\n¡Vamos juntos! 💪`;

    if (navigator.share) {
        navigator.share({
            title: `Desafío: ${challenge.name}`,
            text: shareText,
            url: window.location.href
        }).then(() => {
            window.showToast('¡Desafío compartido exitosamente!');
        }).catch((error) => {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                fallbackCopyToClipboard(shareText);
            }
        });
    } else {
        fallbackCopyToClipboard(shareText);
    }
};

function fallbackCopyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            window.showToast('Enlace copiado al portapapeles');
        }).catch(() => {
            window.showToast('No se pudo copiar el enlace', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            window.showToast('Enlace copiado al portapapeles');
        } catch (err) {
            window.showToast('No se pudo copiar el enlace', 'error');
        }
        document.body.removeChild(textArea);
    }
}

function renderChallengeDetailPage() {
    // Buscar el desafío activo
    const challenge = AppState.challenges.find(c => c.id === AppState.activeChallengeId);

    // Si no se encuentra, mostrar mensaje de error con opción de volver
    if (!challenge) {
        return `
            <div class="flex flex-col items-center justify-center h-screen p-8 text-center">
                <span class="material-symbols-outlined text-6xl text-white/20 mb-4">search_off</span>
                <h2 class="text-xl font-bold text-white mb-2">Desafío no encontrado</h2>
                <p class="text-sm text-white/60 mb-6">El desafío que buscas no existe o fue eliminado.</p>
                <button class="px-6 py-3 bg-gradient-to-r from-[#00f5d4] to-[#00b8ff] rounded-xl text-[#0f172a] font-bold uppercase tracking-wider active:scale-95 transition-all" 
                        onclick="navigateTo('challenges')">
                    Volver a Desafíos
                </button>
            </div>
        `;
    }


    // Calcular valores absolutos para mostrar progreso
    const [goalValue, unit] = challenge.metric.split(' ');
    const goalNumber = parseFloat(goalValue);
    const currentValue = ((challenge.progress || 0) / 100) * goalNumber;
    const progressCapped = Math.min(100, challenge.progress || 0);

    return `
        <div class="glass-header sticky top-0 z-50">
            <div class="flex items-center justify-between p-4">
                <button class="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 active:scale-90 transition-all hover:bg-white/10" onclick="navigateTo('challenges')">
                    <span class="material-symbols-outlined text-white">arrow_back_ios_new</span>
                </button>
                <h1 class="text-sm font-bold uppercase tracking-[0.2em] text-white">Detalles del Desafío</h1>
                <div class="relative">
                    <button class="size-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10" onclick="showChallengeOptions('${challenge.id}')">
                        <span class="material-symbols-outlined text-white">more_horiz</span>
                    </button>
                    <!-- Options Menu -->
                    <div id="challenge-options-menu" class="hidden absolute top-12 right-0 w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                        <button onclick="event.stopPropagation(); editChallenge('${challenge.id}'); document.getElementById('challenge-options-menu').classList.add('hidden');" class="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2 border-b border-white/5">
                            <span class="material-symbols-outlined text-sm text-[#00f5d4]">edit</span>
                            Editar Desafío
                        </button>
                        <button onclick="event.stopPropagation(); deleteChallenge('${challenge.id}'); document.getElementById('challenge-options-menu').classList.add('hidden');" class="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">delete</span>
                            Eliminar Desafío
                        </button>
                    </div>
                </div>
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
                            <p class="text-xl font-bold ${progressCapped >= 100 ? 'text-[#00f5d4]' : 'text-white'}">
                                ${currentValue.toFixed(1)} <span class="text-gray-500 text-sm font-medium">/ ${goalValue} ${unit}</span>
                            </p>
                        </div>
                        <div class="text-right">
                            <p class="${progressCapped >= 100 ? 'text-[#00f5d4]' : 'text-white'} font-black text-2xl">${progressCapped}%</p>
                            ${progressCapped >= 100 ? '<p class="text-[#00f5d4] text-[10px] font-bold uppercase tracking-wider">¡Completado!</p>' : ''}
                        </div>
                    </div>
                    <div class="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full ${progressCapped >= 100 ? 'bg-gradient-to-r from-[#00f5d4] to-[#00ff9d]' : 'bg-gradient-to-r from-[#00f5d4] to-[#00b8ff]'} shadow-[0_0_10px_rgba(0,245,212,0.5)]" style="width: ${progressCapped}%"></div>
                    </div>
                    ${progressCapped >= 100 ? '<p class="text-xs text-[#00f5d4]/60 mt-2 text-center">🎉 ¡Has superado tu meta!</p>' : ''}
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

                    <!-- Participants Info (Dynamic) -->
                    ${challenge.participants > 1 ? `
                    <div class="flex items-center gap-2 mb-6 overflow-x-auto pb-2" style="scrollbar-width: none;">
                        <div class="flex -space-x-3 mr-4 pl-2">
                             <div class="size-10 rounded-full border-2 border-[#050b12] bg-gray-700 flex items-center justify-center text-xs text-white bg-cover bg-center" style="background-image: url('${AppState.currentUser.avatar}')"></div>
                             <div class="size-10 rounded-full border-2 border-[#050b12] bg-[#0f172a] flex items-center justify-center text-[10px] font-bold text-white">+${challenge.participants - 1}</div>
                        </div>
                        <button class="whitespace-nowrap bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all text-white hover:bg-white/10" onclick="showToast('Enlace de invitación copiado')">Invitar más amigos</button>
                    </div>
                    ` : `
                    <div class="mb-6">
                        <button class="w-full bg-white/5 border border-white/10 py-3 rounded-xl text-xs font-bold active:scale-95 transition-all text-white hover:bg-white/10 flex items-center justify-center gap-2" onclick="showToast('Enlace de invitación copiado')">
                            <span class="material-symbols-outlined text-sm">person_add</span>
                            Invitar amigos a este desafío
                        </button>
                    </div>
                    `}

                    <!-- Leaderboard Table -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between px-1 mb-2">
                            <p class="text-[10px] font-black text-[#00f5d4] uppercase tracking-widest">Ranking Top</p>
                            <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Puntaje</p>
                        </div>
                        
                        <!-- Rank 1 (You) -->
                        <div class="leaderboard-row flex items-center justify-between p-3 rounded-2xl border border-[#00f5d4]/50 bg-[#00f5d4]/10 shadow-[0_0_15px_rgba(0,245,212,0.1)]">
                            <div class="flex items-center gap-4">
                                <span class="text-sm font-black text-white w-4 text-center">1</span>
                                <div class="size-12 rounded-xl border border-white/10 bg-cover bg-center" style="background-image: url('${AppState.currentUser.avatar}')"></div>
                                <div>
                                    <p class="text-sm font-bold text-white">Tú</p>
                                    <div class="flex items-center gap-1 text-[10px] text-green-400 font-bold">
                                        <span class="material-symbols-outlined text-[12px]">trending_up</span>
                                        <span>En el reto</span>
                                    </div>
                                </div>
                            </div>
                            <p class="text-sm font-black text-gray-300">${challenge.progress || 0}%</p>
                        </div>

                        ${challenge.participants > 1 ? `
                        <div class="py-4 text-center opacity-40">
                            <p class="text-[10px] font-bold uppercase tracking-widest">Otros participantes se unirán pronto</p>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>

        <!-- Sticky Footer Action -->
        <div class="fixed bottom-0 left-0 right-0 p-4 bg-[#050b12]/80 backdrop-blur-xl border-t border-white/5 z-50 md:ml-64">
            <div class="max-w-2xl mx-auto">
                <div class="flex items-center gap-4">
                    <button class="flex-[1] h-14 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center active:scale-95 transition-all text-gray-400 hover:text-white hover:bg-white/10" onclick="shareChallenge('${challenge.id}')">
                        <span class="material-symbols-outlined">share</span>
                        <span class="text-[9px] font-bold uppercase tracking-widest">Share</span>
                    </button>
                    <button class="flex-[3] h-14 bg-gradient-to-r from-[#00f5d4] to-[#00b8ff] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all text-[#0f172a] hover:brightness-110" 
                            onclick="openRegisterActivityModal('${challenge.id}')">
                        <span class="material-symbols-outlined font-black">add_circle</span>
                        <span class="font-black uppercase tracking-widest text-sm">Registrar Actividad</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}


// ==========================================
// REGISTRO DE ACTIVIDAD (MODAL & LOGIC)
// ==========================================

window.openRegisterActivityModal = function (challengeId) {
    const challenge = AppState.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    const [goalQty, unit] = challenge.metric.split(' ');

    const existingModal = document.getElementById('register-activity-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'register-activity-modal';
    modal.className = 'fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-0 sm:p-4';
    modal.innerHTML = `
        <div class="bg-[#0b121f] w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl border-t sm:border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-5 border-b border-white/5">
                <button class="size-8 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors" onclick="this.closest('#register-activity-modal').remove()">
                    <span class="material-symbols-outlined text-white/40 text-sm">close</span>
                </button>
                <h3 class="font-black text-white text-[10px] uppercase tracking-[0.2em]">Registrar Avance</h3>
                <div class="size-8"></div>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6 overflow-y-auto">
                <div class="text-center">
                    <p class="text-xs font-bold text-[#00f5d4] uppercase tracking-widest mb-1">${challenge.name}</p>
                    <p class="text-white/40 text-[9px] uppercase font-medium">Unidad de medida: ${unit}</p>
                </div>

                <!-- Input Cantidad -->
                <div class="bg-white/5 rounded-2xl p-5 border border-white/5 focus-within:border-[#00f5d4]/50 transition-all">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest block mb-4 text-center">¿Cuánto has avanzado hoy?</label>
                    <div class="flex items-center justify-center gap-3">
                        <input type="number" id="regAmount" placeholder="0.0" step="0.1"
                               class="bg-transparent text-4xl font-black text-white text-center w-32 focus:outline-none placeholder-white/10">
                        <span class="text-xl font-bold text-[#00f5d4]">${unit}</span>
                    </div>
                </div>

                <!-- Sincronizar con Actividad Diaria -->
                <div class="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                    <input type="checkbox" id="syncWithActivity" checked class="size-5 rounded border-white/10 bg-transparent text-[#00f5d4] focus:ring-0">
                    <div class="flex-1">
                        <p class="text-xs font-bold text-white uppercase tracking-wider">Sumar a mi Actividad</p>
                        <p class="text-[9px] text-white/40">Se verá reflejado en tus anillos de progreso de hoy.</p>
                    </div>
                    <span class="material-symbols-outlined text-white/20">sync_alt</span>
                </div>

                <!-- Foto y Comentario -->
                <div class="space-y-4">
                    <div id="regImagePreview" class="hidden w-full h-48 rounded-2xl bg-cover bg-center border border-white/10 relative">
                        <button class="absolute top-2 right-2 size-6 bg-black/60 rounded-full flex items-center justify-center" onclick="removeRegImage()">
                            <span class="material-symbols-outlined text-xs text-white">close</span>
                        </button>
                    </div>

                    <div class="flex gap-4">
                        <label class="flex-shrink-0 size-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all">
                            <span class="material-symbols-outlined text-[#00f5d4]">add_a_photo</span>
                            <input type="file" accept="image/*" class="hidden" onchange="handleRegImage(this)">
                        </label>
                        <textarea id="regComment" placeholder="Añade un comentario (opcional)..." 
                                  class="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 text-sm text-white focus:outline-none focus:border-white/20 resize-none h-12"></textarea>
                    </div>
                </div>
            </div>

            <!-- Footer Action -->
            <div class="p-6 bg-black/20">
                <button class="w-full h-14 bg-gradient-to-r from-[#00f5d4] to-[#00d2ff] rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-[#00f5d4]/20 active:scale-95 transition-all text-[#0f172a] font-black uppercase tracking-widest text-sm"
                        onclick="submitActivityRegistration('${challengeId}')" id="btnSubmitReg">
                    Confirmar Registro
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
};

let currentRegImage = null;

window.handleRegImage = function (input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            currentRegImage = e.target.result;
            const preview = document.getElementById('regImagePreview');
            preview.style.backgroundImage = `url('${currentRegImage}')`;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.removeRegImage = function () {
    currentRegImage = null;
    document.getElementById('regImagePreview').classList.add('hidden');
};

window.submitActivityRegistration = async function (challengeId) {
    const amount = parseFloat(document.getElementById('regAmount').value);
    const comment = document.getElementById('regComment').value;
    const syncWithActivity = document.getElementById('syncWithActivity').checked;
    const btn = document.getElementById('btnSubmitReg');

    if (isNaN(amount) || amount <= 0) {
        window.showToast('Por favor introduce una cantidad válida', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';

    try {
        const challenge = AppState.challenges.find(c => c.id === challengeId);
        const [goalQty, unit] = challenge.metric.split(' ');

        // 1. Calcular nuevo progreso del Reto
        const currentProgressValue = (challenge.progress || 0) / 100 * parseFloat(goalQty);
        const newTotal = currentProgressValue + amount;
        const newPercent = Math.min(100, Math.round((newTotal / parseFloat(goalQty)) * 100));

        // 2. Actualizar Reto en Firestore/Local
        const { getFirestore, doc, updateDoc, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        await updateDoc(doc(db, "challenges", challengeId), {
            progress: newPercent,
            updatedAt: Date.now()
        });
        challenge.progress = newPercent;

        // 3. (OPCIONAL) Sumar a Actividad Diaria
        if (syncWithActivity) {
            const sportMapping = {
                'run': 'running',
                'bike': 'cycling',
                'walk': 'walking',
                'gym': 'strength_training',
                'yoga': 'yoga',
                'swim': 'swimming'
            };

            const sportKey = sportMapping[challenge.category.toLowerCase()] || 'other';
            const now = new Date();

            // Estimar duración (ej. 10km run -> ~60 min si no se especifica)
            // Para ser simple, usaremos el valor de 'amount' si son horas, o estimaremos si son km
            let duration = amount;
            if (unit.toLowerCase() === 'km') {
                duration = amount * 10; // Estimación burda: 10 min por km
            }

            const manualActivity = {
                id: 'manual_' + Date.now(),
                sportKey: sportKey,
                name: `Desafío: ${challenge.name}`,
                startTime: now.toISOString(),
                endTime: new Date(now.getTime() + duration * 60000).toISOString(),
                duration: duration,
                distance: unit.toLowerCase() === 'km' ? amount : 0,
                calories: amount * 50, // Estimación
                steps: unit.toLowerCase() === 'km' ? amount * 1250 : 0,
                source: 'manual_challenge',
                date: now.toISOString().split('T')[0]
            };

            AppState.activities.push(manualActivity);

            // Actualizar rings diarios también
            if (!AppState.todayStats) AppState.todayStats = { steps: 0, calories: 0, activeMinutes: 0 };
            if (unit.toLowerCase() === 'km') {
                AppState.todayStats.steps = (AppState.todayStats.steps || 0) + manualActivity.steps;
            }
            AppState.todayStats.calories = (AppState.todayStats.calories || 0) + manualActivity.calories;

            // Guardar en persistencia local
            const { saveUserData } = await import('../utils/state.js');
            saveUserData();
        }

        // 4. Crear Post en el Feed
        const postContent = `¡He registrado ${amount} ${unit} en el desafío "${challenge.name}"! 🚀\n\n${comment}`;

        const newPost = {
            author: {
                name: AppState.currentUser.name || 'Usuario',
                username: '@' + (AppState.currentUser.username || 'usuario').replace('@', ''),
                avatar: AppState.currentUser.avatar
            },
            timestamp: Date.now(),
            content: postContent,
            media: currentRegImage ? [currentRegImage] : [],
            type: 'challenge_update',
            challengeId: challengeId,
            reactions: { like: 0, support: 0, funny: 0, angry: 0 },
            comments: 0
        };

        await addDoc(collection(db, "posts"), newPost);
        AppState.feedPosts.unshift(newPost);

        const { saveUserData: saveState } = await import('../utils/state.js');
        saveState();

        window.showToast('¡Progreso y Actividad registrados!');
        document.getElementById('register-activity-modal').remove();

        navigateTo('challenge-detail');

    } catch (e) {
        console.error("Error registrando actividad:", e);
        window.showToast('Ocurrió un error al guardar', 'error');
        btn.disabled = false;
        btn.innerText = 'Confirmar Registro';
    }
};

export { renderChallengeDetailPage };
