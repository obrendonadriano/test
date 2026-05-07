# Averbai - Landing Page & CRM

Sistema completo desenvolvido para a **Averbai**, focado na captura e gestão de leads para crédito com garantia de veículo. O projeto inclui uma página de alta conversão (Landing Page) conectada diretamente a um painel administrativo (Mini-CRM) em tempo real.

## 🚀 Funcionalidades

### Landing Page
- **Design de Alta Conversão:** Interface limpa, responsiva e focada na experiência do usuário.
- **Formulário Inteligente:** Validação e aplicação automática de máscaras em campos sensíveis (CPF, Celular, Placa, Valores em R$).
- **Transparência:** Seção de FAQ (Perguntas Frequentes) e aceitação de termos de uso e LGPD integrados.

### Painel Admin (CRM)
- **Dashboard Interativo:** Visão geral com métricas instantâneas (Total de Leads, Leads de Hoje, Volume Solicitado).
- **Funil de Vendas:** Cartões de acompanhamento em tempo real separados por status (Aguardando, Em Atendimento, Fechados, Cancelados).
- **Gestão de Status:** Alteração de status do lead diretamente na tabela para controle de fluxo de atendimento.
- **Busca e Filtros:** Pesquisa ultrarrápida por Nome ou CPF e filtros por datas (Hoje, 7 dias, 30 dias).
- **Exportação Flexível:** Geração de relatórios com 1 clique em formatos **.xlsx (Excel)** e **.pdf**.
- **Integração WhatsApp:** Botão para iniciar atendimento diretamente no WhatsApp Web com mensagem pré-formatada usando os dados e valores do cliente.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Vite
- **Estilização:** Vanilla CSS, Lucide React (Ícones)
- **Visualização de Dados:** Recharts (Gráficos)
- **Exportação:** XLSX, jsPDF, jsPDF-AutoTable
- **Backend / Banco de Dados:** Supabase (PostgreSQL)

## 📦 Como rodar o projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente criando um arquivo `.env`:
   ```env
   VITE_SUPABASE_URL=sua_url_aqui
   VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

---

*by nathan martins r*
