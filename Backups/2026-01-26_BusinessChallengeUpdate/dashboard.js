import { db } from './src/config/firebaseInit.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * Wellnessfy Business - Dashboard Logic
 * Gestiona la navegación, vistas y creación de desafíos conectados a Firestore.
 */

// Estado Global


// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupImageHandlers();
    // Pre-select defaults
    if (window.toggleSport) window.toggleSport(null, 'running');
    // Select first cover
    const firstCover = document.querySelector('.cover-option');
    if (firstCover) window.selectCover(firstCover, 'gym');
});

// ==========================================
// 1. SISTEMA DE NAVEGACIÓN
// ==========================================

function setupNavigation() {
    window.showSection = (sectionId) => {
        // Intercept 'rewards' -> Redirect to Gamification Tab
        if (sectionId === 'rewards') {
            document.querySelectorAll('main > div[id$="Section"]').forEach(el => {
                el.classList.add('hidden');
            });
            const target = document.getElementById('badgesSection');
            if (target) {
                target.classList.remove('hidden');
                document.querySelector('main').scrollTop = 0;
            }
            if (window.switchGamificationTab) window.switchGamificationTab('rewards');
            updateSidebarActiveState('rewards');
            return;
        }

        // Ocultar todas las secciones
        document.querySelectorAll('main > div[id$="Section"]').forEach(el => {
            el.classList.add('hidden');
        });

        // Mostrar la deseada
        const target = document.getElementById(sectionId + 'Section');
        if (target) {
            target.classList.remove('hidden');
            document.querySelector('main').scrollTop = 0;
        } else {
            // Fallback for badges if called directly
            if (sectionId === 'badges') {
                const t = document.getElementById('badgesSection');
                if (t) t.classList.remove('hidden');
            } else {
                console.warn(`Section ${sectionId}Section not found`);
            }
        }

        // Actualizar Sidebar
        updateSidebarActiveState(sectionId);
    };

    // Inicializar
    updateSidebarActiveState('dashboard');
}

function updateSidebarActiveState(sectionId) {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        const action = link.getAttribute('onclick');
        // Simple heuristic matching
        if (action && action.includes(`'${sectionId}'`)) {
            link.className = "flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/5 transition-all";
            const icon = link.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.add('text-neon-teal');
        } else {
            link.className = "flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/70 hover:text-white transition-colors";
            const icon = link.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.remove('text-neon-teal');
        }
    });
}


// ==========================================
// 2. CREACIÓN DE DESAFÍOS (Lógica Principal)
// ==========================================

/**
 * Gestión de Deportes (Multi-select)
 */
window.toggleSport = (btn, sportId) => {
    // Si btn es null (inicialización), buscar por data-sport
    if (!btn) {
        btn = document.querySelector(`button[data-sport="${sportId}"]`);
    }

    const index = state.newChallenge.sports.indexOf(sportId);

    if (index === -1) {
        // Add
        state.newChallenge.sports.push(sportId);
        btn.classList.add('border-neon-teal', 'text-neon-teal', 'bg-neon-teal/10');
        btn.classList.remove('border-white/10', 'text-gray-400', 'bg-white/5');
    } else {
        // Remove (Prevent removing last one logic if desired, but allowing empty for now to re-select)
        state.newChallenge.sports.splice(index, 1);
        btn.classList.remove('border-neon-teal', 'text-neon-teal', 'bg-neon-teal/10');
        btn.classList.add('border-white/10', 'text-gray-400', 'bg-white/5');
    }

    updateValidUnits();
};

function updateValidUnits() {
    // Lógica simplificada de unidades basada en deportes seleccionados
    const unitSelect = document.getElementById('ccUnit');
    if (!unitSelect) return;

    // Reset options
    // En una implementación real completa, filtraríamos las opciones según el deporte.
    // Por ahora, asumimos que todos los deportes soportan distancia o tiempo.
}

/**
 * Gestión de Portada
 */
window.selectCover = (el, type) => {
    // Reset visual state
    document.querySelectorAll('.cover-option').forEach(opt => {
        opt.classList.remove('border-neon-teal', 'opacity-100');
        opt.classList.add('border-transparent', 'opacity-60');
    });

    // Set Active
    el.classList.remove('border-transparent', 'opacity-60');
    el.classList.add('border-neon-teal', 'opacity-100');

    // Store URL
    state.newChallenge.cover = el.dataset.url;
};

/**
 * Configuración de Meta (Acumulativa vs Frecuencia)
 */
window.setGoalType = (type) => {
    document.getElementById('ccGoalType').value = type;

    // Toggle Buttons
    const btnKum = document.getElementById('btnCumulative');
    const btnFreq = document.getElementById('btnFrequency');

    if (type === 'cumulative') {
        btnKum.className = "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-white/10 text-neon-teal shadow transition-all";
        btnFreq.className = "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors";
        document.getElementById('goalCumulative').classList.remove('hidden');
        document.getElementById('goalFrequency').classList.add('hidden');
    } else {
        btnFreq.className = "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest bg-white/10 text-neon-teal shadow transition-all";
        btnKum.className = "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white/50 hover:bg-white/5 transition-colors";
        document.getElementById('goalFrequency').classList.remove('hidden');
        document.getElementById('goalCumulative').classList.add('hidden');
    }
};

/**
 * Tipo y Privacidad
 */
window.setChallengeType = (type) => {
    document.getElementById('ccType').value = type;
    const personal = document.getElementById('typePersonal');
    const group = document.getElementById('typeGroup');
    const options = document.getElementById('groupOptions');

    if (type === 'personal') {
        personal.className = "p-3 rounded-xl border border-neon-teal bg-neon-teal/10 cursor-pointer transition-all flex items-center gap-3";
        group.className = "p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-3";
        options.classList.add('hidden');
        // Force private
        document.getElementById('ccPrivacy').value = 'private';
    } else {
        group.className = "p-3 rounded-xl border border-neon-teal bg-neon-teal/10 cursor-pointer transition-all flex items-center gap-3";
        personal.className = "p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex items-center gap-3";
        options.classList.remove('hidden');
    }
};

window.setPrivacy = (privacy) => {
    document.getElementById('ccPrivacy').value = privacy;
    const pub = document.getElementById('privPublic');
    const priv = document.getElementById('privPrivate');

    if (privacy === 'public') {
        pub.className = "flex-1 py-1.5 rounded-lg border border-neon-teal text-neon-teal text-xs font-bold transition-all";
        priv.className = "flex-1 py-1.5 rounded-lg border border-transparent text-white/50 hover:bg-white/5 text-xs font-bold transition-all";
    } else {
        priv.className = "flex-1 py-1.5 rounded-lg border border-neon-teal text-neon-teal text-xs font-bold transition-all";
        pub.className = "flex-1 py-1.5 rounded-lg border border-transparent text-white/50 hover:bg-white/5 text-xs font-bold transition-all";
    }
};

/**
 * GUARDAR EN FIRESTORE
 */
window.createChallenge = async () => {
    const btn = document.getElementById('btnCreate');

    // 1. Validaciones
    const name = document.getElementById('ccName').value.trim();
    if (!name) return showToast('El nombre es obligatorio', 'error');

    const sports = state.newChallenge.sports;
    if (sports.length === 0) return showToast('Selecciona al menos un deporte', 'error');

    const start = document.getElementById('ccStart').value;
    const end = document.getElementById('ccEnd').value;
    if (!start || !end) return showToast('Define las fechas de inicio y fin', 'error');
    if (new Date(end) <= new Date(start)) return showToast('La fecha fin debe ser posterior al inicio', 'error');

    // 2. Construir Objeto (Schema Matching src/pages/challenges.js)
    const goalType = document.getElementById('ccGoalType').value;
    let metric = "";
    let dailyThreshold = "";

    if (goalType === 'cumulative') {
        const val = document.getElementById('ccGoalValue').value;
        const unit = document.getElementById('ccUnit').value;
        if (!val) return showToast('Define la meta total', 'error');
        metric = `${val} ${unit}`;
    } else {
        const days = document.getElementById('ccDays').value;
        const min = document.getElementById('ccDailyMin').value;
        if (!days || !min) return showToast('Define los días y el mínimo diario', 'error');
        metric = `${days} days`;
        dailyThreshold = min; // Simplified for demo
    }

    const challengeData = {
        name: name,
        description: document.getElementById('ccDesc').value || 'Sin descripción',
        imageGradient: `url('${state.newChallenge.cover}')`, // Format used in main app
        category: sports.length > 1 ? 'Mix' : sports[0].charAt(0).toUpperCase() + sports[0].slice(1),
        allowedSports: sports,
        metric: metric,
        goalType: goalType,
        dailyThreshold: dailyThreshold,

        // Metadata
        participants: 0,
        participantsList: [],
        period: `${formatDate(start)} - ${formatDate(end)}`,
        startDate: new Date(start).toISOString(),
        endDate: new Date(end).toISOString(),

        type: document.getElementById('ccType').value,
        privacy: document.getElementById('ccPrivacy').value,

        // Reward (New!)
        reward: {
            type: 'badge',
            name: document.getElementById('ccBadgeName').value || `${name} Finisher`,
            icon: document.getElementById('ccBadgeIcon').value || '🏆',
            description: `Otorgada por completar ${name}`
        },

        // Creator (Brand Identity)
        creator: {
            name: state.organization.name,
            username: state.organization.handle,
            isBrand: true,
            id: state.organization.id
        },

        createdAt: Date.now(),
        isPro: true // Brand challenges are Pro by default
    };

    // 3. Enviar a Firebase
    try {
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Lanzando...`;
        btn.disabled = true;

        const docRef = await addDoc(collection(db, "challenges"), challengeData);
        console.log("Challenge created with ID: ", docRef.id);

        showToast('¡Desafío Lanzado con Éxito!', 'success');

        // Reset & Redirect
        setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined">rocket_launch</span> Lanzar Desafío`;
            btn.disabled = false;
            window.showSection('challenges');
            // Aquí podríamos recargar la lista de desafíos si fuera dinámica real
        }, 1500);

    } catch (e) {
        console.error("Error adding document: ", e);
        showToast('Error al conectar con servidor', 'error');
        btn.disabled = false;
        btn.innerHTML = `<span class="material-symbols-outlined">error</span> Reintentar`;
    }
};

// ==========================================
// 3. UTILIDADES (Helpers)
// ==========================================

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

window.openInviteModal = () => {
    document.getElementById('inviteModal').classList.remove('hidden');
    document.getElementById('inviteInput').value = '';
    document.getElementById('inviteInput').focus();
};

window.closeInviteModal = () => {
    document.getElementById('inviteModal').classList.add('hidden');
};

window.sendInvitation = () => {
    const input = document.getElementById('inviteInput');
    const value = input.value.trim();

    if (!value) {
        showToast('Por favor ingresa un usuario o email', 'error');
        return;
    }

    closeInviteModal();
    showToast('Enviando invitación...', 'info');

    setTimeout(() => {
        if (value.length < 4) {
            showToast('Error: El usuario no es amigo de la marca', 'error');
            return;
        }
        addPendingRow(value);
        showToast(`Invitación enviada a ${value}`, 'success');
    }, 1500);
};

function addPendingRow(userEmailOrName) {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    const row = document.createElement('tr');
    row.className = 'hover:bg-white/5 transition-colors opacity-60 animate-fade-in';
    row.innerHTML = `
        <td class="px-6 py-4">
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/20">
                    <span class="material-symbols-outlined text-sm">mail</span>
                </div>
                <div>
                    <p class="font-bold italic text-white/70">${userEmailOrName}</p>
                    <p class="text-xs text-white/30">Invitación enviada</p>
                </div>
            </div>
        </td>
        <td class="px-6 py-4"><span class="px-2 py-1 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white/50">INVITADO</span></td>
        <td class="px-6 py-4"><span class="text-xs text-amber-400 font-bold">PENDIENTE</span></td>
        <td class="px-6 py-4 text-white/50 text-xs">-</td>
        <td class="px-6 py-4 text-right">
            <button class="text-white/40 hover:text-white" onclick="this.closest('tr').remove()"><span class="material-symbols-outlined">close</span></button>
        </td>
    `;
    tbody.prepend(row);
}

// Imagenes Perfil (Legacy from previous step, simplified)
function setupImageHandlers() {
    // Inputs invisibles simulados
}

// Toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' :
        type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-white/10 border-white/20 text-white';

    toast.className = `fixed bottom-8 right-8 z-[9999] px-6 py-4 rounded-xl border ${bgColor} font-bold shadow-lg backdrop-blur-md flex items-center gap-3 transition-all duration-300 translate-y-10 opacity-0`;

    let icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    toast.innerHTML = `<span class="material-symbols-outlined text-xl">${icon}</span>${message}`;

    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// ==========================================
// 4. GESTIÓN DE INSIGNIAS (Nueva Lógica Avanzada)
// ==========================================

let badgeState = {
    contentType: 'emoji', // emoji | image
    bgType: 'gradient',   // gradient | solid
    emoji: '🏆',
    image: '',            // URL data
    bgGradient: { c1: '#00f5d4', c2: '#3b82f6', angle: 135 },
    bgSolid: '#00f5d4'
};

window.openNewBadgeModal = () => {
    document.getElementById('newBadgeModal').classList.remove('hidden');
    // Reset Default
    setBadgeContentType('emoji');
    setBadgeBgType('gradient');
    document.getElementById('newBadgeName').value = '';
    document.getElementById('newBadgeDesc').value = '';
    updatePreviewBg(); // render default
};

window.closeNewBadgeModal = () => {
    document.getElementById('newBadgeModal').classList.add('hidden');
};

window.setBadgeContentType = (type) => {
    badgeState.contentType = type;
    const btnEmoji = document.getElementById('btnTypeEmoji');
    const btnImage = document.getElementById('btnTypeImage');
    const secEmoji = document.getElementById('inputEmojiSection');
    const secImage = document.getElementById('inputImageSection');
    const prevEmoji = document.getElementById('previewBadgeEmoji');
    const prevImage = document.getElementById('previewBadgeImage');

    if (type === 'emoji') {
        btnEmoji.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-white/10 text-white shadow-sm";
        btnImage.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-white/50 hover:text-white";
        secEmoji.classList.remove('hidden');
        secImage.classList.add('hidden');
        prevEmoji.classList.remove('hidden');
        prevImage.classList.add('hidden');
    } else {
        btnImage.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-white/10 text-white shadow-sm";
        btnEmoji.className = "px-4 py-1.5 rounded-lg text-xs font-bold transition-all text-white/50 hover:text-white";
        secImage.classList.remove('hidden');
        secEmoji.classList.add('hidden');
        prevImage.classList.remove('hidden');
        prevEmoji.classList.add('hidden');
    }
};

window.updatePreviewEmoji = (emoji) => {
    if (!emoji) return;
    badgeState.emoji = emoji;
    document.getElementById('previewBadgeEmoji').innerText = emoji;
};

window.handleSubtitleImage = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            badgeState.image = e.target.result;
            document.getElementById('previewBadgeImage').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.filterEmojis = (query) => {
    query = query.toLowerCase();
    const categories = document.querySelectorAll('#inputEmojiSection > div > div > p'); // Headers
    const grids = document.querySelectorAll('#inputEmojiSection > div > div > div'); // Grids

    // Iterate through grids (categories)
    grids.forEach((grid, index) => {
        const buttons = grid.querySelectorAll('button');
        let hasVisible = false;

        buttons.forEach(btn => {
            if (btn.innerText.includes(query)) {
                btn.style.display = 'flex';
                hasVisible = true;
            } else {
                btn.style.display = 'none';
            }
        });

        // Toggle Category Header visibility based on if any child is visible
        if (categories[index]) {
            categories[index].style.display = hasVisible ? 'block' : 'none';
        }
    });
};

window.setBadgeBgType = (type) => {
    badgeState.bgType = type;
    const btnGrad = document.getElementById('btnBgGradient');
    const btnSolid = document.getElementById('btnBgSolid');
    const ctrlsGrad = document.getElementById('bgGradientControls');
    const ctrlsGradAngle = document.getElementById('bgGradientAngleBox');
    const ctrlsSolid = document.getElementById('bgSolidControls');

    if (type === 'gradient') {
        btnGrad.className = "flex-1 py-2 rounded-lg border border-neon-teal text-neon-teal bg-neon-teal/10 text-xs font-bold transition-all";
        btnSolid.className = "flex-1 py-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white text-xs font-bold transition-all";
        ctrlsGrad.classList.remove('hidden');
        ctrlsGradAngle.classList.remove('invisible'); // Use invisibility to keep layout or toggle hidden
        ctrlsSolid.classList.add('hidden');
    } else {
        btnSolid.className = "flex-1 py-2 rounded-lg border border-neon-teal text-neon-teal bg-neon-teal/10 text-xs font-bold transition-all";
        btnGrad.className = "flex-1 py-2 rounded-lg border border-white/10 bg-white/5 text-white/50 hover:text-white text-xs font-bold transition-all";
        ctrlsSolid.classList.remove('hidden');
        ctrlsGrad.classList.add('hidden');
        ctrlsGradAngle.classList.add('invisible');
    }
    updatePreviewBg();
};

window.updatePreviewBg = () => {
    const container = document.getElementById('previewBadgeContainer');
    if (badgeState.bgType === 'gradient') {
        const c1 = document.getElementById('gradColor1').value;
        const c2 = document.getElementById('gradColor2').value;
        const angle = document.getElementById('bgGradientAngleBox').querySelector('input').value;
        container.style.background = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
    } else {
        const c = document.getElementById('solidColor').value;
        container.style.background = c;
    }
};

window.saveNewBadge = async () => {
    const name = document.getElementById('newBadgeName').value.trim();
    if (!name) return showToast('El nombre es obligatorio', 'error');

    showToast('Guardando insignia...', 'info');

    setTimeout(() => {
        closeNewBadgeModal();
        showToast('¡Insignia creada exitosamente!', 'success');

        // Add to UI Grid (Optimistic update)
        const badgesSection = document.getElementById('badgesSection');
        if (badgesSection) {
            const grid = badgesSection.querySelectorAll('.grid.grid-cols-2.md\\:grid-cols-3')[0];
            if (grid) {
                const newCard = document.createElement('div');
                newCard.className = "glass-card p-4 flex flex-col items-center text-center gap-3 hover:border-neon-teal/50 transition-colors group cursor-pointer relative animate-fade-in";

                // Get current background style from preview
                const currentBg = document.getElementById('previewBadgeContainer').style.background;
                const contentHtml = badgeState.contentType === 'emoji'
                    ? `<div class="h-full w-full rounded-full flex items-center justify-center text-3xl">${badgeState.emoji}</div>`
                    : `<img src="${badgeState.image}" class="h-full w-full object-contain p-2">`;

                newCard.innerHTML = `
                    <div class="h-16 w-16 rounded-full p-[2px] group-hover:scale-110 transition-transform shadow-glow" style="background: ${currentBg}">
                        <div class="h-full w-full rounded-full bg-navy-900 flex items-center justify-center overflow-hidden">
                             ${contentHtml}
                        </div>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-sm">${name}</h4>
                        <p class="text-[10px] text-white/50">Nueva</p>
                    </div>
                 `;
                grid.insertBefore(newCard, grid.lastElementChild);
            }
        }
    }, 1000);
};

// ==========================================
// 5. GESTIÓN DE CANJES (Integration Hub)
// ==========================================

let redemptionParams = {
    type: 'manual', // manual | codes | api
    config: {}
};

// ==========================================
// 6. LINKED REWARDS LOGIC (Challenge Creation)
// ==========================================

window.toggleLinkedReward = (btn) => {
    const section = document.getElementById('linkedRewardSection');
    const knob = btn.querySelector('div');

    if (section.classList.contains('hidden')) {
        // Activate
        section.classList.remove('hidden');
        btn.classList.replace('bg-white/10', 'bg-neon-teal');
        knob.style.transform = 'translateX(20px)';
    } else {
        // Deactivate
        section.classList.add('hidden');
        btn.classList.replace('bg-neon-teal', 'bg-white/10');
        knob.style.transform = 'translateX(0)';
        clearLinkedReward(); // Clear when turned off
    }
};

window.openRewardSelectorModal = () => {
    const modal = document.getElementById('selectRewardModal');
    const grid = document.getElementById('rewardSelectorGrid');
    if (!modal || !grid) return;

    grid.innerHTML = '';

    // Ensure latest state
    const savedRewards = localStorage.getItem('wellnessfy_rewards_demo');
    if (savedRewards) {
        try { state.rewardsLibrary = JSON.parse(savedRewards); } catch (e) { }
    }

    if (state.rewardsLibrary.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center text-white/40">
                <span class="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                <p>No tienes recompensas creadas.</p>
            </div>`;
    } else {
        state.rewardsLibrary.forEach(reward => {
            const el = document.createElement('div');
            // Check stock
            const hasStock = reward.stockType === 'unlimited' || reward.stock > 0;
            const opacity = hasStock ? 'opacity-100' : 'opacity-50 grayscale';
            const cursor = hasStock ? 'cursor-pointer hover:border-neon-teal' : 'cursor-not-allowed border-red-500/20';

            el.className = `glass-card p-4 transition-all group flex items-start gap-4 border border-transparent ${cursor} ${opacity}`;

            if (hasStock) {
                el.onclick = () => selectRewardForChallenge(reward);
            }

            el.innerHTML = `
                <div class="h-12 w-12 rounded-lg bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5">${reward.icon}</div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                         <h4 class="font-bold text-sm text-white group-hover:text-neon-teal transition-colors line-clamp-1">${reward.title}</h4>
                         ${!hasStock ? '<span class="text-[8px] font-bold bg-red-500 text-white px-1 rounded">AGOTADO</span>' : ''}
                    </div>
                    <p class="text-[10px] text-white/50 line-clamp-2 mt-0.5">${reward.description}</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/30 text-white/60">
                            ${reward.stockType === 'unlimited' ? '∞ ILIMITADO' : 'STOCK: ' + reward.stock}
                        </span>
                         <span class="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-black/30 text-white/60">
                            ${reward.type === 'virtual_code' ? 'CÓDIGO' : 'FÍSICO'}
                        </span>
                    </div>
                </div>
            `;
            grid.appendChild(el);
        });
    }
    modal.classList.remove('hidden');
};

window.closeRewardSelectorModal = () => {
    document.getElementById('selectRewardModal').classList.add('hidden');
};

window.selectRewardForChallenge = (reward) => {
    document.getElementById('ccRewardId').value = reward.id;
    const container = document.getElementById('linkedRewardContainer');

    container.innerHTML = `
        <div class="glass-card p-4 border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between gap-4 animate-fade-in">
            <div class="flex items-center gap-4">
                <div class="h-14 w-14 rounded-xl bg-navy-900 border border-emerald-500/20 flex items-center justify-center text-3xl shadow-lg relative">
                    ${reward.icon}
                    <div class="absolute -top-2 -right-2 bg-emerald-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded-full scale-0 animate-pop-in" style="animation-fill-mode: forwards">LINKED</div>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-white">${reward.title}</h4>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold flex items-center gap-1">
                            <span class="material-symbols-outlined text-[10px]">link</span> VINCULADO
                        </span>
                        <span class="text-[10px] text-white/40 font-mono">${reward.stockType === 'unlimited' ? 'Stock: ∞' : 'Stock: ' + reward.stock}</span>
                    </div>
                </div>
            </div>
            <button onclick="clearLinkedReward()" class="h-8 w-8 rounded-lg hover:bg-red-500/20 hover:text-red-400 text-white/30 transition-colors flex items-center justify-center" title="Desvincular">
                <span class="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    `;
    closeRewardSelectorModal();
};

window.clearLinkedReward = () => {
    const input = document.getElementById('ccRewardId');
    if (input) input.value = '';

    const container = document.getElementById('linkedRewardContainer');
    if (container) {
        container.innerHTML = `
            <button onclick="openRewardSelectorModal()" class="w-full p-4 rounded-xl border border-dashed border-white/20 hover:border-neon-teal/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-white/50 hover:text-white group">
                <div class="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-sm">add</span>
                </div>
                <span class="text-xs font-bold">Seleccionar de la Biblioteca</span>
            </button>
        `;
    }
};

window.openRedemptionModal = () => {
    // Check if modal exists
    const modal = document.getElementById('redemptionModal');
    if (!modal) {
        console.error("Redemption modal not found in HTML");
        return;
    }

    // Connect button trigger if not already connected inline
    // (In this demo, we assume the user added onclick="openRedemptionModal()" to the "Configurar Canjes" button)

    modal.classList.remove('hidden');
    selectRedemptionType(redemptionParams.type); // Reset/Restore view
};

window.closeRedemptionModal = () => {
    document.getElementById('redemptionModal').classList.add('hidden');
};

window.selectRedemptionType = (type) => {
    redemptionParams.type = type;

    // UI Updates
    const types = ['manual', 'codes', 'api'];

    types.forEach(t => {
        const card = document.getElementById(`cardType${t.charAt(0).toUpperCase() + t.slice(1)}`);
        const config = document.getElementById(`config${t.charAt(0).toUpperCase() + t.slice(1)}`);

        if (t === type) {
            // Selected Style
            card.className = "p-4 rounded-xl border border-neon-teal bg-neon-teal/10 cursor-pointer hover:bg-neon-teal/20 transition-all group col-span-full md:col-span-1";
            if (t === 'api') card.classList.add('col-span-full'); // Keep API full width logic if needed

            // Activate Radio UI
            const radio = card.querySelector('.h-2');
            if (radio) radio.classList.add('bg-neon-teal');
            if (radio) radio.classList.remove('bg-transparent');

            // Show Config
            config.classList.remove('hidden');
        } else {
            // Deselected Style
            card.className = "p-4 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:bg-white/10 transition-all group col-span-full md:col-span-1";
            if (t === 'api') card.classList.add('col-span-full');

            // Deactivate Radio UI
            const radio = card.querySelector('.h-2');
            if (radio) radio.classList.remove('bg-neon-teal');
            if (radio) radio.classList.add('bg-transparent');

            // Hide Config
            config.classList.add('hidden');
        }
    });
};

window.saveRedemptionConfig = () => {
    // Mock Saving
    const btn = document.querySelector('#redemptionModal .btn-primary');
    const originalText = btn.innerHTML;

    btn.innerHTML = `<span class="material-symbols-outlined animate-spin">sync</span> Guardando...`;
    btn.disabled = true;

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        closeRedemptionModal();
        showToast('Configuración de canjes actualizada', 'success');
    }, 1200);
};


// ==========================================
// 6. BIBLIOTECA DE RECOMPENSAS (Nuevo)
// ==========================================

let rewardState = {
    stockType: 'unlimited', // unlimited | limited
};

window.openCreateRewardModal = () => {
    document.getElementById('createRewardModal').classList.remove('hidden');
    // Reset to defaults
    setStockType('unlimited');
};

window.closeCreateRewardModal = () => {
    document.getElementById('createRewardModal').classList.add('hidden');
};

window.setStockType = (type) => {
    rewardState.stockType = type;
    const btnUnlim = document.getElementById('btnStockUnlimited');
    const btnLim = document.getElementById('btnStockLimited');
    const confUnlim = document.getElementById('stockUnlimitedConfig');
    const confLim = document.getElementById('stockLimitedConfig');

    if (type === 'unlimited') {
        btnUnlim.className = "p-4 rounded-xl border border-neon-teal bg-neon-teal/10 flex flex-col items-center gap-2 transition-all";
        btnUnlim.style.opacity = "1";

        btnLim.className = "p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-2 transition-all opacity-60 hover:opacity-100";
        btnLim.classList.remove('border-neon-teal', 'bg-neon-teal/10');

        confUnlim.classList.remove('hidden');
        confLim.classList.add('hidden');
    } else {
        btnLim.className = "p-4 rounded-xl border border-neon-teal bg-neon-teal/10 flex flex-col items-center gap-2 transition-all";
        btnLim.style.opacity = "1";

        btnUnlim.className = "p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center gap-2 transition-all opacity-60 hover:opacity-100";
        btnUnlim.classList.remove('border-neon-teal', 'bg-neon-teal/10');

        confLim.classList.remove('hidden');
        confUnlim.classList.add('hidden');
    }
};


window.toggleRewardEmojiPicker = () => {
    const picker = document.getElementById('rewardEmojiPicker');
    if (!picker) return;

    const container = document.getElementById('rewardEmojiContainer');

    // Lazy load the emoji library from the Badge Section
    if (container && container.children.length === 0) {
        // Find the source: The scrollable div inside 'inputEmojiSection'
        const sourceSection = document.getElementById('inputEmojiSection');
        if (sourceSection) {
            // The scrollable container is the first direct div child (based on view_file)
            const sourceContainer = sourceSection.querySelector('.overflow-y-auto');

            if (sourceContainer) {
                // Clone HTML and replace handlers
                let content = sourceContainer.innerHTML;

                // Replace onclick handler
                // Assuming format: onclick="updatePreviewEmoji(this.innerText)"
                const newContent = content.replaceAll('updatePreviewEmoji(this.innerText)', 'setRewardEmoji(this.innerText)');

                container.innerHTML = newContent;

                // Adjust styles of the container inside if needed (e.g. remove max-h limit if parent handles it, 
                // but our parent #rewardEmojiPicker handles scroll)
                // Actually, the source container has 'max-h-60', but we pasted its INNER content.
                // The inner content is P tags and DIV grids. That's fine.
            } else {
                console.error("Source emoji container not found");
                container.innerHTML = "<p class='text-red-500'>Error loading emojis</p>";
            }
        }
    }

    picker.classList.toggle('hidden');
};

window.setRewardEmoji = (emoji) => {
    const input = document.getElementById('rewardIconInput');
    if (input) input.value = emoji;
    toggleRewardEmojiPicker();
};



window.openCreateRewardModal = () => {
    state.editingRewardId = null;

    // Clear Inputs
    document.getElementById('rewardNameInput').value = '';
    document.getElementById('rewardIconInput').value = '🎁';
    document.getElementById('rewardDescInput').value = '';
    document.getElementById('rewardCodeInput').value = '';

    // Reset UI
    const modal = document.getElementById('createRewardModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.querySelector('h3 span:last-child').innerText = 'Nueva Ficha de Recompensa';
        const btn = modal.querySelector('.btn-primary');
        if (btn) btn.innerHTML = '<span class="material-symbols-outlined">save</span> Guardar Recompensa';
    }

    if (typeof setStockType === 'function') setStockType('unlimited');
};

window.editReward = (id) => {
    const reward = state.rewardsLibrary.find(r => r.id === id);
    if (!reward) return;

    state.editingRewardId = id;

    // Fill Inputs
    document.getElementById('rewardNameInput').value = reward.title;
    document.getElementById('rewardIconInput').value = reward.icon;
    document.getElementById('rewardDescInput').value = reward.description;

    // Handle Stock & Code
    if (typeof setStockType === 'function') setStockType(reward.stockType);

    if (reward.stockType === 'unlimited') {
        document.getElementById('rewardCodeInput').value = reward.codes[0] || '';
    } else {
        // Handle limited stock logic if CSV was imported (mocked here)
    }

    // Open Modal with Edit Context
    const modal = document.getElementById('createRewardModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.querySelector('h3 span:last-child').innerText = 'Editar Recompensa';
        const btn = modal.querySelector('.btn-primary');
        if (btn) btn.innerHTML = '<span class="material-symbols-outlined">save</span> Guardar Cambios';
    }
};

window.deleteReward = (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta recompensa?')) return;

    const index = state.rewardsLibrary.findIndex(r => r.id === id);
    if (index !== -1) {
        state.rewardsLibrary.splice(index, 1);
        localStorage.setItem('wellnessfy_rewards_demo', JSON.stringify(state.rewardsLibrary));
        renderRewardsLibrary();
        showToast('Recompensa eliminada', 'success');
    }
};

window.saveReward = () => {
    const btn = document.querySelector('#createRewardModal .btn-primary');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="animate-spin material-symbols-outlined">sync</span> Guardando...';
    btn.disabled = true;

    // Simulate Network Request
    setTimeout(() => {
        // 1. Get Values
        const title = document.getElementById('rewardNameInput').value;
        const icon = document.getElementById('rewardIconInput').value;
        const desc = document.getElementById('rewardDescInput').value;

        // Stock Logic
        const isUnlimited = document.getElementById('btnStockUnlimited').classList.contains('border-neon-teal');
        const stockType = isUnlimited ? 'unlimited' : 'limited';
        const code = document.getElementById('rewardCodeInput').value;

        // Validation
        if (!title) {
            alert('Por favor añade un nombre a la recompensa');
            btn.innerHTML = originalText;
            btn.disabled = false;
            return;
        }

        if (state.editingRewardId) {
            // EDIT EXISTING
            const index = state.rewardsLibrary.findIndex(r => r.id === state.editingRewardId);
            if (index !== -1) {
                state.rewardsLibrary[index] = {
                    ...state.rewardsLibrary[index],
                    title: title,
                    icon: icon,
                    description: desc,
                    stockType: stockType,
                    codes: stockType === 'unlimited' ? [code] : state.rewardsLibrary[index].codes, // Keep codes if limited mode
                    // Preserve other fields
                };
            }
        } else {
            // CREATE NEW
            const newReward = {
                id: 'reward_' + Date.now(),
                title: title,
                type: stockType === 'unlimited' ? 'virtual_code' : 'physical_pickup', // simplistic mapping
                stockType: stockType,
                stock: stockType === 'unlimited' ? 9999 : 0,
                distributed: 0,
                codes: stockType === 'unlimited' ? [code] : [],
                description: desc || 'Sin descripción',
                terms: 'Aplican restricciones',
                status: 'active',
                icon: icon || '🎁'
            };
            state.rewardsLibrary.push(newReward);
        }

        // Save Persistence
        localStorage.setItem('wellnessfy_rewards_demo', JSON.stringify(state.rewardsLibrary));

        // Update UI
        renderRewardsLibrary();

        // Reset and Close
        btn.innerHTML = originalText;
        btn.disabled = false;

        // Assuming closeCreateRewardModal exists or we use toggle logic
        if (typeof closeCreateRewardModal === 'function') closeCreateRewardModal();
        else document.getElementById('createRewardModal').classList.add('hidden');

        // Clear State
        state.editingRewardId = null;

        showToast(state.editingRewardId ? 'Recompensa actualizada' : 'Recompensa añadida', 'success');
    }, 1000);
};

window.renderRewardsLibrary = () => {
    const grid = document.getElementById('rewardsGrid');
    if (!grid) return;

    // Clear current content but keep the reference to recreate
    grid.innerHTML = '';

    // Render Cards
    state.rewardsLibrary.forEach(reward => {
        const isUnlimited = reward.stockType === 'unlimited';
        const stockText = isUnlimited ? '∞ Ilimitado' : reward.stock;
        const typeLabel = isUnlimited ? 'CÓDIGO:' : 'TIPO:';
        const typeValue = isUnlimited ? (reward.codes[0] || '---') : 'CSV ÚNICO';

        // Random bg color logic based on id char or simple toggle
        // Use a consistent color mapping based on index or ID
        const bgColors = ['bg-purple-900/20', 'bg-blue-900/20', 'bg-emerald-900/20', 'bg-rose-900/20'];
        const randomIdx = (reward.title.length + reward.id.length) % bgColors.length;
        const bgClass = bgColors[randomIdx];

        const html = `
        <div class="glass-card p-0 overflow-hidden group hover:border-neon-teal/50 transition-colors relative flex flex-col h-full">
            <div class="h-20 ${bgClass} relative">
                <!-- Status Badge (Left) -->
                <div class="absolute top-2 left-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[8px] font-bold">ACTIVO</div>
                
                <!-- Actions (Right) -->
                <div class="absolute top-2 right-2 flex gap-1.5 z-30">
                     <button onclick="event.stopPropagation(); editReward('${reward.id}')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-black/20 hover:bg-white/20 text-white transition-colors backdrop-blur-md" title="Editar">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onclick="event.stopPropagation(); deleteReward('${reward.id}')" class="h-7 w-7 flex items-center justify-center rounded-lg bg-black/20 hover:bg-red-500/20 hover:text-red-400 text-white/70 transition-colors backdrop-blur-md border border-transparent hover:border-red-500/30" title="Eliminar">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>

                <div class="absolute -bottom-5 left-4 h-10 w-10 rounded-lg bg-navy-900 border border-white/10 flex items-center justify-center text-xl shadow-lg">${reward.icon || '🎁'}</div>
            </div>
            <div class="p-4 pt-6 flex-1 flex flex-col">
                <h3 class="font-bold text-sm mb-1 leading-tight line-clamp-1" title="${reward.title}">${reward.title}</h3>
                <p class="text-[10px] text-white/50 line-clamp-2 mb-3 leading-relaxed flex-1">${reward.description}</p>
                <div class="flex items-center justify-between text-[10px] font-mono bg-black/20 p-1.5 rounded mb-3">
                    <span class="text-white/40">${typeLabel}</span>
                    <span class="text-neon-teal font-bold truncate max-w-[80px]">${typeValue}</span>
                </div>
                <div class="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
                    <div>
                        <p class="text-[8px] text-white/40 font-bold uppercase">Stock</p>
                        <p class="text-xs font-bold text-white">${stockText}</p>
                    </div>
                    <div>
                        <p class="text-[8px] text-white/40 font-bold uppercase">Canjeados</p>
                        <p class="text-xs font-bold text-white text-right">${reward.distributed}</p>
                    </div>
                </div>
            </div>
        </div>
        `;
        grid.insertAdjacentHTML('beforeend', html);
    });

    // Append "Create New" Button as the last item
    const createBtnHtml = `
    <button onclick="openCreateRewardModal()" class="glass-card p-4 border-2 border-dashed border-white/10 hover:border-neon-teal/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center text-center gap-3 group h-full min-h-[200px]">
        <div class="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
            <span class="material-symbols-outlined text-2xl text-neon-teal">add_card</span>
        </div>
        <div>
            <h3 class="font-bold text-sm group-hover:text-neon-teal transition-colors">Crear Recompensa</h3>
            <p class="text-[10px] text-white/50 mt-0.5">Añade un nuevo incentivo</p>
        </div>
    </button>
    `;
    grid.insertAdjacentHTML('beforeend', createBtnHtml);
};


// Ensure render on load
document.addEventListener('DOMContentLoaded', () => {
    const savedRewards = localStorage.getItem('wellnessfy_rewards_demo');
    if (savedRewards) {
        try {
            state.rewardsLibrary = JSON.parse(savedRewards);
        } catch (e) {
            console.error("Error loading rewards:", e);
        }
    }
    renderRewardsLibrary();
});


// Update Sidebar Link Overwrite
// This is a "hack" for the demo to hijack the badges link
const updateSidebarLink = () => {
    const navLinks = document.querySelectorAll('aside nav a');
    navLinks.forEach(link => {
        if (link.innerText.includes('Insignias')) {
            link.onclick = (e) => {
                // e.preventDefault(); // removed to allow default styling logic within showSection if needed, but here we override action
                window.showSection('rewards');
                // Manually set active state since 'rewards' isn't in original list
                updateSidebarActiveState('rewards');

                // Visual fix for the button state
                link.className = "flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 text-white border border-white/5 transition-all";
                const icon = link.querySelector('.material-symbols-outlined');
                if (icon) icon.classList.add('text-neon-teal');
            };
            // Update text to reflect new section name
            const textSpan = link.querySelector('span.font-medium');
            if (textSpan) textSpan.innerText = "Insignias & Premios";
        }
    });
};
// Add to init
document.addEventListener('DOMContentLoaded', updateSidebarLink);


// ==========================================
// 7. NAVEGACIÓN DE PESTAÑAS (Gamificación)
// ==========================================

window.switchGamificationTab = (tab) => {
    const btnBadges = document.getElementById('tabBtnBadges');
    const btnRewards = document.getElementById('tabBtnRewards');
    const viewBadges = document.getElementById('viewBadges');
    const viewRewards = document.getElementById('viewRewards');

    if (tab === 'badges') {
        // Active Tab Style
        btnBadges.className = "px-6 py-2 rounded-lg text-sm font-bold bg-white/10 text-white shadow-sm transition-all flex items-center gap-2";
        btnRewards.className = "px-6 py-2 rounded-lg text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2";

        // Show Content
        viewBadges.classList.remove('hidden');
        viewRewards.classList.add('hidden');
    } else {
        // Active Tab Style
        btnRewards.className = "px-6 py-2 rounded-lg text-sm font-bold bg-white/10 text-white shadow-sm transition-all flex items-center gap-2";
        btnBadges.className = "px-6 py-2 rounded-lg text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2";

        // Show Content
        viewRewards.classList.remove('hidden');
        viewBadges.classList.add('hidden');
    }
};

// AUTO-FIX: Restore Navigation Logic 
// Since we combined sections, 'rewards' section logic needs to point to badgesSection + tab switch
const originalShowSection = window.showSection;
window.showSection = (sectionId) => {
    // Intercept 'rewards' to show 'badgesSection' but switch tab
    if (sectionId === 'rewards') {
        // Call original to hide others and show badgesSection (we map 'rewards' -> 'badges' visually)
        // Check if 'badges' section exists or if we need to show 'badgesSection' explicitly
        // Logic in original showSection likely hides everything not matching ID.

        // Let's assume original showSection expects ID. 
        // We will call showSection('badges') and then switch tab.

        // First, find if badgesSection is the ID. Yes, we kept ID="badgesSection"

        // Manually trigger the sections visibility if 'originalShowSection' isn't easily accessible 
        // or just use logic:
        document.querySelectorAll('div[id$="Section"]').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById('badgesSection');
        if (target) target.classList.remove('hidden');

        switchGamificationTab('rewards');
        window.scrollTo(0, 0);
        return;
    }

    if (sectionId === 'badges') {
        document.querySelectorAll('div[id$="Section"]').forEach(el => el.classList.add('hidden'));
        const target = document.getElementById('badgesSection');
        if (target) target.classList.remove('hidden');

        switchGamificationTab('badges');
        window.scrollTo(0, 0);
        return;
    }

    // Default behavior for other sections
    // Re-implementing simplified version since we can't easily call "super"
    document.querySelectorAll('div[id$="Section"]').forEach(el => {
        if (el.id === sectionId + 'Section') {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
    window.scrollTo(0, 0);
};

// ==========================================
// 7. GESTIÓN DE PORTADA (Challenge Creator)
// ==========================================

window.selectCover = (el, type) => {
    // Deselect all
    document.querySelectorAll('.cover-option').forEach(opt => {
        opt.classList.remove('border-neon-teal', 'opacity-100');
        opt.classList.add('border-transparent', 'opacity-60');
    });

    // Select this
    el.classList.remove('border-transparent', 'opacity-60');
    el.classList.add('border-neon-teal', 'opacity-100');

    // Set value
    const url = el.getAttribute('data-url');
    document.getElementById('ccImage').value = url;

    // Hide Custom Preview if active
    const preview = document.getElementById('customCoverPreview');
    if (preview) preview.classList.add('hidden');

    const grid = document.getElementById('predefinedCovers');
    if (grid) grid.classList.remove('opacity-50', 'pointer-events-none');
};

window.handleCoverUpload = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target.result;

            // UI Updates
            const preview = document.getElementById('customCoverPreview');
            if (preview) {
                preview.style.backgroundImage = `url('${url}')`;
                preview.classList.remove('hidden');
            }

            // Hide Grid
            const grid = document.getElementById('predefinedCovers');
            if (grid) grid.classList.add('opacity-50', 'pointer-events-none');

            // Set Value
            document.getElementById('ccImage').value = url;

            // Deselect predefined
            document.querySelectorAll('.cover-option').forEach(opt => {
                opt.classList.remove('border-neon-teal', 'opacity-100');
                opt.classList.add('border-transparent', 'opacity-60');
            });
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.clearCustomCover = () => {
    // Reset Input
    const input = document.getElementById('uploadCoverInput');
    if (input) input.value = '';

    // Hide Preview
    const preview = document.getElementById('customCoverPreview');
    if (preview) preview.classList.add('hidden');

    // Enable Grid
    const grid = document.getElementById('predefinedCovers');
    if (grid) grid.classList.remove('opacity-50', 'pointer-events-none');

    // Reset Value
    document.getElementById('ccImage').value = '';

    // Re-select first option default
    const first = grid ? grid.querySelector('.cover-option') : null;
    if (first) selectCover(first, 'gym');
};

