// ============================================================
// API: Excluir Qualificação (Soft Delete)
// ============================================================
// DELETE /api/qualificacoes/[id]
//
// Marca a qualificação como excluída (soft delete).
// Registra quem excluiu e quando (RN06, RN07).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  // Verifica autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const resolvedParams = await params;
  const qualificacaoId = resolvedParams.id;
  const adminId = (session.user as any).id;
  const papel = (session.user as any).papel;
  const grupoIds = (session.user as any).grupoIds as string[];

  try {
    // Busca a qualificação
    const qualificacao = await prisma.qualificacao.findUnique({
      where: { id: qualificacaoId },
    });

    if (!qualificacao) {
      return NextResponse.json(
        { erro: 'Qualificação não encontrada' },
        { status: 404 }
      );
    }

    if (qualificacao.excluido) {
      return NextResponse.json(
        { erro: 'Qualificação já foi excluída' },
        { status: 400 }
      );
    }

    // Verifica permissão: admin normal só exclui dos seus grupos
    if (papel !== 'SUPER_ADMIN' && !grupoIds.includes(qualificacao.grupoId)) {
      return NextResponse.json(
        { erro: 'Você não tem permissão para excluir esta qualificação' },
        { status: 403 }
      );
    }

    // Soft delete: marca como excluída e registra quem excluiu
    await prisma.qualificacao.update({
      where: { id: qualificacaoId },
      data: {
        excluido: true,
        excluidoEm: new Date(),
        adminExcluiuId: adminId,
      },
    });

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao excluir qualificação:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao excluir qualificação' },
      { status: 500 }
    );
  }
}
