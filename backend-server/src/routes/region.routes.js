import express from 'express';
import * as regionController from '../controllers/region.controller.js';

const router = express.Router();

router.get('/', regionController.getRegions);
router.get('/:id', regionController.getRegionById);
router.post('/', regionController.createRegion);
router.put('/:id', regionController.updateRegion);
router.delete('/:id', regionController.deleteRegion);

export default router;
