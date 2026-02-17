// ============================================================
// Página: Gerenciar Administradores (Super Admin)
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HiPlus, HiPencil, HiXMark, HiCheck, HiNoSymbol, HiUserGroup,
} from 'react-icons/hi2';
import Loading from '@/components/ui/Loading';

interface Grupo { id: string; nome: string; }
interface Admin {
  id: string; nome: string; email: string; papel: string;
  ativo: boolean; grupos: Grupo[];
}

export default function AdministradoresPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Admin | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [gruposSelecionados, setGruposSelecionados] = useState<string[]>([]);

  useEffect(() => {
    if (session && (session.user as any).papel !== 'SUPER_ADMIN') {
      router.push('/admin');
    }
  }, [session, router]);

  useEffect(() => {
    Promise.all([carregarAdmins(), carregarGrupos()]).finally(() => setCarregando(false));
  }, []);

  async function carregarAdmins() {
    try {
      const res = await fetch('/api/administradores');
      const data = await res.json();
      setAdmins(data.administradores || []);
    } catch { /* silencioso */ }
  }

  async function carregarGrupos() {
    try {
      const res = await fetch('/api/grupos');
      const data = await res.json();
      setGrupos(data.grupos || []);
    } catch { /* silencioso */ }
  }

  function abrirModal(admin?: Admin) {
    if (admin) {
      setEditando(admin);
      setNome(admin.nome);
      setEmail(admin.email);
      setSenha('');
      setGruposSelecionados(admin.grupos.map((g) => g.id));
    } else {
      setEditando(null);
      setNome(''); setEmail(''); setSenha('');
      setGruposSelecionados([]);
    }
    setModalAberto(true);
  }

  function fecharModal() { setModalAberto(false); setEditando(null); }

  function toggleGrupo(id: string) {
    setGruposSelecionados((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      toast.error('Nome e e-mail são obrigatórios'); return;
    }
    if (!editando && !senha) {
      toast.error('Senha é obrigatória para novo admin'); return;
    }

    setSalvando(true);
    try {
      let res;
      if (editando) {
        const body: any = { nome: nome.trim(), email: email.trim(), grupoIds: gruposSelecionados };
        if (senha) body.senha = senha;
        res = await fetch(`/api/administradores/${editando.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch('/api/administradores', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: nome.trim(), email: email.trim(), senha, grupoIds: gruposSelecionados }),
        });
      }
      if (!res.ok) { const d = await res.json(); toast.error(d.erro || 'Erro'); return; }
      toast.success(editando ? 'Admin atualizado!' : 'Admin criado!');
      fecharModal(); carregarAdmins();
    } catch { toast.error('Erro de conexão'); }
    finally { setSalvando(false); }
  }

  async function toggleAtivo(admin: Admin) {
    try {
      const res = await fetch(`/api/administradores/${admin.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !admin.ativo }),
      });
      if (!res.ok) { toast.error('Erro ao atualizar'); return; }
      toast.success(admin.ativo ? 'Admin desativado' : 'Admin ativado');
      carregarAdmins();
    } catch { toast.error('Erro de conexão'); }
  }

  if (carregando) return <Loading texto="Carregando..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Administradores</h1>
          <p className="text-sm text-surface-400">{admins.length} admin(s)</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <HiPlus size={18} /> Novo Admin
        </button>
      </div>

      {admins.length === 0 ? (
        <div className="card text-center text-surface-400">Nenhum administrador</div>
      ) : (
        <div className="space-y-3">
          {admins.map((a) => (
            <div key={a.id} className={`card ${!a.ativo ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-surface-800">{a.nome}</h3>
                    {a.papel === 'SUPER_ADMIN' && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                        Super Admin
                      </span>
                    )}
                    {!a.ativo && (
                      <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs font-medium text-surface-500">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500">{a.email}</p>
                  {a.grupos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {a.grupos.map((g) => (
                        <span key={g.id} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-600">
                          <HiUserGroup size={10} /> {g.nome}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {a.papel !== 'SUPER_ADMIN' && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => abrirModal(a)} className="rounded-full p-2 text-surface-400 hover:bg-surface-100 hover:text-brand-500">
                      <HiPencil size={16} />
                    </button>
                    <button
                      onClick={() => toggleAtivo(a)}
                      className={`rounded-full p-2 ${a.ativo ? 'text-surface-400 hover:bg-negativa-light hover:text-negativa' : 'text-surface-400 hover:bg-positiva-light hover:text-positiva'}`}
                      title={a.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {a.ativo ? <HiNoSymbol size={16} /> : <HiCheck size={16} />}
                    </button>
                  </div>
                )}
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
              <h2 className="text-lg font-bold text-surface-800">{editando ? 'Editar Admin' : 'Novo Admin'}</h2>
              <button onClick={fecharModal} className="rounded-full p-1 hover:bg-surface-100"><HiXMark size={20} /></button>
            </div>
            <form onSubmit={salvar} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Nome *</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" autoFocus />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">E-mail *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">
                  Senha {editando ? '(deixe vazio para manter)' : '*'}
                </label>
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder={editando ? 'Nova senha (opcional)' : 'Senha'} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-surface-600">Grupos vinculados</label>
                {grupos.length === 0 ? (
                  <p className="text-sm text-surface-400">Nenhum grupo cadastrado</p>
                ) : (
                  <div className="max-h-40 space-y-2 overflow-y-auto rounded-apple border border-surface-200 p-3">
                    {grupos.map((g) => (
                      <label key={g.id} className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={gruposSelecionados.includes(g.id)}
                          onChange={() => toggleGrupo(g.id)}
                          className="h-4 w-4 rounded border-surface-300 text-brand-500 focus:ring-brand-500"
                        />
                        <span className="text-sm text-surface-700">{g.nome}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn-primary flex-1">
                  {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
