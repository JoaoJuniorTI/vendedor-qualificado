// ============================================================
// Página: Nova Qualificação
// ============================================================
// Formulário completo para cadastrar uma qualificação.
//
// Fluxo:
// 1. Admin digita o telefone do vendedor
// 2. Sistema busca se vendedor já existe
//    - Se sim: exibe o nome e segue
//    - Se não: pede o nome para criar
// 3. Admin preenche dados do comprador (telefone + nome)
// 4. Seleciona grupo, tipo, estrelas
// 5. Faz upload da foto
// 6. Salva
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HiMagnifyingGlass,
  HiCheckCircle,
  HiXCircle,
  HiUserPlus,
  HiCamera,
  HiHandThumbUp,
  HiHandThumbDown,
  HiMinus,
  HiArrowLeft,
} from 'react-icons/hi2';
import StarRating from '@/components/ui/StarRating';
import Loading from '@/components/ui/Loading';

// Tipos do formulário
interface Grupo {
  id: string;
  nome: string;
}

interface VendedorEncontrado {
  id: string;
  nome: string;
  telefone: string;
  fotoPerfilUrl: string | null;
}

type TipoQualificacao = 'POSITIVA' | 'NEGATIVA' | 'NEUTRA';

export default function NovaQualificacaoPage() {
  const { data: session } = useSession();
  const router = useRouter();

  // ---- Estados do formulário ----
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregandoGrupos, setCarregandoGrupos] = useState(true);

  // Vendedor
  const [telVendedor, setTelVendedor] = useState('');
  const [buscandoVendedor, setBuscandoVendedor] = useState(false);
  const [vendedorEncontrado, setVendedorEncontrado] = useState<VendedorEncontrado | null>(null);
  const [vendedorNovo, setVendedorNovo] = useState(false);
  const [nomeVendedor, setNomeVendedor] = useState('');

  // Comprador
  const [telComprador, setTelComprador] = useState('');
  const [nomeComprador, setNomeComprador] = useState('');

  // Qualificação
  const [grupoId, setGrupoId] = useState('');
  const [tipo, setTipo] = useState<TipoQualificacao | ''>('');
  const [estrelas, setEstrelas] = useState(0);

  // Foto
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Controle
  const [salvando, setSalvando] = useState(false);
  const [etapa, setEtapa] = useState<'vendedor' | 'formulario'>('vendedor');

  // ---- Carrega os grupos ao montar ----
  useEffect(() => {
    async function carregarGrupos() {
      try {
        const res = await fetch('/api/grupos');
        const data = await res.json();
        setGrupos(data.grupos || []);
      } catch {
        toast.error('Erro ao carregar grupos');
      } finally {
        setCarregandoGrupos(false);
      }
    }
    carregarGrupos();
  }, []);

  // ---- Formatação de telefone ----
  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  // ---- Busca o vendedor por telefone ----
  async function buscarVendedor() {
    const numeros = telVendedor.replace(/\D/g, '');
    if (numeros.length < 10) {
      toast.error('Informe um telefone válido com DDD');
      return;
    }

    setBuscandoVendedor(true);
    setVendedorEncontrado(null);
    setVendedorNovo(false);

    try {
      const res = await fetch(`/api/vendedores/buscar?telefone=${numeros}`);
      const data = await res.json();

      if (data.encontrado) {
        setVendedorEncontrado(data.vendedor);
        setEtapa('formulario');
      } else {
        setVendedorNovo(true);
        // Não avança de etapa ainda, precisa do nome
      }
    } catch {
      toast.error('Erro ao buscar vendedor');
    } finally {
      setBuscandoVendedor(false);
    }
  }

  // ---- Confirma vendedor novo e avança ----
  function confirmarVendedorNovo() {
    if (!nomeVendedor.trim()) {
      toast.error('Informe o nome do vendedor');
      return;
    }
    setEtapa('formulario');
  }

  // ---- Seleção de foto ----
  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem (JPG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  // ---- Salvar qualificação ----
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();

    // Validações
    const telCompradorLimpo = telComprador.replace(/\D/g, '');
    if (telCompradorLimpo.length < 10) {
      toast.error('Informe o telefone do comprador com DDD');
      return;
    }
    if (!nomeComprador.trim()) {
      toast.error('Informe o nome do comprador');
      return;
    }
    if (!grupoId) {
      toast.error('Selecione um grupo');
      return;
    }
    if (!tipo) {
      toast.error('Selecione o tipo da qualificação');
      return;
    }
    if (estrelas === 0) {
      toast.error('Selecione a nota em estrelas');
      return;
    }
    if (!foto) {
      toast.error('A foto da qualificação é obrigatória');
      return;
    }

    setSalvando(true);

    try {
      // 1. Faz upload da foto
      const formData = new FormData();
      formData.append('arquivo', foto);
      formData.append('tipo', 'qualificacao');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadErro = await uploadRes.json();
        toast.error(uploadErro.detalhe || uploadErro.erro || 'Erro ao enviar foto');
        return;
      }

      const { url: fotoUrl } = await uploadRes.json();

      // 2. Cria a qualificação
      const qualRes = await fetch('/api/qualificacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefoneVendedor: telVendedor.replace(/\D/g, ''),
          nomeVendedor: vendedorNovo ? nomeVendedor.trim() : undefined,
          grupoId,
          telefoneComprador: telCompradorLimpo,
          nomeComprador: nomeComprador.trim(),
          tipo,
          estrelas,
          fotoUrl,
        }),
      });

      if (!qualRes.ok) {
        const qualErro = await qualRes.json();
        toast.error(qualErro.erro || 'Erro ao salvar qualificação');
        return;
      }

      toast.success('Qualificação cadastrada com sucesso!');

      // Limpa o formulário e volta para a etapa inicial
      resetarFormulario();
    } catch {
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  function resetarFormulario() {
    setTelVendedor('');
    setVendedorEncontrado(null);
    setVendedorNovo(false);
    setNomeVendedor('');
    setTelComprador('');
    setNomeComprador('');
    setGrupoId('');
    setTipo('');
    setEstrelas(0);
    setFoto(null);
    setFotoPreview(null);
    setEtapa('vendedor');
  }

  // ---- Loading ----
  if (carregandoGrupos) {
    return <Loading texto="Carregando..." />;
  }

  // Se não tem grupos cadastrados
  if (grupos.length === 0) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-bold text-surface-800">Nova Qualificação</h1>
        <div className="card mt-8">
          <p className="text-surface-500">
            Nenhum grupo cadastrado. Peça ao Super Admin para cadastrar os grupos primeiro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-surface-800">Nova Qualificação</h1>
      <p className="mb-6 text-sm text-surface-400">
        Registrar uma nova avaliação de vendedor
      </p>

      {/* ===== ETAPA 1: IDENTIFICAR O VENDEDOR ===== */}
      {etapa === 'vendedor' && (
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-surface-800">
            Quem é o vendedor?
          </h2>

          {/* Campo de telefone do vendedor */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-surface-600">
              Telefone do vendedor
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={telVendedor}
                onChange={(e) => setTelVendedor(formatarTelefone(e.target.value))}
                placeholder="(00) 00000-0000"
                className="flex-1"
                autoFocus
              />
              <button
                type="button"
                onClick={buscarVendedor}
                disabled={buscandoVendedor}
                className="btn-primary whitespace-nowrap"
              >
                {buscandoVendedor ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <HiMagnifyingGlass size={18} />
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Vendedor encontrado */}
          {vendedorEncontrado && (
            <div className="flex items-center gap-3 rounded-apple bg-positiva-light p-4">
              <HiCheckCircle className="h-6 w-6 flex-shrink-0 text-positiva" />
              <div>
                <p className="font-semibold text-positiva-dark">
                  Vendedor encontrado!
                </p>
                <p className="text-sm text-positiva-dark/70">
                  {vendedorEncontrado.nome} — {formatarTelefone(vendedorEncontrado.telefone)}
                </p>
              </div>
            </div>
          )}

          {/* Vendedor novo */}
          {vendedorNovo && (
            <div className="rounded-apple border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <HiUserPlus className="h-5 w-5 text-amber-600" />
                <p className="font-semibold text-amber-800">
                  Vendedor não encontrado — cadastrar novo
                </p>
              </div>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-surface-600">
                  Nome do vendedor
                </label>
                <input
                  type="text"
                  value={nomeVendedor}
                  onChange={(e) => setNomeVendedor(e.target.value)}
                  placeholder="Nome completo ou apelido"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={confirmarVendedorNovo}
                className="btn-primary w-full"
              >
                Confirmar e Continuar
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== ETAPA 2: FORMULÁRIO COMPLETO ===== */}
      {etapa === 'formulario' && (
        <form onSubmit={handleSalvar}>
          {/* Info do vendedor selecionado */}
          <div className="card mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50">
                  <HiCheckCircle className="h-5 w-5 text-brand-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">
                    Vendedor: {vendedorEncontrado?.nome || nomeVendedor}
                  </p>
                  <p className="text-xs text-surface-400">
                    {formatarTelefone(telVendedor)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEtapa('vendedor');
                  setVendedorEncontrado(null);
                  setVendedorNovo(false);
                }}
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                Alterar
              </button>
            </div>
          </div>

          <div className="card space-y-5">
            {/* ---- DADOS DO COMPRADOR ---- */}
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-surface-400">
                Dados do Comprador
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-600">
                    Telefone do comprador *
                  </label>
                  <input
                    type="tel"
                    value={telComprador}
                    onChange={(e) => setTelComprador(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-surface-600">
                    Nome do comprador *
                  </label>
                  <input
                    type="text"
                    value={nomeComprador}
                    onChange={(e) => setNomeComprador(e.target.value)}
                    placeholder="Nome ou apelido"
                  />
                </div>
              </div>
            </div>

            {/* ---- GRUPO ---- */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-surface-600">
                Grupo *
              </label>
              <select
                value={grupoId}
                onChange={(e) => setGrupoId(e.target.value)}
              >
                <option value="">Selecione o grupo...</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* ---- TIPO DA QUALIFICAÇÃO ---- */}
            <div>
              <label className="mb-3 block text-sm font-medium text-surface-600">
                Tipo da qualificação *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Positiva */}
                <button
                  type="button"
                  onClick={() => setTipo('POSITIVA')}
                  className={`flex flex-col items-center gap-2 rounded-apple border-2 p-4 transition-all ${
                    tipo === 'POSITIVA'
                      ? 'border-positiva bg-positiva-light'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <HiHandThumbUp
                    size={24}
                    className={tipo === 'POSITIVA' ? 'text-positiva' : 'text-surface-400'}
                  />
                  <span className={`text-sm font-medium ${
                    tipo === 'POSITIVA' ? 'text-positiva-dark' : 'text-surface-500'
                  }`}>
                    Positiva
                  </span>
                </button>

                {/* Neutra */}
                <button
                  type="button"
                  onClick={() => setTipo('NEUTRA')}
                  className={`flex flex-col items-center gap-2 rounded-apple border-2 p-4 transition-all ${
                    tipo === 'NEUTRA'
                      ? 'border-neutra bg-neutra-light'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <HiMinus
                    size={24}
                    className={tipo === 'NEUTRA' ? 'text-neutra' : 'text-surface-400'}
                  />
                  <span className={`text-sm font-medium ${
                    tipo === 'NEUTRA' ? 'text-neutra-dark' : 'text-surface-500'
                  }`}>
                    Neutra
                  </span>
                </button>

                {/* Negativa */}
                <button
                  type="button"
                  onClick={() => setTipo('NEGATIVA')}
                  className={`flex flex-col items-center gap-2 rounded-apple border-2 p-4 transition-all ${
                    tipo === 'NEGATIVA'
                      ? 'border-negativa bg-negativa-light'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <HiHandThumbDown
                    size={24}
                    className={tipo === 'NEGATIVA' ? 'text-negativa' : 'text-surface-400'}
                  />
                  <span className={`text-sm font-medium ${
                    tipo === 'NEGATIVA' ? 'text-negativa-dark' : 'text-surface-500'
                  }`}>
                    Negativa
                  </span>
                </button>
              </div>
            </div>

            {/* ---- ESTRELAS ---- */}
            <div>
              <label className="mb-3 block text-sm font-medium text-surface-600">
                Nota (estrelas) *
              </label>
              <StarRating
                value={estrelas}
                onChange={setEstrelas}
                size={32}
                showValue
              />
            </div>

            {/* ---- FOTO ---- */}
            <div>
              <label className="mb-3 block text-sm font-medium text-surface-600">
                Foto da qualificação *
              </label>

              {fotoPreview ? (
                <div className="relative">
                  <img
                    src={fotoPreview}
                    alt="Preview"
                    className="h-auto max-h-64 w-full rounded-apple object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFoto(null);
                      setFotoPreview(null);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                  >
                    <HiXCircle size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 rounded-apple border-2 border-dashed border-surface-300 bg-surface-50 p-8 transition-colors hover:border-brand-400 hover:bg-brand-50">
                  <HiCamera className="h-10 w-10 text-surface-400" />
                  <span className="text-sm text-surface-500">
                    Clique para selecionar uma foto
                  </span>
                  <span className="text-xs text-surface-400">
                    JPG, PNG — Máximo 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* ---- BOTÕES ---- */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetarFormulario}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando}
                className="btn-primary flex-1"
              >
                {salvando ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </div>
                ) : (
                  'Salvar Qualificação'
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
