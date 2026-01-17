/**
 * 📅 Date Helper
 * 
 * Centraliza la lógica de fechas para evitar problemas de Zona Horaria.
 * Siempre prioriza la FECHA LOCAL del usuario en lugar de UTC.
 */

/**
 * Retorna la fecha actual en formato YYYY-MM-DD respetando la zona horaria local del usuario.
 * Reemplaza a: new Date().toISOString().split('T')[0] (que usa UTC).
 * @returns {string} Fecha local YYYY-MM-DD
 */
export function getLocalISOString(dateInput = new Date()) {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Retorna el objeto Date correspondiente al inicio del día (00:00:00) en hora local.
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {Date} Date ajustado a medianoche local
 */
export function getStartOfDayLocal(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Retorna el objeto Date correspondiente al final del día (23:59:59) en hora local.
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {Date} Date ajustado a fin del día local
 */
export function getEndOfDayLocal(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
