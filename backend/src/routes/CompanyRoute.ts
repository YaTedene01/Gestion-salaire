import { Router } from 'express';
import { CompanyController } from '../controllers/CompanyController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import multer from 'multer';
import path from 'path';

// Config multer pour stocker les images dans /uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, '../../uploads'));
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`);
	}
});
const upload = multer({ storage });

const router = Router();

// Protéger les routes d'entreprises
router.use(AuthMiddleware.authenticate);

router.post('/', AuthMiddleware.authorize('SUPER_ADMIN'), upload.single('logoFile'), CompanyController.create);
router.get('/', CompanyController.getAll);
router.get('/:id', CompanyController.getById);
router.put('/:id', AuthMiddleware.authorize('SUPER_ADMIN'), CompanyController.update);
router.patch('/:id/active', AuthMiddleware.authorize('SUPER_ADMIN'), CompanyController.setActive);
router.delete('/:id', AuthMiddleware.authorize('SUPER_ADMIN'), CompanyController.delete);

// Super admin invitation routes
router.post('/:id/invite-super-admin', AuthMiddleware.authorize('ADMIN'), CompanyController.inviteSuperAdmin);
router.delete('/:id/invite-super-admin', AuthMiddleware.authorize('ADMIN'), CompanyController.removeSuperAdminInvite);
router.get('/:id/check-super-admin-access', CompanyController.checkSuperAdminAccess);

export default router;
