/**
 * Inicializar Sport Search Selector en Editar Perfil
 * Llamar después de renderizar el modal
 */
export async function initSportSelector() {
    try {
        console.log('🔍 Iniciando carga de SportSearchSelector...');

        // Cache bust para asegurar carga de versión corregida
        const { SportSearchSelector } = await import(`../components/SportSearchSelector.js?v=${Date.now()}`);
        console.log('✅ SportSearchSelector importado correctamente');

        const user = AppState.currentUser;

        const sportSelector = new SportSearchSelector({
            mode: 'multiple',
            initialSelection: user.interests || [],
            placeholder: 'Buscar deportes...',
            maxSelections: 10,
            onSelect: (sports) => {
                AppState.currentUser.interests = sports;
                console.log('✅ Deportes seleccionados:', sports);
            }
        });
        console.log('✅ SportSearchSelector instanciado');

        const selectorContainer = document.getElementById('sport-selector-container');
        console.log('📦 Contenedor encontrado:', !!selectorContainer);

        if (selectorContainer) {
            selectorContainer.innerHTML = '';
            selectorContainer.appendChild(sportSelector.render());
            console.log('✅ SportSearchSelector renderizado exitosamente');
        } else {
            console.error('❌ No se encontró el contenedor sport-selector-container');
        }
    } catch (error) {
        console.error('❌ Error cargando SportSearchSelector:', error);
        console.error('Stack:', error.stack);

        // Fallback: Mostrar mensaje de error al usuario
        const selectorContainer = document.getElementById('sport-selector-container');
        if (selectorContainer) {
            selectorContainer.innerHTML = `
                <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                    <p class="font-bold mb-1">Error cargando selector de deportes</p>
                    <p class="text-xs opacity-75">${error.message}</p>
                    <p class="text-xs opacity-50 mt-2">Por favor recarga la página</p>
                </div>
            `;
        }
    }
}

// Exponer globalmente
if (typeof window !== 'undefined') {
    window.initSportSelector = initSportSelector;
}
