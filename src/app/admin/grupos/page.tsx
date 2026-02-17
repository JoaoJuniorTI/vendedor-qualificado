// ============================================================
// Página: Gerenciar Grupos (Super Admin)
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2';
import Loading from '@/components/ui/Loading';

interface Grupo {
  id: string;
  nome: string;
  descricao: string | null;
  nomeDono: string;
  telefoneDono: string;
}

export default function GruposPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Grupo | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeDono, setNomeDono] = useState('');
  const [telefoneDono, setTelefoneDono] = useState('');

  useEffect(() => {
    if (session && (session.user as any).papel !== 'SUPER_ADMIN') {
      router.push('/admin');
    }
  }, [session, router]);

  useEffect(() => { carregarGrupos(); }, []);

  async function carregarGrupos() {
    try {
      const res = await fetch('/api/grupos');
      const data = await res.json();
      setGrupos(data.grupos || []);
    } catch { toast.error('Erro ao carregar grupos'); }
    finally { setCarregando(false); }
  }

  function fmtTel(v: string) {
    const n = v.replace(/\D/g, '').slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  }

  function abrirModal(grupo?: Grupo) {
    if (grupo) {
      setEditando(grupo);
      setNome(grupo.nome);
      setDescricao(grupo.descricao || '');
      setNomeDono(grupo.nomeDono);
      setTelefoneDono(fmtTel(grupo.telefoneDono));
    } else {
      setEditando(null);
      setNome(''); setDescricao(''); setNomeDono(''); setTelefoneDono('');
    }
    setModalAberto(true);
  }

  function fecharModal() { setModalAberto(false); setEditando(null); }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !nomeDono.trim() || !telefoneDono.trim()) {
      toast.error('Preencha os campos obrigatórios'); return;
    }
    setSalvando(true);
    try {
      const body = { nome: nome.trim(), descricao: descricao.trim() || null, nomeDono: nomeDono.trim(), telefoneDono: telefoneDono.replace(/\D/g, '') };
      const res = editando
        ? await fetch(`/api/grupos/${editando.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/grupos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); toast.error(d.erro || 'Erro'); return; }
      toast.success(editando ? 'Grupo atualizado!' : 'Grupo criado!');
      fecharModal(); carregarGrupos();
    } catch { toast.error('Erro de conexão'); }
    finally { setSalvando(false); }
  }

  async function excluir(id: string) {
    try {
      const res = await fetch(`/api/grupos/${id}`, { method: 'DELETE' });
      if (!res.ok) { const d = await res.json(); toast.error(d.erro || 'Erro'); return; }
      toast.success('Grupo excluído'); setConfirmandoExclusao(null); carregarGrupos();
    } catch { toast.error('Erro de conexão'); }
  }

  if (carregando) return <Loading texto="Carregando grupos..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Grupos</h1>
          <p className="text-sm text-surface-400">{grupos.length} grupo(s)</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <HiPlus size={18} /> Novo Grupo
        </button>
      </div>

      {grupos.length === 0 ? (
        <div className="card text-center text-surface-400">Nenhum grupo cadastrado</div>
      ) : (
        <div className="space-y-3">
          {grupos.map((g) => (
            <div key={g.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-surface-800">{g.nome}</h3>
                  {g.descricao && <p className="mt-1 text-sm text-surface-500">{g.descricao}</p>}
                  <div className="mt-2 text-xs text-surface-400">
                    <span>Dono: {g.nomeDono}</span>
                    <span className="mx-2">•</span>
                    <span>{fmtTel(g.telefoneDono)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => abrirModal(g)} className="rounded-full p-2 text-surface-400 hover:bg-surface-100 hover:text-brand-500">
                    <HiPencil size={16} />
                  </button>
                  {confirmandoExclusao === g.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => excluir(g.id)} className="rounded-apple bg-negativa px-2 py-1 text-xs text-white">Sim</button>
                      <button onClick={() => setConfirmandoExclusao(null)} className="rounded-apple bg-surface-200 px-2 py-1 text-xs">Não</button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmandoExclusao(g.id)} className="rounded-full p-2 text-surface-400 hover:bg-negativa-light hover:text-negativa">
                      <HiTrash size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={fecharModal}>
          <div className="w-full max-w-md rounded-apple-lg bg-white p-6 shadow-apple-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-800">{editando ? 'Editar Grupo' : 'Novo Grupo'}</h2>
              <button onClick={fecharModal} className="rounded-full p-1 hover:bg-surface-100"><HiXMark size={20} /></button>
            </div>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Nome do grupo *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Grupo Vendas SP" autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Descrição</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição do grupo (opcional)" rows={2} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Nome do dono *</label>
                <input type="text" value={nomeDono} onChange={(e) => setNomeDono(e.target.value)} placeholder="Nome do administrador do grupo" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Telefone do dono *</label>
                <input type="tel" value={telefoneDono} onChange={(e) => setTelefoneDono(fmtTel(e.target.value))} placeholder="(00) 00000-0000" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn-primary flex-1">
                  {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
