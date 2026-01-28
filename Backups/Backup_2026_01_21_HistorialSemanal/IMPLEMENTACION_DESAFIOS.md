# Plan de Implementación de Desafíos en Wellnessfy

## Filosofía de Datos: "Aspiradora de Datos"
Wellnessfy debe pedirle a Google FIT/Health Connect **TODA** la información disponible de **TODAS** las actividades, independientemente de si el usuario las ha marcado como favoritas o si existen desafíos activos para ellas.

**¿Por qué?**
1.  **Automatización "Cero Fricción"**: Evita que el usuario pierda progreso si olvida registrar una actividad inusual (ej. Pádel).
2.  **Retroactividad**: Al unirse a un desafío nuevo, el usuario puede recibir crédito inmediato por actividades realizadas días antes (dentro del periodo del reto).
3.  **Flexibilidad Future-Proof**: Permite crear desafíos de cualquier tipo (ej. "Frisbee") sin actualizar el código de recolección de datos.

---

## Fases de Implementación Técnica

### Fase 1: Estructura de Datos (Leaderboard)
Actualizar el esquema en Firebase (`challenges` collection) para soportar rankings detallados.

**Nuevo Schema para `participants`:**
En lugar de solo un array de IDs, usaremos una estructura de mapa para guardar el progreso:
```javascript
progressData: {
    "UserID_123": {
        score: 45.5, // Valor acumulado (Km, Pasos, Minutos)
        lastUpdate: 1705689000000,
        avatar: "url_foto",
        name: "Alberto"
    },
    // ... otros usuarios
}
```

### Fase 2: Motor de Procesamiento (`ActivityEngine`)
Crear un módulo central (ej. `src/utils/activityEngine.js`) que procese la "Data Bruta".

**Lógica `processNewActivity(activityType, amount, unit, date)`:**
1.  **Buscar Desafíos**: Obtener todos los desafíos activos donde `participantsList` incluya al usuario.
2.  **Filtrar Relevantes**: Seleccionar aquellos donde `challenge.category === activityType` (o equivalente) y la fecha de la actividad esté dentro de `start` y `end`.
3.  **Validar Métricas**: Asegurar coincidencia de unidades (ej. Km con Km, Minutos con Minutos).
4.  **Actualización Atómica**: Usar `updateDoc` con `increment` en Firebase para sumar el progreso al `score` del usuario en ese desafío específico.

### Fase 3: Puntos de Entrada (Triggers)
El motor debe activarse desde dos frentes:
1.  **Automático (Sincronización Cloud)**:
    *   `googleHealth.js` descarga todo el historial sin filtrar.
    *   Pasa cada bloque de data al `ActivityEngine`.
2.  **Manual (UI Web)**:
    *   Crear un Modal de "Registrar Actividad Manual" (Footer de Challenge Detail).
    *   Al enviar, llamar directamente a `ActivityEngine`.

---

## Próximos Pasos (To-Do)
1.  [ ] Crear Modal de Registro Manual en `challengeDetail.js`.
2.  [ ] Implementar `src/utils/activityEngine.js`.
3.  [ ] Actualizar `renderChallengeDetailPage` para leer de `progressData` real.
4.  [ ] Refinar `googleHealth.js` para enviar data al motor.
