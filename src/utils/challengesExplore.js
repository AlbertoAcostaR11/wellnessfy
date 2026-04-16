
import { AppState } from './state.js';
import { mountSportSelector } from './sportSelectorInit.js';

// ==========================================
// MÓDULO EXPLORAR DESAFÍOS (GEOLOCALIZADO)
// ==========================================

export const ExploreModule = {
    userLocation: null,
    radius: 5000, // Empezar con radio amplio para ver algo
    activeSports: [], // Array vacío = todos
    isLoading: false,
    challengesFound: [],

    // Base de datos simulada de desafíos "cercanos"
    // En producción, esto vendría de una query geoespacial a Firestore (GeoFlutterFire o similar)
    // Datos reales conectados a AppState


    init: function () {
        console.log('🌍 Iniciando Explorador Geolocalizado...');
        // Intentar obtener ubicación si no existe
        if (!this.userLocation) {
            this.getUserLocation();
        } else {
            this.updateResults();
        }

        // Exponer función para el slider de radio
        window.updateExploreRadius = (val) => {
            this.radius = parseInt(val);
            const label = this.radius >= 5000 ? 'Global (Todo el mundo)' : `${this.radius} km`;
            document.getElementById('radiusValue').textContent = label;
            this.updateResults();
        };

        // Montar Selector de Deportes
        mountSportSelector('geo-explore-sport-selector', {
            mode: 'multiple',
            initialSelection: this.activeSports,
            placeholder: 'Filtrar por deporte...',
            onSelect: (selectedSports) => {
                this.activeSports = selectedSports;
                this.updateResults();
            }
        });
    },

    getUserLocation: function () {
        this.isLoading = true;
        this.renderStatus('Buscando tu ubicación...');

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('📍 Ubicación encontrada:', this.userLocation);
                    this.isLoading = false;
                    this.updateResults();
                },
                (error) => {
                    console.error("Error GPS:", error);
                    // Fallback: CDMX centro (o ubicación default)
                    this.userLocation = { lat: 19.4326, lng: -99.1332 };
                    this.isLoading = false;
                    this.renderStatus('Ubicación no disponible. Usando predeterminada.');
                    setTimeout(() => this.updateResults(), 1000);
                }
            );
        } else {
            this.userLocation = { lat: 19.4326, lng: -99.1332 };
            this.isLoading = false;
            this.updateResults();
        }
    },

    // Fórmula Haversine para distancia en km
    getDistanceFromLatLonInKm: function (lat1, lon1, lat2, lon2) {
        var R = 6371; // Radio de la tierra en km
        var dLat = this.deg2rad(lat2 - lat1);
        var dLon = this.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        return d;
    },

    deg2rad: function (deg) {
        return deg * (Math.PI / 180);
    },

    updateResults: function () {
        if (!this.userLocation) return;

        if (!AppState.challenges) return;

        // Filtrar desafíos reales
        const filtered = AppState.challenges.map(c => {
            // Verificar si tiene geolocalización
            if (!c.location || !c.location.lat || !c.location.lng) {
                return { ...c, distanceKm: 9999 }; // Sin ubicación = Lejos
            }

            const dist = this.getDistanceFromLatLonInKm(this.userLocation.lat, this.userLocation.lng, c.location.lat, c.location.lng);
            return { ...c, distanceKm: dist };
        }).filter(c => {
            const uid = AppState.currentUser.id || AppState.currentUser.uid;
            const username = AppState.currentUser.username;
            const name = AppState.currentUser.name;

            // 0. Ocultar mis propios desafíos (Discovery)
            // Usamos la misma lógica robusta que en MyChallengesTab
            const isCreator = (c.creator?.id === uid) ||
                (c.creator?.username === username) ||
                (c.creator?.name === name) ||
                (c.createdBy === uid) ||
                (c.creatorId === uid);

            if (isCreator) return false;

            // 0.5 Ocultar desafíos a los que YA me uní
            const isParticipant = c.participantsList && c.participantsList.includes(uid);
            if (isParticipant) return false;

            // 1. Filtro de Visibilidad Estratégica (NUEVO)
            const vis = c.visibility || {};
            const scope = vis.scope || 'global'; // Fallback a global si no tiene visibilidad definida

            if (scope === 'local') {
                const center = vis.location || c.location || {};
                if (!center.lat || !center.lng) return false; // Si es local pero no tiene centro, se oculta

                const dist = this.getDistanceFromLatLonInKm(this.userLocation.lat, this.userLocation.lng, center.lat, center.lng);
                c.distanceKm = dist; // Actualizar para ordenamiento

                if (dist > (vis.radius || this.radius)) return false;
            } else if (scope === 'national' || scope === 'global') {
                // Desafíos Omnipresentes (Premium/Pro)
                c.distanceKm = 0; // Se muestran arriba
            } else {
                // Fallback para desafíos de usuarios normales (Geolocalizados por default)
                if (c.distanceKm > this.radius) return false;
            }

            // 2. Filtro Privacidad
            if (c.challengePrivacy === 'private' || c.privacy === 'private') {
                return false;
            }

            // 3. Filtro de Deporte (Multideporte support)
            if (this.activeSports.length === 0) return true;

            if (c.allowedSports && Array.isArray(c.allowedSports)) {
                return c.allowedSports.some(s => this.activeSports.includes(s));
            }
            const cat = (c.category || '').toLowerCase();
            return this.activeSports.includes(cat);

        }).sort((a, b) => a.distanceKm - b.distanceKm); // Más cercanos primero

        console.log(`🔍 [Explore] Filtrado: ${filtered.length} desafíos de ${AppState.challenges.length} (Radio: ${this.radius}km)`);
        this.renderResults(filtered);
    },

    renderStatus: function (msg) {
        const el = document.getElementById('exploreResults');
        if (el) el.innerHTML = `<div class="p-10 text-center text-white/50 animate-pulse">${msg}</div>`;
    },

    renderResults: function (results) {
        const container = document.getElementById('exploreResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12 opacity-50 animate-fade-in">
                    <span class="material-symbols-outlined text-4xl mb-3 text-white/20">radar</span>
                    <p class="text-sm font-bold text-white">No hay desafíos cercanos</p>
                    <p class="text-xs text-white/50">Intenta ampliar el radio de búsqueda</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(challenge => {
            // Fix: Handle creator object correctly
            const creatorName = challenge.creator?.name || challenge.creator || 'Desconocido';
            const bgImage = challenge.image || challenge.imageGradient || '';
            // Ensure we have a valid URL if possible, otherwise rely on CSS fallback or solid color
            const style = bgImage.includes('url') ? `background-image: ${bgImage}` : `background-image: url('${bgImage}')`;

            return `
            <div class="glass-card rounded-2xl p-4 flex gap-4 items-center group cursor-pointer hover:border-[#00f5d4]/30 transition-all" onclick="window.showChallengeDetails && window.showChallengeDetails('${challenge.id}')">
                <div class="size-16 rounded-xl bg-cover bg-center shrink-0 border border-white/10" style="${style}"></div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-white text-sm truncate pr-2 group-hover:text-[#00f5d4] transition-colors">${challenge.name}</h4>
                        <span class="text-[10px] font-bold text-[#00f5d4] bg-[#00f5d4]/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                            ${challenge.distanceKm.toFixed(1)} km
                        </span>
                    </div>
                    <p class="text-xs text-white/50 truncate mb-2">por ${creatorName}</p>
                    
                    <div class="flex items-center gap-3 text-[10px] text-white/40 font-bold uppercase tracking-wider">
                         <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px]">group</span> ${challenge.participants}</span>
                         <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[12px] text-[#00d2ff]">verified</span> Oficial</span>
                    </div>
                </div>
                
                <button class="size-8 rounded-full bg-white/5 flex items-center justify-center text-[#00f5d4] hover:bg-[#00f5d4] hover:text-[#0f172a] transition-all shrink-0">
                    <span class="material-symbols-outlined text-lg">add</span>
                </button>
            </div>
        `}).join('');
    },

    // Retorna el HTML Inicial de la Pestaña
    getTemplate: function () {
        return `
            <div class="animate-fade-in space-y-6">
                <!-- 1. Filtro Deporte (NUEVO SELECTOR) -->
                <div class="space-y-2">
                    <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">¿Qué quieres practicar?</label>
                    <div id="geo-explore-sport-selector">
                        <!-- SportSearchSelector se montará aquí -->
                        <div class="h-10 bg-white/5 rounded-xl animate-pulse"></div>
                    </div>
                </div>

                <!-- 2. Slider Distancia Inteligente -->
                <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div class="flex justify-between items-end mb-4">
                        <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm text-[#00f5d4]">location_on</span>
                            Radio de Búsqueda
                        </label>
                        <span id="radiusValue" class="text-xl font-bold text-[#00f5d4]">${this.radius} km</span>
                    </div>
                    
                    <input type="range" min="1" max="10000" step="10" value="${this.radius}" class="w-full accent-[#00f5d4] cursor-pointer" 
                           oninput="window.updateExploreRadius(this.value)">
                           
                    <div class="flex justify-between text-[9px] text-white/30 font-bold uppercase tracking-widest mt-2">
                        <span>1 km</span>
                        <span>500 km</span>
                        <span>Global</span>
                    </div>
                </div>

                <div class="border-t border-white/5 my-2"></div>

                <!-- 3. Resultados Geolocalizados -->
                <div>
                     <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1 mb-4 block">Desafíos Encontrados</label>
                     <div id="exploreResults" class="space-y-3 min-h-[200px]">
                        <!-- JS Inyectará resultados aquí -->
                        <div class="flex flex-col items-center justify-center h-40 text-white/30 animate-pulse">
                            <span class="material-symbols-outlined text-3xl mb-2">satellite_alt</span>
                            <p class="text-xs">Triangulando satélites...</p>
                        </div>
                     </div>
                </div>
            </div>
        `;
    },

    renderIcon: function (id, name, icon) {
        const isActive = this.activeSport === id;
        const classes = isActive
            ? 'bg-[#00f5d4]/20 border-[#00f5d4] text-[#00f5d4]'
            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10';

        return `
            <div onclick="window.setExploreSport('${id}')" 
                 data-sport="${id}"
                 class="sport-filter-btn flex flex-col items-center justify-center min-w-[70px] p-2 rounded-xl border cursor-pointer transition-all ${classes}">
                <span class="material-symbols-outlined text-xl mb-1">${icon}</span>
                <span class="text-[9px] font-bold uppercase">${name}</span>
            </div>
        `;
    }
};
