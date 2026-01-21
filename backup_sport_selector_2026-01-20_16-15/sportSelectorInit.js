/**
 * Utility to mount SportSearchSelector in any container
 */
export async function mountSportSelector(containerId, options = {}) {
    try {
        console.log(`🔍 Iniciando carga de SportSearchSelector para ${containerId}...`);

        // Cache bust para asegurar carga de versión corregida
        const { SportSearchSelector } = await import(`../components/SportSearchSelector.js?v=${Date.now()}`);

        const defaultOptions = {
            mode: 'multiple',
            initialSelection: [],
            placeholder: 'Buscar deportes...',
            maxSelections: 50,
            onSelect: (selected) => console.log('Selection:', selected)
        };

        const finalOptions = { ...defaultOptions, ...options };

        const sportSelector = new SportSearchSelector(finalOptions);

        const selectorContainer = document.getElementById(containerId);

        if (selectorContainer) {
            selectorContainer.innerHTML = '';
            selectorContainer.appendChild(sportSelector.render());
            console.log(`✅ SportSearchSelector renderizado en ${containerId}`);
            return sportSelector; // Return instance for potential manual control
        } else {
            console.warn(`⚠️ No se encontró el contenedor ${containerId}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Error cargando SportSearchSelector en ${containerId}:`, error);

        const selectorContainer = document.getElementById(containerId);
        if (selectorContainer) {
            selectorContainer.innerHTML = `
                <div class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                    <span class="material-symbols-outlined text-xl mb-1">error</span>
                    <p>Error cargando deportes</p>
                </div>
            `;
        }
        return null;
    }
}
