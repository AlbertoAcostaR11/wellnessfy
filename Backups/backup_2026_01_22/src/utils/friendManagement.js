// Append to circles.js - Friend management functions
import { AppState } from './state.js';

// Load friend details after rendering
async function loadFriendDetails() {
    const friendCards = document.querySelectorAll('[data-friend-id]');
    if (friendCards.length === 0) return;

    try {
        const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        for (const card of friendCards) {
            const friendId = card.dataset.friendId;
            try {
                const userDoc = await getDoc(doc(db, 'users', friendId));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const nameEl = document.getElementById(`friend-name-${friendId}`);
                    const avatarEl = document.getElementById(`friend-avatar-${friendId}`);

                    if (nameEl) {
                        nameEl.textContent = userData.name || 'Usuario';
                        nameEl.dataset.username = userData.username || 'user';
                    }
                    if (avatarEl) {
                        const avatarUrl = userData.avatar || userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}`;
                        avatarEl.style.backgroundImage = `url('${avatarUrl}')`;
                    }
                }
            } catch (error) {
                console.warn(`Could not load friend ${friendId}:`, error);
            }
        }
    } catch (error) {
        console.error('Error loading friend details:', error);
    }
}

// Manage friend circles (add/remove from circles)
window.manageFriendCircles = async function (friendId) {
    const { showCircleSelectorModal } = await import('../components/CircleSelectorModal.js');

    // Get current circles for this friend
    const currentCircles = [];
    AppState.circles.forEach(circle => {
        if (Array.isArray(circle.members) && circle.members.includes(friendId)) {
            currentCircles.push(circle.id);
        }
    });

    showCircleSelectorModal(
        friendId,
        async (selectedCircleIds) => {
            try {
                const { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                const db = getFirestore();

                // Circles to add (selected but not currently in)
                const toAdd = selectedCircleIds.filter(id => !currentCircles.includes(id));
                // Circles to remove (currently in but not selected)
                const toRemove = currentCircles.filter(id => !selectedCircleIds.includes(id));

                // Update Firestore
                for (const circleId of toAdd) {
                    await updateDoc(doc(db, 'circles', circleId), {
                        members: arrayUnion(friendId)
                    });
                }

                for (const circleId of toRemove) {
                    await updateDoc(doc(db, 'circles', circleId), {
                        members: arrayRemove(friendId)
                    });
                }

                // Update local state
                AppState.circles.forEach(circle => {
                    if (toAdd.includes(circle.id) && Array.isArray(circle.members)) {
                        if (!circle.members.includes(friendId)) {
                            circle.members.push(friendId);
                        }
                    }
                    if (toRemove.includes(circle.id) && Array.isArray(circle.members)) {
                        circle.members = circle.members.filter(id => id !== friendId);
                    }
                });

                window.showToast('Círculos actualizados', 'success');

                // Refresh the page
                const { navigateTo } = await import('../router.js');
                navigateTo('circles');
            } catch (error) {
                console.error('Error updating circles:', error);
                window.showToast('Error al actualizar círculos', 'error');
            }
        },
        currentCircles // Pre-select current circles
    );
};

// Remove friend completely
window.removeFriend = async function (friendId) {
    // Get friend name first
    const nameEl = document.getElementById(`friend-name-${friendId}`);
    const friendName = nameEl ? nameEl.textContent : 'este amigo';

    if (!confirm(`¿Seguro que quieres eliminar a ${friendName} de todos tus círculos?`)) return;

    try {
        const { getFirestore, doc, updateDoc, arrayRemove } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        // Remove from all circles
        for (const circle of AppState.circles) {
            if (Array.isArray(circle.members) && circle.members.includes(friendId)) {
                await updateDoc(doc(db, 'circles', circle.id), {
                    members: arrayRemove(friendId)
                });

                // Update local state
                circle.members = circle.members.filter(id => id !== friendId);
            }
        }

        window.showToast(`${friendName} eliminado de todos los círculos`, 'success');

        // Refresh the page
        const { navigateTo } = await import('../router.js');
        navigateTo('circles');
    } catch (error) {
        console.error('Error removing friend:', error);
        window.showToast('Error al eliminar amigo', 'error');
    }
};

// Export for use in router
window.loadFriendDetails = loadFriendDetails;

console.log('✅ Friend management functions loaded');
