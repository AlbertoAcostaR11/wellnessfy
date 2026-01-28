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

// ==========================================
// FUNCIONES DE SEMANA (Lunes-Domingo)
// ==========================================

/**
 * Retorna el lunes de la semana actual (inicio de semana).
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {Date} Date del lunes a las 00:00:00
 */
export function getWeekStart(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar al lunes
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

/**
 * Retorna el domingo de la semana actual (fin de semana).
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {Date} Date del domingo a las 23:59:59
 */
export function getWeekEnd(date = new Date()) {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // Lunes + 6 días = Domingo
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}

/**
 * Retorna un array de fechas (YYYY-MM-DD) desde el lunes de la semana actual hasta HOY.
 * Si hoy es miércoles, retorna: [lun, mar, mié]
 * Si hoy es domingo, retorna: [lun, mar, mié, jue, vie, sáb, dom]
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {Array<string>} Array de fechas en formato YYYY-MM-DD
 */
export function getCurrentWeekDays(date = new Date()) {
    const weekStart = getWeekStart(date);
    const today = new Date(date);
    today.setHours(0, 0, 0, 0);

    const days = [];
    const current = new Date(weekStart);

    while (current <= today) {
        days.push(getLocalISOString(current));
        current.setDate(current.getDate() + 1);
    }

    return days;
}

/**
 * Retorna un array de TODOS los 7 días de la semana (Lun-Dom), independientemente del día actual.
 * Útil para el historial semanal donde siempre mostramos 7 días completos.
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {Array<string>} Array de 7 fechas en formato YYYY-MM-DD
 */
export function getFullWeekDays(date = new Date()) {
    const weekStart = getWeekStart(date);
    const days = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(day.getDate() + i);
        days.push(getLocalISOString(day));
    }

    return days;
}

/**
 * Retorna el número de semana del año (1-52/53) según ISO 8601.
 * @param {Date} date - Fecha opcional (default: ahora)
 * @returns {number} Número de semana (1-52)
 */
export function getWeekNumber(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7)); // Jueves de la semana
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

/**
 * Retorna el lunes de una semana específica del año.
 * @param {number} weekNumber - Número de semana (1-52)
 * @param {number} year - Año (ej: 2026)
 * @returns {Date} Date del lunes de esa semana
 */
export function getWeekStartFromNumber(weekNumber, year) {
    const jan4 = new Date(year, 0, 4); // 4 de enero (siempre está en la semana 1)
    const jan4Day = jan4.getDay() || 7; // 1 = Lun, 7 = Dom
    const weekOneMonday = new Date(jan4);
    weekOneMonday.setDate(jan4.getDate() - jan4Day + 1);

    const targetMonday = new Date(weekOneMonday);
    targetMonday.setDate(weekOneMonday.getDate() + (weekNumber - 1) * 7);
    targetMonday.setHours(0, 0, 0, 0);

    return targetMonday;
}

/**
 * Retorna el domingo de una semana específica del año.
 * @param {number} weekNumber - Número de semana (1-52)
 * @param {number} year - Año (ej: 2026)
 * @returns {Date} Date del domingo de esa semana
 */
export function getWeekEndFromNumber(weekNumber, year) {
    const weekStart = getWeekStartFromNumber(weekNumber, year);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}

/**
 * Formatea un rango de semana para mostrar en UI.
 * Ejemplo: "20 - 26 Enero 2026" o "30 Dic 2025 - 5 Ene 2026"
 * @param {Date} weekStart - Lunes de la semana
 * @param {Date} weekEnd - Domingo de la semana
 * @returns {string} Rango formateado
 */
export function formatWeekRange(weekStart, weekEnd) {
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const startMonth = weekStart.toLocaleDateString('es-ES', { month: 'long' });
    const endMonth = weekEnd.toLocaleDateString('es-ES', { month: 'long' });
    const startYear = weekStart.getFullYear();
    const endYear = weekEnd.getFullYear();

    // Mismo mes y año
    if (startMonth === endMonth && startYear === endYear) {
        return `${startDay} - ${endDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${startYear}`;
    }

    // Mismo año, diferente mes
    if (startYear === endYear) {
        return `${startDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} - ${endDay} ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${endYear}`;
    }

    // Diferente año (cruce de año)
    return `${startDay} ${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} ${startYear} - ${endDay} ${endMonth.charAt(0).toUpperCase() + endMonth.slice(1)} ${endYear}`;
}
