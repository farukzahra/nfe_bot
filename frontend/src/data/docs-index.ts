export interface DocEntry {
  id: string
  number: string
  title: string
  description: string
  file: string
}

export const projectSummary =
  'Importar XML de NF-e/NFC-e, organizar entrada e saída, armazenar os dados no banco vinculados ao usuário logado e permitir consultas inteligentes sobre compras, vendas, produtos, clientes, fornecedores e margem estimada.'

export const documentationIndex: DocEntry[] = [
  {
    id: 'overview',
    number: '1',
    title: 'Visão Geral',
    description: 'Objetivo e proposta do sistema',
    file: 'docs/overview.md',
  },
  {
    id: 'fase1',
    number: '2',
    title: 'Fase 1 — Importação',
    description: 'Upload de XML e ZIP',
    file: 'docs/fase1-importacao.md',
  },
  {
    id: 'dados',
    number: '3',
    title: 'Dados a Extrair',
    description: 'Todos os campos extraídos da NF-e/NFC-e',
    file: 'docs/dados.md',
  },
  {
    id: 'classificacao',
    number: '4',
    title: 'Classificação Entrada/Saída',
    description: 'Regras de separação de documentos',
    file: 'docs/classificacao.md',
  },
  {
    id: 'banco',
    number: '5',
    title: 'Banco de Dados',
    description: 'Tabelas, campos e modelo de dados',
    file: 'docs/banco-de-dados.md',
  },
  {
    id: 'banco-conexao',
    number: '5.1',
    title: 'Conexões com o Banco',
    description: 'URLs de dev e produção, variáveis de ambiente',
    file: 'docs/banco-conexao.md',
  },
  {
    id: 'auth',
    number: '5.2',
    title: 'Autenticação',
    description: 'Cadastro, login, JWT e isolamento por usuário',
    file: 'docs/auth.md',
  },
  {
    id: 'fase2',
    number: '6',
    title: 'Fase 2 — CRUD',
    description: 'Tela de visualização e correção dos imports',
    file: 'docs/fase2-crud.md',
  },
  {
    id: 'telas',
    number: '6.1',
    title: 'Telas',
    description: 'Inventário de telas, rotas, padrões de UI e ações',
    file: 'docs/telas.md',
  },
  {
    id: 'fase3',
    number: '7',
    title: 'Fase 3 — Chatbot',
    description: 'Chatbot gerencial, margem e tool calling',
    file: 'docs/fase3-chatbot.md',
  },
  {
    id: 'arquitetura',
    number: '8',
    title: 'Arquitetura',
    description: 'Fluxo do sistema, decisões e MCP',
    file: 'docs/arquitetura.md',
  },
  {
    id: 'stack',
    number: '9',
    title: 'Stack',
    description: 'Stack técnica Full JS detalhada',
    file: 'docs/stack.md',
  },
  {
    id: 'seguranca',
    number: '10',
    title: 'Segurança',
    description: 'Isolamento, permissões e auditoria',
    file: 'docs/seguranca.md',
  },
  {
    id: 'roadmap',
    number: '11',
    title: 'Roadmap',
    description: 'Fases planejadas do produto',
    file: 'docs/roadmap.md',
  },
  {
    id: 'fases',
    number: '12',
    title: 'Fases de Implementação',
    description: 'Checklist de progresso do desenvolvimento',
    file: 'docs/fases-implementacao.md',
  },
  {
    id: 'testes',
    number: '13',
    title: 'Testes',
    description: 'Vitest (backend) + Playwright (frontend)',
    file: 'docs/testes.md',
  },
  {
    id: 'visual',
    number: '14',
    title: 'Visual',
    description: 'Tema Vuetify 3 - Vite Theme FREE',
    file: 'docs/visual.md',
  },
]

export const repositoryUrl = 'https://github.com/farukzahra/nfe_bot.git'
