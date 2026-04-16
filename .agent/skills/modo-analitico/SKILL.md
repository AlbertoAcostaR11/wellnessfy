---
name: Modo Analítico
description: Perfil de análisis profundo para entender el contexto, alcances, dependencias y efectos colaterales de cualquier cambio, evitando soluciones superficiales.
---

# Skill: Modo Analítico 🧐🔬

Este modo se activa cuando el sistema o el usuario detectan que un problema requiere una visión que va más allá de la línea de código inmediata. Su objetivo es realizar una **"disección forense"** del entorno para asegurar que la solución sea integral, escalable y no genere deuda técnica.

## 🔎 Protocolo de Análisis Obligatorio

Cuando se activa el **Modo Analítico**, se debe enlistar y responder a los siguientes puntos:

### 1. Contexto y Objetivos (Focus Directo)
*   **Objetivo de la función/módulo**: ¿Para qué fue creada originalmente y qué problema resuelve hoy?
*   **Mapa de ubicación**: Enlista todas las partes del código donde esta función está presente o es invocada.

### 2. Impacto de Red (Focus Indirecto)
*   **Zonas de impacto indirecto**: ¿Qué partes del código (aunque no toquen esta función) dependen del resultado de su ejecución? (Ej: Una variable global, un evento de UI).
*   **Dependencias descendentes**: Enlista todas las funciones que son alimentadas o afectadas por esta función particular.
*   **Efectos en otras Apps**: Para el Ecosistema Wellnessfy, ¿cómo afecta este cambio la sincronización entre la App de Usuario y el Dashboard Business?

### 3. Infraestructura y Seguridad (Backend Focus)
*   **Estado en la nube**: ¿La lógica ya existe en Google Cloud Functions? ¿Requiere actualizaciones de despliegue?
*   **Persistencia (Firestore/Firebase)**: ¿El esquema de datos es el correcto? ¿Se requieren nuevas subcolecciones?
*   **Reglas y Permisos**: ¿Las reglas de seguridad de Firestore permiten esta operación? ¿Se cuenta con los permisos de IAM en Google Cloud?
*   **Consumo de APIs**: ¿Existen límites de cuota (Rate Limits) que debamos considerar?

### 4. Integridad y Resiliencia (Nuevas Preguntas Propuestas)
*   **Análisis del "Código Fantasma"**: ¿Existen restos de implementaciones anteriores que deban ser limpiados para evitar colisiones?
*   **Consistencia del Modelo de Datos**: ¿Los nombres de los campos en Firestore coinciden exactamente entre `dashboard.js` y `challenges.js`?
*   **Mecanismos de Failsafe**: Si el servidor o la API fallan, ¿qué mensaje o estado de respaldo ("fallback") verá el usuario?
*   **Escalabilidad B2B**: ¿Esta función funcionaría igual de bien para una empresa pequeña que para una de 10,000 empleados?

---

## 🛠️ Acciones de Auditoría Recomendas
1.  **Grep Search Exhaustivo**: Buscar el nombre de la función en TODO el proyecto, no solo en el archivo actual.
2.  **Verificación de Reglas**: Leer `firestore.rules` antes de implementar una nueva escritura.
3.  **Traza de Datos**: Seguir el flujo de un dato desde que se crea en la UI hasta que llega a la colección final en Firestore.

---

## 💡 Mantra del Skill
*"El origen de un error rara vez está donde este se manifiesta. Mira el bosque, no solo el árbol podrido."*
