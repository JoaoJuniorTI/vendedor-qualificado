# 🚀 Guia de Instalação — Vendedor Qualificado

## ✅ O que está pronto

O projeto está **100% implementado** com todas as funcionalidades:

### Área Pública (sem login)
- Página inicial com busca por telefone
- Página de resultado com resumo (positivas, negativas, neutras, média de estrelas)
- Lista de qualificações com fotos ampliáveis
- Lista de grupos onde o vendedor recebeu qualificações

### Área Administrativa (login com e-mail/senha)
- Tela de login
- Dashboard com atalhos
- **Nova Qualificação**: busca/cria vendedor, dados do comprador, grupo, tipo, estrelas, foto
- **Lista de Qualificações**: filtros, paginação, dados do comprador (visível só aqui), exclusão com confirmação
- **Foto de Vendedor**: busca e altera foto de perfil
- Menu lateral responsivo

### Área Super Admin
- CRUD de Grupos (criar, editar, excluir)
- CRUD de Administradores (criar, editar, ativar/desativar, vincular a grupos)

### Infraestrutura
- Banco de dados modelado (5 tabelas com relacionamentos)
- Autenticação com JWT
- Upload de fotos com compressão automática
- Soft delete com log de auditoria
- Proteção de rotas
- Design responsivo estilo Apple

---

## Pré-requisitos

### 1. Node.js (versão 18 ou superior)
- Baixe em: https://nodejs.org/
- Escolha a versão **LTS**
- Teste no terminal: `node --version`

### 2. Editor de código
- Recomendo o **VS Code**: https://code.visualstudio.com/

---

## Passo a Passo

### Passo 1: Copiar o projeto

Extraia a pasta `vendedor-qualificado` para o seu computador:
```
C:\projetos\vendedor-qualificado\     (Windows)
~/projetos/vendedor-qualificado/      (Mac/Linux)
```

### Passo 2: Abrir o terminal na pasta do projeto

```bash
cd C:\projetos\vendedor-qualificado
```

### Passo 3: Instalar as dependências

```bash
npm install
```
⏳ Pode demorar alguns minutos na primeira vez.

### Passo 4: Criar o banco de dados gratuito

Acesse https://neon.tech e:
1. Crie uma conta gratuita (pode usar Google)
2. Clique em **"Create a project"**
3. Nome: `vendedor-qualificado`
4. Copie a **Connection string** que aparece

### Passo 5: Configurar as variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Abra o `.env` e preencha:
```env
DATABASE_URL="cole-a-connection-string-do-neon-aqui"
NEXTAUTH_SECRET="gere-um-texto-aleatorio-longo-aqui"
NEXTAUTH_URL="http://localhost:3000"
SUPER_ADMIN_EMAIL="seu-email@gmail.com"
SUPER_ADMIN_SENHA="sua-senha-segura"
SUPER_ADMIN_NOME="João"
```

### Passo 6: Criar as tabelas no banco

```bash
npx prisma generate
npx prisma db push
```

### Passo 7: Criar o Super Admin

```bash
npx prisma db seed
```

Você verá: `✅ Super Admin criado com sucesso!`

### Passo 8: Rodar o projeto

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## Como usar

### Primeiro acesso

1. Acesse http://localhost:3000
2. Clique em "Área administrativa"
3. Faça login com o e-mail e senha que você configurou no `.env`
4. Primeiro, vá em **Grupos** e cadastre os grupos de WhatsApp
5. Depois, se quiser outros admins, vá em **Administradores** e cadastre-os vinculando aos grupos
6. Agora você pode cadastrar qualificações!

### Fluxo de uso diário

1. Admin faz login
2. Clica em **Nova Qualificação**
3. Digita o telefone do vendedor (se não existe, cadastra na hora)
4. Preenche: telefone/nome do comprador, grupo, tipo, estrelas, foto
5. Salva

### Consulta pública

Qualquer pessoa acessa a página inicial, digita o telefone do vendedor e vê a reputação completa.

---

## Estrutura dos Arquivos

```
vendedor-qualificado/
├── prisma/
│   ├── schema.prisma          ← Definição das tabelas do banco
│   └── seed.ts                ← Script que cria o Super Admin
├── src/
│   ├── app/
│   │   ├── page.tsx           ← Página inicial (consulta pública)
│   │   ├── login/page.tsx     ← Tela de login
│   │   ├── consulta/[telefone]/page.tsx  ← Resultado da consulta
│   │   ├── admin/
│   │   │   ├── page.tsx       ← Dashboard do admin
│   │   │   ├── layout.tsx     ← Menu lateral
│   │   │   ├── qualificacao/nova/page.tsx  ← Cadastrar qualificação
│   │   │   ├── qualificacao/page.tsx       ← Listar qualificações
│   │   │   ├── vendedor/foto/page.tsx      ← Alterar foto
│   │   │   ├── grupos/page.tsx             ← CRUD Grupos (super admin)
│   │   │   └── administradores/page.tsx    ← CRUD Admins (super admin)
│   │   └── api/               ← Todas as APIs do backend
│   ├── components/            ← Componentes visuais reutilizáveis
│   ├── lib/                   ← Conexão com banco, auth, upload
│   └── middleware.ts          ← Proteção de rotas
├── .env.example               ← Modelo das variáveis de ambiente
├── package.json               ← Dependências do projeto
└── tailwind.config.js         ← Configuração visual
```

---

## Comandos Úteis

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Roda o projeto em modo desenvolvimento |
| `npm run build` | Compila para produção |
| `npm start` | Roda a versão compilada |
| `npx prisma studio` | Abre interface visual do banco (ótimo pra debug!) |
| `npx prisma db push` | Sincroniza o schema com o banco |
| `npx prisma db seed` | Executa o seed (cria Super Admin) |

---

## Deploy na Vercel

1. Suba o código no GitHub
2. Acesse https://vercel.com e conecte o repositório
3. Configure as variáveis de ambiente (mesmas do `.env`)
4. Deploy automático!

---

## Problemas Comuns

**Erro "Cannot find module '@prisma/client'"**
→ Execute: `npx prisma generate`

**Erro de conexão com banco**
→ Verifique a `DATABASE_URL` no `.env`

**Login não funciona**
→ Verifique o `NEXTAUTH_SECRET` e `NEXTAUTH_URL` no `.env`

**Fotos não carregam**
→ Verifique se as pastas `public/uploads/qualificacoes` e `public/uploads/perfis` existem
