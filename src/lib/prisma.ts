// ============================================================
// Conexão com o Banco de Dados (Prisma Client)
// ============================================================
// Este arquivo cria uma única instância do Prisma Client
// e reutiliza em todo o projeto. Isso evita criar conexões
// demais durante o desenvolvimento (hot reload do Next.js).
// ============================================================

import { PrismaClient } from '@prisma/client';

// Declara variável global para reutilizar no dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Se já existe uma instância, reutiliza. Senão, cria uma nova.
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// No modo desenvolvimento, salva a instância para reutilizar
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
