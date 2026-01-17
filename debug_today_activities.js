
// debug_today_activities.js
// Script to inspect today's activities and debug mapping issues

(function () {
    console.log("🔍 Inspecting Today's Activities for Mapping Issues...");

    const activities = window.AppState?.activities || [];
    if (activities.length === 0) {
        console.log("❌ No activities found in AppState.");
        alert("No hay actividades cargadas en la App. Intenta sincronizar primero.");
        return;
    }

    // Get today's date string matching the logic in activity.js
    const getLocalISOString = (date) => {
        const offset = date.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(date - offset)).toISOString().slice(0, 10);
        return localISOTime;
    };
    const todayStr = getLocalISOString(new Date());

    console.log(`📅 Today is: ${todayStr}`);

    const todayActs = activities.filter(act => {
        if (!act.startTime) return false;
        const actDate = new Date(act.startTime);
        // Quick local check
        const actStr = getLocalISOString(actDate);
        return actStr === todayStr;
    });

    console.log(`📊 Found ${todayActs.length} activities for today.`);

    if (todayActs.length > 0) {
        console.table(todayActs.map(a => ({
            Name: a.name,
            SportKey: a.sportKey,
            OriginalID: a.originalId,
            Duration: a.duration + 'm',
            Calories: a.calories,
            // Check matches
            'Matches Breath?': (a.sportKey || '').includes('breath') || (a.name || '').toLowerCase().includes('respiración') || (a.name || '').toLowerCase().includes('breath'),
            'Matches Med?': (a.sportKey || '').includes('meditation') || (a.name || '').toLowerCase().includes('meditation')
        })));

        // Create a visual alert
        const listHtml = todayActs.map(a => `
            <li class="mb-2 p-2 bg-white/5 rounded border border-white/10">
                <div class="font-bold text-[#00f5d4]">${a.name}</div>
                <div class="text-xs text-white/60">Key: ${a.sportKey} | ID: ${a.originalId}</div>
                <div class="text-xs text-white/60">Dur: ${a.duration}m</div>
            </li>
        `).join('');

        const div = document.createElement('div');
        div.innerHTML = `
            <div style="position:fixed; top:20%; left:5%; right:5%; background:#0f172a; border:2px solid #00f5d4; padding:20px; z-index:9999; color:white; font-family:sans-serif; max-height:60vh; overflow:auto; border-radius:12px; box-shadow: 0 0 20px rgba(0,0,0,0.5);">
                <h3 class="text-xl font-bold mb-4">Actividades de Hoy (${todayStr})</h3>
                <h3 class="text-xl font-bold mb-4">Actividades de Hoy (${todayStr})</h3>
                <ul class="text-sm">${listHtml}</ul>
                <div class="mt-4 flex justify-end">
                    <button onclick="this.parentElement.parentElement.remove()" class="px-4 py-2 bg-[#00f5d4] text-black font-bold rounded">Cerrar</button>
                </div>
            </div>
        `;
        document.body.appendChild(div);
    } else {
        alert(`No se encontraron actividades para la fecha ${todayStr}.`);
    }

})();
