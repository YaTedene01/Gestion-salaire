import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
      password: await bcrypt.hash('123', 10),
      role: 'ADMIN',
      companyId: company.id,
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
      companyId: company.id,
    },
  });

  console.log('Seed terminé : super admin, admin, user, entreprise créés');
  console.log('Admin email:', admin.email);
  console.log('Admin password: 123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
