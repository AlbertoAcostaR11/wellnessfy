# 🚨 Solución al Error de Subida de Imágenes (CORS)

El error `Payload size exceeds the limit` ya fue corregido en el código (cambiamos a Firebase Storage).
Sin embargo, ahora verás un error rojo en la consola (CORS) bloqueando la subida desde `localhost`. Esto es una seguridad de Google por defecto.

## Pasos para desbloquear (Solo toma 2 minutos):

1.  Ve a la **Consola de Google Cloud**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
2.  Asegúrate de estar en tu proyecto `wellnessfy-cbc1b` (selecciónalo arriba a la izquierda).
3.  Haz clic en el ícono de **Terminal / Cloud Shell** (arriba a la derecha, parece un cuadro de código `>_`).
4.  Espera a que se conecte la terminal.
5.  Sube el archivo `cors.json` que acabo de crear en tu carpeta:
    *   En la terminal de Cloud Shell, haz clic en los 3 puntos (⋮) o botón de menú -> **Upload**.
    *   Selecciona el archivo `cors.json` de tu carpeta `Wellnessfy App`.
6.  Una vez subido, ejecuta este comando en la terminal de Cloud Shell:

```bash
gsutil cors set cors.json gs://wellnessfy-cbc1b.firebasestorage.app
```

7.  **¡Listo!** Vuelve a tu página local, recarga y prueba subir la imagen. Funcionará perfectamente.
