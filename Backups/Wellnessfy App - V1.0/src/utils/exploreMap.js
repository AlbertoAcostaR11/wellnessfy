// Google Maps Integration for Explore Tab
let exploreMap = null;
let userMarker = null;

// Initialize Google Maps in Explore tab
window.initializeExploreMap = function () {
    // Wait for Google Maps API to load
    if (typeof google === 'undefined' || !google.maps) {
        console.log('⏳ Esperando Google Maps API...');
        setTimeout(initializeExploreMap, 500);
        return;
    }

    const mapContainer = document.getElementById('exploreMap');
    if (!mapContainer) {
        console.log('⚠️ Contenedor de mapa no encontrado');
        return;
    }

    // Get user location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Create map
                exploreMap = new google.maps.Map(mapContainer, {
                    center: userLocation,
                    zoom: 14,
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{ "color": "#0f172a" }]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#ffffff" }]
                        },
                        {
                            "elementType": "labels.text.stroke",
                            "stylers": [{ "color": "#0f172a" }]
                        },
                        {
                            "featureType": "road",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#1e293b" }]
                        },
                        {
                            "featureType": "water",
                            "elementType": "geometry",
                            "stylers": [{ "color": "#0ea5e9" }]
                        }
                    ],
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false
                });

                // Add user marker
                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: exploreMap,
                    title: 'Tu ubicación',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#00f5d4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 3
                    },
                    animation: google.maps.Animation.DROP
                });

                // Add circle radius
                const circle = new google.maps.Circle({
                    map: exploreMap,
                    center: userLocation,
                    radius: 1000, // 1km
                    fillColor: '#00f5d4',
                    fillOpacity: 0.1,
                    strokeColor: '#00f5d4',
                    strokeOpacity: 0.3,
                    strokeWeight: 2
                });

                // Save location to localStorage
                localStorage.setItem('user_location', JSON.stringify(userLocation));

                console.log('✅ Mapa inicializado en:', userLocation);
            },
            (error) => {
                console.error('Error obteniendo ubicación:', error);

                // Fallback to default location (Ciudad de México)
                const defaultLocation = { lat: 19.4326, lng: -99.1332 };

                exploreMap = new google.maps.Map(mapContainer, {
                    center: defaultLocation,
                    zoom: 12,
                    styles: [
                        {
                            "elementType": "geometry",
                            "stylers": [{ "color": "#0f172a" }]
                        },
                        {
                            "elementType": "labels.text.fill",
                            "stylers": [{ "color": "#ffffff" }]
                        }
                    ],
                    disableDefaultUI: true,
                    zoomControl: true
                });

                mapContainer.innerHTML += `
                    <div class="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-full text-xs font-bold">
                        ⚠️ Activa permisos de ubicación
                    </div>
                `;
            }
        );
    } else {
        console.error('Geolocalización no soportada');
        mapContainer.innerHTML = `
            <div class="flex items-center justify-center h-full text-white/50 text-sm">
                Geolocalización no disponible
            </div>
        `;
    }
};

// Auto-initialize when switching to explore tab
setTimeout(() => {
    const exploreTab = document.querySelector('[onclick*="explore"]');
    if (exploreTab) {
        exploreTab.addEventListener('click', () => {
            setTimeout(initializeExploreMap, 300);
        });
    }
}, 1000);
