// ============================================================
// Componente: TipoBadge
// ============================================================
// Exibe um badge colorido indicando o tipo da qualificação:
//   - POSITIVA: verde
//   - NEGATIVA: vermelho
//   - NEUTRA: cinza
// ============================================================

import { TipoQualificacao } from '@prisma/client';
import { HiHandThumbUp, HiHandThumbDown, HiMinus } from 'react-icons/hi2';

interface TipoBadgeProps {
  tipo: TipoQualificacao;
}

const CONFIG = {
  POSITIVA: {
    classe: 'badge-positiva',
    icone: HiHandThumbUp,
    texto: 'Positiva',
  },
  NEGATIVA: {
    classe: 'badge-negativa',
    icone: HiHandThumbDown,
    texto: 'Negativa',
  },
  NEUTRA: {
    classe: 'badge-neutra',
    icone: HiMinus,
    texto: 'Neutra',
  },
};

export default function TipoBadge({ tipo }: TipoBadgeProps) {
  const { classe, icone: Icone, texto } = CONFIG[tipo];

  return (
    <span className={classe}>
      <Icone size={14} />
      {texto}
    </span>
  );
}
