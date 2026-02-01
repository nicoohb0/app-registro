import 'dotenv/config';
import { MongoClient } from "mongodb";

class dbCliente {
    constructor() {
        const connectionString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority`;
        console.log('Intentando conectar a MongoDB...');
        this.client = new MongoClient(connectionString);
        this.conectarDB();
    }

    async conectarDB() {
        try {
            await this.client.connect();
            this.db = this.client.db('datos-registro');
            console.log("✅ Conectado a la base de datos MongoDB");
        } catch (e) {
            console.error("❌ Error al conectar a MongoDB:", e.message);
            console.log("💡 Asegúrate de que:");
            console.log("   1. Las variables de entorno están configuradas correctamente");
            console.log("   2. Tu IP está en la whitelist de MongoDB Atlas");
            console.log("   3. El usuario y contraseña son correctos");
        }
    }
}

export default new dbCliente();