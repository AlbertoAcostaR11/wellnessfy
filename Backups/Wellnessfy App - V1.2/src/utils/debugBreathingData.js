
import { healthProviderManager } from './healthProviders/HealthProviderManager.js';
import { getLocalISOString } from './dateHelper.js';

export async function analyzeBreathingData() {
    console.log("🫁 Analyzing Breathing Data directly from Provider...");

    // Ensure cleanup of previous runs
    const existing = document.getElementById('breathing-debug-panel');
    if (existing) existing.remove();

    const provider = healthProviderManager.activeProvider || 'fitbit';
    const providerInstance = healthProviderManager.providers[provider];

    if (!providerInstance) {
        console.warn("No provider instance found.");
        return;
    }

    const today = new Date();
    const todayStr = getLocalISOString(today); // YYYY-MM-DD

    try {
        let rawActivities = [];
        let statusMsg = "Fetching data...";

        if (provider === 'fitbit') {
            if (typeof providerInstance.getActivitiesForDate === 'function') {
                rawActivities = await providerInstance.getActivitiesForDate(todayStr);
            } else {
                // Fallback to range
                rawActivities = await providerInstance.getActivities(today, today);
            }
        } else {
            rawActivities = await providerInstance.getActivities(today, today);
        }

        console.log("📦 Raw Provider Data:", rawActivities);

        // Filter for "Walking" too just as a control group (to see if data is fetching at all)
        const controlGroup = rawActivities.filter(a =>
            (a.name || a.activityName || '').toLowerCase().includes('walk') ||
            (a.name || a.activityName || '').toLowerCase().includes('camin')
        );

        // Filter for Breathing Candidates
        const candidates = rawActivities.filter(a => {
            const name = (a.name || a.activityName || '').toLowerCase();
            const id = a.activityId || a.activityType;
            return name.includes('relax') ||
                name.includes('breath') ||
                name.includes('respir') ||
                name.includes('yoga') ||
                name.includes('medita') ||
                name.includes('mindfulness') ||
                id === 122; // Google Fit breathing
        });

        // HTML Output
        const createCard = (act, isControl) => `
            <div class="p-3 mb-2 rounded bg-white/5 border ${isControl ? 'border-gray-600' : 'border-[#00f5d4]'}">
                <div class="font-bold text-sm ${isControl ? 'text-gray-400' : 'text-[#00f5d4]'}">
                    ${act.name || act.activityName || 'Unnamed'}
                </div>
                <div class="text-[10px] text-white/60 font-mono mt-1">
                    ID: ${act.activityId || act.activityType}<br>
                    ParentID: ${act.activityParentId || act.activityParentName || 'N/A'}<br>
                    Dur: ${act.duration || act.activeDuration} (Raw)<br>
                    Cal: ${act.activityCalories || act.calories || 'N/A'}<br>
                    Steps: ${act.steps || 'N/A'}
                </div>
            </div>
        `;

        const htmlContent = `
            <div id="breathing-debug-panel" style="position:fixed; top:10%; right:5%; width:300px; max-height:80vh; overflow-y:auto; background:#1e293b; border:2px solid #00f5d4; padding:15px; z-index:10000; border-radius:12px; box-shadow:0 0 20px rgba(0,0,0,0.7); font-family:sans-serif;">
                <h3 class="font-bold text-white mb-2">🕵️ Análisis RAW (${provider})</h3>
                <p class="text-xs text-white/50 mb-4">Fecha: ${todayStr}</p>
                
                <h4 class="text-[#00f5d4] text-xs font-bold uppercase mb-2">🎯 Candidatos Respiración</h4>
                ${candidates.length > 0 ? candidates.map(c => createCard(c, false)).join('') : '<p class="text-xs text-white/40 italic">No se encontraron actividades de respiración o relax.</p>'}

                <h4 class="text-gray-400 text-xs font-bold uppercase mt-4 mb-2">🚶 Control (Caminatas)</h4>
                 ${controlGroup.length > 0 ? controlGroup.map(c => createCard(c, true)).join('') : '<p class="text-xs text-white/40 italic">No se encontraron caminatas.</p>'}
                
                <div class="mt-4 pt-4 border-t border-white/10 text-center">
                    <button onclick="document.getElementById('breathing-debug-panel').remove()" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors w-full">Cerrar</button>
                    <button onclick="window.analyzeBreathingData()" class="mt-2 text-[10px] text-[#00f5d4] underline">Re-analizar</button>
                </div>
            </div>
        `;

        const div = document.createElement('div');
        div.innerHTML = htmlContent;
        document.body.appendChild(div.firstElementChild);

    } catch (e) {
        console.error("Error analyzing breathing:", e);
        alert("Error analizando datos RAW: " + e.message);
    }
}

// Auto-expose
window.analyzeBreathingData = analyzeBreathingData;

// Auto-run if imported
setTimeout(analyzeBreathingData, 2500);
