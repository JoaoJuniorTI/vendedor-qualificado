// ============================================================
// Layout: Área Administrativa
// ============================================================
// Layout que envolve todas as páginas /admin/*.
// Inclui barra lateral (desktop) ou menu inferior (mobile)
// com navegação entre as funcionalidades.
// ============================================================

'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  HiShieldCheck,
  HiPlusCircle,
  HiListBullet,
  HiPhoto,
  HiUserGroup,
  HiUsers,
  HiArrowRightOnRectangle,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2';
import { useState } from 'react';
import Loading from '@/components/ui/Loading';

// Itens do menu
const menuItems = [
  {
    href: '/admin/qualificacao/nova',
    label: 'Nova Qualificação',
    icon: HiPlusCircle,
    papel: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/admin/qualificacao',
    label: 'Qualificações',
    icon: HiListBullet,
    papel: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/admin/vendedor/foto',
    label: 'Foto de Vendedor',
    icon: HiPhoto,
    papel: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    href: '/admin/grupos',
    label: 'Grupos',
    icon: HiUserGroup,
    papel: ['SUPER_ADMIN'],
  },
  {
    href: '/admin/administradores',
    label: 'Administradores',
    icon: HiUsers,
    papel: ['SUPER_ADMIN'],
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  // Enquanto verifica a sessão
  if (status === 'loading') {
    return (
      <div className="min-h-screen">
        <Loading texto="Verificando sessão..." />
      </div>
    );
  }

  // Se não está logado (não deveria chegar aqui por causa do middleware)
  if (!session) {
    router.push('/login');
    return null;
  }

  const papel = (session.user as any).papel;

  // Filtra os itens do menu baseado no papel do usuário
  const menuFiltrado = menuItems.filter((item) =>
    item.papel.includes(papel)
  );

  return (
    <div className="min-h-screen bg-surface-100">
      {/* ===== HEADER MOBILE ===== */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-surface-200 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <HiShieldCheck className="h-6 w-6 text-brand-500" />
          <span className="font-semibold text-surface-800">VQ Admin</span>
        </div>
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-full p-2 transition-colors hover:bg-surface-100"
        >
          {menuAberto ? <HiXMark size={24} /> : <HiBars3 size={24} />}
        </button>
      </header>

      {/* ===== OVERLAY MOBILE ===== */}
      {menuAberto && (
        <div
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside
        className={`fixed left-0 top-0 z-20 h-full w-64 transform border-r border-surface-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          menuAberto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo (desktop) */}
        <div className="hidden items-center gap-2 border-b border-surface-200 px-6 py-4 lg:flex">
          <HiShieldCheck className="h-7 w-7 text-brand-500" />
          <span className="text-lg font-bold text-surface-800">VQ Admin</span>
        </div>

        {/* Info do usuário */}
        <div className="border-b border-surface-200 px-6 py-4 pt-16 lg:pt-4">
          <p className="text-sm font-semibold text-surface-800">
            {session.user.name}
          </p>
          <p className="text-xs text-surface-400">
            {papel === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrador'}
          </p>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-3 py-4">
          {menuFiltrado.map((item) => {
            const ativo = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuAberto(false)}
                className={`mb-1 flex items-center gap-3 rounded-apple px-4 py-2.5 text-sm font-medium transition-all ${
                  ativo
                    ? 'bg-brand-50 text-brand-600'
                    : 'text-surface-500 hover:bg-surface-50 hover:text-surface-800'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Botão de sair */}
        <div className="border-t border-surface-200 px-3 py-4">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-3 rounded-apple px-4 py-2.5 text-sm font-medium text-surface-500 transition-all hover:bg-negativa-light hover:text-negativa"
          >
            <HiArrowRightOnRectangle size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <main className="min-h-screen lg:ml-64">
        <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
