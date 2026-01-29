
import { AppState } from '../utils/state.js';
import { showCircleSelectorModal } from '../components/CircleSelectorModal.js';

let currentFilter = 'all';
window.currentNotificationFilter = 'all';

export function renderNotifications() {
    const notifications = AppState.notifications || [];

    // Mark all as read when opening the page
    if (notifications.some(n => !n.read)) {
        setTimeout(() => {
            notifications.forEach(n => n.read = true);
            if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
        }, 1500); // Dar un poco más de tiempo para que el usuario las vea antes de que desaparezca el badge
    }

    // Filter notifications
    let filteredNotifications = [...notifications];
    if (currentFilter !== 'all') {
        filteredNotifications = notifications.filter(n => n.category === currentFilter);
    }

    // Sort by date (most recent first)
    const sortedNotifications = filteredNotifications.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );

    return `
        <div class="space-y-6 animate-fade-in pb-10">
            <!-- Header -->
            <div class="flex flex-col gap-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold tracking-tight text-white">
                            Notificaciones
                        </h1>
                    </div>
                    <button onclick="markAllAsRead()" class="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition-all flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">done_all</span>
                        Marcar todo como leído
                    </button>
                </div>

                <!-- Filter Tabs -->
                <div class="flex justify-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
                    ${renderFilterBtn('all', 'Todas', 'notifications')}
                    ${renderFilterBtn('social', 'Social', 'chat_bubble')}
                    ${renderFilterBtn('friends', 'Amigos', 'person_add')}
                    ${renderFilterBtn('challenges', 'Desafíos', 'emoji_events')}
                    ${renderFilterBtn('wellness', 'Bienestar', 'self_improvement')}
                    ${renderFilterBtn('competition', 'Competición', 'trending_up')}
                    ${renderFilterBtn('streaks', 'Rachas', 'local_fire_department')}
                    ${renderFilterBtn('brands', 'Marcas', 'campaign')}
                    ${renderFilterBtn('rewards', 'Premios', 'military_tech')}
                </div>
            </div>

            <!-- Notifications List -->
            <div id="notificationsContainer" class="space-y-3">
                ${sortedNotifications.length > 0 ?
            sortedNotifications.map(notif => renderNotificationItem(notif)).join('') :
            renderEmptyState()
        }
            </div>
        </div>
    `;
}

function renderFilterBtn(id, label, icon) {
    const isActive = currentFilter === id;
    return `
        <button onclick="filterNotifications('${id}')" 
            class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap 
            ${isActive ? 'bg-[#00f5d4] text-navy-900 shadow-[0_0_15px_rgba(0,245,212,0.3)]' : 'text-white/40 hover:bg-white/5 hover:text-white'}">
            <span class="material-symbols-outlined text-sm">${icon}</span>
            ${label}
        </button>
    `;
}

window.filterNotifications = function (filter) {
    currentFilter = filter;
    window.currentNotificationFilter = filter;
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = renderNotifications();
    }
};

function renderNotificationItem(notif) {
    const isUnread = !notif.read;
    const timeAgo = formatTimeAgo(notif.date);

    let content = '';
    let icon = '';
    let iconBg = '';
    let actions = '';

    switch (notif.type) {
        // --- SOCIAL ---
        case 'friend_request':
            icon = 'person_add';
            iconBg = 'bg-blue-500/20 text-blue-400';
            content = `<strong>${notif.actor.name}</strong> (@${notif.actor.username}) te ha enviado una solicitud de amistad.`;

            if (notif.processed) {
                actions = `
                    <div class="flex items-center gap-2 mt-3 px-3 py-1.5 rounded-lg bg-[#00f5d4]/20 border border-[#00f5d4]/30">
                        <span class="material-symbols-outlined text-[#00f5d4] text-sm">check_circle</span>
                        <span class="text-[#00f5d4] text-[10px] font-bold">Agregado a círculos</span>
                    </div>`;
            } else {
                actions = `
                    <div class="flex gap-2 mt-3">
                        <button onclick="showCircleSelectorModal('${notif.actor.id}', '${notif.actor.name}', '${notif.actor.username}', '${notif.id}')" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00f5d4] text-navy-900 text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,245,212,0.3)]">
                            <span class="material-symbols-outlined text-sm">group_add</span>
                            Agregar
                        </button>
                        <button onclick="markAsRead('${notif.id}')" class="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all">Omitir</button>
                    </div>`;
            }
            break;

        case 'post_comment':
            icon = 'chat_bubble';
            iconBg = 'bg-purple-500/20 text-purple-400';
            content = `<strong>${notif.actor.name}</strong> comentó: <span class="italic text-white/60">"${notif.data?.commentPreview || '...'}"</span>`;
            break;

        case 'post_reaction':
            icon = 'favorite';
            iconBg = 'bg-purple-500/20 text-purple-400';
            content = `A <strong>${notif.actor.name}</strong> le gustó tu publicación.`;
            break;

        // --- CHALLENGES ---
        case 'challenge_invite':
            icon = 'emoji_events';
            iconBg = 'bg-amber-500/20 text-amber-400';
            content = `<strong>${notif.actor.name}</strong> te invitó al desafío <strong>"${notif.data?.challengeTitle || 'Reto'}"</strong>.`;
            actions = `<div class="mt-3"><button onclick="navigateTo('challenge-detail', '${notif.data?.challengeId}')" class="px-3 py-1.5 rounded-lg bg-amber-500 text-navy-900 text-[10px] font-black uppercase">Ver Desafío</button></div>`;
            break;

        case 'challenge_goal_reached':
            icon = 'emoji_events';
            iconBg = 'bg-amber-500/20 text-amber-400';
            content = `¡Has completado el desafío <strong>"${notif.data?.challengeTitle}"</strong>! 🎉`;
            break;

        // --- COMPETITION ---
        case 'ranking_overtake':
        case 'ranking_update':
            icon = 'trending_up';
            iconBg = 'bg-rose-500/20 text-rose-400';
            content = `<strong>${notif.actor.name}</strong> te ha superado en el ranking de <strong>"${notif.data?.challengeTitle}"</strong>. ¡Recupera tu puesto! 📉`;
            break;

        case 'leaderboard_closing':
            icon = 'timer';
            iconBg = 'bg-rose-500/20 text-rose-400';
            content = `El ranking semanal cierra en breve. Estás a poco del Top 3.`;
            break;

        // --- WELLNESS ---
        case 'sedentary_reminder':
            icon = 'accessibility_new';
            iconBg = 'bg-emerald-500/20 text-emerald-400';
            content = `Llevas tiempo sentado. ¡Un paseo de 5 minutos te vendría genial! 🌿`;
            break;

        case 'daily_goal_reached':
        case 'goal_reached': // Legacy
            icon = 'check_circle';
            iconBg = 'bg-emerald-500/20 text-emerald-400';
            content = `¡Objetivo cumplido! Has alcanzado tu meta diaria de <strong>${notif.data?.metric || 'actividad'}</strong>.`;
            break;

        // --- STREAKS ---
        case 'streak_danger':
            icon = 'local_fire_department';
            iconBg = 'bg-orange-500/20 text-orange-400';
            content = `🔥 ¡Cuidado! Tu racha de ${notif.data?.streakDays || 5} días está en peligro. Muévete hoy para mantenerla.`;
            break;

        case 'personal_record':
            icon = 'show_chart';
            iconBg = 'bg-orange-500/20 text-orange-400';
            content = `🏅 ¡Nuevo Récord Personal! Nunca habías hecho tantos ${notif.data?.metric} en un día.`;
            break;

        // --- BRANDS ---
        case 'brand_promotion':
        case 'brand_event_start':
            icon = 'campaign';
            iconBg = 'bg-cyan-500/20 text-cyan-400';
            content = `<strong>${notif.actor.name}</strong> ha lanzado un nuevo evento exclusivo. ¡Participa y gana premios!`;
            break;

        // --- REWARDS ---
        case 'badge_unlocked':
        case 'achievement': // Legacy
            icon = 'military_tech';
            iconBg = 'bg-yellow-500/20 text-yellow-400';
            content = `🏆 ¡Has desbloqueado la insignia <strong>${notif.data?.badgeName || 'Campeón'}</strong>!`;
            break;

        default:
            icon = 'notifications';
            iconBg = 'bg-white/10 text-white';
            content = notif.message || 'Nueva notificación recibida.';
    }

    return `
        <div class="glass-card relative border-white/5 p-4 rounded-2xl flex gap-4 transition-all hover:bg-white/[0.07] group ${isUnread ? 'border-l-4 border-l-primary' : ''}">
            <!-- Actor Avatar -->
            <div class="relative shrink-0">
                <div class="size-12 rounded-full bg-navy-800 p-[1px] overflow-hidden border border-white/10">
                    <img src="${notif.actor.avatar || 'https://ui-avatars.com/api/?name=' + notif.actor.name}" class="size-full object-cover">
                </div>
                <!-- Mini Icon Overlay -->
                <div class="absolute -bottom-1 -right-1 size-5 rounded-full ${iconBg} flex items-center justify-center shadow-lg border border-navy-900">
                    <span class="material-symbols-outlined text-[10px]">${icon}</span>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pr-4">
                <div class="flex justify-between items-start gap-2 mb-1">
                    <p class="text-sm text-white/80 leading-snug">
                        ${content}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-primary/80 font-black uppercase tracking-wider">${timeAgo}</span>
                    ${isUnread ? '<div class="size-1.5 rounded-full bg-primary animate-pulse"></div>' : ''}
                </div>
                ${actions}
            </div>
        </div>
    `;
}

function renderEmptyState() {
    return `
        <div class="flex flex-col items-center justify-center py-20 text-center">
            <div class="size-20 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 opacity-20">
                <span class="material-symbols-outlined text-4xl">notifications_off</span>
            </div>
            <h3 class="text-white/60 font-bold">Sin resultados</h3>
            <p class="text-white/30 text-xs mt-1">No hay notificaciones en esta categoría.</p>
        </div>
    `;
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) return 'Ahora';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return then.toLocaleDateString();
}

// Global functions for actions
// Note: acceptFriendRequest is now handled by showCircleSelectorModal
// which calls acceptFriendRequestWithCircles from friendshipManager.js

// Legacy reject function kept for backwards compatibility
window.rejectFriendRequest = function (userId, notifId) {
    console.log('Rechazar amigo (legacy):', userId);
    markAsRead(notifId);
};

window.markAllAsRead = function () {
    AppState.notifications.forEach(n => n.read = true);
    if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
    const mainContent = document.getElementById('mainContent');
    if (mainContent) mainContent.innerHTML = renderNotifications();
};

function markAsRead(id) {
    const notif = AppState.notifications.find(n => n.id === id);
    if (notif) {
        notif.read = true;
        if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.innerHTML = renderNotifications();
    }
}
