// ...
import { AppState, loadUserData, saveUserData } from './utils/state.js';
import { navigateTo } from './router.js';
import { showCreateChallengeModal } from './pages/challenges.js';
import { showCreateCircleModal, showCircleDetail } from './pages/circles.js';
import { showEditProfile } from './pages/profile.js';
import { showCreatePostModal } from './pages/feed.js';
import { syncHealthConnect } from './pages/activity.js';
import { initGoogleIdentity, autoSyncIfReady } from './utils/googleHealth.js';
import './utils/weeklyCharts.js'; // Auto-renderiza gráficas semanales
import './utils/exploreMap.js'; // Google Maps para Explorar
import * as activityAggregator from './utils/activityAggregator.js'; // Agregador de deportes
import { initializeHealthProvider, healthProviderManager } from './utils/healthSync.js'; // Multi-platform health sync
import './utils/friendRequestHandler.js'; // Friend request with deduplication

// Exponer agregador globalmente para sportsData.js
window.activityAggregatorModule = activityAggregator;

// Firebase Imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, orderBy, arrayUnion } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

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
const messaging = getMessaging(app);

// --- INFRAESTRUCTURA DE NOTIFICACIONES NATIVAS ---

/**
 * Solicita permisos para notificaciones nativas y obtiene el token FCM
 */
window.requestNotificationPermission = async function () {
    console.log('🔔 Solicitando permiso para notificaciones nativas...');
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('✅ Permiso concedido.');
            const token = await getToken(messaging, {
                vapidKey: 'BMD-z83qK2L_ID6WpUPK2yqP8p8_R_x1_x1_x1_x1_x1_x1_x1_x1_x1_x1_x1_x1_x1_x1_x1' // TODO: Reemplazar con clave real de Firebase Console
            });

            if (token) {
                console.log('🔥 FCM Token:', token);
                await saveTokenToCloud(token);
                return token;
            }
        } else {
            console.warn('❌ Permiso denegado para notificaciones.');
        }
    } catch (error) {
        console.error('❌ Error al obtener el token FCM:', error);
    }
    return null;
};

/**
 * Guarda el token del dispositivo en el perfil del usuario en Firestore
 */
async function saveTokenToCloud(token) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            fcmTokens: arrayUnion(token),
            notificationsEnabled: true,
            lastTokenUpdate: Date.now()
        });
        console.log('💾 Token guardado en la nube para el usuario:', user.uid);
    } catch (error) {
        console.error('❌ Error guardando token en Firestore:', error);
    }
}

/**
 * Configura la escucha de mensajes cuando la app está abierta (foreground)
 */
function setupForegroundMessaging() {
    onMessage(messaging, (payload) => {
        console.log('📥 Mensaje recibido en primer plano:', payload);

        // Mostrar notificación visual personalizada (nativa o Toast)
        if (window.showToast) {
            window.showToast(payload.notification.title + ': ' + payload.notification.body, 'info');
        }

        // También podemos disparar una notificación de sistema si queremos aunque esté abierta
        new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: '/logo-icon.png'
        });

        // Recargar notificaciones en la UI si es necesario
        if (AppState.currentPage === 'notifications') {
            syncAppGlobalData();
        }
    });
}

// Initialize App
console.log('Initializing Wellnessfy App (v1.1.0 - 18:38)...');
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
                AppState.currentUser = { ...AppState.currentUser, ...cloudData, email: user.email, uid: user.uid };
            } else {
                console.log('New user detected, generating profile...');
                // Fallback if doc doesn't exist yet but we have auth user
                let suggestedUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');

                // Check if username exists
                const uQuery = query(collection(db, "users"), where("username", "==", "@" + suggestedUsername));
                const uSnap = await getDocs(uQuery);

                if (!uSnap.empty) {
                    suggestedUsername += Math.floor(100 + Math.random() * 900);
                }

                const newUserProfile = {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || 'Usuario',
                    username: "@" + suggestedUsername,
                    isPublic: true,
                    createdAt: Date.now(),
                    avatar: user.photoURL || 'https://i.pravatar.cc/300?img=12'
                };

                await setDoc(userDocRef, newUserProfile);
                AppState.currentUser = newUserProfile;
                console.log('✅ Unique username generated:', newUserProfile.username);
            }

            // 2. Sync GLOBAL Data (Feed & Challenges)
            await syncAppGlobalData();

            // 2.1 Cargar actividades persistidas desde Firestore
            try {
                const { loadActivitiesFromFirestore } = await import('./utils/activityPersistence.js');
                const persistedActivities = await loadActivitiesFromFirestore();

                if (persistedActivities.length > 0) {
                    AppState.activities = persistedActivities;
                    console.log(`💾 Loaded ${persistedActivities.length} activities from Firestore`);

                    // Actualizar progreso de desafíos con actividades cargadas
                    const { updateAllChallengesProgress } = await import('./utils/challengeProgressSync.js');
                    await updateAllChallengesProgress();
                }
            } catch (error) {
                console.warn('⚠️ Error loading persisted activities:', error);
            }

            // 2.2 Escuchar Notificaciones Cloud
            listenToCloudNotifications(user.uid);

            // 2.3 Inicializar Mensajería Push (Foreground)
            setupForegroundMessaging();

            // 2.4 Iniciar monitoreo de conexión automático
            try {
                const { startConnectionMonitoring } = await import('./utils/autoReconnection.js');
                startConnectionMonitoring();
                console.log('🔄 Monitoreo de conexión iniciado');
            } catch (error) {
                console.warn('⚠️ Error iniciando monitoreo de conexión:', error);
            }

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

// Función Maestra de Sincronización (Optimizada - No Bloqueante)
async function syncAppGlobalData() {
    console.log('🔄 Syncing Global Data (Feed, Challenges & Circles)...');

    // PASO 1: Cargar desde caché local PRIMERO (instantáneo)
    const cachedChallenges = localStorage.getItem('my_challenges');
    const cachedPosts = localStorage.getItem('my_posts');
    const cachedCircles = localStorage.getItem('my_circles');

    if (cachedChallenges) {
        try {
            AppState.challenges = JSON.parse(cachedChallenges);
            console.log(`📦 Loaded ${AppState.challenges.length} challenges from cache`);
        } catch (e) {
            console.error('Error parsing cached challenges:', e);
        }
    }

    if (cachedPosts) {
        try {
            AppState.feedPosts = JSON.parse(cachedPosts);
            console.log(`📦 Loaded ${AppState.feedPosts.length} posts from cache`);
        } catch (e) {
            console.error('Error parsing cached posts:', e);
        }
    }

    if (cachedCircles) {
        try {
            AppState.circles = JSON.parse(cachedCircles);
            console.log(`📦 Loaded ${AppState.circles.length} circles from cache`);
        } catch (e) {
            console.error('Error parsing cached circles:', e);
        }
    }

    // PASO 2: Actualizar desde Firestore en SEGUNDO PLANO (no bloqueante)
    try {
        // A. Fetch Posts (Ordered by timestamp desc)
        const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const postsSnap = await getDocs(postsQuery);
        const cloudPosts = [];
        postsSnap.forEach((doc) => {
            cloudPosts.push({ id: doc.id, ...doc.data() });
        });

        // Actualizar solo si hay datos nuevos
        if (cloudPosts.length > 0) {
            AppState.feedPosts = cloudPosts;
            localStorage.setItem('my_posts', JSON.stringify(cloudPosts));
            console.log(`☁️ Synced ${cloudPosts.length} posts from cloud.`);
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
            localStorage.setItem('my_challenges', JSON.stringify(cloudChallenges));
            console.log(`☁️ Synced ${cloudChallenges.length} challenges from cloud.`);

            // Si estamos en la página de desafíos, refrescar la vista
            if (AppState.currentPage === 'challenges' || AppState.currentPage === 'challenge-detail') {
                const mainContent = document.getElementById('mainContent');
                if (mainContent && AppState.currentPage === 'challenges') {
                    import('./pages/challenges.js').then(({ renderChallenges }) => {
                        mainContent.innerHTML = renderChallenges();
                    });
                }
            }
        }

        // C. Fetch Circles (where user is creator or member)
        const currentUserId = AppState.currentUser?.uid || AppState.currentUser?.id;
        if (currentUserId) {
            // Fetch circles where user is creator
            const createdCirclesQuery = query(
                collection(db, "circles"),
                where("createdBy", "==", currentUserId)
            );
            const createdCirclesSnap = await getDocs(createdCirclesQuery);

            // Fetch circles where user is a member
            const memberCirclesQuery = query(
                collection(db, "circles"),
                where("membersList", "array-contains", currentUserId)
            );
            const memberCirclesSnap = await getDocs(memberCirclesQuery);

            const cloudCircles = [];
            const circleIds = new Set();

            // Add created circles
            createdCirclesSnap.forEach((doc) => {
                if (!circleIds.has(doc.id)) {
                    cloudCircles.push({ id: doc.id, ...doc.data() });
                    circleIds.add(doc.id);
                }
            });

            // Add member circles (avoiding duplicates)
            memberCirclesSnap.forEach((doc) => {
                if (!circleIds.has(doc.id)) {
                    cloudCircles.push({ id: doc.id, ...doc.data() });
                    circleIds.add(doc.id);
                }
            });

            if (cloudCircles.length > 0) {
                AppState.circles = cloudCircles;
                localStorage.setItem('my_circles', JSON.stringify(cloudCircles));
                console.log(`☁️ Synced ${cloudCircles.length} circles from cloud.`);
            } else {
                AppState.circles = [];
                localStorage.setItem('my_circles', JSON.stringify([]));
                console.log('No circles found for this user.');
            }
        }

    } catch (e) {
        console.error("❌ Error syncing global data:", e);
        console.log("📦 Using cached data instead");
    }
}

// Escuchador en tiempo real de notificaciones desde Firestore
function listenToCloudNotifications(userId) {
    if (!userId) return;

    const notifQuery = query(
        collection(db, "friendRequests"),
        where("to", "==", userId)
    );

    // Importamos onSnapshot para escucha pasiva
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js').then(({ onSnapshot }) => {
        onSnapshot(notifQuery, (snapshot) => {
            const newNotifications = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.status === 'pending') {
                    newNotifications.push({
                        id: doc.id,
                        type: 'friend_request',
                        actor: {
                            id: data.from,
                            name: data.fromName || 'Alguien',
                            username: data.fromUsername || 'usuario',
                            avatar: data.fromAvatar
                        },
                        date: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                        read: data.read || false
                    });
                }
            });

            // Actualizamos el estado global solo con las nuevas si hay cambios
            AppState.notifications = [...newNotifications];
            updateNotificationBadges();

            // Si el usuario está en la página de notificaciones, re-renderizar
            if (AppState.currentPage === 'notifications') {
                const mainContent = document.getElementById('mainContent');
                import('./pages/notifications.js').then(({ renderNotifications }) => {
                    if (mainContent) mainContent.innerHTML = renderNotifications();
                });
            }
        }, (error) => {
            console.error('❌ Error en el escuchador de notificaciones:', error);
            if (error.code === 'failed-precondition') {
                console.warn('⚠️ Se requiere un índice en Firestore. Revisa el link en la consola para crearlo.');
            }
        });
    });
}


// Initialize Application
// Initialize Application - LIMPIEZA FASE 2
window.onload = async () => {
    try {
        console.log('🚀 Iniciando Wellnessfy (Modo Transición - Conversor Universal)...');

        // 0. Registrar Service Worker para Notificaciones Nativas
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/firebase-messaging-sw.js')
                .then(reg => console.log('✅ Service Worker registrado para Push:', reg.scope))
                .catch(err => console.error('❌ Error registrando Service Worker:', err));
        }

        // 1. Cargar estado de aplicación (Usuario, pero sin datos de salud complejos)
        loadUserData();

        // 1.1 Inicializar Proveedores
        const activeProvider = await initializeHealthProvider();
        if (activeProvider === 'googleFit') {
            initGoogleIdentity();
        }

        // 2. Inicializar Router y UI - CORREGIDO
        const startPage = localStorage.getItem('wellnessfy_last_page') || 'activity';
        navigateTo(startPage);

        if (typeof renderLayout === 'function') renderLayout();

        // 3. Sync Feed Global (Firebase) - Ya se ejecuta en onAuthStateChanged
        // La sincronización se hace automáticamente cuando el usuario se autentica
        // y usa caché local para carga instantánea

        // 4. Initialize Notifications (Mock for now)
        if (AppState.notifications.length === 0) {
            generateMockNotifications();
        }
        updateNotificationBadges();

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

// Notification Helpers
window.updateNotificationBadges = function () {
    const unreadCount = AppState.notifications.filter(n => !n.read).length;

    // Desktop Update
    const desktopBadge = document.getElementById('notifBadgeDesktop');
    const desktopCount = document.getElementById('notifCountDesktop');
    if (desktopBadge && desktopCount) {
        if (unreadCount > 0) {
            desktopBadge.classList.remove('hidden');
            desktopCount.innerText = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            desktopBadge.classList.add('hidden');
        }
    }

    // Mobile Update
    const mobileBadge = document.getElementById('notifBadgeMobile');
    const mobileCount = document.getElementById('notifCountMobile');
    if (mobileBadge && mobileCount) {
        if (unreadCount > 0) {
            mobileBadge.classList.remove('hidden');
            mobileCount.innerText = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            mobileBadge.classList.add('hidden');
        }
    }
};

function generateMockNotifications() {
    // Limpiamos las notificaciones fantasma para empezar de cero
    AppState.notifications = [];
}

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
