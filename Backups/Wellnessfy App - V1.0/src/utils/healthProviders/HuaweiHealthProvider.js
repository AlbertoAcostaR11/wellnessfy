/**
 * Huawei Health Provider (Web / Cloud API)
 * Acceso a datos vía Huawei Health Kit REST API
 */

export class HuaweiHealthProvider {
    constructor() {
        this.name = 'huaweiHealth';
        // Endpoints de Huawei Account & Health Kit
        this.authUrl = 'https://oauth-login.cloud.huawei.com/oauth2/v3/authorize';
        this.baseUrl = 'https://health-api.cloud.huawei.com/healthkit/v1';

        this.token = null;

        // Configuración (Se debe reemplazar con datos reales de Huawei Console)
        this.clientId = 'TU_HUAWEI_APP_ID';
        this.redirectUri = window.location.origin + '/huawei-callback.html';

        // Scopes necesarios para leer actividades y métricas
        // Referencia: https://developer.huawei.com/consumer/en/doc/development/HMSCore-Guides/scope-0000001050040560
        this.scopes = [
            'https://www.huawei.com/healthkit/activity.read',
            'https://www.huawei.com/healthkit/step.read',
            'https://www.huawei.com/healthkit/calories.read',
            'https://www.huawei.com/healthkit/heartrate.read'
        ].join(' '); // Huawei usa espacios como separador
    }

    /**
     * Iniciar flujo OAuth2 Implícito (o Authorization Code si hay backend)
     * Para Web pura, usamos flow implícito si es soportado, o code con intercambio.
     * Huawei recomienda Authorization Code, pero para demo usaremos token directo si es posible.
     */
    async authenticate() {
        console.log('🔴 Iniciando autenticación con Huawei Health...');

        const params = new URLSearchParams({
            response_type: 'token', // Intentamos token directo
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: this.scopes,
            access_type: 'online'
        });

        window.location.href = `${this.authUrl}?${params.toString()}`;
    }

    hasValidToken() {
        this.token = localStorage.getItem('huawei_access_token');
        return !!this.token;
    }

    /**
     * Obtener Actividades (Activity Records)
     * POST /activityRecord:activityRecordDetail
     */
    async getActivities(startDate, endDate) {
        if (!this.token) return [];

        const start = startDate.getTime();
        const end = endDate.getTime();

        try {
            // Huawei usa POST para consultas complejas
            const response = await fetch(`${this.baseUrl}/activityRecords:getActivityRecord`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startTime: start,
                    endTime: end
                })
            });

            if (!response.ok) throw new Error('Error Huawei API');

            const data = await response.json();
            return data.activityRecords || [];

        } catch (error) {
            console.error('Huawei API Error:', error);
            return this.getMockData();
        }
    }

    getSteps(date) { return 0; } // Implementar lógica de Sampling Data
    getCalories(date) { return 0; }

    getMockData() {
        return [{
            id: 'mock-huawei-1',
            name: 'Running',
            desc: 'Mock run',
            startTime: Date.now() - 3600000,
            endTime: Date.now(),
            activityType: 1 // Running
        }];
    }
}
