
import { getUserCircles } from '../utils/friendshipManager.js';

/**
 * Circle Selector Modal - Google+ Style
 * Allows users to select which circles to add a friend to
 */

let currentFriendData = null;
let customCallback = null;

/**
 * Show circle selector modal
 * @param {string} friendUserId - Friend's user ID
 * @param {string|function} friendNameOrCallback - Friend's display name OR callback function
 * @param {string} friendUsername - Friend's username (optional if using callback)
 * @param {string} notifId - Notification ID (optional if using callback)
 * @param {Array<string>} preselectedCircles - Array of circle IDs to pre-select (optional)
 */
export async function showCircleSelectorModal(friendUserId, friendNameOrCallback, friendUsername, notifId, preselectedCircles = []) {
    // Check if this is callback mode (for managing existing friends)
    if (typeof friendNameOrCallback === 'function') {
        customCallback = friendNameOrCallback;
        currentFriendData = { friendUserId, isCallbackMode: true };
    } else {
        // Original mode (for friend requests)
        currentFriendData = { friendUserId, friendName: friendNameOrCallback, friendUsername, notifId, isCallbackMode: false };
        customCallback = null;
    }

    // Fetch user's circles
    const circles = await getUserCircles();

    // Create modal HTML
    const modalHTML = `
        <div id="circleSelectorModal" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in" style="background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px);">
            <div class="glass-card border-white/10 rounded-3xl p-6 max-w-md w-full animate-scale-in shadow-2xl">
                <!-- Header -->
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-xl font-bold text-white">${currentFriendData.isCallbackMode ? 'Gestionar Círculos' : 'Agregar a Círculos'}</h2>
                        ${!currentFriendData.isCallbackMode ? `
                            <p class="text-sm text-white/60 mt-1">
                                Selecciona dónde agregar a <span class="text-[#00f5d4] font-bold">@${friendUsername}</span>
                            </p>
                        ` : `
                            <p class="text-sm text-white/60 mt-1">
                                Selecciona los círculos para este amigo
                            </p>
                        `}
                    </div>
                    <button onclick="closeCircleSelectorModal()" class="size-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                        <span class="material-symbols-outlined text-white/60 text-lg">close</span>
                    </button>
                </div>

                <!-- Circles List -->
                <div id="circlesList" class="space-y-2 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                    ${circles.length > 0 ? renderCirclesList(circles, preselectedCircles) : renderEmptyCircles()}
                </div>

                <!-- Create New Circle Button -->
                <button onclick="showCreateCircleInline()" class="w-full px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white/80 transition-all flex items-center justify-center gap-2 mb-4">
                    <span class="material-symbols-outlined text-lg">add_circle</span>
                    Crear nuevo círculo
                </button>

                <!-- Actions -->
                <div class="flex gap-3">
                    <button onclick="closeCircleSelectorModal()" class="flex-1 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white/60 transition-all">
                        Cancelar
                    </button>
                    <button onclick="confirmCircleSelection()" id="confirmCirclesBtn" class="flex-1 px-4 py-3 rounded-xl bg-[#00f5d4] hover:bg-[#00d4b8] text-navy-900 text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,245,212,0.3)] disabled:opacity-50 disabled:cursor-not-allowed" ${preselectedCircles.length === 0 ? 'disabled' : ''}>
                        ${currentFriendData.isCallbackMode ? 'Guardar' : 'Agregar'} <span id="selectedCount" class="ml-1">(${preselectedCircles.length})</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert modal into DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add event listeners to checkboxes
    updateCheckboxListeners();
}

function renderCirclesList(circles, preselectedCircles = []) {
    return circles.map(circle => `
        <label class="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group">
            <input type="checkbox" 
                   class="circle-checkbox size-5 rounded border-2 border-white/20 bg-white/5 checked:bg-[#00f5d4] checked:border-[#00f5d4] cursor-pointer transition-all"
                   data-circle-id="${circle.id}"
                   ${preselectedCircles.includes(circle.id) ? 'checked' : ''}
                   onchange="updateSelectedCount()">
            <div class="flex-1">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-[#00f5d4] text-lg">
                        ${circle.icon || 'group'}
                    </span>
                    <span class="font-bold text-white text-sm">${circle.name}</span>
                </div>
                ${circle.members && circle.members.length > 0 ?
            `<p class="text-xs text-white/40 mt-0.5">${circle.members.length} ${circle.members.length === 1 ? 'miembro' : 'miembros'}</p>`
            : ''}
            </div>
        </label>
    `).join('');
}

function renderEmptyCircles() {
    return `
        <div class="flex flex-col items-center justify-center py-8 text-center">
            <div class="size-16 rounded-full bg-white/5 flex items-center justify-center mb-3 border border-white/10">
                <span class="material-symbols-outlined text-3xl text-white/20">group_off</span>
            </div>
            <p class="text-white/60 text-sm font-bold">No tienes círculos aún</p>
            <p class="text-white/30 text-xs mt-1">Crea tu primer círculo para organizar tus contactos</p>
        </div>
    `;
}

function updateCheckboxListeners() {
    const checkboxes = document.querySelectorAll('.circle-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedCount);
    });
}

window.updateSelectedCount = function () {
    const checkboxes = document.querySelectorAll('.circle-checkbox:checked');
    const count = checkboxes.length;

    const countSpan = document.getElementById('selectedCount');
    const confirmBtn = document.getElementById('confirmCirclesBtn');

    if (countSpan) {
        countSpan.textContent = `(${count})`;
    }

    if (confirmBtn) {
        confirmBtn.disabled = count === 0;
    }
};

window.closeCircleSelectorModal = function () {
    const modal = document.getElementById('circleSelectorModal');
    if (modal) {
        modal.classList.add('animate-fade-out');
        setTimeout(() => modal.remove(), 200);
    }
    currentFriendData = null;
    customCallback = null;
};

window.confirmCircleSelection = async function () {
    if (!currentFriendData) return;

    const checkboxes = document.querySelectorAll('.circle-checkbox:checked');
    const selectedCircleIds = Array.from(checkboxes).map(cb => cb.dataset.circleId);

    if (selectedCircleIds.length === 0 && !currentFriendData.isCallbackMode) {
        window.showToast('Selecciona al menos un círculo', 'error');
        return;
    }

    // Disable button and show loading
    const confirmBtn = document.getElementById('confirmCirclesBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span>';
    }

    try {
        if (currentFriendData.isCallbackMode && customCallback) {
            // Use custom callback for friend management
            await customCallback(selectedCircleIds);
        } else {
            // Original flow for friend requests
            await window.acceptFriendRequestWithCircles(
                currentFriendData.friendUserId,
                selectedCircleIds,
                currentFriendData.notifId
            );
        }
    } catch (error) {
        console.error('Error in circle selection:', error);
        window.showToast('Error al procesar la solicitud', 'error');
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = `${currentFriendData.isCallbackMode ? 'Guardar' : 'Agregar'} <span id="selectedCount">(${selectedCircleIds.length})</span>`;
        }
        return;
    }

    // Close modal
    window.closeCircleSelectorModal();
};

window.showCreateCircleInline = async function () {
    const circlesList = document.getElementById('circlesList');
    if (!circlesList) return;

    // Check if inline form already exists
    if (document.getElementById('inlineCircleForm')) return;

    const inlineFormHTML = `
        <div id="inlineCircleForm" class="p-4 rounded-xl bg-[#00f5d4]/10 border-2 border-[#00f5d4]/30 animate-scale-in">
            <div class="flex items-center gap-2 mb-3">
                <span class="material-symbols-outlined text-[#00f5d4]">add_circle</span>
                <h3 class="font-bold text-white text-sm">Nuevo Círculo</h3>
            </div>
            <input type="text" 
                   id="newCircleName" 
                   placeholder="Nombre del círculo (ej: Familia, Trabajo...)"
                   class="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00f5d4] transition-all mb-3"
                   maxlength="30">
            <div class="flex gap-2">
                <button onclick="cancelInlineCircleCreate()" class="flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 transition-all">
                    Cancelar
                </button>
                <button onclick="createCircleAndSelect()" class="flex-1 px-3 py-2 rounded-lg bg-[#00f5d4] hover:bg-[#00d4b8] text-navy-900 text-xs font-black uppercase tracking-wider transition-all">
                    Crear
                </button>
            </div>
        </div>
    `;

    circlesList.insertAdjacentHTML('afterbegin', inlineFormHTML);

    // Focus on input
    const input = document.getElementById('newCircleName');
    if (input) {
        input.focus();
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.createCircleAndSelect();
            }
        });
    }
};

window.cancelInlineCircleCreate = function () {
    const form = document.getElementById('inlineCircleForm');
    if (form) {
        form.classList.add('animate-fade-out');
        setTimeout(() => form.remove(), 200);
    }
};

window.createCircleAndSelect = async function () {
    const input = document.getElementById('newCircleName');
    if (!input) return;

    const circleName = input.value.trim();

    if (!circleName) {
        window.showToast('Ingresa un nombre para el círculo', 'error');
        input.focus();
        return;
    }

    try {
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();
        const currentUser = window.AppState?.currentUser;

        if (!currentUser) {
            window.showToast('Error: Usuario no encontrado', 'error');
            return;
        }

        const currentUserId = currentUser.uid || currentUser.id;

        // Create new circle
        const newCircle = {
            name: circleName,
            createdBy: currentUserId,
            members: [],
            icon: 'group',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'circles'), newCircle);

        // Refresh circles list
        const circles = await getUserCircles();
        const circlesList = document.getElementById('circlesList');

        if (circlesList) {
            circlesList.innerHTML = renderCirclesList(circles);
            updateCheckboxListeners();

            // Auto-select the newly created circle
            const newCheckbox = document.querySelector(`input[data-circle-id="${docRef.id}"]`);
            if (newCheckbox) {
                newCheckbox.checked = true;
                updateSelectedCount();
            }
        }

        window.showToast(`✅ Círculo "${circleName}" creado`, 'success');

    } catch (error) {
        console.error('Error creating circle:', error);
        window.showToast('Error al crear círculo', 'error');
    }
};

// Make function globally available
window.showCircleSelectorModal = showCircleSelectorModal;

console.log('✅ Circle Selector Modal loaded');
