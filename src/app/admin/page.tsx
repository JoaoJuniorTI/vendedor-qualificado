// ============================================================
// Página: Dashboard Admin
// ============================================================
// Página inicial da área admin. Mostra um resumo rápido
// e atalhos para as principais funcionalidades.
// ============================================================

'use client';

import { useSession } from 'next-auth/react';
import { HiPlusCircle, HiListBullet, HiPhoto } from 'react-icons/hi2';

export default function AdminPage() {
  const { data: session } = useSession();
  const nome = session?.user?.name?.split(' ')[0] || 'Admin';

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-surface-800">
        Olá, {nome}! 👋
      </h1>
      <p className="mb-8 text-surface-400">
        O que você gostaria de fazer?
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Nova Qualificação */}
        <a
          href="/admin/qualificacao/nova"
          className="card group flex flex-col items-center gap-3 py-8 transition-all hover:shadow-apple-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 transition-colors group-hover:bg-brand-100">
            <HiPlusCircle className="h-7 w-7 text-brand-500" />
          </div>
          <span className="font-semibold text-surface-800">
            Nova Qualificação
          </span>
          <span className="text-xs text-surface-400">
            Registrar uma nova avaliação
          </span>
        </a>

        {/* Ver Qualificações */}
        <a
          href="/admin/qualificacao"
          className="card group flex flex-col items-center gap-3 py-8 transition-all hover:shadow-apple-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-positiva-light transition-colors group-hover:bg-green-100">
            <HiListBullet className="h-7 w-7 text-positiva" />
          </div>
          <span className="font-semibold text-surface-800">
            Qualificações
          </span>
          <span className="text-xs text-surface-400">
            Visualizar e gerenciar
          </span>
        </a>

        {/* Alterar Foto */}
        <a
          href="/admin/vendedor/foto"
          className="card group flex flex-col items-center gap-3 py-8 transition-all hover:shadow-apple-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 transition-colors group-hover:bg-purple-100">
            <HiPhoto className="h-7 w-7 text-purple-500" />
          </div>
          <span className="font-semibold text-surface-800">
            Foto de Vendedor
          </span>
          <span className="text-xs text-surface-400">
            Alterar foto de perfil
          </span>
        </a>
      </div>
    </div>
  );
}
