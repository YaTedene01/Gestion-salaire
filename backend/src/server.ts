import dotenv from 'dotenv';
dotenv.config();
dotenv.config();
import express, { Application, Request, Response } from 'express';
import cors from 'cors';

const app: Application = express();
const PORT = process.env.PORT || 5000;



app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import path from 'path';
// Sert les fichiers du dossier uploads statiquement
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import CompanyRoute from './routes/CompanyRoute';
app.use('/api/companies', CompanyRoute);

import PaymentRoute from './routes/PaymentRoute';
app.use('/api/payments', PaymentRoute);

import AuthRoute from './routes/AuthRoute';
app.use('/api/auth', AuthRoute);

import EmployeeRoute from './routes/EmployeeRoute';
app.use('/api/employees', EmployeeRoute);

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API Gestion Salaire - Backend fonctionne!',
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});