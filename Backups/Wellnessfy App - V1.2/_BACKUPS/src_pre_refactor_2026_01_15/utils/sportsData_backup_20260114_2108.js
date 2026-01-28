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
    const categories = {
        'cardio': { name: 'Cardio', icon: 'favorite', color: '#ff6b6b' },
        'strength': { name: 'Fuerza', icon: 'fitness_center', color: '#ff9f43' },
        'mindfulness': { name: 'Mente & Cuerpo', icon: 'self_improvement', color: '#a29bfe' },
        'team': { name: 'Deportes de Equipo', icon: 'groups', color: '#00b894' },
        'water': { name: 'Acuáticos', icon: 'pool', color: '#00d2ff' },
        'outdoor': { name: 'Aventura', icon: 'hiking', color: '#26de81' },
        'combat': { name: 'Combate', icon: 'sports_martial_arts', color: '#d63031' },
        'racket': { name: 'Raqueta', icon: 'sports_tennis', color: '#ffeaa7' },
        'winter': { name: 'Invierno', icon: 'ac_unit', color: '#74b9ff' },
        'intensity': { name: 'Alta Intensidad', icon: 'local_fire_department', color: '#ff4757' },
        'fun': { name: 'Diversión', icon: 'celebration', color: '#f368e0' }
    };

    let html = `
        <div class="space-y-6">
            <div class="glass-card rounded-3xl p-6">
                <div class="flex items-center gap-3 mb-6">
                    <span class="material-symbols-outlined text-3xl text-[#00f5d4]">sports</span>
                    <div>
                        <h3 class="text-lg font-bold text-white">Mis Deportes</h3>
                        <p class="text-xs text-white/50">Selecciona tus actividades favoritas</p>
                    </div>
                </div>
    `;

    // Group sports by category
    const grouped = {};
    SPORTS_DATA.forEach(sport => {
        if (!grouped[sport.category]) grouped[sport.category] = [];
        grouped[sport.category].push(sport);
    });

    // Render each category
    Object.entries(grouped).forEach(([catKey, sports]) => {
        const cat = categories[catKey];
        if (!cat) return;

        html += `
            <div class="mb-6">
                <div class="flex items-center gap-2 mb-3">
                    <span class="material-symbols-outlined text-xl" style="color: ${cat.color}">${cat.icon}</span>
                    <h4 class="text-sm font-bold text-white/80 uppercase tracking-wider">${cat.name}</h4>
                </div>
                <div class="grid grid-cols-3 gap-3">
        `;

        sports.forEach(sport => {
            html += `
                <button 
                    class="sport-card flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[${sport.color}]/50 hover:bg-white/10 transition-all duration-300 group"
                    data-sport-id="${sport.id}"
                    onclick="window.toggleSport(${sport.id}, '${sport.name}')"
                >
                    <span class="material-symbols-outlined text-3xl transition-all duration-300" style="color: ${sport.color}; font-variation-settings: 'FILL' 0">${sport.icon}</span>
                    <span class="text-[10px] font-bold text-white/60 group-hover:text-white/90 text-center transition-colors">${sport.name}</span>
                </button>
            `;
        });

        html += `
                </div>
            </div>
        `;
    });

    html += `
            </div>
        </div>
    `;

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
