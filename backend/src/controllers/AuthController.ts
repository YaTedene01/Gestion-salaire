import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body;
			const user = await AuthService.register(email, password, role);
			res.status(201).json({ user });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const { user, token } = await AuthService.login(email, password);
			res.status(200).json({ user, token });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}
}
