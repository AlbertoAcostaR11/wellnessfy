
import { AppState } from './state.js';

/**
 * Loads suggested users from Firestore to replace mocks with real data
 */
export async function loadSuggestedUsers() {
    console.log('✨ Loading real suggested users...');

    // Lista de usuarios "VIP" o sugeridos para visualizar
    const TARGET_USERS = ['Alberto Acosta', 'Gaby Garza', 'José Ramírez', 'Facturino'];
    const SPORT_MAPPING = {
        'Alberto Acosta': 'Running',
        'Gaby Garza': 'Hiking',
        'José Ramírez': 'Pesas',
        'Facturino': 'Meditación'
    };

    const container = document.getElementById('suggested-users-container');
    if (!container) return;

    try {
        const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const q = query(collection(db, 'users'), where('name', 'in', TARGET_USERS));
        const snapshot = await getDocs(q);

        const users = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            users.push({
                id: doc.id,
                ...data,
                // Si no hay avatar, usar fallback
                avatar: data.avatar || data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`
            });
        });

        // Ordenar según el orden de TARGET_USERS para mantener consistencia visual
        users.sort((a, b) => {
            return TARGET_USERS.indexOf(a.name) - TARGET_USERS.indexOf(b.name);
        });

        // Filter out current user
        const currentUserId = AppState.currentUser.uid || AppState.currentUser.id;
        const currentUserName = AppState.currentUser.name;

        const filteredUsers = users.filter(user => {
            // Check ID and Name to be sure
            return user.id !== currentUserId && user.name !== currentUserName;
        });

        if (filteredUsers.length > 0) {
            container.innerHTML = filteredUsers.map(user => {
                const sport = SPORT_MAPPING[user.name] || 'Deportista';
                return renderUserSuggestionCard(user.name, user.username || '@user', sport, user.avatar, user.id);
            }).join('');
        } else {
            console.warn('No suggested users found in DB (after filtering)');
            container.innerHTML = '<div class="text-white/50 text-xs p-4">No hay sugerencias disponibles</div>';
        }

    } catch (error) {
        console.error('Error loading suggested users:', error);
        // Fallback
        container.innerHTML = '<div class="text-red-400 text-xs p-4">Error cargando sugerencias</div>';
    }
}

function renderUserSuggestionCard(name, username, sport, img, uid) {
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
    return `
        <div class="min-w-[140px] flex-shrink-0 snap-center bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer relative group" onclick="window.viewUserProfile('${uid}')">
            <button class="absolute top-2 right-2 size-6 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-[#00f5d4] hover:bg-[#00f5d4]/20 transition-all" onclick="event.stopPropagation(); window.sendFriendRequest('${uid}')">
                <span class="material-symbols-outlined text-sm">person_add</span>
            </button>
            <div class="size-16 rounded-full border-2 border-white/10 group-hover:border-[#00f5d4] overflow-hidden relative bg-black">
                 <img src="${img}" alt="${name}" 
                     class="w-full h-full object-cover"
                     onerror="this.onerror=null; this.src='${fallback}';"
                />
            </div>
            <div class="text-center w-full">
                <h3 class="font-bold text-white text-xs truncate w-full">${name}</h3>
                <p class="text-[10px] text-[#00f5d4] truncate">${sport}</p>
            </div>
        </div>
    `;
}

// Expose to window
window.loadSuggestedUsers = loadSuggestedUsers;
