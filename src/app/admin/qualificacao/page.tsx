// ============================================================
// Página: Lista de Qualificações (Admin)
// ============================================================
// Exibe todas as qualificações dos grupos do admin.
// Inclui: dados do comprador (visível apenas aqui), filtros,
// paginação e botão de exclusão com confirmação.
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  HiTrash,
  HiFunnel,
  HiXMark,
  HiChevronLeft,
  HiChevronRight,
  HiPhone,
  HiUser,
} from 'react-icons/hi2';
import StarRating from '@/components/ui/StarRating';
import TipoBadge from '@/components/ui/TipoBadge';
import Loading from '@/components/ui/Loading';

interface Qualificacao {
  id: string;
  vendedor: { id: string; nome: string; telefone: string };
  grupo: { id: string; nome: string };
  telefoneComprador: string;
  nomeComprador: string;
  tipo: 'POSITIVA' | 'NEGATIVA' | 'NEUTRA';
  estrelas: number;
  fotoUrl: string;
  criadoEm: string;
  adminCadastrou: string;
}

interface Grupo {
  id: string;
  nome: string;
}

interface Paginacao {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}

export default function QualificacoesPage() {
  const { data: session } = useSession();

  const [qualificacoes, setQualificacoes] = useState<Qualificacao[]>([]);
  const [paginacao, setPaginacao] = useState<Paginacao | null>(null);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Filtros
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroTelefone, setFiltroTelefone] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // Modal de exclusão
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);

  // Modal de foto
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  // Carrega grupos para o filtro
  useEffect(() => {
    async function carregarGrupos() {
      try {
        const res = await fetch('/api/grupos');
        const data = await res.json();
        setGrupos(data.grupos || []);
      } catch {
        // silencioso
      }
    }
    carregarGrupos();
  }, []);

  // Carrega qualificações
  useEffect(() => {
    carregarQualificacoes();
  }, [filtroGrupo, filtroTelefone, filtroTipo, paginaAtual]);

  async function carregarQualificacoes() {
    setCarregando(true);
    try {
      const params = new URLSearchParams();
      params.set('pagina', paginaAtual.toString());
      if (filtroGrupo) params.set('grupoId', filtroGrupo);
      if (filtroTelefone) params.set('telefone', filtroTelefone.replace(/\D/g, ''));
      if (filtroTipo) params.set('tipo', filtroTipo);

      const res = await fetch(`/api/qualificacoes?${params}`);
      const data = await res.json();

      setQualificacoes(data.qualificacoes || []);
      setPaginacao(data.paginacao || null);
    } catch {
      toast.error('Erro ao carregar qualificações');
    } finally {
      setCarregando(false);
    }
  }

  // Exclusão com confirmação
  async function handleExcluir(id: string) {
    setExcluindo(id);
    try {
      const res = await fetch(`/api/qualificacoes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.erro || 'Erro ao excluir');
        return;
      }
      toast.success('Qualificação excluída');
      setConfirmandoExclusao(null);
      carregarQualificacoes();
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setExcluindo(null);
    }
  }

  // Formata telefone
  function fmt(tel: string) {
    if (tel.length === 11) return `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}`;
    if (tel.length === 10) return `(${tel.slice(0, 2)}) ${tel.slice(2, 6)}-${tel.slice(6)}`;
    return tel;
  }

  function fmtData(d: string) {
    return new Date(d).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function limparFiltros() {
    setFiltroGrupo('');
    setFiltroTelefone('');
    setFiltroTipo('');
    setPaginaAtual(1);
  }

  const temFiltros = filtroGrupo || filtroTelefone || filtroTipo;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Qualificações</h1>
          <p className="text-sm text-surface-400">
            {paginacao ? `${paginacao.total} registro(s)` : ''}
          </p>
        </div>
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`btn-secondary ${temFiltros ? '!border-brand-500 !text-brand-500' : ''}`}
        >
          <HiFunnel size={18} />
          Filtros
          {temFiltros && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs text-white">
              !
            </span>
          )}
        </button>
      </div>

      {/* Painel de Filtros */}
      {mostrarFiltros && (
        <div className="card mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-600">Filtros</h3>
            {temFiltros && (
              <button onClick={limparFiltros} className="text-xs text-brand-500 hover:text-brand-600">
                Limpar filtros
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">Grupo</label>
              <select
                value={filtroGrupo}
                onChange={(e) => { setFiltroGrupo(e.target.value); setPaginaAtual(1); }}
                className="!py-2 !text-sm"
              >
                <option value="">Todos os grupos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>{g.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">Telefone do vendedor</label>
              <input
                type="tel"
                value={filtroTelefone}
                onChange={(e) => { setFiltroTelefone(e.target.value); setPaginaAtual(1); }}
                placeholder="Buscar por telefone"
                className="!py-2 !text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-surface-500">Tipo</label>
              <select
                value={filtroTipo}
                onChange={(e) => { setFiltroTipo(e.target.value); setPaginaAtual(1); }}
                className="!py-2 !text-sm"
              >
                <option value="">Todos os tipos</option>
                <option value="POSITIVA">Positiva</option>
                <option value="NEGATIVA">Negativa</option>
                <option value="NEUTRA">Neutra</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {carregando ? (
        <Loading texto="Carregando qualificações..." />
      ) : qualificacoes.length === 0 ? (
        <div className="card text-center text-surface-400">
          {temFiltros
            ? 'Nenhuma qualificação encontrada com os filtros aplicados'
            : 'Nenhuma qualificação cadastrada ainda'}
        </div>
      ) : (
        <div className="space-y-3">
          {qualificacoes.map((q) => (
            <div key={q.id} className="card">
              {/* Cabeçalho */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <TipoBadge tipo={q.tipo} />
                    <StarRating value={q.estrelas} size={14} />
                    <span className="text-xs text-surface-400">{q.grupo.nome}</span>
                  </div>
                </div>

                {/* Botão excluir */}
                {confirmandoExclusao === q.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-negativa">Confirmar?</span>
                    <button
                      onClick={() => handleExcluir(q.id)}
                      disabled={excluindo === q.id}
                      className="rounded-apple bg-negativa px-3 py-1 text-xs font-medium text-white hover:bg-negativa-dark"
                    >
                      {excluindo === q.id ? '...' : 'Sim'}
                    </button>
                    <button
                      onClick={() => setConfirmandoExclusao(null)}
                      className="rounded-apple bg-surface-200 px-3 py-1 text-xs font-medium text-surface-600 hover:bg-surface-300"
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmandoExclusao(q.id)}
                    className="rounded-full p-2 text-surface-400 transition-colors hover:bg-negativa-light hover:text-negativa"
                    title="Excluir qualificação"
                  >
                    <HiTrash size={16} />
                  </button>
                )}
              </div>

              {/* Vendedor e Comprador lado a lado */}
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                {/* Vendedor */}
                <div className="rounded-apple bg-surface-50 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-surface-400">
                    Vendedor
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-surface-800">
                    <HiUser size={14} className="text-surface-400" />
                    {q.vendedor.nome}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-surface-500">
                    <HiPhone size={12} className="text-surface-400" />
                    {fmt(q.vendedor.telefone)}
                  </p>
                </div>

                {/* Comprador (visível apenas para admins) */}
                <div className="rounded-apple bg-blue-50 p-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Comprador
                  </p>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-surface-800">
                    <HiUser size={14} className="text-blue-400" />
                    {q.nomeComprador}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-surface-500">
                    <HiPhone size={12} className="text-blue-400" />
                    {fmt(q.telefoneComprador)}
                  </p>
                </div>
              </div>

              {/* Foto */}
              <div
                className="mb-3 cursor-pointer overflow-hidden rounded-apple"
                onClick={() => setFotoAmpliada(q.fotoUrl)}
              >
                <Image
                  src={q.fotoUrl}
                  alt="Foto da qualificação"
                  width={600}
                  height={300}
                  className="h-auto max-h-48 w-full object-cover transition-transform hover:scale-[1.02]"
                />
              </div>

              {/* Rodapé */}
              <div className="flex items-center justify-between text-xs text-surface-400">
                <span>Cadastrado por: {q.adminCadastrou}</span>
                <span>{fmtData(q.criadoEm)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {paginacao && paginacao.totalPaginas > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
            disabled={paginaAtual === 1}
            className="btn-secondary !px-3 !py-2"
          >
            <HiChevronLeft size={18} />
          </button>
          <span className="text-sm text-surface-500">
            Página {paginaAtual} de {paginacao.totalPaginas}
          </span>
          <button
            onClick={() => setPaginaAtual((p) => Math.min(paginacao.totalPaginas, p + 1))}
            disabled={paginaAtual === paginacao.totalPaginas}
            className="btn-secondary !px-3 !py-2"
          >
            <HiChevronRight size={18} />
          </button>
        </div>
      )}

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
