// ============================================================
// API: Atualizar Foto de Perfil do Vendedor
// ============================================================
// PATCH /api/vendedores/foto
//
// Body: { telefone, fotoUrl }
// Requer autenticação (admin ou super admin).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  try {
    const { telefone, fotoUrl } = await request.json();

    if (!telefone || !fotoUrl) {
      return NextResponse.json(
        { erro: 'Telefone e URL da foto são obrigatórios' },
        { status: 400 }
      );
    }

    const telefoneLimpo = telefone.replace(/\D/g, '');

    const vendedor = await prisma.vendedor.findUnique({
      where: { telefone: telefoneLimpo },
    });

    if (!vendedor) {
      return NextResponse.json(
        { erro: 'Vendedor não encontrado' },
        { status: 404 }
      );
    }

    const atualizado = await prisma.vendedor.update({
      where: { telefone: telefoneLimpo },
      data: { fotoPerfilUrl: fotoUrl },
    });

    return NextResponse.json({
      sucesso: true,
      vendedor: {
        id: atualizado.id,
        nome: atualizado.nome,
        telefone: atualizado.telefone,
        fotoPerfilUrl: atualizado.fotoPerfilUrl,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar foto:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao atualizar foto' },
      { status: 500 }
    );
  }
}
