import express from 'express';
import * as mlModelController from '../controllers/mlModel.controller.js';

const router = express.Router();

router.get('/', mlModelController.getModels);
router.get('/:id', mlModelController.getModelById);
router.post('/', mlModelController.createModel);
router.put('/:id', mlModelController.updateModel);
router.delete('/:id', mlModelController.deleteModel);

export default router;
