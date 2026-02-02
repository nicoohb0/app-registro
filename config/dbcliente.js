// dbcliente.js - VERSIÓN CORREGIDA
import 'dotenv/config';
import { MongoClient } from "mongodb";

class dbCliente {
    constructor() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?appName=datos-registro`;
        console.log('Intentando conectar a MongoDB...');
        this.client = new MongoClient(queryString);
        this.conectarDB(); // <-- CORREGIDO
    }

    async conectarDB() {
        try {
            await this.client.connect();
            this.db = this.client.db('datos-registro');
            console.log("✅ Conectado a la base de datos MongoDB");
        } catch (e) {
            console.error("❌ Error al conectar a MongoDB:", e.message);
            throw e; // <-- IMPORTANTE: Relanzar el error
        }
    }
}

export default new dbCliente();