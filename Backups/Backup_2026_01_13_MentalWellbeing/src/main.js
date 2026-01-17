
import { AppState, loadUserData, saveUserData } from './utils/state.js';
import { navigateTo } from './router.js';
import { showCreateChallengeModal } from './pages/challenges.js';
import { showCreateCircleModal, showCircleDetail, searchFriends } from './pages/circles.js';
import { showEditProfile } from './pages/profile.js';
import { showCreatePostModal } from './pages/feed.js';
import { syncHealthConnect } from './pages/activity.js';
import { initGoogleIdentity, autoSyncIfReady } from './utils/googleHealth.js';
import './utils/weeklyCharts.js'; // Auto-renderiza gráficas semanales

// Firebase Imports for Auth Management
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyC9K_nqcTRPGtTpUfWDvkFhnAESaJ3I7Vs",
    authDomain: "wellnessfy-cbc1b.firebaseapp.com",
    projectId: "wellnessfy-cbc1b",
    storageBucket: "wellnessfy-cbc1b.firebasestorage.app",
    messagingSenderId: "232789372708",
    appId: "1:232789372708:web:e7d5fcffa0ba39cf6e0db1",
    measurementId: "G-0V7MV5E1CF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize App
console.log('Initializing Wellnessfy App (Modular)...');
loadUserData(); // Load cached data first (fast)

// Real-time Cloud Sync
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User detected, syncing with cloud...', user.uid);
        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const cloudData = userDocSnap.data();
                console.log('Cloud data loaded for:', cloudData.username);

                // Update AppState with Cloud Data
                AppState.currentUser = { ...AppState.currentUser, ...cloudData };
                saveUserData(); // Update LocalStorage

                // Refresh current view to show real data
                const currentPage = localStorage.getItem('wellnessfy_last_page') || 'feed';
                navigateTo(currentPage);
            } else {
                console.log('No cloud data found for this user yet.');
            }
        } catch (error) {
            console.error('Error syncing with cloud:', error);
        }
    } else {
        console.log('No user signed in (Guest mode or Session Expired)');
        // Optional: Redirect to login if strictly private
        // if (!localStorage.getItem('wellnessfy_user')) window.location.href = 'login.html';
    }
});


// Initialize Google Auth (Lazy load handling inside)
window.onload = () => {
    initGoogleIdentity();
    // Intentar sincronización automática si hay token guardado
    setTimeout(() => {
        autoSyncIfReady();
    }, 1500);
};

// Expose Globals for HTML OnClick
window.AppState = AppState;
window.syncHealthConnect = syncHealthConnect;
window.navigateTo = navigateTo;
window.saveUserData = saveUserData;

// Logout Function (Fixed with Firebase SignOut)
window.logout = function () {
    console.log('Logging out...');
    signOut(auth).then(() => {
        console.log('Firebase SignOut successful');
        localStorage.clear(); // Clear all app data
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        // Force redirect even on error
        localStorage.clear();
        window.location.href = 'login.html';
    });
};

/*
// Logout Function
window.logout = function () {
    console.log('Logging out...');
    localStorage.removeItem('wellnessfy_user');
    localStorage.removeItem('wellnessfy_last_page');
    // Optional: Sign out from Firebase if we were tracking auth state there
    window.location.href = 'login.html';
};
*/


// Expose Page Actions
window.showCreateChallengeModal = showCreateChallengeModal;
window.showCreateCircleModal = showCreateCircleModal;
window.showCircleDetail = showCircleDetail;
window.searchFriends = searchFriends;
window.showEditProfile = showEditProfile;
window.showCreatePostModal = showCreatePostModal;
window.showProfile = () => navigateTo('profile');

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // Check last page
    const lastPage = localStorage.getItem('wellnessfy_last_page') || 'feed';
    navigateTo(lastPage);
});
