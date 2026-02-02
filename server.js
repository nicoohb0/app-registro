import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import routeRegistro from './routes/registro.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dbcliente from './config/dbcliente.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Handlebars
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Rutas
app.get('/', (req, res) => {
    res.render('home', { title: 'Sistema de Registro' });
});

app.get('/registro-form', (req, res) => {
    res.render('registro-form', { title: 'Registro de Usuarios' });
});

dbcliente.conectarDB().then(() => {
    const PORT = process.env.PORT || 5566;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor en http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.error('❌ No se pudo conectar a la base de datos:', error);
    process.exit(1);
});

// API
app.use('/api/registro', routeRegistro);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar
const PORT = process.env.PORT || 5566;
app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    // console.log(`📝 API Registro: http://localhost:${PORT}/api/registro`);
});