// ============================================================
// API: Destaques Admin (todos, incluindo inativos)
// ============================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }
  if ((session.user as any).papel !== 'SUPER_ADMIN') {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  try {
    const destaques = await prisma.destaque.findMany({
      orderBy: [{ ativo: 'desc' }, { posicao: 'asc' }, { criadoEm: 'desc' }],
    });

    return NextResponse.json({ destaques });
  } catch (error: any) {
    return NextResponse.json(
      { erro: 'Erro ao carregar', detalhe: error.message },
      { status: 500 }
    );
  }
}
