// ============================================================
// API Route: Autenticação (NextAuth)
// ============================================================
// Este arquivo é o ponto de entrada do NextAuth.
// Ele lida com login, logout e verificação de sessão.
// ============================================================

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
