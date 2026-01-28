# Arquitectura del Ecosistema Wellnessfy

**Versión:** 1.0  
**Fecha:** 23 Enero 2026  
**Objetivo:** Definir la infraestructura técnica unificada para el ecosistema de aplicaciones Wellnessfy.

---

## 1. Visión General
El ecosistema Wellnessfy opera bajo un modelo de **"Nucleus & Satellites"** (Núcleo y Satélites).
*   **Núcleo (Hub):** `Wellnessfy App` (app.wellnessfy.io). Centraliza métricas, perfil social, gamificación y análisis global.
*   **Satélites:** Apps especializadas (`Breathe`, `Meditate`, `Nutri`, `BodyGain`) que ofrecen experiencias profundas en verticales específicas y reportan datos al Núcleo.

## 2. Infraestructura Compartida (Firebase)

Todo el ecosistema vive dentro de **UN ÚNICO Proyecto de Firebase**:
*   **Project ID:** `wellnessfy-cbc1b`

### 2.1 Autenticación Unificada (SSO)
*   Los usuarios comparten el mismo `UID` en todas las apps.
*   Si un usuario se registra en *Breathe*, su cuenta es válida inmediatamente en *Wellnessfy App*.
*   **Requisito:** Todas las apps deben usar la misma configuración de Firebase Auth del proyecto `wellnessfy-cbc1b`.

### 2.2 Base de Datos Global (Firestore)

El esquema de datos está diseñado para compartir lo vital y encapsular lo específico.

#### Colecciones Compartidas (Lectura/Escritura por todas las apps)
*   `users/{userId}`: Perfil maestro (Display Name, Avatar, Premium Status).
*   `activities`: **El Bus de Datos**. Todas las apps escriben sus sesiones aquí.
    *   Ejemplo *Breathe*: Escribe `{ type: 'guided_breathing', duration: 10, source: 'Breathe' }`.
    *   Ejemplo *Nutri*: Escribe `{ type: 'nutrition', calories: 600, source: 'Nutri' }`.
    *   *Wellnessfy App* escucha esta colección para generar gráficas y anillos de actividad.

#### Colecciones Específicas (Privadas por App)
*   `app_breathe_data/{userId}`: Preferencias de respiración, historial de rachas local, configuraciones de voz.
*   `app_nutri_data/{userId}`: Planes de comida, alergias, lista de compras.
*   `app_meditate_data/{userId}`: Mantras guardados, progreso de cursos.

### 2.3 Seguridad (Firestore Rules)
Las reglas deben permitir que el usuario autenticado escriba en `activities` desde cualquier origen, siempre que el `userId` coincida con su `auth.uid`.

---

## 3. Estrategia de Hosting y Dominios

Usamos **Firebase Multi-Site Hosting**. Cada app tiene su propio "Sitio" (Target) dentro del mismo proyecto.

| Aplicación | Site ID (Target) | Dominio Producción |
| :--- | :--- | :--- |
| **Wellnessfy App** (Hub) | `wellnessfy-app` | `app.wellnessfy.io` |
| **Breathe** | `wellnessfy-breathe` | `breathe.wellnessfy.io` |
| **Meditate** | `wellnessfy-meditate` * | `meditate.wellnessfy.io` |
| **Nutri** | `wellnessfy-nutri` * | `nutri.wellnessfy.io` |
| **BodyGain** | `wellnessfy-bodygain` * | `bodygain.wellnessfy.io` |

*\* Site IDs pendientes de creación en consola.*

---

## 4. Guía de Inicio para "Breathe by Wellnessfy"

### Paso 1: Configuración Local
1.  Crear carpeta: `c:\Users\alber\Local\Breathe App`
2.  Inicializar proyecto web (Vite o Vanilla).

### Paso 2: Conexión a Firebase
1.  Ejecutar `firebase init hosting`.
2.  Seleccionar proyecto: `wellnessfy-cbc1b` (NO crear nuevo).
3.  Configurar Target:
    ```bash
    firebase target:apply hosting breathe wellnessfy-breathe
    ```
4.  Editar `firebase.json` para usar el target:
    ```json
    {
      "hosting": {
        "target": "breathe",
        "public": "dist", // o carpeta de build
        ...
      }
    }
    ```

### Paso 3: Código de Exportación
Implementar la función de exportación estándar definida en el "System Prompt" para enviar sesiones a la colección `activities`.

---

## 5. Próximos Pasos Inmediatos
1.  **Firebase Console:** Crear el Site ID `wellnessfy-breathe`.
2.  **DNS:** Configurar el subdominio `breathe.wellnessfy.io` (CNAME -> `wellnessfy-breathe.web.app` o la IP de Firebase).
3.  **Desarrollo:** Iniciar el desarrollo de la app en la nueva carpeta.
