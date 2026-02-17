// ============================================================
// Página: Alterar Foto de Perfil do Vendedor
// ============================================================
// Admin busca um vendedor pelo telefone e pode alterar
// ou adicionar uma foto de perfil.
// ============================================================

'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import {
  HiMagnifyingGlass,
  HiCamera,
  HiUserCircle,
  HiXCircle,
  HiCheckCircle,
} from 'react-icons/hi2';

interface Vendedor {
  id: string;
  nome: string;
  telefone: string;
  fotoPerfilUrl: string | null;
}

export default function FotoVendedorPage() {
  const [telefone, setTelefone] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [vendedor, setVendedor] = useState<Vendedor | null>(null);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  const [novaFoto, setNovaFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  async function buscarVendedor() {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length < 10) {
      toast.error('Informe um telefone válido com DDD');
      return;
    }

    setBuscando(true);
    setVendedor(null);
    setNaoEncontrado(false);
    setNovaFoto(null);
    setPreview(null);

    try {
      const res = await fetch(`/api/vendedores/buscar?telefone=${numeros}`);
      const data = await res.json();

      if (data.encontrado) {
        setVendedor(data.vendedor);
      } else {
        setNaoEncontrado(true);
      }
    } catch {
      toast.error('Erro ao buscar vendedor');
    } finally {
      setBuscando(false);
    }
  }

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Máximo 5MB');
      return;
    }

    setNovaFoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function salvarFoto() {
    if (!vendedor || !novaFoto) return;

    setSalvando(true);
    try {
      // 1. Upload
      const formData = new FormData();
      formData.append('arquivo', novaFoto);
      formData.append('tipo', 'perfil');

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        toast.error('Erro ao enviar foto');
        return;
      }
      const { url } = await uploadRes.json();

      // 2. Atualiza o vendedor
      const res = await fetch('/api/vendedores/foto', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telefone: vendedor.telefone,
          fotoUrl: url,
        }),
      });

      if (!res.ok) {
        toast.error('Erro ao salvar');
        return;
      }

      const data = await res.json();
      setVendedor(data.vendedor);
      setNovaFoto(null);
      setPreview(null);
      toast.success('Foto atualizada com sucesso!');
    } catch {
      toast.error('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-surface-800">Foto de Vendedor</h1>
      <p className="mb-6 text-sm text-surface-400">
        Alterar a foto de perfil de um vendedor
      </p>

      {/* Busca */}
      <div className="card mb-6">
        <label className="mb-1.5 block text-sm font-medium text-surface-600">
          Telefone do vendedor
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            onKeyDown={(e) => e.key === 'Enter' && buscarVendedor()}
            placeholder="(00) 00000-0000"
            className="flex-1"
            autoFocus
          />
          <button onClick={buscarVendedor} disabled={buscando} className="btn-primary">
            {buscando ? (
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

      {/* Não encontrado */}
      {naoEncontrado && (
        <div className="card text-center text-surface-400">
          Vendedor não encontrado com este número
        </div>
      )}

      {/* Vendedor encontrado */}
      {vendedor && (
        <div className="card">
          {/* Info atual */}
          <div className="mb-6 flex items-center gap-4">
            {vendedor.fotoPerfilUrl ? (
              <Image
                src={vendedor.fotoPerfilUrl}
                alt={vendedor.nome}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <HiUserCircle className="h-20 w-20 text-surface-200" />
            )}
            <div>
              <p className="text-lg font-semibold text-surface-800">{vendedor.nome}</p>
              <p className="text-sm text-surface-400">{formatarTelefone(vendedor.telefone)}</p>
              <p className="mt-1 text-xs text-surface-400">
                {vendedor.fotoPerfilUrl ? 'Foto atual ↑' : 'Sem foto de perfil'}
              </p>
            </div>
          </div>

          {/* Upload nova foto */}
          <div>
            <label className="mb-3 block text-sm font-medium text-surface-600">
              Nova foto de perfil
            </label>

            {preview ? (
              <div className="mb-4">
                <div className="relative inline-block">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-32 w-32 rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setNovaFoto(null); setPreview(null); }}
                    className="absolute -right-1 -top-1 rounded-full bg-negativa p-1 text-white"
                  >
                    <HiXCircle size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <label className="mb-4 flex cursor-pointer flex-col items-center gap-2 rounded-apple border-2 border-dashed border-surface-300 bg-surface-50 p-6 transition-colors hover:border-brand-400">
                <HiCamera className="h-8 w-8 text-surface-400" />
                <span className="text-sm text-surface-500">Clique para selecionar</span>
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            )}

            {novaFoto && (
              <button
                onClick={salvarFoto}
                disabled={salvando}
                className="btn-primary w-full"
              >
                {salvando ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Salvando...
                  </div>
                ) : (
                  <>
                    <HiCheckCircle size={18} />
                    Salvar Foto
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
