// ============================================================
// API: Grupo Individual
// ============================================================
// PATCH  /api/grupos/[id]  → Atualizar grupo
// DELETE /api/grupos/[id]  → Excluir grupo
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function verificarSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { erro: 'Não autenticado', status: 401 };
  if ((session.user as any).papel !== 'SUPER_ADMIN') return { erro: 'Acesso negado', status: 403 };
  return { session };
}

// PATCH: Atualizar grupo
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const check = await verificarSuperAdmin();
  if ('erro' in check) {
    return NextResponse.json({ erro: check.erro }, { status: check.status });
  }

  try {
    const { nome, descricao, nomeDono, telefoneDono } = await request.json();

    const grupo = await prisma.grupo.findUnique({ where: { id: params.id } });
    if (!grupo) {
      return NextResponse.json({ erro: 'Grupo não encontrado' }, { status: 404 });
    }

    const atualizado = await prisma.grupo.update({
      where: { id: params.id },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
        ...(nomeDono !== undefined && { nomeDono: nomeDono.trim() }),
        ...(telefoneDono !== undefined && { telefoneDono: telefoneDono.replace(/\D/g, '') }),
      },
    });

    return NextResponse.json({ sucesso: true, grupo: atualizado });
  } catch (error) {
    console.error('Erro ao atualizar grupo:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}

// DELETE: Excluir grupo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const check = await verificarSuperAdmin();
  if ('erro' in check) {
    return NextResponse.json({ erro: check.erro }, { status: check.status });
  }

  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id: params.id },
      include: { _count: { select: { qualificacoes: true } } },
    });

    if (!grupo) {
      return NextResponse.json({ erro: 'Grupo não encontrado' }, { status: 404 });
    }

    // Aviso: se tem qualificações vinculadas, vai apagar em cascata
    if (grupo._count.qualificacoes > 0) {
      return NextResponse.json(
        { erro: `Este grupo tem ${grupo._count.qualificacoes} qualificação(ões). Exclua-as antes de excluir o grupo.` },
        { status: 400 }
      );
    }

    await prisma.grupo.delete({ where: { id: params.id } });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
