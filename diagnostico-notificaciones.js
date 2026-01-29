// Diagnóstico de Notificaciones - Ejecutar en consola del navegador

(async function diagnosticarNotificaciones() {
    console.log('🔍 Iniciando diagnóstico de notificaciones...\n');

    // 1. Verificar que el usuario esté logueado
    const user = AppState.currentUser;
    if (!user || !user.uid) {
        console.error('❌ No hay usuario logueado');
        return;
    }
    console.log('✅ Usuario logueado:', user.name, `(${user.uid})`);

    // 2. Verificar NotificationService
    if (!window.NotificationService) {
        console.error('❌ NotificationService no está disponible');
        return;
    }
    console.log('✅ NotificationService cargado');

    // 3. Verificar permisos de notificaciones del navegador
    console.log('📱 Permiso de notificaciones:', Notification.permission);

    // 4. Verificar tokens FCM guardados
    const { getFirestore, doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (userDoc.exists()) {
        const tokens = userDoc.data().fcmTokens || [];
        console.log(`📲 Tokens FCM registrados: ${tokens.length}`);
        if (tokens.length > 0) {
            console.log('   Token actual:', tokens[0].substring(0, 50) + '...');
        }
    }

    // 5. Verificar últimas notificaciones recibidas
    const { collection, query, orderBy, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    const notifsRef = collection(db, `users/${user.uid}/notifications`);
    const q = query(notifsRef, orderBy('timestamp', 'desc'), limit(5));
    const snapshot = await getDocs(q);

    console.log(`\n📬 Últimas ${snapshot.size} notificaciones:`);
    snapshot.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.timestamp).toLocaleString();
        console.log(`   [${date}] ${data.type} - ${data.message}`);
    });

    // 6. Prueba de envío
    console.log('\n🧪 Enviando notificación de prueba...');
    try {
        await NotificationService.send('POST_LIKE', {
            targetUserId: user.uid,
            actor: {
                id: 'test_user',
                name: 'Sistema de Prueba',
                avatar: user.avatar
            },
            title: 'Prueba de Notificación',
            message: 'Si ves esto en Firestore, el sistema funciona.',
            data: { postId: 'test_123' }
        });
        console.log('✅ Notificación de prueba enviada a Firestore');
        console.log('   Verifica en Firebase Console: users/' + user.uid + '/notifications');
    } catch (error) {
        console.error('❌ Error al enviar notificación:', error);
    }

    console.log('\n✅ Diagnóstico completado');
})();
