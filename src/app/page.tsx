// ============================================================
// Página Inicial - Consulta Pública
// ============================================================
// Esta é a primeira tela que o visitante vê.
// Contém o logo, campo de busca por telefone e botão consultar.
// Ao pesquisar, redireciona para /consulta/[telefone].
// ============================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiMagnifyingGlass, HiShieldCheck } from 'react-icons/hi2';
import Vitrine from '@/components/Vitrine';

export default function HomePage() {
  const router = useRouter();
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');

  // Formata o telefone enquanto o usuário digita
  function formatarTelefone(valor: string) {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '');

    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limitado = numeros.slice(0, 11);

    // Aplica a máscara: (XX) XXXXX-XXXX
    if (limitado.length <= 2) return limitado;
    if (limitado.length <= 7) return `(${limitado.slice(0, 2)}) ${limitado.slice(2)}`;
    return `(${limitado.slice(0, 2)}) ${limitado.slice(2, 7)}-${limitado.slice(7)}`;
  }

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();

    // Extrai apenas os números
    const numeros = telefone.replace(/\D/g, '');

    // Validação básica
    if (numeros.length < 10 || numeros.length > 11) {
      setErro('Informe um número de telefone válido com DDD');
      return;
    }

    setErro('');
    router.push(`/consulta/${numeros}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* Vitrine de destaques */}
      <Vitrine />

      {/* Container central */}
      <div className="w-full max-w-md text-center">

        {/* Logo / Ícone */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-brand-500 shadow-apple-lg">
            <HiShieldCheck className="h-10 w-10 text-white" />
          </div>
        </div>

        {/* Título */}
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-surface-800">
          Vendedor Qualificado
        </h1>
        <p className="mb-10 text-surface-400">
          Consulte a reputação de vendedores de grupos de WhatsApp
        </p>

        {/* Formulário de Busca */}
        <form onSubmit={handleBuscar} className="space-y-4">
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
            <input
              type="tel"
              value={telefone}
              onChange={(e) => {
                setTelefone(formatarTelefone(e.target.value));
                setErro('');
              }}
              placeholder="(00) 00000-0000"
              className="!pl-12 text-center text-lg tracking-wide"
              autoFocus
            />
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <p className="text-sm text-negativa">{erro}</p>
          )}

          <button type="submit" className="btn-primary w-full text-base">
            Consultar Vendedor
          </button>
        </form>

        {/* Link para admin */}
        <div className="mt-12">
          <a
            href="/login"
            className="text-sm text-surface-400 transition-colors hover:text-surface-600"
          >
            Área administrativa →
          </a>
        </div>
      </div>

      {/* Rodapé discreto */}
      <footer className="absolute bottom-6 text-center text-xs text-surface-300">
        Vendedor Qualificado © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
