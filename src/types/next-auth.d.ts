// ============================================================
// Declarações de Tipo para NextAuth
// ============================================================
// Extende os tipos padrão do NextAuth para incluir
// os campos customizados (papel, grupoIds) na sessão.
// ============================================================

import { Papel } from '@prisma/client';
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      papel: Papel;
      grupoIds: string[];
    };
  }

  interface User {
    id: string;
    papel: Papel;
    grupoIds: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    papel: Papel;
    grupoIds: string[];
  }
}
