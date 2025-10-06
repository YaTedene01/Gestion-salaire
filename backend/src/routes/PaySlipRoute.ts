import { Router } from 'express';
import { PaySlipController } from '../controllers/PaySlipController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

const router = Router();

// Protéger toutes les routes de bulletins
router.use(AuthMiddleware.authenticate);
// Le caissier peut voir tous les bulletins approuvés, pas seulement ceux de son entreprise
router.use((req: any, res, next) => {
  if (req.user?.role === 'CASHIER') {
    return next(); // Caissier peut accéder sans restriction d'entreprise
  }
  return AuthMiddleware.requireCompanyAccess(req, res, next);
});

router.get('/', PaySlipController.getAll);
router.get('/:id', PaySlipController.getById);
router.put('/:id', AuthMiddleware.authorize('ADMIN'), PaySlipController.update);
router.delete('/:id', AuthMiddleware.authorize('ADMIN'), PaySlipController.delete);

export default router;