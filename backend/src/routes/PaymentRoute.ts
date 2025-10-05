import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Protéger toutes les routes de paiement
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireCompanyAccess);

router.post('/', AuthMiddleware.authorize('ADMIN', 'CASHIER'), PaymentController.create);
router.get('/', PaymentController.getAll);
router.get('/:id', PaymentController.getById);

export default router;
