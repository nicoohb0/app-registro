import 'dotenv/config';
import express from 'express';
import routeRegistro from './routes/registro.js'

const app = express();

app.use('/registro', routeRegistro);

try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT,()=> console.log('Servidor activo en el pureto ' + PORT))
} catch(e) {
    console.log(e);
}