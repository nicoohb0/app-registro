import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import routeRegistro from './routes/registro.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurar Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Ruta principal que renderiza la vista home
app.get('/', (req, res) => {
    res.render('home', {
        title: 'Sistema de Registro'
    });
});

// Ruta para mostrar formulario de registro
app.get('/registro-form', (req, res) => {
    res.render('registro-form', {
        title: 'Registro de Usuarios'
    });
});

// API Routes
app.use('/api/registro', routeRegistro);

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Página no encontrada'
    });
});

// Iniciar servidor
try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`✅ Servidor activo en http://localhost:${PORT}`);
        console.log(`📁 Vista principal: http://localhost:${PORT}/`);
        console.log(`📁 API Registro: http://localhost:${PORT}/api/registro`);
    });
} catch(e) {
    console.error('❌ Error al iniciar servidor:', e);
}