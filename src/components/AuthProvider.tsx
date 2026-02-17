// ============================================================
// Componente: AuthProvider
// ============================================================
// Envolve a aplicação com o SessionProvider do NextAuth.
// Isso permite que qualquer componente acesse a sessão do
// usuário logado usando useSession().
// Precisa ser 'use client' porque usa contexto do React.
// ============================================================

'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
