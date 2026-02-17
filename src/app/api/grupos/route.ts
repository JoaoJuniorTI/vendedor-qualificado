// ============================================================
// API: Grupos
// ============================================================
// GET  /api/grupos  → Lista grupos (filtrado por permissão)
// POST /api/grupos  → Criar grupo (super admin)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ============================================================
// GET: Listar grupos
// ============================================================
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const papel = (session.user as any).papel;
  const grupoIds = (session.user as any).grupoIds as string[];

  let grupos;

  if (papel === 'SUPER_ADMIN') {
    // Super admin vê todos os grupos
    grupos = await prisma.grupo.findMany({
      orderBy: { nome: 'asc' },
    });
  } else {
    // Admin normal vê apenas seus grupos
    grupos = await prisma.grupo.findMany({
      where: { id: { in: grupoIds } },
      orderBy: { nome: 'asc' },
    });
  }

  return NextResponse.json({ grupos });
}

// ============================================================
// POST: Criar grupo (apenas super admin)
// ============================================================
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  if ((session.user as any).papel !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { erro: 'Apenas o Super Admin pode criar grupos' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { nome, descricao, nomeDono, telefoneDono } = body;

    if (!nome || !nomeDono || !telefoneDono) {
      return NextResponse.json(
        { erro: 'Nome do grupo, nome do dono e telefone do dono são obrigatórios' },
        { status: 400 }
      );
    }

    const grupo = await prisma.grupo.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        nomeDono: nomeDono.trim(),
        telefoneDono: telefoneDono.replace(/\D/g, ''),
      },
    });

    return NextResponse.json({ sucesso: true, grupo }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao criar grupo' },
      { status: 500 }
    );
  }
}
