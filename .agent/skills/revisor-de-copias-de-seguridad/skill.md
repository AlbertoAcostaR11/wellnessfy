# Revisor de Copias de Seguridad

## Descripción
Esta habilidad está diseñada para rescatar funcionalidades "perfectas" que se han perdido durante el desarrollo o tras restauraciones accidentales. Permite auditar múltiples directorios de backup, comparar versiones de una función específica y restaurar la más óptima según la necesidad del usuario.

## Triggers (Cuándo usarla)
- Cuando el usuario mencione que algo "antes funcionaba al 100%" y ya no.
- Cuando se sospeche que una actualización o corrección borró una mejora previa.
- Al decir "revisa los backups de la función X" o "busca la mejor versión de Y en las copias".

## Instrucciones (El Prompt)
1.  **Definir el Objetivo**: Identificar claramente la función, componente o archivo que se desea auditar (ej: `renderDeportesTab`, `handleHealthSync`).
2.  **Rastreo Exhaustivo**: 
    - Listar los directorios de backup disponibles (`Backups/`, `_BACKUPS/`, `backup_*/`).
    - Buscar el término objetivo dentro de esos directorios usando herramientas de búsqueda.
3.  **Auditoría de Versiones**:
    - Extraer el código de la función en cada punto en el tiempo encontrado.
    - Analizar el "alcance" de cada versión (qué problemas resolvía, qué features incluía).
4.  **Presentación Comparativa**: 
    - Generar una lista o tabla de las versiones encontradas.
    - Para cada una, describir: Ubicación del backup, fecha aproximada (si está en el nombre), y puntos clave de esa implementación.
    - Resaltar cuál parece ser la versión "más completa" o "más óptima" y por qué.
5.  **Ejecución de Restauración**:
    - Una vez que el usuario elija una versión, leer el contenido completo de la versión elegida.
    - Aplicar la restauración sobre el archivo actual del proyecto de forma precisa, asegurando no perder otras mejoras actuales compatibles.

## Checklist de Calidad
- [ ] ¿Se exploraron todas las carpetas de backup del proyecto?
- [ ] ¿Se mostró una comparación clara entre lo que hay en producción/actual y lo que hay en los backups?
- [ ] ¿La versión propuesta como "óptima" realmente contiene la lógica que el usuario extraña?
- [ ] ¿Se verificaron las dependencias (imports) al restaurar código antiguo en un entorno nuevo?

## Formato de Salida
- Tabla comparativa de versiones con descripciones breves.
- Bloques de código con las diferencias clave resaltadas.
- Confirmación final con el detalle del cambio realizado.
