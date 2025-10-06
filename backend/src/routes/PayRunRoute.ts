import { Router } from 'express';
import { PayRunController } from '../controllers/PayRunController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Protéger toutes les routes de cycles de paie
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireCompanyAccess);

router.post('/', AuthMiddleware.authorize('ADMIN'), PayRunController.create);
router.get('/', PayRunController.getAll);
router.get('/:id', PayRunController.getById);
router.get('/:id/payslips', PayRunController.getPaySlips);
router.post('/:id/generate', AuthMiddleware.authorize('ADMIN'), PayRunController.generatePaySlips);
router.patch('/:id/status', AuthMiddleware.authorize('ADMIN'), PayRunController.updateStatus);
router.patch('/:id/close', AuthMiddleware.authorize('ADMIN'), PayRunController.close);
router.delete('/:id', AuthMiddleware.authorize('ADMIN'), PayRunController.delete);

export default router;