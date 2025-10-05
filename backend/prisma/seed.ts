import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@demo.com' },
    update: {},
    create: {
      email: 'superadmin@demo.com',
      password: await bcrypt.hash('superadmin123', 10),
      role: 'SUPER_ADMIN',
    },
  });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  });

  // Utilisateur
  const user = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      password: await bcrypt.hash('user123', 10),
      role: 'USER',
    },
  });

  // Entreprise
  const company = await prisma.company.create({
    data: {
      name: 'DemoCorp',
      logo: '',
      address: 'Dakar',
      currency: 'FCFA',
      period: 'MENSUEL',
    },
  });

  // Employés
  const emp1 = await prisma.employee.create({
    data: {
      fullName: 'Mamadou Diop',
      position: 'Développeur',
      contractType: 'FIXE',
      salary: 750000,
      bankDetails: 'BICIS',
      isActive: true,
    },
  });
  const emp2 = await prisma.employee.create({
    data: {
      fullName: 'Fatou Sall',
      position: 'Comptable',
      contractType: 'FIXE',
      salary: 650000,
      bankDetails: 'SGBS',
      isActive: true,
    },
  });
  const emp3 = await prisma.employee.create({
    data: {
      fullName: 'Ibrahima Ndiaye',
      position: 'Manager',
      contractType: 'HONORAIRE',
      salary: 850000,
      bankDetails: 'Ecobank',
      isActive: true,
    },
  });

  console.log('Seed terminé : super admin, admin, user, entreprise, employés créés');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
