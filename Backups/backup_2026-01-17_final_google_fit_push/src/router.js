
import { AppState } from './utils/state.js';
import { renderFeed } from './pages/feed.js';
import { renderChallenges, renderCreateChallengePage } from './pages/challenges.js';
import { renderChallengeDetailPage } from './pages/challengeDetail.js';
import { renderCircles } from './pages/circles.js';
import { renderProfilePage } from './pages/profile.js';
import { renderActivity } from './pages/activity.js';
import { renderSettingsPage } from './pages/settings.js';
import { renderNotifications } from './pages/notifications.js';


export function navigateTo(page, param = null) {
    if (!page) page = 'activity';
    AppState.currentPage = page;
    localStorage.setItem('wellnessfy_last_page', page);

    // Update active nav button (Mobile)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });

    // Update active nav button (Desktop Sidebar)
    document.querySelectorAll('.nav-btn-desktop').forEach(btn => {
        btn.classList.remove('active', 'bg-white/10', 'text-primary');
        if (btn.dataset.page === page) {
            btn.classList.add('active', 'bg-white/10', 'text-primary');
        }
    });

    // Load page content
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    switch (page) {
        case 'challenges':
            mainContent.innerHTML = renderChallenges();
            break;
        case 'create-challenge':
            mainContent.innerHTML = renderCreateChallengePage(param);
            break;
        case 'challenge-detail':
            mainContent.innerHTML = renderChallengeDetailPage();
            break;
        case 'circles':
            mainContent.innerHTML = renderCircles();
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
            // Handle async profile loading
            (async () => {
                mainContent.innerHTML = '<div class="flex items-center justify-center h-screen"><span class="material-symbols-outlined animate-spin text-4xl text-[#00f5d4]">progress_activity</span></div>';
                const profileHTML = await renderProfilePage(param);
                mainContent.innerHTML = profileHTML;
            })();
            return; // Exit early since we're handling async
        case 'settings':
            mainContent.innerHTML = renderSettingsPage();
            break;
        default:
            mainContent.innerHTML = renderFeed();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
