function runSleepDiagnosis() {
    console.log('--- INICIO DIAGNÓSTICO SUEÑO ---');
    const token = localStorage.getItem('google_health_token');
    if (!token) {
        console.error('❌ No se encontró token en localStorage (google_health_token)');
        return;
    }

    const now = Date.now();
    // Pedimos 7 días atrás
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

    // URL para obtener SESIONES de sueño (activityType=72)
    const url = `https://www.googleapis.com/fitness/v1/users/me/sessions?startTime=${new Date(sevenDaysAgo).toISOString()}&endTime=${new Date(now).toISOString()}&activityType=72`;

    console.log('Fetching:', url);

    fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(r => r.json())
        .then(d => {
            console.log('📊 DATA BRUTA GOOGLE (Sessions):', d);

            if (d.session && d.session.length > 0) {
                console.group('Sesiones Encontradas:');
                d.session.forEach(s => {
                    const start = new Date(parseInt(s.startTimeMillis));
                    const end = new Date(parseInt(s.endTimeMillis));
                    const durationMillis = parseInt(s.endTimeMillis) - parseInt(s.startTimeMillis);
                    const hours = durationMillis / (1000 * 60 * 60);

                    console.log(`🛏️ Sesión: ${start.toLocaleString()} -> ${end.toLocaleString()}`);
                    console.log(`   Duración: ${hours.toFixed(2)} horas (${(durationMillis / 1000 / 60).toFixed(0)} min)`);
                    console.log(`   ID: ${s.id}, Modified: ${new Date(parseInt(s.modifiedTimeMillis)).toLocaleString()}`);
                });
                console.groupEnd();
            } else {
                console.warn('⚠️ NO SE ENCONTRARON SESIONES DE SUEÑO (activityType=72) en los últimos 7 días.');
                console.log('Posibles causas:');
                console.log('1. Google Fit no tiene datos sincronizados (revisa App Google Fit).');
                console.log('2. Los datos son "manuales" y a veces no salen en la API igual.');
                console.log('3. El reloj/dispositivo no ha sincronizado aún.');
            }
        })
        .catch(e => console.error('❌ Error fetching sessions:', e));
}

// Exponer globalmente para ejecutar desde consola
window.runSleepDiagnosis = runSleepDiagnosis;
console.log('✅ Script de diagnóstico cargado. Escribe runSleepDiagnosis() en la consola para ver tus datos.');
