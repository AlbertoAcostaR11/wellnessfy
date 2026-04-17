import express from 'express';
import nodemailer from 'nodemailer';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Configuración de almacenamiento para Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configuración de Nodemailer para IONOS
const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.mx',
    port: 465,
    secure: true,
    auth: {
        user: 'hola@wellnessfy.io',
        pass: '*12151819Aa'
    }
});

// ÚNICO ENDPOINT NECESARIO: Subir InBody y enviar correo
app.post('/api/upload-inbody/:email', upload.single('inbody'), async (req, res) => {
    const { email } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    try {
        const mailOptions = {
            from: '"Wellnessfy" <hola@wellnessfy.io>',
            to: email,
            subject: 'Tu reporte InBody - Wellnessfy con TotalPass',
            text: `Gracias por unirte a Wellnessfy con TotalPass.\n\nAquí tienes tu InBody. Recuerda consultar esta información con un especialista en salud y nutrición.\n\n¡Espera más noticias de Wellnessfy Próximamente!`,
            attachments: [
                {
                    filename: file.originalname || 'InBody_Report.pdf',
                    content: file.buffer
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email enviado a:', email, '| Respuesta:', info.response);
        
        res.status(200).json({ message: 'Email enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar email:', error);
        res.status(500).json({ error: 'Error al enviar el correo con el adjunto' });
    }
});

app.listen(port, () => {
    console.log(`🚀 Servidor LOCAL de Envíos Wellnessfy activo en http://localhost:${port}`);
    console.log(`- Panel de Administración listo. Usa este servidor solo en tu computadora.`);
});
