import { db } from './src/config/firebaseInit.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

/**
 * Wellnessfy Business - Dashboard Logic
 * Gestiona la navegación, vistas y creación de desafíos conectados a Firestore.
 */

// Estado Global
const state = {
    currentSection: 'dashboard',
    organization: {
        name: 'Empresa Demo',
        handle: 'empresa_demo',
        verified: true,
        id: 'business_demo_123' // Mock ID
    },
    newChallenge: {
        sports: [],
        cover: ''
    }
};

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
            console.warn(`Section ${sectionId}Section not found`);
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
