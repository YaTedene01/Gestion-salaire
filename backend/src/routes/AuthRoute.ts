import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/create-admin', AuthMiddleware.authenticate, AuthController.createAdmin);
router.get('/users', AuthMiddleware.authenticate, AuthController.getAllUsers);
router.patch('/users/:id/active', AuthMiddleware.authenticate, AuthMiddleware.authorize('ADMIN'), AuthController.setActive);
router.delete('/users/:id', AuthMiddleware.authenticate, AuthMiddleware.authorize('ADMIN'), AuthController.deleteUser);

export default router;
