/**
 * 🔍 Sport Search Selector Component
 * 
 * Buscador universal de deportes con selección única o múltiple.
 * 
 * @usage
 * ```javascript
 * const selector = new SportSearchSelector({
 *     mode: 'multiple',              // 'single' | 'multiple'
 *     initialSelection: ['yoga'],    // Array o string
 *     onSelect: (selection) => {},   // Callback
 *     placeholder: 'Buscar deportes...',
 *     maxSelections: 5               // Solo para mode='multiple'
 * });
 * 
 * document.getElementById('container').appendChild(selector.render());
 * ```
 */

import { getAllSports, getSportIcon, getSportDisplayName } from '../utils/sportIcons.js';

export class SportSearchSelector {
    constructor(options = {}) {
        this.mode = options.mode || 'single'; // 'single' | 'multiple'
        this.initialSelection = options.initialSelection || (this.mode === 'multiple' ? [] : null);
        this.onSelect = options.onSelect || (() => { });
        this.placeholder = options.placeholder || 'Buscar deportes...';
        this.maxSelections = options.maxSelections || Infinity;

        // Estado interno
        this.allSports = getAllSports();
        this.filteredSports = [...this.allSports];
        this.selectedSports = this.mode === 'multiple'
            ? (Array.isArray(this.initialSelection) ? [...this.initialSelection] : [])
            : this.initialSelection;
        this.searchQuery = '';
        this.isOpen = false;
        this.focusedIndex = -1;

        // Referencias DOM
        this.container = null;
        this.searchInput = null;
        this.dropdown = null;
        this.selectedChips = null;

        // Bind methods
        this.handleSearch = this.handleSearch.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
        this.toggleSport = this.toggleSport.bind(this);
    }

    /**
     * Renderizar componente
     * @returns {HTMLElement}
     */
    render() {
        this.container = document.createElement('div');
        this.container.className = 'sport-search-selector';
        this.container.innerHTML = this.getTemplate();

        // Obtener referencias
        this.searchInput = this.container.querySelector('.sport-search-input');
        this.dropdown = this.container.querySelector('.sport-search-dropdown');
        this.selectedChips = this.container.querySelector('.sport-selected-chips');

        // Attach events
        this.attachEvents();

        // Renderizar selección inicial
        if (this.mode === 'multiple' && this.selectedSports.length > 0) {
            this.renderSelectedChips();
        }

        return this.container;
    }

    /**
     * Template HTML
     */
    getTemplate() {
        return `
            <div class="sport-search-wrapper">
                ${this.mode === 'multiple' ? `
                    <div class="sport-selected-chips"></div>
                ` : ''}
                
                <div class="sport-search-input-wrapper">
                    <span class="material-symbols-outlined sport-search-icon">search</span>
                    <input 
                        type="text" 
                        class="sport-search-input" 
                        placeholder="${this.placeholder}"
                        autocomplete="off"
                    >
                    ${this.mode === 'single' && this.selectedSports ? `
                        <button class="sport-search-clear" title="Limpiar">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    ` : ''}
                </div>
                
                <div class="sport-search-dropdown" style="display: none;">
                    <div class="sport-search-results"></div>
                </div>
            </div>
            
            ${this.getStyles()}
        `;
    }

    /**
     * Estilos inline (evita conflictos)
     */
    getStyles() {
        return `
            <style>
                .sport-search-selector {
                    position: relative;
                    width: 100%;
                }
                
                .sport-search-wrapper {
                    position: relative;
                }
                
                .sport-selected-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    min-height: 2rem;
                }
                
                .sport-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.375rem 0.75rem;
                    background: rgba(0, 245, 212, 0.1);
                    border: 1px solid rgba(0, 245, 212, 0.3);
                    border-radius: 9999px;
                    color: #00f5d4;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    transition: all 0.2s;
                }
                
                .sport-chip:hover {
                    background: rgba(0, 245, 212, 0.2);
                    border-color: #00f5d4;
                }
                
                .sport-chip .material-symbols-outlined {
                    font-size: 1rem;
                }
                
                .sport-chip-remove {
                    background: none;
                    border: none;
                    color: #00f5d4;
                    cursor: pointer;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                
                .sport-chip-remove:hover {
                    opacity: 1;
                }
                
                .sport-search-input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .sport-search-icon {
                    position: absolute;
                    left: 1rem;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 1.25rem;
                    pointer-events: none;
                }
                
                .sport-search-input {
                    width: 100%;
                    padding: 0.75rem 1rem 0.75rem 3rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                
                .sport-search-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #00f5d4;
                    box-shadow: 0 0 0 3px rgba(0, 245, 212, 0.1);
                }
                
                .sport-search-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .sport-search-clear {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    padding: 0.25rem;
                    display: flex;
                    align-items: center;
                    border-radius: 0.375rem;
                    transition: all 0.2s;
                }
                
                .sport-search-clear:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .sport-search-dropdown {
                    position: absolute;
                    top: calc(100% + 0.5rem);
                    left: 0;
                    right: 0;
                    max-height: 20rem;
                    overflow-y: auto;
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.75rem;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    animation: slideDown 0.2s ease-out;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-0.5rem);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .sport-search-results {
                    padding: 0.5rem;
                }
                
                .sport-search-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }
                
                .sport-search-item:hover,
                .sport-search-item.focused {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(0, 245, 212, 0.3);
                }
                
                .sport-search-item.selected {
                    background: rgba(0, 245, 212, 0.1);
                    border-color: #00f5d4;
                }
                
                .sport-search-item-icon {
                    width: 2rem;
                    height: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 245, 212, 0.1);
                    border-radius: 0.5rem;
                    color: #00f5d4;
                    font-size: 1.25rem;
                }
                
                .sport-search-item.selected .sport-search-item-icon {
                    background: #00f5d4;
                    color: #0f172a;
                }
                
                .sport-search-item-name {
                    flex: 1;
                    color: white;
                    font-size: 0.875rem;
                    font-weight: 600;
                }
                
                .sport-search-item-check {
                    color: #00f5d4;
                    font-size: 1.25rem;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .sport-search-item.selected .sport-search-item-check {
                    opacity: 1;
                }
                
                .sport-search-empty {
                    padding: 2rem;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 0.875rem;
                }
                
                .sport-search-empty .material-symbols-outlined {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                    opacity: 0.3;
                }
            </style>
        `;
    }

    /**
     * Attach event listeners
     */
    attachEvents() {
        // Search input
        this.searchInput.addEventListener('input', this.handleSearch);
        this.searchInput.addEventListener('focus', () => this.openDropdown());
        this.searchInput.addEventListener('keydown', this.handleKeyDown);

        // Clear button (solo en mode='single')
        if (this.mode === 'single') {
            const clearBtn = this.container.querySelector('.sport-search-clear');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearSelection());
            }
        }

        // Click outside
        document.addEventListener('click', this.handleClickOutside);
    }

    /**
     * Handle search input
     */
    handleSearch(e) {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.filterSports();
        this.renderResults();
        this.openDropdown();
    }

    /**
     * Filter sports based on search query
     */
    filterSports() {
        if (!this.searchQuery) {
            this.filteredSports = [...this.allSports];
        } else {
            this.filteredSports = this.allSports.filter(sport =>
                (sport.searchTerms && sport.searchTerms.includes(this.searchQuery)) ||
                sport.name.toLowerCase().includes(this.searchQuery) ||
                sport.key.toLowerCase().includes(this.searchQuery)
            );
        }
        this.focusedIndex = -1;
    }

    /**
     * Render search results
     */
    renderResults() {
        const resultsContainer = this.dropdown.querySelector('.sport-search-results');

        if (this.filteredSports.length === 0) {
            resultsContainer.innerHTML = `
                <div class="sport-search-empty">
                    <div><span class="material-symbols-outlined">search_off</span></div>
                    <div>No se encontraron deportes</div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = this.filteredSports.map((sport, index) => {
            const isSelected = this.mode === 'multiple'
                ? this.selectedSports.includes(sport.key)
                : this.selectedSports === sport.key;

            return `
                <div class="sport-search-item ${isSelected ? 'selected' : ''} ${index === this.focusedIndex ? 'focused' : ''}" 
                     data-sport-key="${sport.key}"
                     data-index="${index}">
                    <div class="sport-search-item-icon">
                        <span class="material-symbols-outlined">${sport.icon}</span>
                    </div>
                    <div class="sport-search-item-name">${sport.name}</div>
                    ${this.mode === 'multiple' ? `
                        <span class="material-symbols-outlined sport-search-item-check">check_circle</span>
                    ` : ''}
                </div>
            `;
        }).join('');

        // Attach click events
        resultsContainer.querySelectorAll('.sport-search-item').forEach(item => {
            item.addEventListener('click', () => {
                const sportKey = item.dataset.sportKey;
                this.toggleSport(sportKey);
            });
        });
    }

    /**
     * Toggle sport selection
     */
    toggleSport(sportKey) {
        if (this.mode === 'single') {
            this.selectedSports = sportKey;
            this.searchInput.value = getSportDisplayName(sportKey);
            this.closeDropdown();
            this.onSelect(sportKey);
        } else {
            const index = this.selectedSports.indexOf(sportKey);

            if (index > -1) {
                // Deselect
                this.selectedSports.splice(index, 1);
            } else {
                // Select (check max limit)
                if (this.selectedSports.length < this.maxSelections) {
                    this.selectedSports.push(sportKey);
                } else {
                    console.warn(`Max selections reached: ${this.maxSelections}`);
                    return;
                }
            }

            this.renderSelectedChips();
            this.renderResults();
            this.onSelect([...this.selectedSports]);
        }
    }

    /**
     * Render selected chips (mode='multiple')
     */
    renderSelectedChips() {
        if (!this.selectedChips) return;

        this.selectedChips.innerHTML = this.selectedSports.map(sportKey => {
            const sport = this.allSports.find(s => s.key === sportKey);
            if (!sport) return '';

            return `
                <div class="sport-chip" data-sport-key="${sportKey}">
                    <span class="material-symbols-outlined">${sport.icon}</span>
                    <span>${sport.name}</span>
                    <button class="sport-chip-remove" data-sport-key="${sportKey}">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            `;
        }).join('');

        // Attach remove events
        this.selectedChips.querySelectorAll('.sport-chip-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const sportKey = btn.dataset.sportKey;
                this.toggleSport(sportKey);
            });
        });
    }

    /**
     * Clear selection (mode='single')
     */
    clearSelection() {
        this.selectedSports = null;
        this.searchInput.value = '';
        this.searchQuery = '';
        this.filterSports();
        this.renderResults();
        this.onSelect(null);
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(e) {
        if (!this.isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'Enter') {
                this.openDropdown();
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.focusedIndex = Math.min(this.focusedIndex + 1, this.filteredSports.length - 1);
                this.renderResults();
                this.scrollToFocused();
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
                this.renderResults();
                this.scrollToFocused();
                break;

            case 'Enter':
                e.preventDefault();
                if (this.focusedIndex >= 0 && this.focusedIndex < this.filteredSports.length) {
                    const sport = this.filteredSports[this.focusedIndex];
                    this.toggleSport(sport.key);
                }
                break;

            case 'Escape':
                e.preventDefault();
                this.closeDropdown();
                this.searchInput.blur();
                break;
        }
    }

    /**
     * Scroll to focused item
     */
    scrollToFocused() {
        const focusedItem = this.dropdown.querySelector('.sport-search-item.focused');
        if (focusedItem) {
            focusedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * Handle click outside
     */
    handleClickOutside(e) {
        if (this.container && !this.container.contains(e.target)) {
            this.closeDropdown();
        }
    }

    /**
     * Open dropdown
     */
    openDropdown() {
        this.isOpen = true;
        this.dropdown.style.display = 'block';
        this.renderResults();
    }

    /**
     * Close dropdown
     */
    closeDropdown() {
        this.isOpen = false;
        this.dropdown.style.display = 'none';
        this.focusedIndex = -1;
    }

    /**
     * Get current selection
     */
    getSelection() {
        return this.mode === 'multiple' ? [...this.selectedSports] : this.selectedSports;
    }

    /**
     * Set selection programmatically
     */
    setSelection(selection) {
        if (this.mode === 'multiple') {
            this.selectedSports = Array.isArray(selection) ? [...selection] : [];
            this.renderSelectedChips();
        } else {
            this.selectedSports = selection;
            if (selection) {
                this.searchInput.value = getSportDisplayName(selection);
            }
        }
        this.renderResults();
    }

    /**
     * Destroy component
     */
    destroy() {
        document.removeEventListener('click', this.handleClickOutside);
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Exponer globalmente para debugging
if (typeof window !== 'undefined') {
    window.SportSearchSelector = SportSearchSelector;
}
