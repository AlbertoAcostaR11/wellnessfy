# Wellnessfy & TotalPass Integration

Este es un microservicio diseñado para facilitar el registro de usuarios de TotalPass y la entrega automatizada de reportes InBody.

## 🚀 Cómo iniciar

El servidor ya ha sido configurado. Si deseas iniciarlo manualmente en el futuro:

1. Asegúrate de estar en la carpeta del proyecto.
2. Ejecuta:
   ```bash
   node server.js
   ```

## 🌐 URLs de Acceso

- **Registro de Usuarios**: [http://localhost:3000/registration.html](http://localhost:3000/registration.html)
- **Panel de Administración**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

## 🛠 Tecnologías Utilizadas

- **Frontend**: HTML5, Tailwind CSS, JavaScript Vanilla (Cero dependencias pesadas).
- **Estética**: Glassmorphism con la paleta de colores oficial de Wellnessfy (Neon Teal, Neon Purple).
- **Backend**: Node.js + Express.
- **Email**: Nodemailer configurado con el SMTP de IONOS (`hola@wellnessfy.io`).
- **Base de Datos**: Archivo JSON local (`users_totalpass.json`) para simplicidad y rapidez.

## 📧 Flujo de Email

Cuando un administrador carga un PDF en el Panel de Administración:
1. El archivo se procesa en memoria.
2. Se envía un correo profesional desde `hola@wellnessfy.io`.
3. El usuario recibe el mensaje personalizado con el PDF adjunto.

---
**Desarrollado por Antigravity AI**
