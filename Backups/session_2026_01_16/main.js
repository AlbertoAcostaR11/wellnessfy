
import { AppState, loadUserData, saveUserData } from './utils/state.js';
import './utils/diagnostico_seguro.js';
import './utils/analisis_google_health.js';
import { navigateTo } from './router.js';

// ...

// Initialize Application - LIMPIEZA FASE 2
// (Bloque init duplicado eliminado)
import { showCreateChallengeModal } from './pages/challenges.js';
import { showCreateCircleModal, showCircleDetail, searchFriends } from './pages/circles.js';
import { showEditProfile } from './pages/profile.js';
import { showCreatePostModal } from './pages/feed.js';
import { syncHealthConnect } from './pages/activity.js';
import { initGoogleIdentity, autoSyncIfReady } from './utils/googleHealth.js';
import './utils/weeklyCharts.js'; // Auto-renderiza gráficas semanales
import './utils/exploreMap.js'; // Google Maps para Explorar
import * as activityAggregator from './utils/activityAggregator.js'; // Agregador de deportes
import './utils/debugActivityDetector.js'; // Script de debugging de actividades
import { initializeHealthProvider, healthProviderManager } from './utils/healthSync.js'; // Multi-platform health sync
import './utils/fitbitDiagnostics.js'; // Herramienta de diagnóstico
import './utils/debugFitbitData.js'; // Diagnóstico detallado de datos Fitbit
import './utils/debugDataPersistence.js'; // Diagnóstico de persistencia de datos

// Exponer agregador globalmente para sportsData.js
window.activityAggregatorModule = activityAggregator;

// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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
// loadUserData(); // Deshabilitamos carga local pura para dar prioridad a la nube, aunque podríamos mantenerla como caché

// Real-time Cloud Sync
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log('User detected, syncing with cloud...', user.uid);
        try {
            // 1. Sync User Profile
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const cloudData = userDocSnap.data();
                AppState.currentUser = { ...AppState.currentUser, ...cloudData, email: user.email };
            } else {
                // Fallback if doc doesn't exist yet but we have auth user
                AppState.currentUser = { ...AppState.currentUser, email: user.email };
            }

            // 2. Sync GLOBAL Data (Feed & Challenges)
            await syncAppGlobalData();

            // Refresh current view
            updateProfileUI(); // Update Nav Icon
            const currentPage = localStorage.getItem('wellnessfy_last_page') || 'feed';

            // Auto-sync Universal (Si hay token)
            // autoSyncIfReady(); // Legacy Google Removed

            // Check manual rápido de token para disparar sync
            const hasFitbit = localStorage.getItem('fitbit_access_token');
            const hasGoogle = localStorage.getItem('google_access_token');

            if (hasFitbit || hasGoogle) {
                console.log('🔄 Auto-iniciando Motor Universal...');
                // Pequeño delay para asegurar que el DOM y Router estén listos
                setTimeout(() => {
                    if (window.syncHealthConnect) window.syncHealthConnect();
                }, 1000);
            }

            navigateTo(currentPage);

        } catch (error) {
            console.error('Error syncing with cloud:', error);
        }
    } else {
        console.log('No user signed in (Guest mode)');
    }
});

// Función Maestra de Sincronización
async function syncAppGlobalData() {
    console.log('Syncing Global Data (Feed & Challenges)...');
    try {
        // A. Fetch Posts (Ordered by timestamp desc)
        const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const postsSnap = await getDocs(postsQuery);
        const cloudPosts = [];
        postsSnap.forEach((doc) => {
            cloudPosts.push({ id: doc.id, ...doc.data() });
        });

        // Mezclar o Reemplazar? -> Nube manda.
        if (cloudPosts.length > 0) {
            AppState.feedPosts = cloudPosts;
            console.log(`Synced ${cloudPosts.length} posts from cloud.`);
        }

        // B. Fetch Challenges
        const challengesQuery = query(collection(db, "challenges"), orderBy("createdAt", "desc"));
        const challengesSnap = await getDocs(challengesQuery);
        const cloudChallenges = [];
        challengesSnap.forEach((doc) => {
            cloudChallenges.push({ id: doc.id, ...doc.data() });
        });

        if (cloudChallenges.length > 0) {
            AppState.challenges = cloudChallenges;
            console.log(`Synced ${cloudChallenges.length} challenges from cloud.`);
        }

    } catch (e) {
        console.error("Error syncing global data:", e);
    }
}


// Initialize Application
// Initialize Application - LIMPIEZA FASE 2
window.onload = async () => {
    try {
        console.log('🚀 Iniciando Wellnessfy (Modo Transición - Conversor Universal)...');

        // --- BLOQUE DESACTIVADO: Inicialización de Proveedores Legacy ---
        /*
        const activeProvider = await initializeHealthProvider();
        if (activeProvider === 'googleFit') {
            initGoogleIdentity();
            autoSyncIfReady();
        }
        */

        // 1. Cargar estado de aplicación (Usuario, pero sin datos de salud complejos)
        // (Limpieza forzada removida para permitir flujo real de Switches)
        loadUserData();

        // 2. Inicializar Router y UI - CORREGIDO
        const startPage = localStorage.getItem('wellnessfy_last_page') || 'feed';
        navigateTo(startPage);

        if (typeof renderLayout === 'function') renderLayout();

        // 3. Sync Feed Global (Firebase) - Esto es independiente de Salud
        await syncAppGlobalData();

    } catch (error) {
        console.error("❌ Error fatal en inicialización:", error);
    }
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

// Toast Notification Helper
window.showToast = function (message, type = 'success') {
    const exist = document.getElementById('toast-notification');
    if (exist) exist.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = `fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] z-[100] flex items-center gap-3 transition-all duration-300 translate-y-10 opacity-0 border backdrop-blur-md ${type === 'error' ? 'bg-red-600/90 border-red-400 text-white' : 'bg-[#00f5d4]/90 border-[#00f5d4] text-[#0f172a]'}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-2xl filled">${type === 'error' ? 'error' : 'check_circle'}</span>
        <span class="font-bold text-sm tracking-wide uppercase">${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Initial Render
document.addEventListener('DOMContentLoaded', () => {
    // 1. Security Check: If not logged in, redirect to login page
    const isLoggedIn = localStorage.getItem('wellnessfy_logged_in') === 'true';
    if (!isLoggedIn) {
        // Double check: if last page exists, maybe allow? No, strict mode.
        // If user is actually logged in via Firebase persistence, login.html will redirect back.
        window.location.href = 'login.html';
        return;
    }

    const lastPage = localStorage.getItem('wellnessfy_last_page') || 'feed';
    updateProfileUI(); // Update UI on load
    navigateTo(lastPage);
});

// Update Profile Selectors in Nav
window.updateProfileUI = function () {
    const { avatar } = AppState.currentUser;
    const hasAvatar = avatar && avatar.trim() !== '';

    // Desktop
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    if (sidebarAvatar) {
        if (hasAvatar) {
            sidebarAvatar.style.backgroundImage = `url('${avatar}')`;
            sidebarAvatar.classList.remove('bg-white/10');
            sidebarAvatar.innerHTML = '';
        } else {
            sidebarAvatar.style.backgroundImage = 'none';
            sidebarAvatar.classList.add('bg-white/10');
            sidebarAvatar.innerHTML = '<span class="material-symbols-outlined text-white/50">person</span>';
        }
    }

    // Mobile
    const mobileBtn = document.querySelector('nav button[data-page="profile"]');
    if (mobileBtn) {
        const icon = mobileBtn.querySelector('.material-symbols-outlined');
        let img = mobileBtn.querySelector('img.profile-nav-img');

        if (hasAvatar) {
            if (icon) icon.style.display = 'none';

            if (!img) {
                img = document.createElement('img');
                img.className = 'profile-nav-img w-6 h-6 rounded-full object-cover border border-white/20 mb-1 animate-fade-in';
                // Insert as first child
                mobileBtn.insertBefore(img, mobileBtn.firstChild);
            }
            img.src = avatar;
            img.style.display = 'block';
        } else {
            if (img) img.style.display = 'none';
            if (icon) icon.style.display = 'block';
        }
    }
}
