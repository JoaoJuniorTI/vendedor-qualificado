// ============================================================
// Componente: Vitrine
// ============================================================
// Exibe conteúdos em destaque na página pública.
// Renderizado como elemento nativo da página (não como ad).
// Desktop: lateral esquerda e direita
// Mobile: antes e depois do conteúdo principal
// ============================================================

'use client';

import { useState, useEffect } from 'react';

interface ItemVitrine {
  id: string;
  posicao: 'ESQUERDA' | 'DIREITA';
  titulo: string;
  imagemUrl: string;
  linkUrl: string;
}

export default function Vitrine() {
  const [itens, setItens] = useState<ItemVitrine[]>([]);

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/destaques');
        const data = await res.json();
        setItens(data.destaques || []);
      } catch {
        // Silencioso
      }
    }
    carregar();
  }, []);

  const itemEsquerda = itens.find((i) => i.posicao === 'ESQUERDA');
  const itemDireita = itens.find((i) => i.posicao === 'DIREITA');

  function handleVisitar(item: ItemVitrine) {
    fetch(`/api/destaques/${item.id}`, { method: 'POST' }).catch(() => {});
    window.open(item.linkUrl, '_blank', 'noopener,noreferrer');
  }

  if (itens.length === 0) return null;

  return (
    <>
      {/* ===== MOBILE: Destaque superior ===== */}
      {itemEsquerda && (
        <section className="mb-6 block lg:hidden">
          <div
            onClick={() => handleVisitar(itemEsquerda)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            role="article"
            aria-label={itemEsquerda.titulo}
          >
            <img
              src={itemEsquerda.imagemUrl}
              alt={itemEsquerda.titulo}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* ===== MOBILE: Destaque inferior ===== */}
      {itemDireita && (
        <section className="mt-6 block lg:hidden">
          <div
            onClick={() => handleVisitar(itemDireita)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            role="article"
            aria-label={itemDireita.titulo}
          >
            <img
              src={itemDireita.imagemUrl}
              alt={itemDireita.titulo}
              className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        </section>
      )}

      {/* ===== DESKTOP: Destaque esquerdo (fixo na lateral) ===== */}
      {itemEsquerda && (
        <aside className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:left-6 2xl:left-10">
          <div
            onClick={() => handleVisitar(itemEsquerda)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            role="article"
            aria-label={itemEsquerda.titulo}
          >
            <img
              src={itemEsquerda.imagemUrl}
              alt={itemEsquerda.titulo}
              className="h-auto w-[160px] object-cover xl:w-[200px] 2xl:w-[240px]"
              loading="lazy"
            />
          </div>
        </aside>
      )}

      {/* ===== DESKTOP: Destaque direito (fixo na lateral) ===== */}
      {itemDireita && (
        <aside className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block xl:right-6 2xl:right-10">
          <div
            onClick={() => handleVisitar(itemDireita)}
            className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
            role="article"
            aria-label={itemDireita.titulo}
          >
            <img
              src={itemDireita.imagemUrl}
              alt={itemDireita.titulo}
              className="h-auto w-[160px] object-cover xl:w-[200px] 2xl:w-[240px]"
              loading="lazy"
            />
          </div>
        </aside>
      )}
    </>
  );
}
