// ============================================================
// Página: Resultado da Consulta Pública
// ============================================================
// Exibe os dados do vendedor buscado por telefone:
// - Foto de perfil, nome, telefone
// - Resumo (positivas, negativas, neutras, média de estrelas)
// - Lista de grupos
// - Lista de qualificações com fotos
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  HiArrowLeft,
  HiHandThumbUp,
  HiHandThumbDown,
  HiMinus,
  HiUserCircle,
  HiUserGroup,
  HiXMark,
} from 'react-icons/hi2';
import StarRating from '@/components/ui/StarRating';
import TipoBadge from '@/components/ui/TipoBadge';
import Loading from '@/components/ui/Loading';
import Vitrine from '@/components/Vitrine';

// Tipos para os dados que vêm da API
interface Vendedor {
  id: string;
  nome: string;
  telefone: string;
  fotoPerfilUrl: string | null;
}

interface Resumo {
  total: number;
  positivas: number;
  negativas: number;
  neutras: number;
  mediaEstrelas: number;
}

interface Grupo {
  id: string;
  nome: string;
}

interface Qualificacao {
  id: string;
  tipo: 'POSITIVA' | 'NEGATIVA' | 'NEUTRA';
  estrelas: number;
  fotoUrl: string;
  criadoEm: string;
  grupo: Grupo;
}

interface DadosConsulta {
  vendedor: Vendedor;
  resumo: Resumo;
  grupos: Grupo[];
  qualificacoes: Qualificacao[];
}

export default function ConsultaPage() {
  const params = useParams();
  const router = useRouter();
  const telefone = params.telefone as string;

  const [dados, setDados] = useState<DadosConsulta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  // Busca os dados do vendedor ao carregar a página
  useEffect(() => {
    async function buscar() {
      try {
        const res = await fetch(`/api/vendedores?telefone=${telefone}`);

        if (res.status === 404) {
          setErro('Vendedor não encontrado com este número de telefone.');
          return;
        }

        if (!res.ok) {
          setErro('Erro ao consultar vendedor. Tente novamente.');
          return;
        }

        const data = await res.json();
        setDados(data);
      } catch {
        setErro('Erro de conexão. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    }

    buscar();
  }, [telefone]);

  // Formata o telefone para exibição
  function formatarTelefone(tel: string) {
    if (tel.length === 11) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    }
    if (tel.length === 10) {
      return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
    }
    return tel;
  }

  // Formata a data
  function formatarData(data: string) {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // === CARREGANDO ===
  if (carregando) {
    return (
      <div className="min-h-screen">
        <Loading texto="Consultando vendedor..." />
      </div>
    );
  }

  // === ERRO ou NÃO ENCONTRADO ===
  if (erro || !dados) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="mb-2 text-xl font-semibold text-surface-800">
            {erro || 'Vendedor não encontrado'}
          </h2>
          <p className="mb-6 text-surface-400">
            Verifique o número e tente novamente
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            <HiArrowLeft size={18} />
            Nova Consulta
          </button>
        </div>
      </div>
    );
  }

  const { vendedor, resumo, grupos, qualificacoes } = dados;

  // === RESULTADO ===
  return (
    <div className="min-h-screen pb-8">
      {/* Vitrine de destaques */}
      <Vitrine />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-surface-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.push('/')}
            className="rounded-full p-2 transition-colors hover:bg-surface-100"
          >
            <HiArrowLeft size={20} className="text-surface-600" />
          </button>
          <h1 className="text-lg font-semibold text-surface-800">
            Consulta de Vendedor
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        {/* Card do Vendedor */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            {/* Foto de Perfil */}
            {vendedor.fotoPerfilUrl ? (
              <Image
                src={vendedor.fotoPerfilUrl}
                alt={vendedor.nome}
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-full object-cover"
              />
            ) : (
              <HiUserCircle className="h-[72px] w-[72px] text-surface-200" />
            )}

            <div>
              <h2 className="text-xl font-bold text-surface-800">
                {vendedor.nome}
              </h2>
              <p className="text-surface-400">
                {formatarTelefone(vendedor.telefone)}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo de Qualificações */}
        <div className="card mb-6">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
            Resumo
          </h3>

          {/* Média de Estrelas */}
          <div className="mb-5 flex items-center gap-3">
            <span className="text-4xl font-bold text-surface-800">
              {resumo.mediaEstrelas > 0 ? resumo.mediaEstrelas.toFixed(1) : '—'}
            </span>
            <div>
              <StarRating value={Math.round(resumo.mediaEstrelas)} size={24} />
              <p className="mt-1 text-sm text-surface-400">
                {resumo.total} {resumo.total === 1 ? 'qualificação' : 'qualificações'}
              </p>
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-3">
            {/* Positivas */}
            <div className="rounded-apple bg-positiva-light p-3 text-center">
              <HiHandThumbUp className="mx-auto mb-1 h-5 w-5 text-positiva" />
              <div className="text-2xl font-bold text-positiva-dark">{resumo.positivas}</div>
              <div className="text-xs text-positiva-dark/70">Positivas</div>
            </div>

            {/* Negativas */}
            <div className="rounded-apple bg-negativa-light p-3 text-center">
              <HiHandThumbDown className="mx-auto mb-1 h-5 w-5 text-negativa" />
              <div className="text-2xl font-bold text-negativa-dark">{resumo.negativas}</div>
              <div className="text-xs text-negativa-dark/70">Negativas</div>
            </div>

            {/* Neutras */}
            <div className="rounded-apple bg-neutra-light p-3 text-center">
              <HiMinus className="mx-auto mb-1 h-5 w-5 text-neutra" />
              <div className="text-2xl font-bold text-neutra-dark">{resumo.neutras}</div>
              <div className="text-xs text-neutra-dark/70">Neutras</div>
            </div>
          </div>
        </div>

        {/* Grupos */}
        {grupos.length > 0 && (
          <div className="card mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-400">
              Grupos
            </h3>
            <div className="flex flex-wrap gap-2">
              {grupos.map((grupo) => (
                <span
                  key={grupo.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700"
                >
                  <HiUserGroup size={14} />
                  {grupo.nome}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Qualificações */}
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-surface-400">
            Qualificações ({qualificacoes.length})
          </h3>

          {qualificacoes.length === 0 ? (
            <div className="card text-center text-surface-400">
              Nenhuma qualificação registrada
            </div>
          ) : (
            <div className="space-y-3">
              {qualificacoes.map((q) => (
                <div key={q.id} className="card">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TipoBadge tipo={q.tipo} />
                      <span className="text-xs text-surface-400">
                        {q.grupo.nome}
                      </span>
                    </div>
                    <span className="text-xs text-surface-400">
                      {formatarData(q.criadoEm)}
                    </span>
                  </div>

                  <div className="mb-3">
                    <StarRating value={q.estrelas} size={16} />
                  </div>

                  {/* Foto da qualificação */}
                  <div
                    className="cursor-pointer overflow-hidden rounded-apple"
                    onClick={() => setFotoAmpliada(q.fotoUrl)}
                  >
                    <Image
                      src={q.fotoUrl}
                      alt="Foto da qualificação"
                      width={600}
                      height={400}
                      className="h-auto w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de foto ampliada */}
      {fotoAmpliada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            onClick={() => setFotoAmpliada(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
          >
            <HiXMark size={24} />
          </button>
          <Image
            src={fotoAmpliada}
            alt="Foto ampliada"
            width={1200}
            height={800}
            className="max-h-[85vh] max-w-full rounded-apple-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
