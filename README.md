# 🚗 AutoMatch - Plataforma Integrada de Serviços Automotivos

Este é o repositório principal do frontend do **AutoMatch**, desenvolvido sob um modelo de **Monorepo** para unificar as aplicações **Web** e **Mobile** compartilhando lógica de negócios, validações e comunicação com o backend em uma única base de código.

Este projeto constitui o entregável prático do **Projeto Integrador 2026/1** do **6º Período do Curso Superior de Bacharelado em Engenharia de Software da Faculdade SENAI FATESG**.

---

## 🎓 Contexto Acadêmico (SENAI FATESG)

O desenvolvimento deste software engloba competências de múltiplas disciplinas do curso de Engenharia de Software:
* **Construção de Software II:** Desenvolvimento mobile aderente aos requisitos do PI.
* **Teste de Software:** Cobertura de testes unitários (+90% de cobertura no backend com JUnit e esteira de testes no frontend).
* **Interação Humano-Computador (IHC):** Interfaces modernas com alta usabilidade, consistência visual e acessibilidade.
* **Análise e Projeto de Algoritmos:** Seleção de 5 funções críticas do projeto para modelagem matemática de sua complexidade $T(n)$ e emprego de técnicas avançadas de projeto de algoritmos.
* **Empreendedorismo:** Definição do modelo de negócios através do **Lean Canvas**.

---

## 💼 Modelo de Negócios (Lean Canvas)

O AutoMatch foi concebido para sanar problemas reais de comunicação e confiança no mercado de manutenção automotiva.

| Elemento | Descrição |
| :--- | :--- |
| **Problema** | • Falta de praticidade para encontrar oficinas/mecânicos confiáveis em momentos de emergência.<br>• Falta de transparência nos preços de peças e serviços.<br>• Gestão ineficiente de agendamentos por parte dos profissionais autônomos. |
| **Segmento de Clientes** | • **Clientes:** Proprietários de veículos que necessitam de socorro rápido ou manutenção preventiva periódica.<br>• **Profissionais:** Mecânicos autônomos e oficinas que desejam digitalizar sua agenda e captar mais clientes. |
| **Proposta de Valor** | • Agendamento sob demanda conectando clientes e profissionais com base em localização e especialidade.<br>• Orçamentação digital detalhada com rastreabilidade e histórico de revisões do veículo. |
| **Solução** | • Aplicativo mobile para o cliente realizar buscas e agendamentos instantâneos.<br>• Painel administrativo Web para o profissional gerenciar ordens de serviço, catálogo e agenda. |
| **Canais** | • Aplicativo Móvel (iOS/Android) via Expo.<br>• Plataforma Web responsiva via Next.js. |
| **Estrutura de Custos** | • Custos de infraestrutura na VPS e banco de dados.<br>• Custo de marketing de aquisição para motoristas e mecânicos. |
| **Fontes de Receita** | • Taxa de conveniência por agendamento concluído (comissões).<br>• Assinatura premium para oficinas (relatórios avançados, destaque na busca). |
| **Métricas Chave** | • Volume Mensal de Agendamentos (GMV).<br>• Tempo médio de resposta do mecânico.<br>• Retenção de clientes recorrentes e NPS (Net Promoter Score). |

---

## 🏗️ Arquitetura do Frontend (Monorepo)

Para maximizar a produtividade e reaproveitar código entre as plataformas Web e Mobile, a arquitetura utiliza:
* **Turborepo:** Orquestração de tarefas (build, lint, dev) com caching inteligente.
* **pnpm Workspaces:** Instalação e resolução de dependências de forma ultra-rápida, evitando duplicação.
* **Base Compartilhada:** Extração de contratos e requisições para a pasta `packages/`.

```
automatch-frontend/
├── apps/
│   ├── web/               # Next.js 16 (React 19) + TailwindCSS 4 - Painel Web e Landing Page
│   └── mobile/            # Expo 56 (React Native 0.85) - App Mobile do Cliente e Profissional
├── packages/
│   ├── core/              # Regras de Negócio, Validações (Zod Schemas) e Tipos TS Globais
│   ├── api-client/        # Cliente HTTP (Axios), Zustand Stores e React Query Hooks
│   ├── eslint-config/     # Padronização de qualidade de código
│   └── tsconfig/          # Configurações TypeScript compartilhadas
└── automatch-backend/     # Código-fonte do Backend (Microserviços Java 21 / Spring Boot)
```

### 🔁 Estratégia de Reaproveitamento de Código

1. **Schemas & Validação:** Todos os formulários (Login, Cadastro de Profissional, Criação de Agendamento) usam schemas **Zod** declarados em `@automatch/core`.
2. **API Integrada:** O pacote `@automatch/api-client` concentra os hooks do **React Query** e a instância do **Axios**. Se um endpoint do backend mudar, a alteração é feita apenas neste pacote, refletindo instantaneamente na Web e no Mobile.
3. **Gerenciamento de Estado:** A store global de Autenticação e Configurações é implementada no Zustand dentro do `@automatch/api-client`.

---

## 🖥️ Arquitetura do Backend & VPS

O backend oficial (alocado em `automatch-backend/`) é implementado sob uma arquitetura de microserviços de alta performance em Java 21 e Spring Boot 3.2.5:
* **api-gateway:** Ponto de entrada com Spring Cloud Gateway, atuando no roteamento, segurança e injeção de Trace IDs.
* **iam-service:** Autenticação segura com JWT e RBAC (Role-Based Access Control) diferenciando Clientes e Mecânicos.
* **catalog-service:** Catálogo de profissionais com cache Redis e mensageria distribuída com Apache Kafka.
* **booking-service:** Core de agendamentos, implementando padrões de resiliência e **Idempotência** via Spring AOP.
* **notification-service:** Envio de SMS e e-mails assíncronos guiado por eventos Kafka.

> [!IMPORTANT]
> Atualmente, os microserviços estão implantados em produção em uma **VPS (Virtual Private Server)**, permitindo que o frontend integre os endpoints de forma contínua no ambiente de homologação e produção através da internet.

---

## 🔗 Detalhamento dos Endpoints da API

Para integrar o frontend ao backend, o `@automatch/api-client` consome os seguintes endpoints mapeados (testados e disponíveis no arquivo Postman [AutoMatch-Backend.postman_collection.json](file:///Users/danieldouglas/bits/code/fatesg/pi/automatch-frontend/automatch-backend/AutoMatch-Backend.postman_collection.json)):

### 1. Autenticação (`iam-service`)
* **`POST /api/v1/auth/register`**
  * **Uso:** Cadastro de novos usuários (Clientes ou Oficinas/Mecânicos).
  * **Payload (JSON):**
    ```json
    {
      "email": "jose.silva@example.com",
      "password": "senha123",
      "firstName": "José",
      "lastName": "Silva",
      "role": "CLIENT"
    }
    ```
* **`POST /api/v1/auth/login`**
  * **Uso:** Autenticação do usuário. Retorna um token JWT para acesso a endpoints protegidos.
  * **Payload (JSON):**
    ```json
    {
      "email": "jose.silva@example.com",
      "password": "senha123"
    }
    ```
  * **Resposta:** Retorna o token JWT e os dados básicos do usuário autenticado.

### 2. Catálogo de Profissionais (`catalog-service`)
* **`GET /api/v1/professionals/search`**
  * **Uso:** Pesquisa profissionais registrados. Requer token JWT no header.
  * **Query Params:** `specialty` (Opcional - ex: "Mecânico", "Elétrica").
* **`PUT /api/v1/professionals/{id}`**
  * **Uso:** Atualiza os dados profissionais (especialidades, serviços ativos). Requer token JWT.
  * **Payload (JSON):**
    ```json
    {
      "firstName": "José",
      "lastName": "Mecânico",
      "specialty": "Mecânico de Motores",
      "services": ["Troca de Óleo", "Revisão Geral"],
      "active": true
    }
    ```

### 3. Agendamentos (`booking-service`)
* **`POST /api/v1/bookings`**
  * **Uso:** Cria uma solicitação de reserva de serviço. Protegido contra duplicidade (idempotência).
  * **Payload (JSON):**
    ```json
    {
      "clientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "clientEmail": "jose.silva@example.com",
      "professionalId": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "professionalEmail": "professional@example.com",
      "serviceName": "Troca de Óleo e Filtro",
      "appointmentTime": "2026-07-15T14:30:00"
    }
    ```

---

## 🎨 Princípios de IHC Aplicados

A interface do AutoMatch foi desenhada visando uma estética moderna e premium:
* **Tema Escuro Nativo:** Utilização de tons profundos (`#09090b` e `#18181b`) reduzindo a fadiga visual e economizando bateria em telas OLED (Mobile).
* **Feedback Imediato:** Transições suaves, botões com feedback de carregamento em estados assíncronos (`submitting`) e Skeletons na listagem de profissionais.
* **Componentização Semântica:** Uso de componentes reutilizáveis baseados no Radix UI (Web) para acessibilidade por leitores de tela e navegação por teclado.

---

## 📐 Algoritmos & Complexidade Matemática

Atendendo às diretrizes de **Análise e Projeto de Algoritmos**, o projeto mapeia as seguintes funções core para cálculo da fórmula de complexidade $T(n)$:
1. **Algoritmo de Busca de Especialistas (Catalog):** Busca com filtragem de string baseada na técnica de busca sequencial otimizada com complexidade de tempo linear $O(n)$.
2. **Filtro de Localização:** Cálculo da distância euclidiana/Haversine para ordenar prestadores por proximidade utilizando a técnica de ordenação QuickSort/TimSort com complexidade $O(n \log n)$ no caso médio.
3. **Processamento de Agendamentos por Prioridade:** Gestão de fila de chamados de socorro mecânico com estrutura de Min-Heap, proporcionando complexidade de inserção $O(\log n)$.
4. **Idempotência (Backend AOP):** Verificação em cache distribuído (Redis) para checagem de requisições idênticas em tempo constante $O(1)$.
5. **Autenticação JWT & Criptografia:** Geração e assinatura digital do token, dependente do tamanho da chave criptográfica em complexidade $O(1)$ para tempo de execução por payload.

---

## 🚀 Como Executar o Projeto Frontend

### Pré-requisitos
* **Node.js** >= 18.0.0
* **pnpm** >= 9.0.0

### 1. Instalação das Dependências do Monorepo
Na raiz do projeto:
```bash
pnpm install
```

### 2. Configuração das Variáveis de Ambiente
Crie um arquivo `.env` nas aplicações:
* **Para Web ([`apps/web/.env`](file:///Users/danieldouglas/bits/code/fatesg/pi/automatch-frontend/apps/web/)):**
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
  ```
* **Para Mobile ([`apps/mobile/.env`](file:///Users/danieldouglas/bits/code/fatesg/pi/automatch-frontend/apps/mobile/.env)):**
  ```env
  EXPO_PUBLIC_API_URL=http://localhost:8080/api/v1
  ```
  *(Nota: Se testar o App Mobile em um celular físico na mesma rede local, substitua `localhost` pelo IP local do seu Gateway ou pela URL de homologação da VPS).*

### 3. Execução em Desenvolvimento

#### Opção A: Iniciar Web, Mobile e dependências simultaneamente
```bash
pnpm dev
```

#### Opção B: Iniciar apenas o Painel Web (Next.js)
```bash
pnpm --filter web dev
```

#### Opção C: Iniciar apenas o Aplicativo Mobile (Expo)
```bash
pnpm --filter mobile start
```

### 4. Executando o Backend (Localmente via Docker/Kubernetes)
Caso queira rodar o backend localmente em vez da VPS:
* **Subir a Infraestrutura:**
  ```bash
  cd automatch-backend
  docker compose up -d
  ```
* **Rodar os microserviços:**
  ```bash
  mvn spring-boot:run -pl <nome-do-modulo>
  ```
  *(Ou execute `./k8s/deploy.sh` caso possua o cluster Kubernetes local rodando sob o Kind).*

### 5. Execução em Produção via Docker (VPS)
O frontend monorepo também está preparado para empacotamento em container Docker e deploy contínuo (CD) na VPS.
* **Build local da imagem Next.js (Web):**
  ```bash
  docker build --build-arg NEXT_PUBLIC_API_URL=http://187.124.128.145:8080/api/v1 -t automatch-web-app .
  ```
* **Rodar com Docker Compose na VPS:**
  O arquivo [`docker-compose.frontend.yml`](file:///Users/danieldouglas/bits/code/fatesg/pi/automatch-frontend/docker-compose.frontend.yml) permite orquestrar o container da web app conectando-o à mesma rede bridge do backend:
  ```bash
  docker compose -p automatch-web-prod -f docker-compose.frontend.yml up -d
  ```

---

## 🔄 Pipeline de CI/CD (GitHub Actions)

O repositório do frontend possui workflows automatizados de **Deploy Contínuo (CD)** localizados na pasta [`.github/workflows/`](file:///Users/danieldouglas/bits/code/fatesg/pi/automatch-frontend/.github/workflows/):
* **Staging (`cd-staging.yml`):** Disparado em pushes na branch `develop`. Compila a imagem Next.js injetando a URL da API da VPS e faz o deploy do container (`automatch-web-staging`) na VPS.
* **Production (`cd-prod.yml`):** Disparado em pushes na branch `main`. Realiza o build final da imagem de produção e executa o container (`automatch-web-prod`) na porta `3000` na VPS.

> [!TIP]
> Garanta que os segredos `VPS_HOST`, `VPS_USERNAME` e `VPS_PASSWORD` estejam configurados nas Secrets do seu repositório no GitHub para que o deploy contínuo ocorra automaticamente sem intervenção manual.

---

## 👥 Integrantes do Grupo (Autores)

* **Daniel Douglas**
* **Jose Carlos Vaz Felipe**
* **Lucas Alves dos Reis**

---

<div align="center">
<strong>AutoMatch Frontend Monorepo</strong><br>
Focado em engenharia de qualidade, reaproveitamento máximo de código e design premium. 🚀
</div>
