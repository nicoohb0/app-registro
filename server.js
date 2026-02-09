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

// HSTS
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.secure)
    {
        res.setHeader(
            'Strict-Transport-Security',
            'max-age-3156000; includeSubDomains; preload'
        );
    }
    next();
});

// CSP
app.use((req, res, next) => {
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://cdnjs.cloudflare.com",
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'"
    ].join('; ');

    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Security-Policy', csp);
    res.setHeader('X-WebKit-CSP', csp);

    next();
});

app.post('/csp-report', (req, res) => {
    console.log('CSP Violation:', req.body);
    res.status(204).end();
});

// CAPTCHA
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 
        'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    next();
});


// API
app.use('/api/registro', routeRegistro);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

// // Iniciar
// const PORT = process.env.PORT || 5566;
// app.listen(PORT, () => {
//     console.log(`🚀 Servidor en http://localhost:${PORT}`);
//     // console.log(`📝 API Registro: http://localhost:${PORT}/api/registro`);
// });