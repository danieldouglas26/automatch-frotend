# 🚗 Automatch Frontend Monorepo

Bem-vindo ao repositório oficial do frontend do **Automatch**.

Este projeto foi arquitetado para oferecer uma experiência moderna, escalável e de alta performance, integrando aplicações **Web** e **Mobile** através de uma base de código compartilhada, reutilizável e altamente tipada.

---

## 📖 Sobre o Projeto

O Automatch é uma plataforma desenvolvida com foco em performance, experiência do usuário e escalabilidade.

A arquitetura frontend utiliza uma estratégia de **Monorepo**, permitindo compartilhar regras de negócio, tipagens, integrações de API e utilitários entre aplicações Web e Mobile, reduzindo duplicação de código e aumentando a produtividade da equipe.

---

# 🏗️ Arquitetura

O projeto é gerenciado utilizando:

* **Turborepo** para orquestração de builds e cache inteligente
* **pnpm Workspaces** para gerenciamento de dependências
* **TypeScript** para tipagem ponta a ponta

## Estrutura do Projeto

```text
automatch-frontend/
│
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── public/
│   │   └── next.config.ts
│   │
│   └── mobile/
│       ├── app/
│       ├── src/
│       └── app.json
│
├── packages/
│   ├── api-client/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── core/
│   │   ├── src/
│   │   └── package.json
│   │
│   └── ui/
│       ├── src/
│       └── package.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── README.md
```

---

# 🚀 Aplicações

## 🌐 Web

Aplicação web desenvolvida utilizando:

* Next.js 14+
* React 18+
* TypeScript
* TailwindCSS
* Shadcn/UI
* React Query
* Zustand

### Principais objetivos

* SEO otimizado
* SSR e ISR
* Excelente performance
* Dark Mode nativo
* Design System compartilhado

---

## 📱 Mobile

Aplicação mobile desenvolvida utilizando:

* Expo
* React Native
* TypeScript
* NativeWind
* React Query
* Zustand

### Principais objetivos

* Código compartilhado com a Web
* Experiência nativa
* Deploy simplificado
* Performance otimizada

---

# 📦 Packages Compartilhados

## @automatch/core

Responsável por centralizar:

* Tipagens globais
* Schemas Zod
* Helpers
* Utilitários
* Constantes

### Exemplo

```ts
import { UserSchema } from "@automatch/core";
```

---

## @automatch/api-client

Camada de comunicação com os microsserviços.

### Responsabilidades

* Axios configurado
* Interceptors
* Refresh Token
* React Query Hooks
* Tratamento de erros

### Exemplo

```ts
import { api } from "@automatch/api-client";

const user = await api.get("/users/me");
```

---

## @automatch/ui

Biblioteca compartilhada de componentes.

### Exemplos

* Buttons
* Inputs
* Cards
* Modals
* Loaders
* Skeletons

---

# 🛠️ Stack Tecnológica

## Base Compartilhada

| Tecnologia  | Função                         |
| ----------- | ------------------------------ |
| TypeScript  | Tipagem estática               |
| React Query | Cache e sincronização de dados |
| Zustand     | Estado global                  |
| Axios       | Cliente HTTP                   |
| Zod         | Validação                      |
| ESLint      | Qualidade de código            |
| Prettier    | Padronização                   |

---

## Web

| Tecnologia    | Função          |
| ------------- | --------------- |
| Next.js       | Framework React |
| TailwindCSS   | Estilização     |
| Shadcn/UI     | Componentes     |
| Framer Motion | Animações       |

---

## Mobile

| Tecnologia   | Função           |
| ------------ | ---------------- |
| Expo         | Runtime Mobile   |
| React Native | Interface        |
| NativeWind   | Tailwind para RN |
| Reanimated   | Animações        |

---

# 🎯 Filosofia de Desenvolvimento

Seguimos alguns princípios fundamentais:

## 1. Reutilização de Código

> Se a lógica não altera a interface visual, ela deve estar dentro de `packages/`.

---

## 2. Tipagem Primeiro

Toda comunicação entre frontend e backend deve ser tipada.

```ts
Backend ➜ DTO ➜ Zod ➜ TypeScript ➜ UI
```

---

## 3. Performance

Priorizamos:

* Lazy Loading
* Code Splitting
* Skeleton Loading
* Prefetching
* Cache Inteligente
* Renderização otimizada

---

## 4. UX Premium

Inspirado em produtos como:

* Stripe
* Linear
* Apple
* Vercel

Foco em:

* Dark Mode elegante
* Microinterações
* Navegação intuitiva
* Responsividade completa

---

# 🔐 Integração com Backend

O frontend foi projetado para consumir os microsserviços do ecossistema Automatch através de um API Gateway centralizado.

## Serviços

```text
API Gateway
│
├── IAM Service
├── Catalog Service
├── Booking Service
├── Notification Service
└── Future Services
```

---

## Autenticação

Fluxo padrão:

```text
Login
  ↓
JWT Access Token
  ↓
Axios Interceptor
  ↓
Refresh Token
  ↓
Renovação automática
```

Características:

* Refresh Token automático
* Interceptors compartilhados
* Controle centralizado de sessão
* Logout global

---

# 🚀 Começando

## Pré-requisitos

* Node.js >= 18
* pnpm >= 9
* Git

---

## Clonando o Projeto

```bash
git clone <repository-url>

cd automatch-frontend
```

---

## Instalando Dependências

```bash
pnpm install
```

---

## Executando em Desenvolvimento

### Todos os projetos

```bash
pnpm dev
```

### Apenas Web

```bash
pnpm --filter web dev
```

### Apenas Mobile

```bash
pnpm --filter mobile dev
```

---

# 📜 Scripts Disponíveis

```bash
pnpm dev
```

Inicia todos os projetos.

```bash
pnpm build
```

Build de todo o monorepo.

```bash
pnpm lint
```

Executa ESLint.

```bash
pnpm type-check
```

Validação TypeScript.

```bash
pnpm test
```

Executa testes.

---

# 📄 Licença

Este projeto é propriedade da equipe **Automatch**.

Todos os direitos reservados.

---

<div align="center">

**Automatch Frontend**

Construindo experiências modernas, escaláveis e performáticas 🚀

</div>
