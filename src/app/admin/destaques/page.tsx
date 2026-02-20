// ============================================================
// Página: Gerenciar Destaques (Super Admin)
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HiPlus, HiPencil, HiTrash, HiXMark, HiCamera,
  HiEye, HiEyeSlash, HiLink,
} from 'react-icons/hi2';
import Loading from '@/components/ui/Loading';

interface Destaque {
  id: string;
  posicao: 'ESQUERDA' | 'DIREITA';
  titulo: string;
  imagemUrl: string;
  linkUrl: string;
  ativo: boolean;
  acessos: number;
}

export default function DestaquesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [destaques, setDestaques] = useState<Destaque[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Destaque | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);

  // Formulário
  const [posicao, setPosicao] = useState<'ESQUERDA' | 'DIREITA'>('ESQUERDA');
  const [titulo, setTitulo] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (session && (session.user as any).papel !== 'SUPER_ADMIN') {
      router.push('/admin');
    }
  }, [session, router]);

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    try {
      const res = await fetch('/api/destaques/gerenciar');
      const data = await res.json();
      setDestaques(data.destaques || []);
    } catch {
      toast.error('Erro ao carregar');
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal(destaque?: Destaque) {
    if (destaque) {
      setEditando(destaque);
      setPosicao(destaque.posicao);
      setTitulo(destaque.titulo);
      setLinkUrl(destaque.linkUrl);
      setFotoPreview(destaque.imagemUrl);
      setFoto(null);
    } else {
      setEditando(null);
      setPosicao('ESQUERDA');
      setTitulo(''); setLinkUrl('');
      setFoto(null); setFotoPreview(null);
    }
    setModalAberto(true);
  }

  function fecharModal() { setModalAberto(false); setEditando(null); }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Máximo 5MB'); return; }
    setFoto(file);
    setFotoPreview(URL.createObjectURL(file));
  }

  async function uploadarFoto(): Promise<string | null> {
    if (!foto) return editando?.imagemUrl || null;
    try {
      const formData = new FormData();
      formData.append('arquivo', foto);
      formData.append('tipo', 'qualificacao');
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) { toast.error('Erro ao enviar imagem'); return null; }
      const { url } = await res.json();
      return url;
    } catch {
      toast.error('Erro no upload');
      return null;
    }
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim() || !linkUrl.trim()) {
      toast.error('Preencha título e link'); return;
    }
    if (!editando && !foto) {
      toast.error('Selecione uma imagem'); return;
    }

    setSalvando(true);
    try {
      const imagemUrl = await uploadarFoto();
      if (!imagemUrl) { setSalvando(false); return; }

      let res;
      if (editando) {
        res = await fetch(`/api/destaques/${editando.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ titulo: titulo.trim(), imagemUrl, linkUrl: linkUrl.trim() }),
        });
      } else {
        res = await fetch('/api/destaques', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ posicao, titulo: titulo.trim(), imagemUrl, linkUrl: linkUrl.trim() }),
        });
      }
      if (!res.ok) { const d = await res.json(); toast.error(d.erro || 'Erro'); return; }
      toast.success(editando ? 'Destaque atualizado!' : 'Destaque criado!');
      fecharModal(); carregar();
    } catch { toast.error('Erro de conexão'); }
    finally { setSalvando(false); }
  }

  async function toggleAtivo(destaque: Destaque) {
    try {
      const res = await fetch(`/api/destaques/${destaque.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !destaque.ativo }),
      });
      if (!res.ok) { toast.error('Erro'); return; }
      toast.success(destaque.ativo ? 'Desativado' : 'Ativado');
      carregar();
    } catch { toast.error('Erro'); }
  }

  async function excluir(id: string) {
    try {
      const res = await fetch(`/api/destaques/${id}`, { method: 'DELETE' });
      if (!res.ok) { toast.error('Erro ao excluir'); return; }
      toast.success('Excluído');
      setConfirmandoExclusao(null);
      carregar();
    } catch { toast.error('Erro'); }
  }

  if (carregando) return <Loading texto="Carregando..." />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800">Destaques</h1>
          <p className="text-sm text-surface-400">Imagens exibidas nas laterais da página pública</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <HiPlus size={18} /> Novo
        </button>
      </div>

      {destaques.length === 0 ? (
        <div className="card text-center text-surface-400">
          Nenhum destaque cadastrado. Crie destaques para divulgar sua loja.
        </div>
      ) : (
        <div className="space-y-4">
          {destaques.map((d) => (
            <div key={d.id} className={`card ${!d.ativo ? 'opacity-60' : ''}`}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-shrink-0 overflow-hidden rounded-apple">
                  <img src={d.imagemUrl} alt={d.titulo} className="h-32 w-full object-cover sm:w-48" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-surface-800">{d.titulo}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.posicao === 'ESQUERDA' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {d.posicao === 'ESQUERDA' ? '← Esquerda / Topo' : 'Direita / Rodapé →'}
                      </span>
                      {!d.ativo && (
                        <span className="rounded-full bg-surface-200 px-2 py-0.5 text-xs text-surface-500">Inativo</span>
                      )}
                    </div>
                    <p className="flex items-center gap-1 text-sm text-brand-500 break-all">
                      <HiLink size={14} className="flex-shrink-0" /> {d.linkUrl}
                    </p>
                    <p className="mt-2 text-xs text-surface-400">
                      {d.acessos} acesso(s)
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button onClick={() => toggleAtivo(d)} className={`rounded-apple px-3 py-1.5 text-xs font-medium transition-colors ${
                      d.ativo ? 'bg-surface-100 text-surface-600 hover:bg-surface-200' : 'bg-positiva-light text-positiva hover:bg-positiva/20'
                    }`}>
                      {d.ativo ? <><HiEyeSlash size={14} className="mr-1 inline" />Desativar</> : <><HiEye size={14} className="mr-1 inline" />Ativar</>}
                    </button>
                    <button onClick={() => abrirModal(d)} className="rounded-apple bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-surface-200">
                      <HiPencil size={14} className="mr-1 inline" />Editar
                    </button>
                    {confirmandoExclusao === d.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-negativa">Confirmar?</span>
                        <button onClick={() => excluir(d.id)} className="rounded-apple bg-negativa px-2 py-1 text-xs text-white">Sim</button>
                        <button onClick={() => setConfirmandoExclusao(null)} className="rounded-apple bg-surface-200 px-2 py-1 text-xs">Não</button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmandoExclusao(d.id)} className="rounded-apple bg-surface-100 px-3 py-1.5 text-xs font-medium text-negativa hover:bg-negativa-light">
                        <HiTrash size={14} className="mr-1 inline" />Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={fecharModal}>
          <div className="w-full max-w-lg rounded-apple-lg bg-white p-6 shadow-apple-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-surface-800">{editando ? 'Editar Destaque' : 'Novo Destaque'}</h2>
              <button onClick={fecharModal} className="rounded-full p-1 hover:bg-surface-100"><HiXMark size={20} /></button>
            </div>
            <form onSubmit={salvar} className="space-y-4">
              {!editando && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-surface-600">Posição *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPosicao('ESQUERDA')}
                      className={`rounded-apple border-2 p-3 text-sm font-medium transition-all ${
                        posicao === 'ESQUERDA' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-surface-200 text-surface-500'
                      }`}>
                      ← Esquerda / Topo
                    </button>
                    <button type="button" onClick={() => setPosicao('DIREITA')}
                      className={`rounded-apple border-2 p-3 text-sm font-medium transition-all ${
                        posicao === 'DIREITA' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-surface-200 text-surface-500'
                      }`}>
                      Direita → / Rodapé
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-surface-400">Desktop: lateral | Mobile: topo ou rodapé</p>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Título *</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Perfumes importados com desconto" />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-surface-600">Link (URL) *</label>
                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://minhaloja.com.br" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-surface-600">
                  Imagem {editando ? '(manter ou trocar)' : '*'}
                </label>
                {fotoPreview ? (
                  <div className="relative">
                    <img src={fotoPreview} alt="Preview" className="h-40 w-full rounded-apple object-cover" />
                    <button type="button" onClick={() => { setFoto(null); setFotoPreview(editando?.imagemUrl || null); }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70">
                      <HiXMark size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-apple border-2 border-dashed border-surface-300 bg-surface-50 p-6 hover:border-brand-400">
                    <HiCamera className="h-8 w-8 text-surface-400" />
                    <span className="text-sm text-surface-500">Clique para selecionar</span>
                    <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                  </label>
                )}
                <p className="mt-1 text-xs text-surface-400">
                  Recomendado: 240×400px (lateral) ou 728×90px (mobile)
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={fecharModal} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={salvando} className="btn-primary flex-1">
                  {salvando ? 'Salvando...' : editando ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
