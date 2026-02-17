// ============================================================
// SEED: Script para criar o Super Admin inicial
// ============================================================
// Este script roda uma vez para criar o primeiro usuário do sistema.
// Execute com: npx prisma db seed
// ============================================================

import { PrismaClient, Papel } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Lê as variáveis de ambiente
  const email = process.env.SUPER_ADMIN_EMAIL;
  const senha = process.env.SUPER_ADMIN_SENHA;
  const nome = process.env.SUPER_ADMIN_NOME;

  // Validação: garante que as variáveis foram preenchidas
  if (!email || !senha || !nome) {
    console.error('❌ Erro: Preencha as variáveis SUPER_ADMIN_EMAIL, SUPER_ADMIN_SENHA e SUPER_ADMIN_NOME no arquivo .env');
    process.exit(1);
  }

  // Verifica se já existe um super admin com este email
  const existente = await prisma.administrador.findUnique({
    where: { email },
  });

  if (existente) {
    console.log('ℹ️  Super Admin já existe com este e-mail. Nenhuma ação necessária.');
    return;
  }

  // Criptografa a senha (bcrypt com 12 rounds)
  const senhaHash = await bcrypt.hash(senha, 12);

  // Cria o Super Admin
  const superAdmin = await prisma.administrador.create({
    data: {
      nome,
      email,
      senhaHash,
      papel: Papel.SUPER_ADMIN,
      ativo: true,
    },
  });

  console.log('✅ Super Admin criado com sucesso!');
  console.log(`   Nome:  ${superAdmin.nome}`);
  console.log(`   Email: ${superAdmin.email}`);
  console.log(`   Papel: ${superAdmin.papel}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
