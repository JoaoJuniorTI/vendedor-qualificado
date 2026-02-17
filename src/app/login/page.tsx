// ============================================================
// Página: Login
// ============================================================
// Tela de login com e-mail e senha para Administradores.
// Após login bem-sucedido, redireciona para /admin.
// ============================================================

'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { HiShieldCheck, HiEnvelope, HiLockClosed } from 'react-icons/hi2';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      // Chama o NextAuth para autenticar
      const resultado = await signIn('credentials', {
        email,
        senha,
        redirect: false, // Não redireciona automaticamente
      });

      if (resultado?.error) {
        setErro('E-mail ou senha inválidos');
        return;
      }

      // Login bem-sucedido: redireciona para a área admin
      router.push('/admin');
      router.refresh();
    } catch {
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-brand-500 shadow-apple-lg">
            <HiShieldCheck className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="mb-1 text-center text-2xl font-bold text-surface-800">
          Área Administrativa
        </h1>
        <p className="mb-8 text-center text-sm text-surface-400">
          Faça login para gerenciar qualificações
        </p>

        {/* Formulário */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* E-mail */}
          <div className="relative">
            <HiEnvelope className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="!pl-12"
              required
              autoFocus
            />
          </div>

          {/* Senha */}
          <div className="relative">
            <HiLockClosed className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              className="!pl-12"
              required
            />
          </div>

          {/* Erro */}
          {erro && (
            <p className="text-center text-sm text-negativa">{erro}</p>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={carregando}
            className="btn-primary w-full"
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link para voltar */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-sm text-surface-400 transition-colors hover:text-surface-600"
          >
            ← Voltar para consulta pública
          </a>
        </div>
      </div>
    </div>
  );
}
