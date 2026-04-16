import { db, auth } from './src/config/firebaseInit.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { collection, addDoc, setDoc, doc, serverTimestamp, getDoc, getDocs, query, where, limit, deleteDoc, updateDoc, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';


// Auth Guard
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    } else {
        console.log("👤 Usuario autenticado:", user.email);
        await bootstrapDashboard(user);
    }
});

let ORG_ID = "DEMO_CORP_001";

/**
 * Wellnessfy Business - Dashboard Logic
 * Gestiona la navegación, vistas y creación de desafíos conectados a Firestore.
 */

// Estado Global
let dshstate = {
    organization: {
        id: ORG_ID,
        name: "Mi Empresa",
        handle: "mi_empresa"
    },
    newChallenge: {
        sports: [],
        cover: ''
    },

    currentUser: null,
    loadedBadges: [], // All badges available for this Org
    loadedChallenges: [],
    editingChallengeId: null
};
window.dshstate = dshstate;

// Geografía del Desafío
let challengeMap = null;
let challengeMarker = null;
let challengeCircle = null;

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


        if (sectionId === 'challenges') {
            renderBadgeCatalogSelect();
            loadChallenges(dshstate.organization.id);
            // Delay map init slightly to ensure DOM is ready
            setTimeout(initChallengeMap, 100);
        }

        // Reset form if creating NEW challenge
        if (sectionId === 'createChallenge' && dshstate.editingChallengeId === null) {
            resetChallengeForm();
        }

        // Default behavior for other sections
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

    const index = dshstate.newChallenge.sports.indexOf(sportId);

    if (index === -1) {
        // Add
        dshstate.newChallenge.sports.push(sportId);
        btn.classList.add('border-neon-teal', 'text-neon-teal', 'bg-neon-teal/10');
        btn.classList.remove('border-white/10', 'text-gray-400', 'bg-white/5');
    } else {
        // Remove (Prevent removing last one logic if desired, but allowing empty for now to re-select)
        dshstate.newChallenge.sports.splice(index, 1);
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
    dshstate.newChallenge.cover = el.dataset.url;
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

    const sports = dshstate.newChallenge.sports;
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
        imageGradient: `url('${dshstate.newChallenge.cover}')`, // Format used in main app
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

        // 🟢 Visibility Analytics (Strategic Integration)
        visibility: {
            scope: document.getElementById('ccScope').value,
            location: {
                lat: parseFloat(document.getElementById('ccLat').value) || null,
                lng: parseFloat(document.getElementById('ccLng').value) || null
            },
            radius: parseInt(document.getElementById('ccRadius').value) || 20
        },

        // Reward (from Library)
        reward: (() => {
            const badgeId = document.getElementById('ccSelectedBadgeId').value;
            const badge = dshstate.loadedBadges.find(b => b.id === badgeId);

            if (!badge) return {
                type: 'badge',
                name: `${name} Finisher`,
                icon: '🏆',
                description: `Otorgada por completar ${name}`
            };

            return {
                badgeId: badge.id,
                type: 'badge',
                name: badge.name,
                icon: (badge.type === 'emoji' || !badge.type) ? (badge.content || badge.emoji || '🏆') : 'image',
                image: badge.type === 'image' ? (badge.content || badge.image) : null,
                style: badge.style,
                description: badge.description || `Otorgada por completar ${name}`
            };
        })(),

        // Creator (Brand Identity)
        creator: {
            name: dshstate.organization.name,
            username: dshstate.organization.handle,
            isBrand: true,
            id: dshstate.organization.id
        },

        createdAt: Date.now(),
        createdBy: auth.currentUser?.uid || null,
        isPro: true // Brand challenges are Pro by default
    };

    // 3. Enviar a Firebase
    try {
        const isEditing = dshstate.editingChallengeId !== null;
        btn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> ${isEditing ? 'Actualizando...' : 'Lanzando...'}`;
        btn.disabled = true;

        if (isEditing) {
            await updateDoc(doc(db, "challenges", dshstate.editingChallengeId), challengeData);
            showToast('¡Desafío Actualizado!', 'success');
        } else {
            const docRef = await addDoc(collection(db, "challenges"), challengeData);
            console.log("Challenge created with ID: ", docRef.id);
            showToast('¡Desafío Lanzado con Éxito!', 'success');
        }

        // Reset & Redirect
        setTimeout(() => {
            btn.innerHTML = `<span class="material-symbols-outlined">rocket_launch</span> Lanzar Desafío`;
            btn.disabled = false;
            dshstate.editingChallengeId = null; // Important: Clear editing state
            loadChallenges(dshstate.organization.id); // Refresh list
            window.showSection('challenges');
        }, 1500);

    } catch (e) {
        console.error("Error adding/updating document: ", e);
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

window.sendInvitation = async () => {
    // Determine which input is active (Old vs New implementation)
    const emailInput = document.getElementById('inviteEmail'); // From fixed modal
    const otherInput = document.getElementById('inviteInput'); // From old code

    let email = "";
    if (emailInput && emailInput.value) email = emailInput.value.trim();
    else if (otherInput && otherInput.value) email = otherInput.value.trim();

    if (!email) {
        showToast('Por favor ingresa un email válido', 'error');
        return;
    }

    showToast('Enviando invitación...', 'info');

    try {
        await addDoc(collection(db, 'invitations'), {
            email: email,
            orgId: ORG_ID,
            status: 'pending',
            role: 'member',
            sentAt: serverTimestamp()
        });

        closeInviteModal();
        showToast(`Invitación enviada a ${email}`, 'success');

        // Update UI
        if (typeof addPendingRow === 'function') addPendingRow(email);

        if (emailInput) emailInput.value = '';
        if (otherInput) otherInput.value = '';

    } catch (e) {
        console.error("Error sending invitation:", e);
        showToast('Error al conectar con servidor', 'error');
    }
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
// 4. BOOTSTRAP DINÁMICO
// ==========================================

async function bootstrapDashboard(user) {
    try {
        // 1. Cargar Perfil de Usuario
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        if (userSnap.exists()) {
            dshstate.currentUser = { uid: user.uid, ...userSnap.data() };
            updateUserSidebar(dshstate.currentUser);
        }

        // 2. Buscar Empresa del Usuario
        const companyQuery = query(collection(db, "companies"), where("ownerId", "==", user.uid), limit(1));
        const companySnap = await getDocs(companyQuery);

        if (!companySnap.empty) {
            const companyDoc = companySnap.docs[0];
            const companyData = companyDoc.data();
            ORG_ID = companyDoc.id;

            dshstate.organization = {
                id: ORG_ID,
                name: companyData.name,
                handle: companyData.handle || companyData.name.toLowerCase().replace(/\s+/g, '_'),
                ...companyData
            };

            console.log("🏢 Dashboard vinculado a:", dshstate.organization.name, "ID:", dshstate.organization.id);
            updateOrganizationUI();
            loadTeamMembers(dshstate.organization.id);
            loadBadges(dshstate.organization.id);
            loadChallenges(dshstate.organization.id);

        } else {
            console.warn("⚠️ No se encontró empresa vinculada. Usando modo DEMO.");
            loadTeamMembers(ORG_ID); // Load demo team or empty
            loadBadges(ORG_ID);
            loadChallenges(ORG_ID);
        }

    } catch (error) {
        console.error("❌ Error en bootstrap:", error);
    }
}

function updateUserSidebar(user) {
    const avatar = document.getElementById('sidebarUserAvatar');
    const name = document.getElementById('sidebarUserName');
    const email = document.getElementById('sidebarUserEmail');

    if (avatar) avatar.src = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
    if (name) name.innerText = user.name || 'Admin User';
    if (email) email.innerText = user.email || 'admin@empresa.com';
}

function updateOrganizationUI() {
    const org = dshstate.organization;

    // 1. Inputs de Perfil
    const brandNameInput = document.getElementById('brandName');
    const brandHandleInput = document.getElementById('brandHandle');
    const brandBioInput = document.getElementById('brandBio');
    const brandFullDesc = document.getElementById('brandFullDesc');
    const brandAddress = document.getElementById('brandAddress');
    const brandCTAUrl = document.getElementById('brandCTAUrl');
    const brandIG = document.getElementById('brandIG');
    const brandWA = document.getElementById('brandWA');

    if (brandNameInput) brandNameInput.value = org.name || '';
    if (brandHandleInput) brandHandleInput.value = org.handle || '';
    if (brandBioInput) brandBioInput.value = org.bio || '';
    if (brandFullDesc) brandFullDesc.value = org.description || '';
    if (brandAddress) brandAddress.value = org.address || '';
    if (brandCTAUrl) brandCTAUrl.value = org.ctaUrl || '';
    if (brandIG) brandIG.value = org.instagram || '';
    if (brandWA) brandWA.value = org.whatsapp || '';

    // 2. Datos Fiscales
    const brandRFC = document.getElementById('brandRFC');
    const brandLegalName = document.getElementById('brandLegalName');
    if (brandRFC) brandRFC.innerText = org.rfc || '---';
    if (brandLegalName) brandLegalName.innerText = org.legalName || '---';

    // 3. Imágenes (Portadas y Logo)
    const logoPreview = document.getElementById('logoPreview');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    const coverPreview = document.getElementById('coverPreview');
    const coverPlaceholder = document.getElementById('coverPlaceholder');

    if (org.logoURL) {
        if (logoPreview) {
            logoPreview.src = org.logoURL;
            logoPreview.classList.remove('hidden');
        }
        if (logoPlaceholder) logoPlaceholder.classList.add('hidden');
    }

    if (org.coverURL) {
        if (coverPreview) {
            coverPreview.src = org.coverURL;
            coverPreview.classList.remove('hidden');
        }
        if (coverPlaceholder) coverPlaceholder.classList.add('hidden');
    }

    // 4. Dashboard Header
    const dashboardTitle = document.querySelector('#dashboardSection h1');
    if (dashboardTitle) dashboardTitle.innerText = `${org.name} Insights`;
}

async function loadTeamMembers(companyId) {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="px-6 py-8 text-center text-white/20"><span class="material-symbols-outlined animate-spin">sync</span> Cargando equipo...</td></tr>`;

    try {
        // 1. Obtener Propietario (Creator)
        const companyRef = doc(db, 'companies', companyId);
        const companySnap = await getDoc(companyRef);

        let membersHtml = '';

        if (companySnap.exists()) {
            const companyData = companySnap.data();
            const ownerId = companyData.ownerId;

            // Cargar datos del owner
            const ownerSnap = await getDoc(doc(db, 'users', ownerId));
            if (ownerSnap.exists()) {
                const owner = ownerSnap.data();
                membersHtml += createMemberRowHtml({
                    uid: ownerId,
                    ...owner
                }, 'PROPIETARIO', 'ACTIVO');
            }
        } else if (companyId === "DEMO_CORP_001") {
            // Fallback User
            membersHtml += createMemberRowHtml({
                name: 'Administrador',
                username: '@admin',
                email: 'admin@wellnessfy.io',
                avatar: null
            }, 'PROPIETARIO', 'ACTIVO');
        }

        // 2. Cargar Invitados / Otros Miembros (Si existiera la subcolección)
        // Por ahora mantenemos la lógica simple de mostrar al creador.

        tbody.innerHTML = membersHtml || '<tr><td colspan="5" class="px-6 py-8 text-center text-white/30 text-xs italic">No hay miembros en el equipo</td></tr>';

    } catch (error) {
        console.error("Error cargando equipo:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-red-400 text-xs italic">Error al cargar equipo</td></tr>';
    }
}

function createMemberRowHtml(user, role, status) {
    const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=random`;
    return `
        <tr class="hover:bg-white/5 transition-colors animate-fade-in">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img src="${avatarUrl}" class="size-full object-cover">
                    </div>
                    <div>
                        <p class="font-bold text-white">${user.name || 'Usuario'}</p>
                        <p class="text-[10px] text-white/50">${user.username || user.email}</p>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4"><span class="px-2 py-1 rounded text-[10px] font-bold bg-white/10 text-neon-teal border border-neon-teal/20">${role}</span></td>
            <td class="px-6 py-4"><span class="text-xs text-emerald-400 font-bold">${status}</span></td>
            <td class="px-6 py-4 text-white/50 text-xs">Recientemente</td>
            <td class="px-6 py-4 text-right">
                ${role !== 'PROPIETARIO' ? `
                <button class="text-white/40 hover:text-white">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>` : ''}
            </td>
        </tr>
    `;
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

    // Prepare Data
    const badgeData = {
        name: name,
        type: badgeState.contentType, // emoji | image
        content: badgeState.contentType === 'emoji' ? badgeState.emoji : badgeState.image,
        style: {
            bgType: badgeState.bgType,
            bgSolid: badgeState.bgSolid,
            bgGradient: badgeState.bgGradient
        },
        orgId: dshstate.organization.id || "DEMO_CORP_001",
        createdAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, 'badges'), badgeData);

        closeNewBadgeModal();
        showToast('¡Insignia creada exitosamente!', 'success');

        // Optimistic UI Update (using corrected ID)
        const grid = document.getElementById('badgesGrid');
        if (grid) {
            // Construct complete object for renderer
            const fullBadgeData = { ...badgeData, id: docRef.id };
            const newCard = createBadgeCard(fullBadgeData);
            // Insert AFTER the "Create New" button (which should be first child)
            // If grid has children, insert before the second child (which is effectively after first) -> actually simpler: insertBefore 2nd child works, or if only 1 child, append.
            if (grid.children.length > 0) {
                grid.insertBefore(newCard, grid.children[1]); // Index 1 is the second element
            } else {
                grid.appendChild(newCard);
            }
        }
    } catch (e) {
        console.error("Error saving badge:", e);
        showToast('Error al guardar en base de datos', 'error');
    }
};


window.deleteBadge = async (badgeId, cardElement) => {
    if (!confirm('¿Estás seguro de eliminar esta insignia?')) return;

    try {
        await deleteDoc(doc(db, 'badges', badgeId));
        if (cardElement) cardElement.remove(); // Optimistic UI removal
        showToast('Insignia eliminada', 'success');
    } catch (e) {
        console.error('Error deleting badge:', e);
        showToast('Error al eliminar insignia', 'error');
    }
};

async function loadBadges(orgId) {
    const grid = document.getElementById('badgesGrid');
    if (!grid) return;

    // Clear existing dynamic badges (Keep the "Create New" button which is static)
    // We assume the static button doesn't have the 'glass-card' AND 'animate-fade-in' combo or we filter by something else.
    // Easier: Store the create button, plain innerHTML reset, restore button.
    // Or: Remove all elements that are NOT the create button.

    // Strategy: Remove all children starting from index 1
    while (grid.children.length > 1) {
        grid.removeChild(grid.lastChild);
    }

    try {
        const q = query(collection(db, 'badges'), where('orgId', '==', orgId));
        const querySnapshot = await getDocs(q);
        console.log("💎 [Firestore] Cargando insignias:", querySnapshot.size);

        dshstate.loadedBadges = []; // Reset local list
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const badgeObj = { id: doc.id, ...data };
            dshstate.loadedBadges.push(badgeObj);

            const card = createBadgeCard(badgeObj);
            grid.appendChild(card);
        });

        console.log("📦 Catálogo actualizado con:", dshstate.loadedBadges.length, "insignias");
        // Always refresh the catalog select in challenges if it's there
        renderBadgeCatalogSelect();

    } catch (err) {
        console.error("Error loading badges:", err);
    }
}

function createBadgeCard(badge) {
    const card = document.createElement('div');
    card.className = "glass-card p-4 flex flex-col items-center text-center gap-3 hover:border-neon-teal/50 transition-colors group cursor-pointer relative animate-fade-in";

    // Background Logic
    let bgStyle = '#333';
    if (badge.style) {
        if (badge.style.bgType === 'gradient' && badge.style.bgGradient) {
            bgStyle = `linear-gradient(${badge.style.bgGradient.angle}deg, ${badge.style.bgGradient.c1}, ${badge.style.bgGradient.c2})`;
        } else if (badge.style.bgSolid) {
            bgStyle = badge.style.bgSolid;
        }
    }

    const contentHtml = (badge.type === 'emoji' || !badge.type) // Default to emoji
        ? `<div class="h-full w-full rounded-full flex items-center justify-center text-3xl pb-1">${badge.content || badge.emoji || '🏆'}</div>`
        : `<img src="${badge.content || badge.image}" class="h-full w-full object-contain p-2">`;

    card.innerHTML = `
        <div class="h-16 w-16 rounded-full p-[2px] group-hover:scale-110 transition-transform shadow-glow" style="background: ${bgStyle}">
            <div class="h-full w-full rounded-full bg-navy-900 flex items-center justify-center overflow-hidden">
                 ${contentHtml}
            </div>
        </div>
        
        <button onclick="event.stopPropagation(); deleteBadge('${badge.id}', this.closest('.glass-card'))" 
            class="absolute top-2 right-2 h-7 w-7 rounded-lg bg-black/40 hover:bg-red-500/80 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm"
            title="Eliminar Insignia">
            <span class="material-symbols-outlined text-sm">delete</span>
        </button>
        <div>
            <h4 class="font-bold text-white text-sm truncate max-w-[120px]">${badge.name}</h4>
            <p class="text-[10px] text-white/50">${badge.description || 'Insignia'}</p>
        </div>
    `;
    return card;
}


// ==========================================
// 5. GESTIÓN DE CANJES (Integration Hub)
// ==========================================

let redemptionParams = {
    type: 'manual', // manual | codes | api
    config: {}
};

// ==========================================
// 6. GESTIÓN DE DESAFÍOS (Business View)
// ==========================================

async function loadChallenges(orgId) {
    const grid = document.getElementById('challengesGrid');
    if (!grid) return;

    // Reset grid but keep the "Create New" button (which is at the end or we can re-add it)
    grid.innerHTML = '';

    try {
        console.log("🕒 Cargando desafíos para ORG:", orgId);
        const q = query(
            collection(db, "challenges"),
            where("creator.id", "==", orgId),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        console.log("✅ Desafíos recuperados:", querySnapshot.size);

        if (querySnapshot.empty) {
            // Placeholder si no hay retos
            grid.innerHTML = `
                <div class="col-span-full py-20 text-center opacity-30 select-none pointer-events-none">
                    <span class="material-symbols-outlined text-6xl mb-4">emoji_events</span>
                    <p class="text-xl font-bold">No has lanzado desafíos aún</p>
                    <p class="text-sm">Tus retos para la comunidad aparecerán aquí.</p>
                </div>
            `;
        }

        dshstate.loadedChallenges = []; // Reset local list
        querySnapshot.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            dshstate.loadedChallenges.push(data);
            const card = createBusinessChallengeCard(data);
            grid.appendChild(card);
        });

        // Siempre añadir el botón de "Crear Nuevo" al final
        const createBtn = document.createElement('button');
        createBtn.onclick = () => showSection('createChallenge');
        createBtn.className = "glass-card p-6 border-2 border-dashed border-white/10 hover:border-neon-teal/50 hover:bg-white/5 transition-all flex flex-col items-center justify-center text-center gap-4 group h-full min-h-[300px]";
        createBtn.innerHTML = `
            <div class="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow">
                <span class="material-symbols-outlined text-3xl text-neon-teal">add</span>
            </div>
            <div>
                <h3 class="font-bold text-lg group-hover:text-neon-teal transition-colors">Crear Nuevo</h3>
                <p class="text-xs text-white/50 mt-1">Lanza un nuevo reto para tu audiencia</p>
            </div>
        `;
        grid.appendChild(createBtn);

    } catch (err) {
        console.error("Error loading challenges:", err);
        // Fallback for missing index
        if (err.message.includes("index")) {
            console.warn("⚠️ Indice faltante, reintentando sin orden...");
            const qFallback = query(collection(db, "challenges"), where("creator.id", "==", orgId));
            const snap = await getDocs(qFallback);
            grid.innerHTML = '';
            snap.forEach(doc => {
                const card = createBusinessChallengeCard({ id: doc.id, ...doc.data() });
                grid.appendChild(card);
            });
        }
    }
}

function createBusinessChallengeCard(challenge) {
    const card = document.createElement('div');
    card.className = "glass-card overflow-hidden group hover:border-neon-teal/30 transition-all animate-fade-in";

    // Reward Icon logic
    const rewardIcon = challenge.reward?.icon || '🏆';
    const rewardBg = challenge.reward?.style?.bgGradient ?
        `linear-gradient(${challenge.reward.style.bgGradient.angle}deg, ${challenge.reward.style.bgGradient.c1}, ${challenge.reward.style.bgGradient.c2})` :
        (challenge.reward?.style?.bgSolid || '#333');

    card.innerHTML = `
        <!-- Header Image -->
        <div class="h-32 w-full bg-cover bg-center relative" style="background-image: ${challenge.imageGradient || 'linear-gradient(135deg, #00f5d4, #00d2ff)'}">
            <div class="absolute inset-0 bg-black/40"></div>
            <div class="absolute top-3 right-3 flex gap-2">
                 <span class="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[9px] font-bold text-white uppercase tracking-widest border border-white/10">
                    ${challenge.category}
                </span>
            </div>
            
            <!-- Floating Reward Icon -->
            <div class="absolute -bottom-6 left-6 h-12 w-12 rounded-full p-[2px] shadow-lg" style="background: ${rewardBg}">
                <div class="h-full w-full rounded-full bg-navy-900 flex items-center justify-center text-xl overflow-hidden">
                    ${challenge.reward?.image ? `<img src="${challenge.reward.image}" class="h-full w-full object-contain p-1">` : rewardIcon}
                </div>
            </div>
        </div>

        <!-- Body -->
        <div class="p-6 pt-10">
            <h3 class="text-xl font-bold text-white group-hover:text-neon-teal transition-colors truncate">${challenge.name}</h3>
            <p class="text-xs text-white/50 mb-4 line-clamp-2 h-8">${challenge.description}</p>
            
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Meta</p>
                    <p class="text-sm font-black text-neon-teal italic">${challenge.metric}</p>
                </div>
                <div class="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">Participantes</p>
                    <p class="text-sm font-black text-white italic">${challenge.participants || 0}</p>
                </div>
            </div>

            <!-- Footer Stats -->
            <div class="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-wider">
                <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm">calendar_today</span>
                    ${challenge.period}
                </div>
                <div class="flex items-center gap-2">
                    <button class="hover:text-white transition-colors" onclick="editBusinessChallenge('${challenge.id}')">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button class="hover:text-red-400 transition-colors" onclick="deleteChallengeItem('${challenge.id}')">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

window.deleteChallengeItem = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este desafío?')) return;
    try {
        await deleteDoc(doc(db, "challenges", id));
        showToast('Desafío eliminado');
        loadChallenges(dshstate.organization.id);
    } catch (e) {
        console.error(e);
        showToast('Error al eliminar', 'error');
    }
};

window.editBusinessChallenge = (id) => {
    const challenge = dshstate.loadedChallenges.find(c => c.id === id);
    if (!challenge) return showToast('No se encontró el desafío', 'error');

    dshstate.editingChallengeId = id;

    // Fill basic info
    document.getElementById('ccName').value = challenge.name;
    document.getElementById('ccDesc').value = challenge.description || '';

    // Dates
    if (challenge.startDate) document.getElementById('ccStart').value = challenge.startDate.split('T')[0];
    if (challenge.endDate) document.getElementById('ccEnd').value = challenge.endDate.split('T')[0];

    // Goal
    document.getElementById('ccGoalType').value = challenge.goalType || 'cumulative';
    window.setGoalType(challenge.goalType || 'cumulative');

    if (challenge.goalType === 'cumulative') {
        const [val, unit] = challenge.metric.split(' ');
        document.getElementById('ccGoalValue').value = val;
        document.getElementById('ccUnit').value = unit || 'Km';
    } else {
        const [days] = challenge.metric.split(' ');
        document.getElementById('ccDays').value = days;
        document.getElementById('ccDailyMin').value = challenge.dailyThreshold || '';
    }

    // Category / Sports
    dshstate.newChallenge.sports = challenge.allowedSports || [];
    // Reset visual sports selection
    document.querySelectorAll('.sport-pill').forEach(pill => {
        const sport = pill.dataset.sport;
        if (dshstate.newChallenge.sports.includes(sport)) {
            pill.classList.add('active', 'border-neon-teal', 'bg-neon-teal/10', 'text-neon-teal');
        } else {
            pill.classList.remove('active', 'border-neon-teal', 'bg-neon-teal/10', 'text-neon-teal');
        }
    });

    // Visibility
    if (challenge.visibility) {
        const vis = challenge.visibility;
        window.setScope(vis.scope || 'local');
        document.getElementById('ccLat').value = vis.location?.lat || '';
        document.getElementById('ccLng').value = vis.location?.lng || '';
        document.getElementById('ccRadius').value = vis.radius || 20;
        updateRadiusLabel(vis.radius || 20);

        if (vis.location?.lat && vis.location?.lng) {
            updateChallengeCoords(vis.location.lat, vis.location.lng);
        }
    }

    // Badge
    if (challenge.reward?.badgeId) {
        document.getElementById('ccSelectedBadgeId').value = challenge.reward.badgeId;
        // Trigger preview update
        renderBadgeCatalogSelect();
    }

    showSection('createChallenge');

    // Update button text
    const btn = document.getElementById('btnCreate');
    if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined">save</span> Guardar Cambios`;
    }
};

// ==========================================
// 6. RECOMPENSAS VINCULADAS (Desafíos)
// ==========================================

window.renderBadgeCatalogSelect = () => {
    const container = document.getElementById('badgeCatalogList');
    if (!container) return;

    if (dshstate.loadedBadges.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-8 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                <p class="text-xs text-white/40 mb-3">No tienes insignias en tu librería</p>
                <button onclick="window.showSection('badges')" class="text-neon-teal text-[10px] font-bold uppercase tracking-widest hover:underline">
                    + Crear mi primera insignia
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = dshstate.loadedBadges.map(badge => {
        let bgStyle = '#333';
        if (badge.style) {
            if (badge.style.bgType === 'gradient' && badge.style.bgGradient) {
                bgStyle = `linear-gradient(${badge.style.bgGradient.angle}deg, ${badge.style.bgGradient.c1}, ${badge.style.bgGradient.c2})`;
            } else if (badge.style.bgSolid) {
                bgStyle = badge.style.bgSolid;
            }
        }

        const iconHtml = (badge.type === 'emoji' || !badge.type)
            ? `<span class="text-xl">${badge.content || badge.emoji || '🏆'}</span>`
            : `<img src="${badge.content || badge.image}" class="h-6 w-6 object-contain">`;

        return `
            <div onclick="selectBadgeForChallenge('${badge.id}')" 
                class="badge-select-item flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 hover:border-neon-teal/50 hover:bg-neon-teal/5 transition-all cursor-pointer group"
                id="select-badge-${badge.id}">
                <div class="h-12 w-12 rounded-full p-[1px]" style="background: ${bgStyle}">
                    <div class="h-full w-full rounded-full bg-navy-900 flex items-center justify-center overflow-hidden">
                        ${iconHtml}
                    </div>
                </div>
                <p class="text-[9px] font-bold text-white/60 group-hover:text-white truncate w-full text-center">${badge.name}</p>
            </div>
        `;
    }).join('');
};

window.selectBadgeForChallenge = (badgeId) => {
    const badge = dshstate.loadedBadges.find(b => b.id === badgeId);
    if (!badge) return;

    // UI Update (Visual selection)
    const allItems = document.querySelectorAll('.badge-select-item');
    allItems.forEach(item => {
        item.classList.remove('border-neon-teal', 'bg-neon-teal/10');
        item.classList.add('border-white/10', 'bg-white/5');
    });

    const selectedItem = document.getElementById(`select-badge-${badgeId}`);
    if (selectedItem) {
        selectedItem.classList.remove('border-white/10', 'bg-white/5');
        selectedItem.classList.add('border-neon-teal', 'bg-neon-teal/10');
    }

    // Persistent State
    document.getElementById('ccSelectedBadgeId').value = badgeId;

    // Update Big Preview
    updateChallengeBadgePreview(badge);
    showToast(`Insignia "${badge.name}" seleccionada`);
};

function updateChallengeBadgePreview(badge) {
    const previewContainer = document.getElementById('challengeBadgePreview');
    const nameDisplay = document.getElementById('challengeBadgeNameDisplay');
    if (!previewContainer) return;

    let bgStyle = '#333';
    if (badge.style) {
        if (badge.style.bgType === 'gradient' && badge.style.bgGradient) {
            bgStyle = `linear-gradient(${badge.style.bgGradient.angle}deg, ${badge.style.bgGradient.c1}, ${badge.style.bgGradient.c2})`;
        } else if (badge.style.bgSolid) {
            bgStyle = badge.style.bgSolid;
        }
    }

    const contentHtml = (badge.type === 'emoji' || !badge.type)
        ? `<span class="text-4xl filter drop-shadow-md">${badge.content || badge.emoji || '🏆'}</span>`
        : `<img src="${badge.content || badge.image}" class="h-12 w-12 object-contain filter drop-shadow-md">`;

    previewContainer.style.background = bgStyle;
    previewContainer.innerHTML = contentHtml;
    if (nameDisplay) nameDisplay.innerText = badge.name;

    // Add shine effect
    previewContainer.classList.add('shadow-glow');
}

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
        try { dshstate.rewardsLibrary = JSON.parse(savedRewards); } catch (e) { }
    }

    if (dshstate.rewardsLibrary.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center text-white/40">
                <span class="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                <p>No tienes recompensas creadas.</p>
            </div>`;
    } else {
        dshstate.rewardsLibrary.forEach(reward => {
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
    dshstate.editingRewardId = null;

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
    const reward = dshstate.rewardsLibrary.find(r => r.id === id);
    if (!reward) return;

    dshstate.editingRewardId = id;

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

window.deleteReward = async (id) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta recompensa?')) return;

    try {
        await deleteDoc(doc(db, 'rewards', id));

        const index = dshstate.rewardsLibrary.findIndex(r => r.id === id);
        if (index !== -1) {
            dshstate.rewardsLibrary.splice(index, 1);
            renderRewardsLibrary();
            showToast('Recompensa eliminada', 'success');
        }
    } catch (e) {
        console.error("Error deleting reward:", e);
        showToast('Error al eliminar recompensa', 'error');
    }
};


// Funciones de Recompensa ELIMINADAS


// Ensure render on load
document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage loading REMOVED to prioritize Firestore source of truth.
    // Logic moved to bootstrapDashboard -> loadRewards
});

// 6.b LOGIC FOR REWARDS PERSISTENCE
async function loadRewards(orgId) {
    try {
        const q = query(collection(db, 'rewards'), where('orgId', '==', orgId), orderBy('updatedAt', 'desc')); // Updated ordering
        const querySnapshot = await getDocs(q);
        console.log("🔥 [DEBUG] loadRewards Query Results:", querySnapshot.size, "docs found for OrgID:", orgId);

        dshstate.rewardsLibrary = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("   -> Doc:", doc.id, data);
            dshstate.rewardsLibrary.push({ id: doc.id, ...data });
        });
        renderRewardsLibrary();
    } catch (e) {
        // Fallback for missing index error
        if (e.message.includes("The query requires an index")) {
            console.warn("⚠️ Firestore Index Missing via orderBy. Falling back to unordered.");
            const qFallback = query(collection(db, 'rewards'), where('orgId', '==', orgId));
            const snap = await getDocs(qFallback);
            console.log("🔥 [FALLBACK] Recuperados:", snap.size, "docs (Sin Orden)");
            dshstate.rewardsLibrary = [];
            snap.forEach(d => {
                const data = d.data();
                console.log("   -> [FB] Doc:", d.id, data);
                dshstate.rewardsLibrary.push({ id: d.id, ...data });
            });
            renderRewardsLibrary();
        } else {
            console.error("Error loading rewards:", e);
        }
    }
}

function renderRewardsLibrary() {
    const list = document.getElementById('rewardsList');
    if (!list) return;

    list.innerHTML = '';
    dshstate.rewardsLibrary.forEach((reward, index) => {
        const item = document.createElement('div');
        item.className = "p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3 group hover:border-white/10 transition-colors animate-fade-in";
        item.innerHTML = `
            <div class="h-10 w-10 rounded-lg bg-[#0f172a] flex items-center justify-center text-xl">
                ${reward.icon || '🎁'}
            </div>
            <div class="flex-1">
                <p class="font-bold text-white text-sm">${reward.name}</p>
                <p class="text-[10px] text-white/40 truncate">${reward.description || 'Sin descripción'}</p>
            </div>
            <button class="text-white/20 hover:text-red-400 transition-colors" onclick="deleteReward('${reward.id}', ${index})">
                <span class="material-symbols-outlined text-sm">delete</span>
            </button>
        `;
        list.appendChild(item);
    });
}

window.deleteReward = async (id, index) => {
    if (!confirm('¿Eliminar esta recompensa?')) return;
    try {
        await deleteDoc(doc(db, 'rewards', id));
        dshstate.rewardsLibrary.splice(index, 1);
        renderRewardsLibrary();
        showToast('Recompensa eliminada');
    } catch (e) {
        console.error(e);
        showToast('Error al eliminar', 'error');
    }
};

window.renderRewardsLibrary = renderRewardsLibrary; // Expose globally

// Init listener changed
document.addEventListener('DOMContentLoaded', () => {
    // ... existing init code ...
});


// Navigation Hacks Removed - Restoring clean flow


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

// ==========================================
// 8. NUEVAS FUNCIONES DE PERSISTENCIA
// ==========================================

window.saveReward = async () => {
    const name = document.getElementById('rewardNameInput').value.trim();
    if (!name) return showToast('Nombre del premio requerido', 'error');

    const desc = document.getElementById('rewardDescInput').value.trim();
    const icon = document.getElementById('rewardIconInput').value;

    showToast('Guardando recompensa...', 'info');

    try {
        await addDoc(collection(db, 'rewards'), {
            name,
            description: desc,
            icon,
            orgId: dshstate.organization.id || ORG_ID,
            createdAt: serverTimestamp(),
            active: true
        });

        showToast('¡Recompensa guardada!', 'success');
        closeCreateRewardModal();
    } catch (e) {
        console.error(e);
        showToast('Error al guardar recompensa', 'error');
    }
};

window.saveBrandProfile = async () => {
    const brandName = document.getElementById('brandName')?.value;
    const brandHandle = document.getElementById('brandHandle')?.value;
    const brandBio = document.getElementById('brandBio')?.value;
    const brandFullDesc = document.getElementById('brandFullDesc')?.value;
    const brandAddress = document.getElementById('brandAddress')?.value;
    const brandCTAUrl = document.getElementById('brandCTAUrl')?.value;
    const brandIG = document.getElementById('brandIG')?.value;
    const brandWA = document.getElementById('brandWA')?.value;

    if (!brandName) return showToast('Nombre de marca requerido', 'error');
    showToast('Actualizando perfil...', 'info');

    try {
        const companyRef = doc(db, 'companies', ORG_ID);
        const updateData = {
            name: brandName,
            handle: brandHandle,
            bio: brandBio,
            description: brandFullDesc,
            address: brandAddress,
            ctaUrl: brandCTAUrl,
            instagram: brandIG,
            whatsapp: brandWA,
            updatedAt: serverTimestamp()
        };

        // Incluir imágenes si hay cambios pendientes
        if (dshstate.pendingLogo) updateData.logoURL = dshstate.pendingLogo;
        if (dshstate.pendingCover) updateData.coverURL = dshstate.pendingCover;

        await setDoc(companyRef, updateData, { merge: true });

        // Actualizar estado local
        dshstate.organization = {
            ...dshstate.organization,
            ...updateData
        };

        // Limpiar pendientes
        delete dshstate.pendingLogo;
        delete dshstate.pendingCover;

        showToast('Perfil actualizado correctamente', 'success');
        updateOrganizationUI();
    } catch (e) {
        console.error(e);
        showToast('Error al actualizar perfil', 'error');
    }
};

window.handleBrandImageUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamaño (Base64 puede ser pesado, limitar a ~2MB por seguridad de Firestore doc limit 1MB, pero let's try 500KB)
    if (file.size > 800000) {
        showToast('La imagen es demasiado pesada (Máx 800KB)', 'error');
        return;
    }

    try {
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

        if (type === 'logo') {
            dshstate.pendingLogo = base64;
            const preview = document.getElementById('logoPreview');
            const placeholder = document.getElementById('logoPlaceholder');
            if (preview) {
                preview.src = base64;
                preview.classList.remove('hidden');
            }
            if (placeholder) placeholder.classList.add('hidden');
        } else {
            state.pendingCover = base64;
            const preview = document.getElementById('coverPreview');
            const placeholder = document.getElementById('coverPlaceholder');
            if (preview) {
                preview.src = base64;
                preview.classList.remove('hidden');
            }
            if (placeholder) placeholder.classList.add('hidden');
        }

        showToast('Imagen lista (clic en Guardar para confirmar)');
    } catch (err) {
        console.error('Error procesando imagen:', err);
        showToast('Error al cargar la imagen', 'error');
    }
};





// ==========================================
// 10. VISIBILIDAD Y ALCANCE ESTRATÉGICO
// ==========================================

window.setScope = (scope) => {
    document.getElementById('ccScope').value = scope;
    const settings = document.getElementById('localSettings');

    // UI Feedback for Scope buttons
    ['Local', 'National', 'Global'].forEach(s => {
        const btn = document.getElementById(`scope${s}`);
        if (s.toLowerCase() === scope) {
            btn.classList.add('border-neon-teal', 'bg-neon-teal/10', 'text-neon-teal');
            btn.classList.remove('border-white/5', 'bg-white/5', 'text-white/30');
        } else {
            btn.classList.remove('border-neon-teal', 'bg-neon-teal/10', 'text-neon-teal');
            btn.classList.add('border-white/5', 'bg-white/5', 'text-white/30');
        }
    });

    if (scope === 'local') {
        settings.classList.remove('hidden');
        setTimeout(() => { if (challengeMap) challengeMap.invalidateSize(); }, 300);
    } else {
        settings.classList.add('hidden');
        if (scope !== 'local') {
            showToast(`Modo ${scope.toUpperCase()} seleccionado (Plan Pro)`, 'info');
        }
    }
};

window.initChallengeMap = () => {
    if (challengeMap) return;
    const mapContainer = document.getElementById('challengeMap');
    if (!mapContainer) return;

    // CDMX Default
    const defaultPos = [19.4326, -99.1332];

    challengeMap = L.map('challengeMap', {
        zoomControl: false,
        attributionControl: false
    }).setView(defaultPos, 11);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(challengeMap);

    challengeMarker = L.marker(defaultPos, { draggable: true }).addTo(challengeMap);
    challengeCircle = L.circle(defaultPos, {
        color: '#00f5d4',
        fillColor: '#00f5d4',
        fillOpacity: 0.1,
        radius: 20000 // 20km default
    }).addTo(challengeMap);

    challengeMarker.on('dragend', function (e) {
        const pos = e.target.getLatLng();
        updateChallengeCoords(pos.lat, pos.lng);
    });

    challengeMap.on('click', function (e) {
        updateChallengeCoords(e.latlng.lat, e.latlng.lng);
    });
};

function updateChallengeCoords(lat, lng) {
    document.getElementById('ccLat').value = lat;
    document.getElementById('ccLng').value = lng;

    if (challengeMarker) challengeMarker.setLatLng([lat, lng]);
    if (challengeCircle) challengeCircle.setLatLng([lat, lng]);
    if (challengeMap) challengeMap.panTo([lat, lng]);

    document.getElementById('locStatus').innerText = "✓ Punto en mapa";
}

window.searchAddress = async () => {
    const query = document.getElementById('addressSearch').value;
    if (!query) return;

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await res.json();

        if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            updateChallengeCoords(lat, lon);
            challengeMap.setZoom(13);
            showToast('Ubicación encontrada');
        } else {
            showToast('No se encontró la dirección', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error en la búsqueda', 'error');
    }
};

window.detectChallengeLocation = () => {
    const status = document.getElementById('locStatus');
    status.innerText = "Localizando...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            updateChallengeCoords(pos.coords.latitude, pos.coords.longitude);
            status.innerText = "✓ Ubicación lista";
            showToast('Ubicación detectada correctamente');
        }, (err) => {
            status.innerText = "Error GPS";
            showToast('No se pudo obtener la ubicación', 'error');
        });
    } else {
        showToast('Geolocalización no soportada', 'error');
    }
};

window.updateRadiusLabel = (val) => {
    const km = parseInt(val);
    document.getElementById('ccRadiusDisplay').innerText = `${km} km`;
    if (challengeCircle) {
        challengeCircle.setRadius(km * 1000);
    }
};

window.resetChallengeForm = () => {
    dshstate.editingChallengeId = null;
    dshstate.newChallenge.sports = [];

    // Basic Info
    const fields = ['ccName', 'ccDesc', 'ccStart', 'ccEnd', 'ccGoalValue', 'ccDays', 'ccDailyMin', 'ccLat', 'ccLng', 'addressSearch', 'ccSelectedBadgeId'];
    fields.forEach(f => {
        const el = document.getElementById(f);
        if (el) el.value = '';
    });

    // Sports Selection UI
    document.querySelectorAll('.sport-pill').forEach(pill => {
        pill.classList.remove('active', 'border-neon-teal', 'bg-neon-teal/10', 'text-neon-teal');
    });

    // Goal Type UI
    document.getElementById('ccGoalType').value = 'cumulative';
    window.setGoalType('cumulative');

    // Visibility UI
    window.setScope('local');
    updateRadiusLabel(20);
    document.getElementById('ccRadius').value = 20;
    document.getElementById('locStatus').innerText = 'No detectada';
    if (challengeMap) {
        const defaultPos = [19.4326, -99.1332];
        updateChallengeCoords(defaultPos[0], defaultPos[1]);
        challengeMap.setView(defaultPos, 11);
    }

    // Badge Preview UI
    const previewContainer = document.getElementById('challengeBadgePreview');
    const nameDisplay = document.getElementById('challengeBadgeNameDisplay');
    if (previewContainer) {
        previewContainer.style.background = '#333';
        previewContainer.innerHTML = '<span class="material-symbols-outlined text-4xl text-white/20">question_mark</span>';
    }
    if (nameDisplay) nameDisplay.innerText = 'Selecciona una insignia';

    // Button Reset
    const btn = document.getElementById('btnCreate');
    if (btn) {
        btn.innerHTML = `<span class="material-symbols-outlined">rocket_launch</span> Lanzar Desafío`;
    }

    // Refresh catalog selection visuals
    renderBadgeCatalogSelect();
};
