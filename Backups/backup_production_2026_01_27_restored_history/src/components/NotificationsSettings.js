
import { AppState } from '../utils/state.js';
// Dynamic imports for Firebase are handled inside functions to ensure stability

const CATEGORIES = [
    { id: 'social', title: 'Social', icon: 'favorite' },
    { id: 'friend_requests', title: 'Solicitudes de Amistad', icon: 'person_add' },
    { id: 'challenges', title: 'Desafíos', icon: 'emoji_events' },
    { id: 'goals', title: 'Objetivos y Logros', icon: 'track_changes' },
    { id: 'activity', title: 'Recordatorios de Actividad', icon: 'directions_run' },
    { id: 'wellness', title: 'Bienestar y Mindfulness', icon: 'self_improvement' }
];

export function renderNotificationsSettings() {
    const user = AppState.currentUser || {};
    // Ensure prefs object exists
    if (!user.notificationPreferences) user.notificationPreferences = {};
    const prefs = user.notificationPreferences;

    // Check if ALL categories are enabled
    // We consider it "All enabled" if every category in our list is explicitly true or undefined (default true)
    // Actually, safer to check if NONE are false.
    const areAllEnabled = CATEGORIES.every(cat => prefs[cat.id] !== false);

    // Master permission check (visual only if false, we show distinct state?)
    // If system permission is denied, everything should visually look disabled or warn user.
    const systemPermission = Notification.permission === 'granted';

    return `
        <div class="space-y-1">
            <!-- Master Header "TODAS" -->
             <div class="flex items-center justify-between p-4 bg-white/5 border-b border-white/5">
                <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full bg-[#7000ff]/10 flex items-center justify-center border border-[#7000ff]/20">
                        <span class="material-symbols-outlined text-[#7000ff]">notifications</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-white">Todas</p>
                        <p class="text-[10px] text-white/50">Activar o pausar todas las notificaciones</p>
                    </div>
                </div>
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" 
                           id="masterNotifToggle" 
                           ${areAllEnabled && systemPermission ? 'checked' : ''} 
                           class="sr-only peer" 
                           onchange="window.toggleMasterNotifications(this.checked)">
                    <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7000ff]"></div>
                </label>
            </div>

            <!-- Warning if System Permission is Denied -->
            <div id="systemPermissionWarning" class="${Notification.permission === 'denied' ? 'block' : 'hidden'} px-4 py-2 bg-rose-500/10 border-b border-rose-500/20">
                <p class="text-[10px] text-rose-300 flex items-center gap-2">
                    <span class="material-symbols-outlined text-sm">block</span>
                    Las notificaciones están bloqueadas por el navegador. Habilítalas en la barra de dirección.
                </p>
            </div>

            <!-- Categories List -->
            <div class="divide-y divide-white/5">
                ${CATEGORIES.map(cat => {
        const isChecked = prefs[cat.id] !== false; // Default to true
        return `
                        <div class="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                            <div class="flex items-center gap-3">
                                <span class="material-symbols-outlined text-white/40 group-hover:text-white/80 transition-colors text-lg">${cat.icon}</span>
                                <span class="text-sm font-medium text-white/80 group-hover:text-white transition-colors">${cat.title}</span>
                            </div>
                            <label class="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" 
                                       class="sr-only peer sub-notif-toggle" 
                                       data-cat-id="${cat.id}"
                                       ${isChecked ? 'checked' : ''} 
                                       onchange="window.toggleSingleCategory('${cat.id}', this.checked)">
                                <div class="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#7000ff]"></div>
                            </label>
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
}

// --- Logic Implementation ---

window.toggleMasterNotifications = async function (enable) {
    const masterSwitch = document.getElementById('masterNotifToggle');

    // 1. Permission Check (Only if enabling)
    if (enable && Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            // User denied, revert switch
            masterSwitch.checked = false;
            if (window.showToast) window.showToast('Permiso nativo requerido', 'error');
            return;
        }
    }

    // 2. Update All Categories locally
    const user = AppState.currentUser;
    if (!user.notificationPreferences) user.notificationPreferences = {};

    const subSwitches = document.querySelectorAll('.sub-notif-toggle');

    CATEGORIES.forEach(cat => {
        user.notificationPreferences[cat.id] = enable;
    });

    // 3. Update Visuals
    subSwitches.forEach(sw => {
        sw.checked = enable;
    });

    // 4. Persist
    savePreferences(user);
};


window.toggleSingleCategory = function (catId, enable) {
    const user = AppState.currentUser;
    if (!user.notificationPreferences) user.notificationPreferences = {};

    user.notificationPreferences[catId] = enable;

    // Check Master Switch State logic
    // If explicit disable -> Master OFF
    // If enable -> Check if ALL others are authorized
    const masterSwitch = document.getElementById('masterNotifToggle');

    if (!enable) {
        masterSwitch.checked = false;
    } else {
        // Check if all others are strictly true
        const allTrue = CATEGORIES.every(c => user.notificationPreferences[c.id] !== false);
        masterSwitch.checked = allTrue;

        // If enabling a category, assume we need system permission if not present
        if (Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    }

    savePreferences(user);
};

// --- Helper Persist ---
async function savePreferences(user) {
    AppState.currentUser = user;
    if (window.saveUserData) window.saveUserData();

    // Cloud Sync
    try {
        const { getFirestore, doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const { app } = await import('../config/firebaseInit.js');
        const db = getFirestore(app);

        if (user.uid) {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                notificationPreferences: user.notificationPreferences
            });
            console.log('☁️ Notification prefs synced');
        }
    } catch (e) {
        console.warn('Sync error:', e);
    }
}
