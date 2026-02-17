// ============================================================
// API: Qualificações
// ============================================================
// POST /api/qualificacoes       → Cadastrar nova qualificação
// GET  /api/qualificacoes       → Listar qualificações (admin)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// ============================================================
// POST: Cadastrar nova qualificação
// ============================================================
export async function POST(request: NextRequest) {
  // Verifica autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      telefoneVendedor,
      nomeVendedor,       // Usado apenas se o vendedor não existe ainda
      grupoId,
      telefoneComprador,
      nomeComprador,
      tipo,
      estrelas,
      fotoUrl,
    } = body;

    // ---- Validações ----

    if (!telefoneVendedor || !grupoId || !telefoneComprador || !nomeComprador || !tipo || !estrelas || !fotoUrl) {
      return NextResponse.json(
        { erro: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Valida o tipo
    if (!['POSITIVA', 'NEGATIVA', 'NEUTRA'].includes(tipo)) {
      return NextResponse.json(
        { erro: 'Tipo deve ser POSITIVA, NEGATIVA ou NEUTRA' },
        { status: 400 }
      );
    }

    // Valida as estrelas
    if (estrelas < 1 || estrelas > 5) {
      return NextResponse.json(
        { erro: 'Estrelas deve ser de 1 a 5' },
        { status: 400 }
      );
    }

    // Limpa os telefones (só números)
    const telVendedorLimpo = telefoneVendedor.replace(/\D/g, '');
    const telCompradorLimpo = telefoneComprador.replace(/\D/g, '');

    // Verifica se o admin tem acesso ao grupo selecionado
    const papel = (session.user as any).papel;
    const grupoIds = (session.user as any).grupoIds as string[];

    if (papel !== 'SUPER_ADMIN' && !grupoIds.includes(grupoId)) {
      return NextResponse.json(
        { erro: 'Você não tem permissão neste grupo' },
        { status: 403 }
      );
    }

    // Verifica se o grupo existe
    const grupo = await prisma.grupo.findUnique({ where: { id: grupoId } });
    if (!grupo) {
      return NextResponse.json(
        { erro: 'Grupo não encontrado' },
        { status: 404 }
      );
    }

    // ---- Busca ou cria o vendedor (RN02) ----

    let vendedor = await prisma.vendedor.findUnique({
      where: { telefone: telVendedorLimpo },
    });

    if (!vendedor) {
      // Vendedor novo: precisa do nome
      if (!nomeVendedor || nomeVendedor.trim() === '') {
        return NextResponse.json(
          { erro: 'Nome do vendedor é obrigatório para novo cadastro' },
          { status: 400 }
        );
      }

      vendedor = await prisma.vendedor.create({
        data: {
          telefone: telVendedorLimpo,
          nome: nomeVendedor.trim(),
        },
      });
    }

    // ---- Cria a qualificação ----

    const qualificacao = await prisma.qualificacao.create({
      data: {
        vendedorId: vendedor.id,
        grupoId,
        adminCadastrouId: (session.user as any).id,
        telefoneComprador: telCompradorLimpo,
        nomeComprador: nomeComprador.trim(),
        tipo,
        estrelas,
        fotoUrl,
      },
      include: {
        vendedor: { select: { nome: true, telefone: true } },
        grupo: { select: { nome: true } },
      },
    });

    return NextResponse.json({
      sucesso: true,
      qualificacao: {
        id: qualificacao.id,
        vendedor: qualificacao.vendedor,
        grupo: qualificacao.grupo,
        tipo: qualificacao.tipo,
        estrelas: qualificacao.estrelas,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar qualificação:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao criar qualificação' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET: Listar qualificações (área admin)
// ============================================================
export async function GET(request: NextRequest) {
  // Verifica autenticação
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const papel = (session.user as any).papel;
  const grupoIds = (session.user as any).grupoIds as string[];

  // Parâmetros de filtro da query string
  const searchParams = request.nextUrl.searchParams;
  const filtroGrupo = searchParams.get('grupoId');
  const filtroTelefone = searchParams.get('telefone');
  const filtroTipo = searchParams.get('tipo');
  const pagina = parseInt(searchParams.get('pagina') || '1');
  const porPagina = 20;

  // Monta o filtro base
  const where: any = {
    excluido: false,
  };

  // Admin normal: só vê qualificações dos seus grupos
  if (papel !== 'SUPER_ADMIN') {
    where.grupoId = { in: grupoIds };
  }

  // Filtros opcionais
  if (filtroGrupo) {
    where.grupoId = filtroGrupo;
  }

  if (filtroTelefone) {
    const telLimpo = filtroTelefone.replace(/\D/g, '');
    where.vendedor = { telefone: { contains: telLimpo } };
  }

  if (filtroTipo && ['POSITIVA', 'NEGATIVA', 'NEUTRA'].includes(filtroTipo)) {
    where.tipo = filtroTipo;
  }

  try {
    // Busca qualificações com paginação
    const [qualificacoes, total] = await Promise.all([
      prisma.qualificacao.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (pagina - 1) * porPagina,
        take: porPagina,
        include: {
          vendedor: { select: { id: true, nome: true, telefone: true } },
          grupo: { select: { id: true, nome: true } },
          adminCadastrou: { select: { nome: true } },
        },
      }),
      prisma.qualificacao.count({ where }),
    ]);

    return NextResponse.json({
      qualificacoes: qualificacoes.map((q) => ({
        id: q.id,
        vendedor: q.vendedor,
        grupo: q.grupo,
        telefoneComprador: q.telefoneComprador,
        nomeComprador: q.nomeComprador,
        tipo: q.tipo,
        estrelas: q.estrelas,
        fotoUrl: q.fotoUrl,
        criadoEm: q.criadoEm,
        adminCadastrou: q.adminCadastrou.nome,
      })),
      paginacao: {
        pagina,
        porPagina,
        total,
        totalPaginas: Math.ceil(total / porPagina),
      },
    });
  } catch (error) {
    console.error('Erro ao listar qualificações:', error);
    return NextResponse.json(
      { erro: 'Erro interno ao listar qualificações' },
      { status: 500 }
    );
  }
}
