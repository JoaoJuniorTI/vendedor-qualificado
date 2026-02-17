// ============================================================
// Middleware: Proteção de Rotas
// ============================================================
// Intercepta as requisições e verifica se o usuário está
// logado antes de permitir acesso às páginas /admin/*.
// Se não estiver logado, redireciona para /login.
// ============================================================

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// Define quais rotas o middleware protege
export const config = {
  matcher: ['/admin/:path*'],
};
