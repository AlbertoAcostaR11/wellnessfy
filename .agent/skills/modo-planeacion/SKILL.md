---
name: Modo Planeación
description: Skill de análisis exhaustivo previo a la implementación para evitar deudas técnicas, errores de scope y asegurar la integración armónica con el ecosistema y la visión comercial.
---

# Skill: Modo Planeación 🗺️🧠

Este Skill es el **filtro de calidad y arquitectura** de Wellnessfy. Su objetivo es evitar la "implementación impulsiva" que suele romper el código existente o dejar cabos sueltos. Al activar este modo, se realiza un escaneo de 360 grados sobre el impacto de cualquier cambio.

## 🛡️ Protocolo de Análisis Detallado

Antes de escribir una sola línea de código, este Skill obliga a documentar:

### 1. Intervención Directa e Indirecta
*   **Punto de Inserción**: ¿En qué archivos y funciones específicas se inyectará el nuevo código?
*   **Zona de Impacto Crítico**: ¿Qué partes del código se verán modificadas directamente?
*   **Efectos Secundarios (Side Effects)**: ¿Qué funciones o módulos dependen de las zonas modificadas? (Ej: Si cambio el formato de fecha en el provider, ¿se rompen los gráficos de la pestaña Activity?).

### 2. Infraestructura y Backend
*   **Servicios Cloud**: ¿Requiere nuevas Cloud Functions o modificar las existentes?
*   **Seguridad**: ¿Hay que actualizar las reglas de Firestore o los permisos de IAM en Google Cloud?
*   **APIs**: ¿Incorpora nuevas APIs externas o modifica el uso de las actuales? ¿Cómo afecta esto a los límites de cuota?

### 3. Integración Estratégica
*   **Skill Ecosistema 🌐**: ¿Cómo se conecta esta función con las apps satélite? ¿Usa el perfil único? ¿Los datos generados son útiles para otras apps del ecosistema?
*   **Skill Modo Comercial 🚀**: ¿Esta función es Free o Premium? ¿Cómo aporta a la conversión B2B o B2C? ¿Es comercializable?

### 4. Robustez y Resiliencia (Nuevas Consideraciones)
*   **Manejo de Estados (AppState)**: ¿Requiere nuevas propiedades en el estado global? ¿Cómo se sincronizarán en tiempo real via Firestore?
*   **Consistencia de Diseño**: ¿Sigue las guías estéticas de Wellnessfy (glasmorfismo, tipografía, micro-animaciones)?
*   **Mecanismos de Failsafe**: Si la lógica falla (error de red, API caída), ¿la app sigue siendo funcional o se queda en blanco?

---

## 📋 Checklist de Salida del Modo Planeación

La planeación solo se considera finalizada cuando se tiene claridad en:
1.  **Mapa de Archivos**: Lista de archivos a modificar.
2.  **Impacto en Firestore**: Cambios en el esquema de datos.
3.  **Justificación Comercial**: Valor de negocio de la función.
4.  **Validación de Ecosistema**: Confirmación de que respeta la identidad de usuario única.
5.  **Plan de Verificación**: Cómo probaremos que no rompimos nada (Forensic Analysis preventivo).

---

## 💡 Mantra del Skill
*"Diez minutos de planeación ahorran diez horas de depuración."*
