import dbcliente from "../config/dbcliente.js";
import registro from "../controller/registro.js";

class registroModelo {

    async create(registro) {
        const colRegitro = dbcliente.db.collection('registro');
        await colRegitro.insertOne(registro)
    }

}

export default new registroModelo;