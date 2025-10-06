import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import multer from 'multer';

const router = Router();

// Configuration multer pour l'import CSV
const upload = multer({ dest: 'uploads/' });

// Protéger toutes les routes d'employés
router.use(AuthMiddleware.authenticate);
router.use(AuthMiddleware.requireCompanyAccess);

router.post('/', AuthMiddleware.authorize('ADMIN'), EmployeeController.create);
router.post('/import', AuthMiddleware.authorize('ADMIN'), upload.single('file'), EmployeeController.import);
router.post('/generate-qr-codes', AuthMiddleware.authorize('ADMIN'), EmployeeController.generateAllQRCodes);
router.get('/', EmployeeController.getAll);
router.get('/:id', EmployeeController.getById);
router.get('/:id/qr-code', EmployeeController.getQRCode);
router.post('/:id/qr-code', AuthMiddleware.authorize('ADMIN'), EmployeeController.generateQRCode);
router.put('/:id', AuthMiddleware.authorize('ADMIN'), EmployeeController.update);
router.delete('/:id', AuthMiddleware.authorize('ADMIN'), EmployeeController.delete);
router.patch('/:id/active', AuthMiddleware.authorize('ADMIN'), EmployeeController.setActive);

export default router;
