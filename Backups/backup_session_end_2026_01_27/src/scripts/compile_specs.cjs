const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../resources/sport_specs');
const OUTPUT_FILE = path.join(__dirname, '../config/SportSpecsDB.js');

// Mapa de columnas en el CSV a claves del objeto de configuración
// Basado en header: Campo,Google Fit,Health Connect,Fitbit,Apple Health,Huawei Health Web,Huawei Health App,Samsung Health Web,Samsung Health App,Wellnessfy
const PROVIDER_INDEX_MAP = {
    googleFit: 1,
    healthConnect: 2,
    fitbit: 3,
    appleHealth: 4,
    huaweiWeb: 5,
    huaweiApp: 6,
    samsungWeb: 7,
    samsungApp: 8
};

function compileSpecs() {
    console.log('🚀 Iniciando compilación de especificaciones deportivas...');

    const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.csv'));
    const specsDB = {};
    const reversedIdMap = {}; // Para búsqueda rápida por ID: "fitbit_19001" -> "tennis"

    files.forEach(file => {
        const sportKey = file.replace('.csv', '');
        const content = fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8');
        const lines = content.trim().split('\n').map(l => l.trim());

        if (lines.length < 5) return; // Archivo vacío o corrupto

        // Matriz de datos
        const grid = lines.map(line => line.split(','));

        // 1. Extraer los IDs de cada proveedor (Fila index 4, "activityTypeId")
        // Nota: Asumimos que la fila 5 (índice 4) es siempre activityTypeId según fill_sport_grids.js
        const idRow = grid.find(row => row[0] === 'activityTypeId');

        if (!idRow) {
            console.warn(`⚠️ Warning: No activityTypeId found in ${file}`);
            return;
        }

        const ids = {};

        Object.keys(PROVIDER_INDEX_MAP).forEach(provider => {
            const index = PROVIDER_INDEX_MAP[provider];
            const rawId = idRow[index];

            // Limpiar ID (quitar espacios, manejar nulls)
            if (rawId && rawId !== 'null' && rawId !== 'N/A' && rawId.trim() !== '') {
                ids[provider] = rawId.trim();

                // Crear índice invertido para búsquedas O(1)
                // Ej: "fitbit_19001": "tennis"
                const lookupKey = `${provider}_${rawId.trim()}`;
                reversedIdMap[lookupKey] = sportKey;
            }
        });

        // 2. Extraer Mapeos de Campos (ActiveDuration, Calories, etc)
        const fieldMappings = {};
        const fieldsOfInterest = ['calories', 'steps', 'distance', 'activeDuration', 'elevationGain', 'heartRate', 'speed'];

        fieldsOfInterest.forEach(field => {
            const row = grid.find(r => r[0] === field);
            if (row) {
                const map = {};
                Object.keys(PROVIDER_INDEX_MAP).forEach(provider => {
                    const idx = PROVIDER_INDEX_MAP[provider];
                    if (row[idx] && row[idx] !== 'N/A' && row[idx] !== 'null') {
                        map[provider] = row[idx].trim();
                    }
                });
                fieldMappings[field] = map;
            }
        });

        specsDB[sportKey] = {
            ids: ids,
            fields: fieldMappings
        };
    });

    // Generar contenido del archivo JS
    const fileContent = `/**
 * 🧠 SPORT SPECS DATABASE
 * 
 * Generado automáticamente por compile_specs.js
 * NO EDITAR MANUALMENTE. Edita los CSVs en resources/sport_specs y regenera.
 * 
 * @generated ${new Date().toISOString()}
 */

export const REVERSE_ID_MAP = ${JSON.stringify(reversedIdMap, null, 4)};

export const SPORT_SPECS = ${JSON.stringify(specsDB, null, 4)};
`;

    fs.writeFileSync(OUTPUT_FILE, fileContent);
    console.log(`✅ Compilación exitosa! Base de datos generada en: ${OUTPUT_FILE}`);
    console.log(`📊 Total Deportes: ${Object.keys(specsDB).length}`);
    console.log(`🔍 Total IDs Mapeados: ${Object.keys(reversedIdMap).length}`);
}

compileSpecs();
