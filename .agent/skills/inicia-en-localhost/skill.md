# Inicia en Localhost

## Descripción
Esta habilidad permite automatizar el proceso de inicio y verificación del servidor local para la Wellnessfy App, asegurando que el entorno de desarrollo esté listo para su uso en `localhost:8000`.

## Triggers (Cuándo usarla)
- Cuando el usuario pida "ejecutar la app", "abrir en localhost", "iniciar servidor" o frases similares relacionadas con el entorno local.
- Al inicio de una sesión de trabajo si el usuario desea previsualizar cambios.

## Instrucciones (El Prompt)
1.  **Verificar Servidor**: Comprueba si ya existe un proceso de `http-server` o similar ejecutándose en el puerto 8000.
2.  **Iniciar si es necesario**: Si no hay un servidor activo, ejecuta el comando `npx -y http-server -p 8000` en la raíz del proyecto.
3.  **Confirmar Disponibilidad**: Verifica que los archivos `index.html` y `styles.css` estén presentes para asegurar que el servidor servirá el contenido correcto.
4.  **Informar al Usuario**: Proporciona el enlace directo `http://localhost:8000` y confirma que el servidor está operativo.

## Checklist de Calidad
- [ ] ¿El servidor se inició en el puerto 8000?
- [ ] ¿Se proporcionó el enlace clickable al usuario?
- [ ] ¿Se verificó que la raíz del proyecto es el directorio de trabajo actual?

## Formato de Salida
- Un mensaje de confirmación amigable en Markdown.
- El enlace `http://localhost:8000` resaltado.
- Un breve resumen del estado del servidor (puerto y directorio).
