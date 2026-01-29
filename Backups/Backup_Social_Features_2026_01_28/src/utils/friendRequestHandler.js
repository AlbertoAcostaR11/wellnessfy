
import { AppState } from './state.js';

/**
 * Send Friend Request with Deduplication Logic
 * Prevents duplicate notifications by checking for existing pending requests
 */
window.sendFriendRequest = async function (targetUserId) {
    if (!targetUserId) return;

    const currentUser = AppState.currentUser;
    if (!currentUser) {
        window.showToast('Debes iniciar sesión', 'error');
        return;
    }

    const currentUserId = currentUser.uid || currentUser.id;

    // Prevent sending request to self
    if (currentUserId === targetUserId) {
        window.showToast('No puedes enviarte una solicitud a ti mismo', 'error');
        return;
    }

    try {
        // Import Firestore
        const { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        // ✅ CHECK 1: Verify if there's already a pending request from current user to target user
        const existingRequestQuery = query(
            collection(db, 'friendRequests'),
            where('from', '==', currentUserId),
            where('to', '==', targetUserId),
            where('status', '==', 'pending')
        );

        const existingRequestSnapshot = await getDocs(existingRequestQuery);

        if (!existingRequestSnapshot.empty) {
            // There's already a pending request
            window.showToast('Ya enviaste una solicitud a este usuario', 'info');
            console.log('⚠️ Solicitud duplicada bloqueada');
            return;
        }

        // ✅ CHECK 2: Verify if there's a pending request from target user to current user (they sent us a request first)
        const reverseRequestQuery = query(
            collection(db, 'friendRequests'),
            where('from', '==', targetUserId),
            where('to', '==', currentUserId),
            where('status', '==', 'pending')
        );

        const reverseRequestSnapshot = await getDocs(reverseRequestQuery);

        if (!reverseRequestSnapshot.empty) {
            // The target user already sent us a request
            window.showToast('Este usuario ya te envió una solicitud. Revisa tus notificaciones.', 'info');
            console.log('⚠️ El usuario objetivo ya envió una solicitud');
            return;
        }

        // ✅ CHECK 3: Verify if they're already friends
        if (AppState.friends && AppState.friends.some(f => f.uid === targetUserId || f.id === targetUserId)) {
            window.showToast('Ya son amigos', 'info');
            return;
        }

        // ✅ ALL CHECKS PASSED - Create the friend request
        await addDoc(collection(db, 'friendRequests'), {
            from: currentUserId,
            fromName: currentUser.name,
            fromUsername: currentUser.username,
            fromAvatar: currentUser.avatar || currentUser.photoURL,
            to: targetUserId,
            status: 'pending',
            createdAt: serverTimestamp()
        });

        // 🔔 TRIGGER NOTIFICATION
        if (window.NotificationService) {
            window.NotificationService.send('friend_request', {
                targetUserId: targetUserId,
                actor: {
                    id: currentUserId,
                    name: currentUser.name,
                    avatar: currentUser.avatar || currentUser.photoURL
                },
                title: 'Nueva solicitud de amistad',
                message: `${currentUser.name} quiere ser tu amigo.`,
                data: { type: 'friend_request' }
            });
        }

        // Update button UI to show success
        const btn = document.querySelector(`button[onclick*="sendFriendRequest('${targetUserId}')"]`);
        if (btn) {
            btn.innerHTML = `<span class="material-symbols-outlined text-sm">done</span>`;
            btn.classList.remove('hover:text-[#00f5d4]', 'hover:bg-[#00f5d4]/20');
            btn.classList.add('text-white/40', 'cursor-not-allowed');
            btn.disabled = true;
            btn.onclick = null;
        }

        window.showToast('Solicitud de amistad enviada', 'success');
        console.log('✅ Solicitud enviada a:', targetUserId);

    } catch (error) {
        console.error('Error enviando solicitud:', error);
        window.showToast('Error al enviar solicitud', 'error');
    }
};

// Expose to window
console.log('✅ Friend Request Handler loaded with deduplication');
