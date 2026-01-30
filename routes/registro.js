import express from 'express';
const route = express.Router();
import registroController from '../controller/registro.js'

route.post('/', registroController.create);
route.get('/', registroController.getAll);
route.get('/:id', registroController.getOne);
route.put('/:id', registroController.update);
route.delete('/:id', registroController.delete);

export default route;