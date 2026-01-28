
// Scripts de Firebase disponibles en el Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuración de Firebase (debe coincidir con la de main.js)
firebase.initializeApp({
    apiKey: "AIzaSyC9K_nqcTRPGtTpUfWDvkFhnAESaJ3I7Vs",
    authDomain: "wellnessfy-cbc1b.firebaseapp.com",
    projectId: "wellnessfy-cbc1b",
    storageBucket: "wellnessfy-cbc1b.firebasestorage.app",
    messagingSenderId: "232789372708",
    appId: "1:232789372708:web:e7d5fcffa0ba39cf6e0db1"
});

const messaging = firebase.messaging();

// Manejador de mensajes en segundo plano (cuando la app está cerrada o minimizada)
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo-icon.png',
        badge: '/logo-icon.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
