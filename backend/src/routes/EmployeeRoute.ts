import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Protéger toutes les routes d'employés
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireCompanyAccess);

router.post('/', AuthMiddleware.authorize('ADMIN'), EmployeeController.create);
router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.put('/:id', AuthMiddleware.authorize('ADMIN'), EmployeeController.update);
router.delete('/:id', AuthMiddleware.authorize('ADMIN'), EmployeeController.delete);
router.patch('/:id/active', AuthMiddleware.authorize('ADMIN'), EmployeeController.setActive);

export default router;
