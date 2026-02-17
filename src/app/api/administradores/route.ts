// ============================================================
// API: Administradores (CRUD - Super Admin apenas)
// ============================================================
// GET  /api/administradores       → Listar admins
// POST /api/administradores       → Criar admin
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Helper: verifica se é super admin
async function verificarSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { erro: 'Não autenticado', status: 401 };
  if ((session.user as any).papel !== 'SUPER_ADMIN') return { erro: 'Acesso negado', status: 403 };
  return { session };
}

// GET: Listar administradores
export async function GET() {
  const check = await verificarSuperAdmin();
  if ('erro' in check) {
    return NextResponse.json({ erro: check.erro }, { status: check.status });
  }

  const admins = await prisma.administrador.findMany({
    orderBy: { criadoEm: 'desc' },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      ativo: true,
      criadoEm: true,
      grupos: {
        include: {
          grupo: { select: { id: true, nome: true } },
        },
      },
    },
  });

  return NextResponse.json({
    administradores: admins.map((a) => ({
      ...a,
      grupos: a.grupos.map((ag) => ag.grupo),
    })),
  });
}

// POST: Criar administrador
export async function POST(request: NextRequest) {
  const check = await verificarSuperAdmin();
  if ('erro' in check) {
    return NextResponse.json({ erro: check.erro }, { status: check.status });
  }

  try {
    const { nome, email, senha, grupoIds } = await request.json();

    if (!nome || !email || !senha) {
      return NextResponse.json(
        { erro: 'Nome, e-mail e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica se e-mail já existe
    const existente = await prisma.administrador.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json(
        { erro: 'Já existe um administrador com este e-mail' },
        { status: 409 }
      );
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const admin = await prisma.administrador.create({
      data: {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        senhaHash,
        papel: 'ADMIN',
        grupos: grupoIds?.length
          ? {
              create: grupoIds.map((gId: string) => ({
                grupoId: gId,
              })),
            }
          : undefined,
      },
      include: {
        grupos: { include: { grupo: { select: { id: true, nome: true } } } },
      },
    });

    return NextResponse.json({
      sucesso: true,
      admin: {
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
        grupos: admin.grupos.map((ag) => ag.grupo),
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar admin:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
