
import { AppState } from './utils/state.js';
import { renderFeed } from './pages/feed.js';
import { renderChallenges, renderCreateChallengePage } from './pages/challenges.js';
import { renderChallengeDetailPage } from './pages/challengeDetail.js';
import { renderCircles, initCircles } from './pages/circles.js';
import { renderProfilePage } from './pages/profile.js';
import { renderActivity } from './pages/activity.js';
import { renderSettingsPage } from './pages/settings.js';
import { renderNotifications } from './pages/notifications.js';
import { renderGoalsPage } from './pages/goals.js';
import { renderCreateCompanyPage } from './pages/createCompany.js';

// Configuration of logical routes
const ROUTES_MAP = [
    { page: 'feed', path: '/inicio' },
    { page: 'activity', path: '/actividad' },
    { page: 'challenges', path: '/mis-desafios', tab: 'mine' },
    { page: 'challenges', path: '/explorar', tab: 'explore' },
    { page: 'circles', path: '/mis-circulos', tab: 'circles' },
    { page: 'circles', path: '/Descubrir', tab: 'discover' },
    { page: 'circles', path: '/descubrir', tab: 'discover' }, // Case insensitive support
    { page: 'circles', path: '/circulos', tab: 'discover' },
    { page: 'notifications', path: '/notificaciones' },
    { page: 'profile', path: '/perfil' },
    { page: 'profile', path: '/perfil/editar', tab: 'edit' },
    { page: 'goals', path: '/perfil/objetivos' },
    { page: 'settings', path: '/perfil/configuracion', tab: 'personal' },
    { page: 'settings', path: '/perfil/configuracion/personal', tab: 'personal' },
    { page: 'settings', path: '/perfil/configuracion/coach', tab: 'coach' },
    { page: 'settings', path: '/perfil/configuracion/empresa', tab: 'empresa' },
    { page: 'create-company', path: '/perfil/configuracion/empresa/crear' },
    { page: 'create-challenge', path: '/desafios/crear' },
    { page: 'challenge-detail', path: '/desafio' }
];

function checkAuth(page, param) {
    const isLoggedIn = localStorage.getItem('wellnessfy_logged_in') === 'true';

    // Only allow 'profile' if it has a specific username/param
    // If it's the base '/perfil' route, we require login.
    const isPublicProfile = page === 'profile' && param && param !== 'edit';

    if (!isLoggedIn && !isPublicProfile) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

export function navigateTo(page, param = null, updateHistory = true) {
    if (!page) page = 'feed';

    // Auth Gate
    if (!checkAuth(page, param)) return;

    // 1. Find the path for this page/param
    let route = ROUTES_MAP.find(r => r.page === page);

    // Handle specific tab cases for settings/challenges/circles
    if (page === 'settings' && param) {
        route = ROUTES_MAP.find(r => r.page === 'settings' && r.tab === param) || route;
    } else if (page === 'challenges' && param) {
        route = ROUTES_MAP.find(r => r.page === 'challenges' && r.tab === param) || route;
    } else if (page === 'circles' && param) {
        route = ROUTES_MAP.find(r => r.page === 'circles' && r.tab === param) || route;
    }

    let path = route ? route.path : `/${page}`;

    // Handle profile with username
    if (page === 'profile' && param && typeof param === 'string' && !param.includes('/') && param !== 'edit') {
        path = `/${param.replace('@', '')}`;
    }

    // 2. Update History API
    if (updateHistory) {
        window.history.pushState({ page, param }, '', path);
    }

    // 3. Update AppState and Storage
    AppState.currentPage = page;
    localStorage.setItem('wellnessfy_last_page', page);

    // 4. Update UI Selectors
    updateNavSelection(page);

    // 5. Render Page
    renderPage(page, param);
}

function updateNavSelection(page) {
    const isLoggedIn = localStorage.getItem('wellnessfy_logged_in') === 'true';

    // Toggle guest class for layout
    if (!isLoggedIn) {
        document.body.classList.add('guest-mode');
    } else {
        document.body.classList.remove('guest-mode');
    }

    // Mobile Nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) btn.classList.add('active');
    });

    // Desktop Sidebar
    document.querySelectorAll('.nav-btn-desktop').forEach(btn => {
        btn.classList.remove('active', 'bg-white/10', 'text-primary');
        if (btn.dataset.page === page) btn.classList.add('active', 'bg-white/10', 'text-primary');
    });
}

async function renderPage(page, param) {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    // Reset scroll
    window.scrollTo({ top: 0, behavior: 'instant' });

    switch (page) {
        case 'challenges':
            mainContent.innerHTML = renderChallenges(param);
            if (param === 'explore') {
                const { ExploreModule } = await import('./utils/challengesExplore.js');
                setTimeout(() => ExploreModule.init(), 100);
            }
            break;
        case 'create-challenge':
            mainContent.innerHTML = renderCreateChallengePage(param);
            break;
        case 'challenge-detail':
            mainContent.innerHTML = renderChallengeDetailPage();
            break;
        case 'circles':
            mainContent.innerHTML = renderCircles(param || 'discover');
            initCircles();
            if (window.loadFriendDetails) setTimeout(() => window.loadFriendDetails(), 100);
            break;
        case 'notifications':
            mainContent.innerHTML = renderNotifications();
            break;
        case 'feed':
            mainContent.innerHTML = renderFeed();
            break;
        case 'activity':
            mainContent.innerHTML = renderActivity();
            break;
        case 'profile':
            (async () => {
                mainContent.innerHTML = '<div class="flex items-center justify-center h-screen"><span class="material-symbols-outlined animate-spin text-4xl text-[#00f5d4]">progress_activity</span></div>';
                // If it's the 'edit' route, we render the current user profile
                const profileHTML = await renderProfilePage(param === 'edit' ? null : param);
                mainContent.innerHTML = profileHTML;
                if (param === 'edit') window.showEditProfile?.();
                if (window.updateNotificationBadges) window.updateNotificationBadges();
            })();
            break;
        case 'settings':
            mainContent.innerHTML = renderSettingsPage(param || 'personal');
            break;
        case 'goals':
            (async () => {
                const goalsHTML = await renderGoalsPage();
                mainContent.innerHTML = goalsHTML;
            })();
            break;
        case 'create-company':
            mainContent.innerHTML = renderCreateCompanyPage();
            break;
        default:
            mainContent.innerHTML = renderFeed();
    }

    if (window.updateNotificationBadges) window.updateNotificationBadges();
}

export function initRouter() {
    // 1. Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.page) {
            navigateTo(event.state.page, event.state.param, false);
        } else {
            // Initial path logic
            handleCurrentPath();
        }
    });

    // 2. Initial load handling
    handleCurrentPath();
}

function handleCurrentPath() {
    const path = window.location.pathname;

    // Find matching route
    const route = ROUTES_MAP.find(r => r.path === path);

    if (route) {
        navigateTo(route.page, route.tab, false);
        return;
    }

    // Handle legacy profile path or direct username: /username
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 1) {
        // If it's a known non-profile route in ROUTES_MAP it would have been caught above.
        // So we treat any other single segment as a username.
        navigateTo('profile', segments[0], false);
        return;
    }

    if (path.startsWith('/perfil/') && segments.length === 2) {
        navigateTo('profile', segments[1], false);
        return;
    }

    // Fallback if no route found or just root
    const lastPage = localStorage.getItem('wellnessfy_last_page') || 'feed';

    if (path === '/' || path === '') {
        navigateTo(lastPage, null, false);
    } else if (!segments.length) {
        navigateTo('feed', null, false);
    }
}
