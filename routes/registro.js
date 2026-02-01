import express from 'express';
const route = express.Router();
import registroController from '../controller/registro.js';

route.post('/', registroController.create);
route.post('/authenticate', registroController.authenticate);
route.post('/validate-password', registroController.validatePassword);
route.get('/generate-password', registroController.generateSecurePassword);
route.get('/', registroController.getAll);
route.get('/:id', registroController.getOne);
route.put('/:id', registroController.update);
route.delete('/:id', registroController.delete);

export default route;