// ============================================================
// API: Administrador Individual
// ============================================================
// PATCH  /api/administradores/[id]  → Atualizar admin
// DELETE /api/administradores/[id]  → Desativar admin
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function verificarSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) return { erro: 'Não autenticado', status: 401 };
  if ((session.user as any).papel !== 'SUPER_ADMIN') return { erro: 'Acesso negado', status: 403 };
  return { session };
}

// PATCH: Atualizar admin (nome, email, senha, grupos, ativo)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const check = await verificarSuperAdmin();
  if ('erro' in check) {
    return NextResponse.json({ erro: check.erro }, { status: check.status });
  }

  try {
    const { nome, email, senha, grupoIds, ativo } = await request.json();
    const adminId = params.id;

    // Verifica se o admin existe
    const admin = await prisma.administrador.findUnique({ where: { id: adminId } });
    if (!admin) {
      return NextResponse.json({ erro: 'Admin não encontrado' }, { status: 404 });
    }

    // Monta os dados a atualizar
    const data: any = {};
    if (nome !== undefined) data.nome = nome.trim();
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (senha) data.senhaHash = await bcrypt.hash(senha, 12);
    if (ativo !== undefined) data.ativo = ativo;

    // Atualiza o admin
    await prisma.administrador.update({
      where: { id: adminId },
      data,
    });

    // Se grupoIds foi enviado, atualiza os vínculos
    if (grupoIds !== undefined) {
      // Remove todos os vínculos atuais
      await prisma.adminGrupo.deleteMany({ where: { adminId } });

      // Cria os novos vínculos
      if (grupoIds.length > 0) {
        await prisma.adminGrupo.createMany({
          data: grupoIds.map((gId: string) => ({
            adminId,
            grupoId: gId,
          })),
        });
      }
    }

    return NextResponse.json({ sucesso: true });
  } catch (error) {
    console.error('Erro ao atualizar admin:', error);
    return NextResponse.json({ erro: 'Erro interno' }, { status: 500 });
  }
}
