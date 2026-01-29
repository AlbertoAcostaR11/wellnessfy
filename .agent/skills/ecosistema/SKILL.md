---
name: Arquitecto de Ecosistemas
description: Skill maestro para diseñar la arquitectura multi-app de Wellnessfy, garantizando identidad única, centralización de datos en Firestore y escalabilidad técnica en Google Cloud.
---

# Skill: Arquitecto de Ecosistemas 🌐🌀

Este Skill rige la evolución de Wellnessfy de una aplicación única a un **Ecosistema de Bienestar**. Su función es asegurar que cada nueva aplicación satélite (Breathe, Meditate, Nutri, etc.) funcione como un módulo independiente pero comparta el mismo "corazón" (Perfil e Identidad).

## 🧩 Principios del Ecosistema
1.  **Identidad Universal (SSO)**: Un usuario, una cuenta, todas las apps. El documento `users/{uid}` es la fuente de verdad única.
2.  **Independencia Operativa**: Cada app (ej: `breathe.wellnessfy.io`) debe ser funcional por sí misma, pero reportar su actividad al Nodo Central.
3.  **Cross-Pollination de Datos**: Los minutos meditados en la "App A" deben aparecer automáticamente como "Minutos Activos/Bienestar" en la "Wellnessfy App".
4.  **Arquitectura de "Data Lake"**: Centralizar métricas en Firestore bajo estructuras compartidas para que cualquier app del ecosistema pueda leer/escribir según sus permisos.

---

## 🏗️ Protocolo de Integración Técnica

Cada vez que se planee una nueva app o función del ecosistema, este Skill debe auditar:

### 1. Gestión de Identidad (Auth)
*   Verificar que se use **Firebase Authentication** centralizado.
*   Asegurar que el flujo de "Sign Up" en cualquier app verifique primero si el correo ya existe en el ecosistema para vincularlo, no duplicarlo.

### 2. Estructura Firestore (Data Schema)
*   **Perfil**: `users/{userId}` (Datos base: nombre, avatar, metas globales).
*   **Actividad**: `users/{userId}/activities/{activityId}` (Estandarizar tipos de actividad para que todas las apps hablen el mismo idioma).
*   **App Status**: `users/{userId}/apps/{appName}` (Configuraciones específicas de cada app satélite).

### 3. Seguridad y Reglas (Firebase Rules)
*   Diseñar reglas que permitan a la "App Satélite" escribir en su sección específica pero tengan acceso de lectura al perfil global.
*   Implementar validaciones para que los datos de una app no corrompan las métricas globales del usuario.

### 4. Infraestructura Google Cloud
*   **Hospedaje**: Gestión de subdominios (breathe.wellnessfy.io, etc.).
*   **Cloud Functions**: Triggers que reaccionen a datos de una app para actualizar el "Score de Bienestar" global en tiempo real.
*   **CORS**: Configurar proxies y permisos para que las apps del ecosistema puedan comunicarse entre sí de forma segura.

---

## 📈 Factores de Análisis de Nueva App
Al recibir una nueva App para el ecosistema, analizar:

1.  **Función Única**: ¿Qué problema específico resuelve esta app que Wellnessfy App no hace?
2.  **Impacto Global**: ¿Cómo aporta esta app a los anillos de actividad o progreso general del usuario?
3.  **Métricas Compartidas**: ¿Qué datos de esta app deben ser visibles en el Dashboard central de Wellnessfy? (Ej: Segundos de apnea, frecuencia cardíaca, etc.).
4.  **Continuidad de Experiencia**: ¿El avatar y nombre se cargan automáticamente desde el perfil central?

---

## 💼 Conexión con Modo Comercial
*   **Suscripción Unificada**: ¿Esta app se incluye en el plan "Ecosystem Pro"?
*   **Adquisición**: ¿Cómo esta nueva app sirve de puerta de entrada para usuarios que aún no conocen Wellnessfy App?
