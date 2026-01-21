
import { AppState } from '../utils/state.js';

let currentFilter = 'all';

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
        filteredNotifications = notifications.filter(n => {
            if (currentFilter === 'social') {
                return ['friend_request', 'post_comment', 'post_reaction', 'new_post'].includes(n.type);
            }
            if (currentFilter === 'challenges') {
                return ['challenge_invite', 'ranking_update'].includes(n.type);
            }
            if (currentFilter === 'health') {
                return ['achievement', 'goal_reached', 'sedentary_reminder'].includes(n.type);
            }
            return true;
        });
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
                    ${renderFilterBtn('social', 'Social', 'group')}
                    ${renderFilterBtn('challenges', 'Desafíos', 'emoji_events')}
                    ${renderFilterBtn('health', 'Bienestar', 'auto_awesome')}
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
        case 'friend_request':
            icon = 'person_add';
            iconBg = 'bg-blue-500/20 text-blue-400';
            content = `<strong>${notif.actor.name}</strong> (@${notif.actor.username}) te ha enviado una solicitud de amistad.`;
            actions = `
                <div class="flex gap-2 mt-3">
                    <button onclick="acceptFriendRequest('${notif.actor.id}', '${notif.id}')" class="px-3 py-1.5 rounded-lg bg-[#00f5d4] text-navy-900 text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all">Aceptar</button>
                    <button onclick="rejectFriendRequest('${notif.actor.id}', '${notif.id}')" class="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all">Rechazar</button>
                </div>
            `;
            break;
        case 'challenge_invite':
            icon = 'emoji_events';
            iconBg = 'bg-amber-500/20 text-amber-400';
            content = `<strong>${notif.actor.name}</strong> te ha invitado a unirte al desafío <strong>"${notif.data?.challengeTitle || 'Reto'}"</strong>.`;
            actions = `
                <div class="flex gap-2 mt-3">
                    <button onclick="navigateTo('challenge-detail', '${notif.data?.challengeId}')" class="px-3 py-1.5 rounded-lg bg-primary text-navy-900 text-[10px] font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all">Ver Desafío</button>
                </div>
            `;
            break;
        case 'post_comment':
            icon = 'chat_bubble';
            iconBg = 'bg-purple-500/20 text-purple-400';
            content = `<strong>${notif.actor.name}</strong> comentó en tu publicación: <span class="italic text-white/60">"${notif.data?.commentPreview || '...'}"</span>`;
            break;
        case 'post_reaction':
            icon = 'favorite';
            iconBg = 'bg-rose-500/20 text-rose-400';
            content = `A <strong>${notif.actor.name}</strong> le ha gustado tu publicación.`;
            break;
        case 'new_post':
            icon = 'add_circle';
            iconBg = 'bg-emerald-500/20 text-emerald-400';
            content = `<strong>${notif.actor.name}</strong> ha compartido una nueva actividad.`;
            break;
        case 'achievement':
            icon = 'verified';
            iconBg = 'bg-yellow-500/20 text-yellow-400';
            content = `¡Felicidades! Has completado tu objetivo de <strong>${notif.data?.goalName || 'ejercicio'}</strong>.`;
            break;
        case 'ranking_update':
            icon = 'trending_up';
            iconBg = 'bg-blue-500/20 text-blue-400';
            content = `<strong>${notif.actor.name}</strong> te ha adelantado en el ranking del desafío <strong>"${notif.data?.challengeTitle || 'Reto'}"</strong>.`;
            break;
        case 'goal_reached':
            icon = 'stars';
            iconBg = 'bg-amber-500/20 text-amber-400';
            content = `¡Enhorabuena! Has llegado a tu meta de <strong>${notif.data?.metric || 'pasos'}</strong> de hoy. 🏆`;
            break;
        case 'sedentary_reminder':
            icon = 'chair';
            iconBg = 'bg-rose-500/20 text-rose-400';
            content = `Llevas mucho tiempo sentado, ¿qué tal un paseo de 5 minutos? 🚶‍♂️`;
            break;
        default:
            icon = 'notifications';
            iconBg = 'bg-white/10 text-white';
            content = notif.message || 'Nueva notificación';
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
window.acceptFriendRequest = function (userId, notifId) {
    console.log('Aceptar amigo:', userId);
    showToast('¡Nueva amistad confirmada! 🤝');
    markAsRead(notifId);
};

window.rejectFriendRequest = function (userId, notifId) {
    console.log('Rechazar amigo:', userId);
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
