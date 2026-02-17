// ============================================================
// Componente: StarRating (Estrelas)
// ============================================================
// Exibe estrelas de 1 a 5.
// Dois modos:
//   - readonly: apenas exibe (usado na consulta pública)
//   - interativo: permite clicar para selecionar (usado no cadastro)
// ============================================================

'use client';

import { useState } from 'react';
import { HiStar } from 'react-icons/hi2';

interface StarRatingProps {
  /** Valor atual (1 a 5) */
  value: number;
  /** Callback quando uma estrela é clicada (se não informado, fica readonly) */
  onChange?: (value: number) => void;
  /** Tamanho das estrelas em pixels */
  size?: number;
  /** Exibe o valor numérico ao lado */
  showValue?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = 20,
  showValue = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInterativo = !!onChange;

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((estrela) => {
        // Determina se a estrela está "acesa"
        const ativa = estrela <= (hoverValue || value);

        return (
          <button
            key={estrela}
            type="button"
            disabled={!isInterativo}
            onClick={() => onChange?.(estrela)}
            onMouseEnter={() => isInterativo && setHoverValue(estrela)}
            onMouseLeave={() => isInterativo && setHoverValue(0)}
            className={`transition-all duration-150 ${
              isInterativo ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <HiStar
              size={size}
              className={`transition-colors duration-150 ${
                ativa
                  ? 'text-amber-400 drop-shadow-sm'
                  : 'text-surface-200'
              }`}
            />
          </button>
        );
      })}

      {showValue && (
        <span className="ml-1 text-sm font-medium text-surface-500">
          {value > 0 ? value.toFixed(1) : '—'}
        </span>
      )}
    </div>
  );
}
