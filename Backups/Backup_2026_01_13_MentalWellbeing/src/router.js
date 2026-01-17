
import { AppState } from './utils/state.js';
import { renderFeed } from './pages/feed.js';
import { renderChallenges } from './pages/challenges.js';
import { renderChallengeDetailPage } from './pages/challengeDetail.js';
import { renderCircles } from './pages/circles.js';
import { renderProfilePage } from './pages/profile.js';
import { renderActivity } from './pages/activity.js';
import { renderSettingsPage } from './pages/settings.js';

export function navigateTo(page) {
    if (!page) page = 'feed';
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
        case 'challenge-detail':
            mainContent.innerHTML = renderChallengeDetailPage();
            break;
        case 'circles':
            mainContent.innerHTML = renderCircles();
            break;
        case 'feed':
            mainContent.innerHTML = renderFeed();
            break;
        case 'activity':
            mainContent.innerHTML = renderActivity();
            break;
        case 'profile':
            mainContent.innerHTML = renderProfilePage();
            break;
        case 'settings':
            mainContent.innerHTML = renderSettingsPage();
            break;
        default:
            mainContent.innerHTML = renderFeed();
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
