const express = require('express');
const { createFunction } = require('./functions/functions');
const { getQRImages, getQRImagePath } = require('./functions/qrImages'); // Importar funciones de manejo de imágenes
const app = express();
const port = 4010;
const path = require('path');

app.use(express.json()); // Middleware para parsear JSON

// Rutas para crear y ejecutar funciones dinámicas
app.post('/crear', (req, res) => {
    const { nombre, id_externo } = req.body;

    if (nombre && id_externo) {
        let name = createFunction(id_externo);        
        const sms = `Función ${name} creada y lista para usar.`;
        console.log(sms);
        res.send({
            result: true,
            success: sms,
            error: ''
        });
    } else {
        const sms = 'Por favor, proporciona un nombre y un ID';
        console.log(sms);
        res.status(400).send({
            result: false,
            success: '',
            error: sms
        });
    }
});

// Ruta para ejecutar la función en el archivo creado
app.post('/ejecutar', async (req, res) => {
    const { nombre, parametro } = req.body;

    if (nombre && parametro) {
        const filePath = path.join(__dirname, `functions/${nombre}.js`);

        try {
            // Cargar la función desde el archivo creado
            const createdFunction = require(filePath);

            // Ejecutar la función con el parámetro proporcionado
            const result = await createdFunction(app,parametro);
            console.log('Resultado de la función:', result);

            res.send({
                result: true,
                success: result,
                error: ''
            });
        } catch (error) {
            console.error('Error al ejecutar la función:', error);
            res.status(500).send({
                result: false,
                success: '',
                error: 'Error al ejecutar la función'
            });
        }
    } else {
        const sms = 'Por favor, proporciona el nombre y un parámetro';
        console.log(sms);
        res.status(400).send({
            result: false,
            success: '',
            error: sms
        });
    }
});

// Rutas para manejar imágenes .qr.png
app.get('/qr-images-list', async (req, res) => {
    try {
        const qrImages = await getQRImages();
        res.json(qrImages);
    } catch (err) {
        console.error('Error al obtener imágenes .qr.png:', err);
        res.status(500).json({ error: 'Error al obtener imágenes .qr.png' });
    }
});

app.get('/qr-images/:imageName', async (req, res) => {
    const { imageName } = req.params;
    try {
        const imagePath = await getQRImagePath(imageName);
        if (!imagePath) {
            res.status(404).send('Imagen no encontrada');
            return;
        }
        res.sendFile(imagePath);
    } catch (err) {
        console.error('Error al obtener imagen .qr.png:', err);
        res.status(500).json({ error: 'Error al obtener imagen .qr.png' });
    }
});

// Puerto en el que escucha el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});
