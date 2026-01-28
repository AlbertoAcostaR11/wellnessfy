
import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';
import { SPORT_ICONS } from '../utils/sportIcons.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../resources/sport_icons_svg');

// Asegurar que el directorio existe
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Obtener lista de iconos únicos
const uniqueIcons = [...new Set(Object.values(SPORT_ICONS))];
console.log(`Encontrados ${uniqueIcons.length} iconos únicos para descargar.`);

// Función para descargar archivo
const downloadIcon = (iconName) => {
    return new Promise((resolve, reject) => {
        // Probamos la URL de Material Symbols Outlined
        const url = `https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/${iconName}/default/48px.svg`;
        const filePath = path.join(OUTPUT_DIR, `${iconName}.svg`);
        const file = fs.createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`✅ Descargado: ${iconName}`);
                    resolve();
                });
            } else {
                // Try fallback logic or Material Icons (legacy) if Symbols fail? 
                // Symbols URL is tricky. Let's try another one if fail or just log error.
                file.close();
                fs.unlink(filePath, () => { }); // Delete partial file
                console.error(`❌ Falló descarga de ${iconName} (Status: ${response.statusCode})`);
                // Fallback to legacy Material Icons URL
                attemptLegacyDownload(iconName, resolve, reject);
            }
        }).on('error', (err) => {
            fs.unlink(filePath, () => { });
            console.error(`Error de red al descargar ${iconName}: ${err.message}`);
            reject(err);
        });
    });
};

const attemptLegacyDownload = (iconName, resolve, reject) => {
    const url = `https://fonts.gstatic.com/s/i/materialiconsoutlined/${iconName}/v6/24px.svg`;
    const filePath = path.join(OUTPUT_DIR, `${iconName}.svg`);
    const file = fs.createWriteStream(filePath);

    https.get(url, (response) => {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Descargado (Legacy): ${iconName}`);
                resolve();
            });
        } else {
            console.error(`❌ Falló descarga Legacy de ${iconName}`);
            resolve(); // Resolve anyway to continue
        }
    }).on('error', (err) => {
        resolve();
    });
}

// Ejecutar descargas en serie para no saturar
async function run() {
    for (const icon of uniqueIcons) {
        await downloadIcon(icon);
    }
    console.log('Proceso completado.');
}

run();
