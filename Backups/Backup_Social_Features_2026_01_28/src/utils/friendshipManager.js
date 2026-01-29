
import { AppState } from './state.js';

/**
 * Friendship Manager - Google+ Style Circles Integration
 * Handles friend requests, friendships, and circle memberships
 */

/**
 * Accept friend request and add to selected circles
 * @param {string} friendUserId - ID of the user who sent the request
 * @param {Array<string>} circleIds - Array of circle IDs to add the friend to
 * @param {string} notifId - Notification ID to mark as processed
 */
window.acceptFriendRequestWithCircles = async function (friendUserId, circleIds, notifId) {
    if (!friendUserId || !Array.isArray(circleIds)) {
        console.error('Invalid parameters for acceptFriendRequestWithCircles');
        return;
    }

    const currentUser = AppState.currentUser;
    if (!currentUser) {
        window.showToast('Debes iniciar sesión', 'error');
        return;
    }

    const currentUserId = currentUser.uid || currentUser.id;

    try {
        const { getFirestore, collection, query, where, getDocs, updateDoc, addDoc, doc, serverTimestamp, arrayUnion } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        // 1. Find the friend request document
        const requestQuery = query(
            collection(db, 'friendRequests'),
            where('from', '==', friendUserId),
            where('to', '==', currentUserId),
            where('status', '==', 'pending')
        );

        const requestSnapshot = await getDocs(requestQuery);

        if (requestSnapshot.empty) {
            window.showToast('Solicitud no encontrada', 'error');
            return;
        }

        const requestDoc = requestSnapshot.docs[0];

        // 2. Update friend request status to 'accepted'
        await updateDoc(doc(db, 'friendRequests', requestDoc.id), {
            status: 'accepted',
            acceptedAt: serverTimestamp()
        });

        // 3. Create or update friendship document
        const friendshipId = [currentUserId, friendUserId].sort().join('_');

        // Check if friendship already exists
        const friendshipQuery = query(
            collection(db, 'friendships'),
            where('users', 'array-contains', currentUserId)
        );

        const friendshipSnapshot = await getDocs(friendshipQuery);
        const existingFriendship = friendshipSnapshot.docs.find(doc => {
            const users = doc.data().users;
            return users.includes(friendUserId);
        });

        if (existingFriendship) {
            // Update existing friendship with new circles
            const currentCircles = existingFriendship.data().circles || {};
            currentCircles[currentUserId] = circleIds;

            await updateDoc(doc(db, 'friendships', existingFriendship.id), {
                circles: currentCircles,
                updatedAt: serverTimestamp()
            });
        } else {
            // Create new friendship
            await addDoc(collection(db, 'friendships'), {
                users: [currentUserId, friendUserId].sort(),
                createdAt: serverTimestamp(),
                circles: {
                    [currentUserId]: circleIds,
                    [friendUserId]: [] // The other user hasn't assigned circles yet
                }
            });
        }

        // 4. Add friend to selected circles
        for (const circleId of circleIds) {
            const circleRef = doc(db, 'circles', circleId);
            await updateDoc(circleRef, {
                members: arrayUnion(friendUserId),
                updatedAt: serverTimestamp()
            });
        }

        // 5. Create notification for the friend
        const requestData = requestDoc.data();
        if (window.NotificationService) {
            window.NotificationService.send('friend_accepted', {
                targetUserId: friendUserId,
                actor: {
                    id: currentUserId,
                    name: currentUser.name,
                    username: currentUser.username,
                    avatar: currentUser.avatar || currentUser.photoURL
                },
                title: 'Solicitud aceptada',
                message: `${currentUser.name} aceptó tu solicitud de amistad`,
                data: { type: 'friend_accepted' }
            });
        }

        // 6. Mark notification as read and update UI
        if (notifId) {
            const notif = AppState.notifications.find(n => n.id === notifId);
            if (notif) {
                notif.read = true;
                notif.processed = true;
            }
        }

        // 7. Update local state
        if (!AppState.friends) AppState.friends = [];
        if (!AppState.friends.some(f => (f.uid || f.id) === friendUserId)) {
            AppState.friends.push({
                id: friendUserId,
                uid: friendUserId,
                name: requestData.fromName,
                username: requestData.fromUsername,
                avatar: requestData.fromAvatar
            });
        }

        // 8. Show success message
        const circleCount = circleIds.length;
        const circleText = circleCount === 1 ? 'círculo' : 'círculos';
        window.showToast(`✅ Agregado a ${circleCount} ${circleText}`, 'success');

        // 9. Refresh notifications page
        if (typeof window.filterNotifications === 'function') {
            window.filterNotifications(window.currentNotificationFilter || 'all');
        }

        console.log('✅ Amistad aceptada y agregada a círculos:', { friendUserId, circleIds });

    } catch (error) {
        console.error('Error accepting friend request:', error);
        window.showToast('Error al aceptar solicitud', 'error');
    }
};

/**
 * Reject friend request
 * @param {string} friendUserId - ID of the user who sent the request
 * @param {string} notifId - Notification ID to mark as processed
 */
window.rejectFriendRequestWithUpdate = async function (friendUserId, notifId) {
    const currentUser = AppState.currentUser;
    if (!currentUser) return;

    const currentUserId = currentUser.uid || currentUser.id;

    try {
        const { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        // Find and update the friend request
        const requestQuery = query(
            collection(db, 'friendRequests'),
            where('from', '==', friendUserId),
            where('to', '==', currentUserId),
            where('status', '==', 'pending')
        );

        const requestSnapshot = await getDocs(requestQuery);

        if (!requestSnapshot.empty) {
            const requestDoc = requestSnapshot.docs[0];
            await updateDoc(doc(db, 'friendRequests', requestDoc.id), {
                status: 'rejected',
                rejectedAt: serverTimestamp()
            });
        }

        // Mark notification as read
        if (notifId) {
            const notif = AppState.notifications.find(n => n.id === notifId);
            if (notif) {
                notif.read = true;
                notif.processed = true;
            }
        }

        window.showToast('Solicitud rechazada', 'info');

        // Refresh notifications page
        if (typeof window.filterNotifications === 'function') {
            window.filterNotifications(window.currentNotificationFilter || 'all');
        }

    } catch (error) {
        console.error('Error rejecting friend request:', error);
        window.showToast('Error al rechazar solicitud', 'error');
    }
};

/**
 * Get user's circles from Firestore
 * @returns {Promise<Array>} Array of circle objects
 */
export async function getUserCircles() {
    const currentUser = AppState.currentUser;
    if (!currentUser) return [];

    const currentUserId = currentUser.uid || currentUser.id;

    try {
        const { getFirestore, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const circlesQuery = query(
            collection(db, 'circles'),
            where('createdBy', '==', currentUserId)
        );

        const snapshot = await getDocs(circlesQuery);
        const circles = [];

        snapshot.forEach(doc => {
            circles.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return circles;

    } catch (error) {
        console.error('Error fetching user circles:', error);
        return [];
    }
}

/**
 * Add friend to additional circles
 * @param {string} friendId - Friend's user ID
 * @param {Array<string>} circleIds - Circle IDs to add friend to
 */
window.addFriendToCircles = async function (friendId, circleIds) {
    if (!friendId || !Array.isArray(circleIds) || circleIds.length === 0) return;

    try {
        const { getFirestore, doc, updateDoc, arrayUnion, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        for (const circleId of circleIds) {
            const circleRef = doc(db, 'circles', circleId);
            await updateDoc(circleRef, {
                members: arrayUnion(friendId),
                updatedAt: serverTimestamp()
            });
        }

        window.showToast('Amigo agregado a círculos', 'success');

    } catch (error) {
        console.error('Error adding friend to circles:', error);
        window.showToast('Error al agregar a círculos', 'error');
    }
};

/**
 * Remove friend from circle
 * @param {string} friendId - Friend's user ID
 * @param {string} circleId - Circle ID to remove friend from
 */
window.removeFriendFromCircle = async function (friendId, circleId) {
    if (!friendId || !circleId) return;

    try {
        const { getFirestore, doc, updateDoc, arrayRemove, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        const db = getFirestore();

        const circleRef = doc(db, 'circles', circleId);
        await updateDoc(circleRef, {
            members: arrayRemove(friendId),
            updatedAt: serverTimestamp()
        });

        window.showToast('Amigo removido del círculo', 'success');

    } catch (error) {
        console.error('Error removing friend from circle:', error);
        window.showToast('Error al remover del círculo', 'error');
    }
};

console.log('✅ Friendship Manager loaded with Firestore integration');
