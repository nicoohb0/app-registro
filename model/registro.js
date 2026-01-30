import { ObjectId } from "mongodb";
import dbcliente from "../config/dbcliente.js";
import registro from "../controller/registro.js";

class registroModelo {

    async create(registro) {
        const colRegitro = dbcliente.db.collection('registro');
        return await colRegitro.insertOne(registro)
    }

    async update(id, registro) {
        const colRegitro = dbcliente.db.collection('registro');
        return await colRegitro.updateOne({ _id: new ObjectId(id) }, { $set: registro });
    }

    async delete(id) {
        const colRegitro = dbcliente.db.collection('registro');
        return await colRegitro.deleteOne({ _id: new ObjectId(id) });
    }

    async getAll() {
        const colRegitro = dbcliente.db.collection('registro');
        return await colRegitro.find({}).toArray();
    }

    async getOne(id) {
        const colRegitro = dbcliente.db.collection('registro');
        return await colRegitro.findOne({ _id: new ObjectId(id) });
    }

}

export default new registroModelo;