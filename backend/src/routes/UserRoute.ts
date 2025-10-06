import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Protéger toutes les routes utilisateurs
router.use(AuthMiddleware.authenticate);

// Créer un utilisateur (seulement pour ADMIN et SUPER_ADMIN)
router.post('/', AuthMiddleware.authorize('ADMIN'), UserController.create);
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.put('/:id', AuthMiddleware.authorize('ADMIN'), UserController.update);
router.delete('/:id', AuthMiddleware.authorize('ADMIN'), UserController.delete);

export default router;