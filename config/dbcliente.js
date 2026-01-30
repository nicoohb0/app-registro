import 'dotenv/config';
import { MongoClient } from "mongodb";

class dbCliente {
    constructor() {
        const queryString = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?appName=datos-registro`;
        this.client = new MongoClient(queryString);
        this.concetarDB();
    }

    async concetarDB() {
        try {
            await this.client.connect();
            this.db = this.client.db('datos-registro');
            console.log("Conectado a la base de datos");
        } catch (e) {
            console.log(e);
        }
    }
}

export default new dbCliente();