# Análisis de Firestore y Firebase

## Descripción
Esta habilidad asegura que todas las nuevas funcionalidades y actualizaciones de Wellnessfy estén correctamente integradas con la infraestructura de Google Cloud, Firebase y Firestore. Su objetivo es evitar que el desarrollo se limite a un entorno local ("thinking local") y garantizar que el despliegue sea 100% funcional en la nube, considerando la naturaleza social y de tiempo real de la plataforma.

## Cuándo usarla (Triggers)
*   **Nueva Funcionalidad**: Al crear cualquier módulo que requiera persistencia de datos.
*   **Actualizaciones de Modelo**: Al modificar esquemas de datos o lógica de sincronización.
*   **Preparación de Despliegue**: Antes de sugerir o realizar un despliegue a producción.
*   **Funciones Sociales**: Al implementar interacciones entre usuarios (likes, comentarios, seguimientos, retos compartidos).
*   **Debugging de Sincronización**: Cuando los datos no se reflejan entre dispositivos.

## Instrucciones del Proceso

### 1. Auditoría de Conexión y Configuración
*   Verificar que la inicialización de Firebase use la configuración correcta (`firebaseConfig`).
*   Confirmar que las referencias a `db` (Firestore), `auth` y `storage` sean consistentes.
*   Detectar y eliminar cualquier referencia hardcodeada a `localhost` o puertos locales en código destinado a producción.

### 2. Seguridad y Reglas de Firestore
*   Analizar si la nueva funcionalidad requiere cambios en `firestore.rules`.
*   Asegurar que las reglas sigan el principio de mínimo privilegio:
    *   ¿Quién puede escribir? (Solo el dueño, solo amigos, etc.)
    *   ¿Quién puede leer? (Privado, público, restringido).
    *   Validación de campos obligatorios en las escrituras.

### 3. Dinámica Social e Interacción Multi-usuario
*   Verificar que las escrituras incluyan IDs de autor (`authorId`, `uid`).
*   Asegurar que las consultas filtren correctamente por privacidad (usuarios bloqueados, perfiles privados).
*   Validar que las actualizaciones de estado social (contadores de likes, participación en retos) sean atómicas o usen transacciones si es necesario para evitar inconsistencias.

### 4. Tiempo Real y Sincronización
*   Identificar secciones que requieren `onSnapshot()` para actualizaciones en vivo (feeds, notificaciones, chats).
*   Verificar que los listeners se cierren correctamente para evitar fugas de memoria y costos innecesarios en Firestore.
*   Validar la estrategia de caché local vs datos en la nube para asegurar que el usuario vea cambios inmediatos.

### 5. Configuración de Hosting y Dominios
*   Revisar el archivo `firebase.json` para asegurar que las redirecciones (rewrites) y cabeceras sean correctas.
*   Confirmar que los dominios de OAuth y de la app estén autorizados en la consola de Firebase.

### 6. Índices y Escalabilidad
*   Identificar consultas complejas (múltiples `where`, `orderBy`) que puedan requerir la creación de índices compuestos en Firestore.
*   Proponer la creación de índices si se detectan errores de consulta en los logs.

## Checklist de Calidad
1.  [ ] **¿Es Cloud-Ready?** No hay dependencias de archivos locales absolutos ni URLs de localhost.
2.  [ ] **¿Seguridad Aplicada?** Se han definido o verificado las reglas de acceso para proteger los datos.
3.  [ ] **¿Consistencia Social?** La interacción entre dos usuarios distintos funciona correctamente (ej: el usuario B ve el post del usuario A).
4.  [ ] **¿Experiencia Real-Time?** Los cambios se reflejan sin necesidad de refrescar la página manualmente donde se requiere.
5.  [ ] **¿Manejo de Errores?** Se capturan errores específicos de Firebase (Permission Denied, Network Error).

## Formato de Salida
Al usar esta habilidad, Antigravity debe entregar un **Reporte de Integración Cloud** que incluya:
*   **Estado de Conexión**: Confirmación de archivos y variables de entorno.
*   **Propuesta de Reglas**: Fragmento de código para `firestore.rules` si es necesario.
*   **Verificación Social**: Explicación de cómo se maneja la interacción entre usuarios.
*   **Alertas de Despliegue**: Cualquier paso manual necesario en la consola de Google Cloud/Firebase.
