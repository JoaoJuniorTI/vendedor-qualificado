// ============================================================
// Configuração de Autenticação (NextAuth.js)
// ============================================================
// Usa login com e-mail e senha (CredentialsProvider).
// Valida contra a tabela 'administradores' do banco.
// A sessão inclui id, nome, email e papel do admin.
// ============================================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions: NextAuthOptions = {
  // Configura o provedor de credenciais (e-mail + senha)
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // Validação básica
        if (!credentials?.email || !credentials?.senha) {
          throw new Error('E-mail e senha são obrigatórios');
        }

        // Busca o admin no banco pelo e-mail
        const admin = await prisma.administrador.findUnique({
          where: { email: credentials.email },
          include: {
            grupos: {
              include: {
                grupo: true,
              },
            },
          },
        });

        // Se não encontrou ou está inativo
        if (!admin || !admin.ativo) {
          throw new Error('E-mail ou senha inválidos');
        }

        // Compara a senha informada com o hash salvo no banco
        const senhaCorreta = await bcrypt.compare(credentials.senha, admin.senhaHash);
        if (!senhaCorreta) {
          throw new Error('E-mail ou senha inválidos');
        }

        // Retorna os dados do admin para a sessão
        return {
          id: admin.id,
          name: admin.nome,
          email: admin.email,
          papel: admin.papel,
          grupoIds: admin.grupos.map((ag) => ag.grupoId),
        };
      },
    }),
  ],

  // Callbacks para incluir dados customizados na sessão
  callbacks: {
    // Quando o JWT é criado, inclui os dados extras
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.papel = (user as any).papel;
        token.grupoIds = (user as any).grupoIds;
      }
      return token;
    },

    // Quando a sessão é lida, repassa os dados do JWT
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).papel = token.papel;
        (session.user as any).grupoIds = token.grupoIds;
      }
      return session;
    },
  },

  // Configurações gerais
  pages: {
    signIn: '/login', // Página de login customizada
  },
  session: {
    strategy: 'jwt', // Usa JWT (sem banco de sessões)
    maxAge: 24 * 60 * 60, // Sessão expira em 24 horas
  },
  secret: process.env.NEXTAUTH_SECRET,
};
