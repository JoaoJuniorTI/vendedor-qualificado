// ============================================================
// API: Buscar Vendedor por Telefone (uso interno/admin)
// ============================================================
// GET /api/vendedores/buscar?telefone=11999998888
//
// Retorna apenas nome e telefone do vendedor, se existir.
// Usado no formulário de nova qualificação para verificar
// se o vendedor já existe antes de cadastrar.
// Requer autenticação.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Verifica autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const telefone = request.nextUrl.searchParams.get('telefone');
  if (!telefone) {
    return NextResponse.json(
      { erro: 'Parâmetro "telefone" é obrigatório' },
      { status: 400 }
    );
  }

  const telefoneLimpo = telefone.replace(/\D/g, '');

  const vendedor = await prisma.vendedor.findUnique({
    where: { telefone: telefoneLimpo },
    select: {
      id: true,
      nome: true,
      telefone: true,
      fotoPerfilUrl: true,
    },
  });

  if (!vendedor) {
    return NextResponse.json({ encontrado: false });
  }

  return NextResponse.json({
    encontrado: true,
    vendedor,
  });
}
