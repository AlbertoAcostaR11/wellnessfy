/**
 * Firebase Cloud Functions - Fitbit API Proxy
 * Soluciona el problema de CORS al actuar como intermediario entre el cliente y Fitbit API
 */

const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

/**
 * Proxy genérico para llamadas a Fitbit API
 * Evita problemas de CORS al hacer las peticiones desde el servidor
 */
exports.fitbitProxy = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
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
});

/**
 * Health check endpoint
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
    return cors(req, res, () => {
        res.status(200).json({
            status: 'ok',
            service: 'Fitbit Proxy',
            timestamp: new Date().toISOString()
        });
    });
});
