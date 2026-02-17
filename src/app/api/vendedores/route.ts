// ============================================================
// API: Buscar Vendedor por Telefone
// ============================================================
// GET /api/vendedores?telefone=11999998888
//
// Retorna os dados do vendedor com resumo das qualificações
// (contadores por tipo, média de estrelas) e lista completa
// das qualificações ativas.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Pega o telefone da query string
  const telefone = request.nextUrl.searchParams.get('telefone');

  if (!telefone) {
    return NextResponse.json(
      { erro: 'Parâmetro "telefone" é obrigatório' },
      { status: 400 }
    );
  }

  // Limpa o telefone (só números)
  const telefoneLimpo = telefone.replace(/\D/g, '');

  // Busca o vendedor com suas qualificações ativas
  const vendedor = await prisma.vendedor.findUnique({
    where: { telefone: telefoneLimpo },
    include: {
      qualificacoes: {
        where: { excluido: false },  // Só as ativas (não excluídas)
        orderBy: { criadoEm: 'desc' },  // Mais recente primeiro
        include: {
          grupo: {
            select: { id: true, nome: true },
          },
        },
      },
    },
  });

  // Se não encontrou o vendedor
  if (!vendedor) {
    return NextResponse.json(
      { erro: 'Vendedor não encontrado' },
      { status: 404 }
    );
  }

  // Calcula os resumos
  const qualificacoes = vendedor.qualificacoes;

  const positivas = qualificacoes.filter((q) => q.tipo === 'POSITIVA').length;
  const negativas = qualificacoes.filter((q) => q.tipo === 'NEGATIVA').length;
  const neutras = qualificacoes.filter((q) => q.tipo === 'NEUTRA').length;
  const total = qualificacoes.length;

  // Média de estrelas (evita divisão por zero)
  const mediaEstrelas = total > 0
    ? qualificacoes.reduce((soma, q) => soma + q.estrelas, 0) / total
    : 0;

  // Lista de grupos únicos onde recebeu qualificações
  const gruposUnicos = Array.from(
    new Map(
      qualificacoes.map((q) => [q.grupo.id, q.grupo])
    ).values()
  );

  return NextResponse.json({
    vendedor: {
      id: vendedor.id,
      nome: vendedor.nome,
      telefone: vendedor.telefone,
      fotoPerfilUrl: vendedor.fotoPerfilUrl,
    },
    resumo: {
      total,
      positivas,
      negativas,
      neutras,
      mediaEstrelas: Math.round(mediaEstrelas * 10) / 10, // 1 casa decimal
    },
    grupos: gruposUnicos,
    qualificacoes: qualificacoes.map((q) => ({
      id: q.id,
      tipo: q.tipo,
      estrelas: q.estrelas,
      fotoUrl: q.fotoUrl,
      criadoEm: q.criadoEm,
      grupo: q.grupo,
      // NOTA: telefoneComprador e nomeComprador NÃO são retornados
      // na consulta pública, por questão de privacidade (RN17)
    })),
  });
}
