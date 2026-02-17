// ============================================================
// Layout Raiz do Aplicativo
// ============================================================
// Este é o layout principal que envolve TODAS as páginas.
// Aqui configuramos: metadados (SEO), fontes, providers e
// o componente de notificações (toast).
// ============================================================

import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import './globals.css';

// Metadados do site (aparece na aba do navegador e no Google)
export const metadata: Metadata = {
  title: 'Vendedor Qualificado',
  description: 'Consulte a reputação de vendedores de grupos de WhatsApp',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        {/* AuthProvider: disponibiliza a sessão de login para toda a aplicação */}
        <AuthProvider>
          {children}
          {/* Toaster: exibe notificações (sucesso, erro, etc.) */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1d1d1f',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '14px',
                padding: '12px 20px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
