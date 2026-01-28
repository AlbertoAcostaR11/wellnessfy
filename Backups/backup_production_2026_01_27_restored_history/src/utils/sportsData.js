// Sports/Activities data with Google Fit activity type codes
export const SPORTS_DATA = [
    { id: 7, name: 'Caminar', icon: 'directions_walk', color: '#00ff9d', category: 'cardio' },
    { id: 9, name: 'Correr', icon: 'directions_run', color: '#ff6b6b', category: 'cardio' },
    { id: 1, name: 'Ciclismo', icon: 'directions_bike', color: '#4ecdc4', category: 'cardio' },
    { id: 5, name: 'Entrenamiento de Fuerza', icon: 'fitness_center', color: '#ff9f43', category: 'strength' },
    { id: 100, name: 'Yoga', icon: 'self_improvement', color: '#a29bfe', category: 'mindfulness' },
    { id: 45, name: 'Meditación', icon: 'psychiatry', color: '#b19cd9', category: 'mindfulness' },
    { id: 106, name: 'Respiración', icon: 'air', color: '#c8b6ff', category: 'mindfulness' },
    { id: 82, name: 'Natación', icon: 'pool', color: '#00d2ff', category: 'water' },
    { id: 104, name: 'HIIT', icon: 'local_fire_department', color: '#ff4757', category: 'intensity' },
    { id: 79, name: 'Senderismo', icon: 'hiking', color: '#26de81', category: 'outdoor' },
    { id: 102, name: 'Calistenia', icon: 'accessibility_new', color: '#fd79a8', category: 'strength' },
    { id: 6, name: 'Baile', icon: 'music_note', color: '#f368e0', category: 'fun' },
    { id: 21, name: 'Máquina Elíptica', icon: 'settings_accessibility', color: '#00cec9', category: 'cardio' },
    { id: 11, name: 'Fútbol', icon: 'sports_soccer', color: '#00b894', category: 'team' },
    { id: 101, name: 'Pilates', icon: 'spa', color: '#dfe6e9', category: 'mindfulness' },
    { id: 87, name: 'Tenis', icon: 'sports_tennis', color: '#ffeaa7', category: 'racket' },
    { id: 2, name: 'Boxeo', icon: 'sports_martial_arts', color: '#ee5a6f', category: 'combat' },
    { id: 3, name: 'Baloncesto', icon: 'sports_basketball', color: '#ff7675', category: 'team' },
    { id: 8, name: 'Cinta de correr', icon: 'sprint', color: '#74b9ff', category: 'cardio' },
    { id: 15, name: 'Spinning', icon: 'pedal_bike', color: '#a29bfe', category: 'cardio' },
    { id: 59, name: 'Artes Marciales', icon: 'sports_kabaddi', color: '#d63031', category: 'combat' },
    { id: 48, name: 'Escalada', icon: 'terrain', color: '#6c5ce7', category: 'outdoor' },
    { id: 40, name: 'Remo', icon: 'rowing', color: '#0984e3', category: 'cardio' },
    { id: 90, name: 'Voleibol', icon: 'sports_volleyball', color: '#fdcb6e', category: 'team' },
    { id: 27, name: 'CrossFit', icon: 'exercise', color: '#e17055', category: 'intensity' },
    { id: 43, name: 'Patinaje', icon: 'roller_skating', color: '#fab1a0', category: 'fun' },
    { id: 20, name: 'Esquí', icon: 'downhill_skiing', color: '#74b9ff', category: 'winter' },
    { id: 64, name: 'Snowboard', icon: 'snowboarding', color: '#a29bfe', category: 'winter' },
    { id: 107, name: 'Surf', icon: 'surfing', color: '#00cec9', category: 'water' },
    { id: 4, name: 'Bádminton', icon: 'sports_tennis', color: '#dfe6e9', category: 'racket' },
    { id: 76, name: 'Rugby', icon: 'sports_rugby', color: '#2d3436', category: 'team' },
    { id: 10, name: 'Fútbol Americano', icon: 'sports_football', color: '#636e72', category: 'team' },
    { id: 94, name: 'Béisbol', icon: 'sports_baseball', color: '#b2bec3', category: 'team' },
    { id: 87, name: 'Padel', icon: 'sports_tennis', color: '#00b894', category: 'racket' },
    { id: 32, name: 'Cricket', icon: 'sports_cricket', color: '#f9ca24', category: 'team' },
    { id: 34, name: 'Frisbee', icon: 'album', color: '#f0932b', category: 'fun' },
    { id: 31, name: 'Esgrima', icon: 'swords', color: '#c7ecee', category: 'combat' },
    { id: 29, name: 'Curling', icon: 'sports', color: '#dfe4ea', category: 'winter' }
];

export function renderDeportesTab() {
    // Importar helpers del agregador
    const { aggregateWeeklySports, getWeekDayLabels, formatSportValue } =
        window.activityAggregatorModule || {};

    // Verificar si tenemos datos procesados
    const hasAggregator = window.activityAggregatorModule && window.AppState?.weeklyStats?.rawActivitySegments;

    if (!hasAggregator) {
        // Fallback: Mostrar mensaje de sincronización
        return `
            <div class="space-y-6">
                <div class="glass-card rounded-3xl p-8 text-center">
                    <span class="material-symbols-outlined text-6xl text-white/20 mb-4">sports_tennis</span>
                    <h3 class="text-lg font-bold text-white mb-2">Sincroniza para ver tus deportes</h3>
                    <p class="text-sm text-white/50 mb-6">Conecta con Google Health para ver un resumen automático de todas tus actividades de la semana</p>
                    <button class="btn-primary px-6 py-3" onclick="syncHealthConnect()">
                        <span class="material-symbols-outlined text-sm mr-2">sync</span>
                        Sincronizar Ahora
                    </button>
                </div>
            </div>
        `;
    }

    // Agregar datos
    const weeklyActivities = aggregateWeeklySports(window.AppState.weeklyStats.rawActivitySegments);
    const dayLabels = getWeekDayLabels();

    // Si no hay actividades esta semana
    if (Object.keys(weeklyActivities).length === 0) {
        return `
            <div class="space-y-6">
                <div class="glass-card rounded-3xl p-8 text-center">
                    <span class="material-symbols-outlined text-6xl text-white/20 mb-4">sentiment_satisfied</span>
                    <h3 class="text-lg font-bold text-white mb-2">No hay actividades esta semana</h3>
                    <p class="text-sm text-white/50">Sal a moverte y vuelve a sincronizar para ver tus estadísticas aquí</p>
                </div>
            </div>
        `;
    }

    // Renderizar gráficas dinámicas
    let html = `
        <div class="space-y-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-white">Actividades de la Semana</h3>
                    <p class="text-xs text-white/50">Últimos 7 días • Actualizado automáticamente</p>
                </div>
                <div class="text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full">
                    ${Object.keys(weeklyActivities).length} ${Object.keys(weeklyActivities).length === 1 ? 'deporte' : 'deportes'}
                </div>
            </div>
    `;

    // Renderizar cada deporte con su gráfica
    Object.entries(weeklyActivities).forEach(([sportName, sportData]) => {
        const maxValue = Math.max(...sportData.days, 1); // Evitar división por 0
        const { icon, color } = sportData.metadata;

        html += `
            <div class="glass-card rounded-2xl p-5 hover:border-[${color}]/30 transition-all">
                <!-- Header del Deporte -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="size-12 rounded-xl flex items-center justify-center" style="background: ${color}15; border: 1px solid ${color}30;">
                            <span class="material-symbols-outlined text-2xl" style="color: ${color}; font-variation-settings: 'FILL' 1">${icon}</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-white">${sportName}</h4>
                            <p class="text-xs text-white/50">Total: ${formatSportValue(sportData.total, sportData.unit)}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-white/40 uppercase tracking-wider">Promedio</p>
                        <p class="text-sm font-bold" style="color: ${color}">${formatSportValue(sportData.total / 7, sportData.unit)}/día</p>
                    </div>
                </div>

                <!-- Gráfica de Barras -->
                <div class="flex items-end justify-between gap-2 h-32 mb-2">
                    ${sportData.days.map((value, index) => {
            // ESCALA PROPORCIONAL: 4 píxeles por unidad (km o hora)
            const PIXELS_PER_UNIT = 4;
            const heightPx = value * PIXELS_PER_UNIT;
            const maxHeightPx = 128; // Altura máxima del contenedor (h-32 = 128px)

            // Limitar altura al máximo del contenedor
            const finalHeightPx = Math.min(heightPx, maxHeightPx);
            const heightPercent = (finalHeightPx / maxHeightPx) * 100;

            const isToday = index === 6;
            return `
                            <div class="flex-1 flex flex-col items-center gap-1">
                                <div class="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 relative group" 
                                     style="height: ${heightPercent}%; background: ${value > 0 ? `linear-gradient(to top, ${color}, ${color}80)` : 'rgba(255,255,255,0.05)'}; min-height: 4px;">
                                    ${value > 0 ? `
                                        <div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap" style="color: ${color}">
                                            ${formatSportValue(value, sportData.unit)}
                                        </div>
                                    ` : ''}
                                </div>
                                <span class="text-[9px] font-bold ${isToday ? 'text-white' : 'text-white/40'} uppercase tracking-wider">${dayLabels[index]}</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    return html;
}

// Tab switching function
window.switchActivityTab = function (tabName) {
    // Update tab buttons
    document.querySelectorAll('.activity-tab').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });

    const activeContent = document.getElementById(`tab-${tabName}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('active');
    }

    // Force re-render of charts if switching to Resumen tab
    if (tabName === 'resumen' && typeof window.renderWeeklyCharts === 'function') {
        // Small delay to ensure DOM is visible/layout calculated
        setTimeout(() => window.renderWeeklyCharts(), 50);
    }
};

// Toggle sport selection
window.toggleSport = function (sportId, sportName) {
    const card = document.querySelector(`[data-sport-id="${sportId}"]`);
    const icon = card.querySelector('.material-symbols-outlined');

    // Toggle active state
    card.classList.toggle('sport-active');

    if (card.classList.contains('sport-active')) {
        icon.style.fontVariationSettings = "'FILL' 1";
        card.style.borderColor = icon.style.color;
        card.style.backgroundColor = `${icon.style.color}15`;

        // Save to user preferences
        const userSports = JSON.parse(localStorage.getItem('user_sports') || '[]');
        if (!userSports.includes(sportId)) {
            userSports.push(sportId);
            localStorage.setItem('user_sports', JSON.stringify(userSports));
        }

        console.log(`✅ ${sportName} añadido a tus deportes`);
    } else {
        icon.style.fontVariationSettings = "'FILL' 0";
        card.style.borderColor = '';
        card.style.backgroundColor = '';

        // Remove from user preferences
        const userSports = JSON.parse(localStorage.getItem('user_sports') || '[]');
        const index = userSports.indexOf(sportId);
        if (index > -1) {
            userSports.splice(index, 1);
            localStorage.setItem('user_sports', JSON.stringify(userSports));
        }

        console.log(`❌ ${sportName} eliminado de tus deportes`);
    }
};

// Load user's selected sports on page load
window.loadUserSports = function () {
    const userSports = JSON.parse(localStorage.getItem('user_sports') || '[]');
    userSports.forEach(sportId => {
        const card = document.querySelector(`[data-sport-id="${sportId}"]`);
        if (card) {
            card.classList.add('sport-active');
            const icon = card.querySelector('.material-symbols-outlined');
            icon.style.fontVariationSettings = "'FILL' 1";
            card.style.borderColor = icon.style.color;
            card.style.backgroundColor = `${icon.style.color}15`;
        }
    });
};

// Auto-load on tab switch
setTimeout(() => {
    const deportesTab = document.querySelector('[data-tab="deportes"]');
    if (deportesTab) {
        deportesTab.addEventListener('click', () => {
            setTimeout(window.loadUserSports, 100);
        });
    }
}, 1000);

// Auto-refresh when weekly stats are updated (after sync)
window.addEventListener('weeklyStatsUpdated', () => {
    console.log('📊 Stats actualizados, refrescando Mis Deportes...');
    const deportesContent = document.getElementById('tab-deportes');
    if (deportesContent && !deportesContent.classList.contains('hidden')) {
        // La pestaña está activa, re-renderizar
        deportesContent.innerHTML = renderDeportesTab();
        console.log('✅ Mis Deportes actualizado');
    }
});
