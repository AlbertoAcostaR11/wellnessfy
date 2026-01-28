# Sistema de Actualización Automática de Progreso de Desafíos

## 📋 Descripción

Este sistema sincroniza automáticamente el progreso de los desafíos basándose en las actividades registradas desde Fitbit o Google Fit.

## 🔄 Flujo de Funcionamiento

```
1. Usuario sincroniza actividades (Fitbit/Google Fit)
   ↓
2. healthSync.js obtiene actividades raw
   ↓
3. UniversalDataNormalizer normaliza actividades → sportKey
   ↓
4. Actividades se guardan en AppState.activities
   ↓
5. challengeProgressSync.js se ejecuta automáticamente
   ↓
6. Para cada desafío activo:
   - Busca actividades que coincidan con la categoría del desafío
   - Suma el total acumulado (horas, km, calorías, pasos)
   - Calcula el porcentaje de progreso
   - Actualiza en Firestore y localStorage
   ↓
7. UI se refresca automáticamente
```

## 🗺️ Mapeo de Categorías

### Categorías de Desafíos → sportKeys

| Categoría Desafío | sportKeys Equivalentes |
|-------------------|------------------------|
| `run` | running, run |
| `bike` | cycling, bike, biking |
| `walk` | walking, walk |
| `gym` | strength_training, gym, weightlifting, workout |
| `yoga` | yoga, hatha_yoga, vinyasa_yoga |
| `swim` | swimming, swim |
| `meditation` | meditation, guided_breathing |
| `pilates` | pilates |

## 📊 Unidades Soportadas

- **hours / h**: Suma duración de actividades (convertida a horas)
- **km**: Suma distancia de actividades
- **calorías**: Suma calorías quemadas
- **pasos / steps**: Suma pasos totales

## 🎯 Ejemplo

### Desafío
```javascript
{
  name: "Mi desafío personal: Yoga",
  category: "YOGA",
  metric: "4 hours",
  startDate: "2026-01-18T00:00:00Z",
  endDate: "2026-01-24T23:59:59Z"
}
```

### Actividades Sincronizadas
```javascript
[
  {
    sportKey: "yoga",
    name: "Yoga",
    duration: 52, // minutos
    startTime: "2026-01-20T10:00:00Z"
  }
]
```

### Cálculo
```
Total acumulado: 52 minutos = 0.87 horas
Meta: 4 horas
Progreso: (0.87 / 4) * 100 = 21.75% ≈ 22%
```

## 🔧 Archivos Modificados

1. **`src/utils/challengeProgressSync.js`** (NUEVO)
   - Función `calculateChallengeProgress()`: Calcula progreso de un desafío
   - Función `updateAllChallengesProgress()`: Actualiza todos los desafíos
   - Mapeo `CHALLENGE_SPORT_MAPPING`: Relaciona categorías con sportKeys

2. **`src/utils/healthSync.js`**
   - Agregada llamada a `updateAllChallengesProgress()` después de sincronizar
   - Se ejecuta automáticamente cada vez que se sincronizan actividades

3. **`src/utils/state.js`**
   - Persistencia de `activeChallengeId` en localStorage
   - Carga automática al iniciar la app

4. **`src/pages/challenges.js`**
   - Guardado inmediato de `activeChallengeId` al seleccionar desafío

5. **`src/pages/challengeDetail.js`**
   - Mejor manejo de errores cuando no se encuentra el desafío

## 🚀 Uso

### Automático
El sistema se ejecuta automáticamente cada vez que:
- Sincronizas actividades desde el botón "Sincronizar" en Activity
- Se ejecuta la sincronización automática al iniciar la app

### Manual (para debugging)
```javascript
import { updateAllChallengesProgress } from './utils/challengeProgressSync.js';
await updateAllChallengesProgress();
```

## 🐛 Debugging

Para ver los logs del sistema:
```javascript
// En la consola del navegador
localStorage.setItem('debug', 'true');
```

Los logs mostrarán:
- `📊 [Challenge Progress]`: Actividades encontradas para cada desafío
- `✅ Progress calculated`: Cálculo de progreso
- `📈 Updated`: Desafíos actualizados
- `☁️ Synced to Firestore`: Confirmación de sincronización

## ⚠️ Notas Importantes

1. **Rango de Fechas**: Solo se cuentan actividades dentro del rango del desafío
2. **Coincidencia de Deportes**: El sistema usa coincidencia flexible (includes)
3. **Actualización en Tiempo Real**: Los cambios se reflejan inmediatamente en la UI
4. **Persistencia**: Los datos se guardan en Firestore y localStorage

## 🔮 Mejoras Futuras

- [ ] Soporte para desafíos grupales (ranking)
- [ ] Notificaciones cuando se alcanza un hito
- [ ] Historial de progreso diario
- [ ] Gráficas de progreso en el tiempo
- [ ] Badges/logros al completar desafíos
