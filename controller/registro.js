import registroModel from '../model/registro.js';

class registroController {
    constructor() {

    }

    async create(req, res) {
        try {
            const data = await registroModel.create(req.body);
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async update(req, res) {
         try {
            const {id} = req.params;
            const data = await registroModel.update(id, req.body);
            res.status(200).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async delete(req, res) {
         try {
            const {id} = req.params;
            const data = await registroModel.delete(id);
            res.status(200).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async getAll(req, res) {
         try {
            const data = await registroModel.getAll();
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }

    async getOne(req, res) {
         try {
            const {id} = req.params;
            const data = await registroModel.getOne(id);
            res.status(201).json(data);
        } catch (e) {
            res.status(500).send(e);
        }
    }
}

export default new registroController();