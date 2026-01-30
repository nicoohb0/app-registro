import 'dotenv/config';
import express from 'express';
import routeRegistro from './routes/registro.js'
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/registro', routeRegistro);

try {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log('Servidor activo en el pureto ' + PORT))
} catch (e) {
    console.log(e);
}