// ============================================================
// API: Destaque Individual
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PATCH: Atualizar destaque
export async function PATCH(
  request: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }
  if ((session.user as any).papel !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json();
    const { titulo, imagemUrl, linkUrl, ativo } = body;

    const destaque = await prisma.destaque.findUnique({ where: { id } });
    if (!destaque) {
      return NextResponse.json({ erro: 'Destaque não encontrado' }, { status: 404 });
    }

    const atualizado = await prisma.destaque.update({
      where: { id },
      data: {
        ...(titulo !== undefined && { titulo: titulo.trim() }),
        ...(imagemUrl !== undefined && { imagemUrl }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl.trim() }),
        ...(ativo !== undefined && { ativo }),
      },
    });

    return NextResponse.json({ sucesso: true, destaque: atualizado });
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao atualizar', detalhe: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Excluir destaque
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }
  if ((session.user as any).papel !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    await prisma.destaque.delete({ where: { id } });
    return NextResponse.json({ sucesso: true });
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao excluir', detalhe: error.message },
      { status: 500 }
    );
  }
}

// POST: Registrar acesso (público)
export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    await prisma.destaque.update({
      where: { id },
      data: { acessos: { increment: 1 } },
    });
    return NextResponse.json({ sucesso: true });
  } catch {
    return NextResponse.json({ sucesso: false }, { status: 500 });
  }
}
