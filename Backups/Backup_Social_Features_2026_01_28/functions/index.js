/**
 * Firebase Cloud Functions v2 - Wellnessfy Notifications
 */

const { onRequest } = require('firebase-functions/v2/https');
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

/**
 * Proxy genérico para llamadas a Fitbit API
 * Evita problemas de CORS al hacer las peticiones desde el servidor
 */
exports.fitbitProxy = onRequest({ cors: true }, async (req, res) => {
    // Solo permitir POST para seguridad
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { endpoint, token } = req.body;

    // Validaciones
    if (!endpoint || !token) {
        return res.status(400).json({
            error: 'Missing required parameters: endpoint and token'
        });
    }

    try {
        // Hacer la petición a Fitbit API desde el servidor (sin CORS)
        const fitbitUrl = `https://api.fitbit.com${endpoint}`;
        console.log('Proxying request to:', fitbitUrl);

        const response = await fetch(fitbitUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        // Verificar respuesta
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Fitbit API Error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Fitbit API error',
                status: response.status,
                details: errorText
            });
        }

        // Devolver datos exitosos
        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

/**
 * Health check endpoint
 */
exports.healthCheck = onRequest({ cors: true }, (req, res) => {
    res.status(200).json({
        status: 'ok',
        service: 'Wellnessfy Functions v2',
        timestamp: new Date().toISOString()
    });
});

/**
 * Push Notification Sender
 * Triggers when a new notification is created in Firestore
 * Sends FCM push to all user's registered devices
 */
exports.sendPushNotification = onDocumentCreated(
    'users/{userId}/notifications/{notifId}',
    async (event) => {
        const notification = event.data.data();
        const userId = event.params.userId;

        try {
            // Get user's FCM tokens
            const userDoc = await admin.firestore().doc(`users/${userId}`).get();
            if (!userDoc.exists) {
                console.log('User not found:', userId);
                return null;
            }

            const userData = userDoc.data();
            const tokens = userData.fcmTokens || [];

            if (tokens.length === 0) {
                console.log('No FCM tokens for user:', userId);
                return null;
            }

            // Build notification payload
            const payload = {
                notification: {
                    title: notification.title || 'Nueva notificación',
                    body: notification.message || '',
                },
                data: {
                    type: notification.type || '',
                    category: notification.category || '',
                    notifId: event.params.notifId,
                    icon: '/icon-192.png',
                    badge: '/badge-72.png',
                    ...(notification.data || {})
                },
                webpush: {
                    notification: {
                        icon: '/icon-192.png',
                        badge: '/badge-72.png',
                        tag: notification.groupId || notification.type,
                        requireInteraction: false
                    }
                }
            };

            // Send to all tokens
            const response = await admin.messaging().sendEachForMulticast({
                tokens: tokens,
                ...payload
            });

            console.log(`✅ Push sent to ${userId}:`, response.successCount, 'success,', response.failureCount, 'failed');

            // Clean up invalid tokens
            if (response.failureCount > 0) {
                const tokensToRemove = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success &&
                        (resp.error.code === 'messaging/invalid-registration-token' ||
                            resp.error.code === 'messaging/registration-token-not-registered')) {
                        tokensToRemove.push(tokens[idx]);
                    }
                });

                if (tokensToRemove.length > 0) {
                    await admin.firestore().doc(`users/${userId}`).update({
                        fcmTokens: admin.firestore.FieldValue.arrayRemove(...tokensToRemove)
                    });
                    console.log('Removed invalid tokens:', tokensToRemove.length);
                }
            }

            return null;
        } catch (error) {
            console.error('Error sending push notification:', error);
            return null;
        }
    }
);
