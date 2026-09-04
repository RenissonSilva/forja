# FORJA

App de gestão de treino de academia, com conta própria por usuário: monte fichas com séries,
cargas e ajustes de cadeira, marque o treino do dia, acompanhe a semana no calendário e veja o
IMC e o peso evoluírem em gráfico.

Multi-usuário com autenticação (e-mail/senha e Google) via **Supabase** — Postgres gerenciado +
Auth, com Row Level Security isolando os dados de cada conta. Requer conexão com a internet
(sem suporte offline).

## Stack

- **Expo (managed)** + **Expo Router** + **TypeScript** (strict)
- **Supabase**: Postgres + Auth (e-mail/senha, Google OAuth) + Row Level Security, acessado via
  `@supabase/supabase-js`
- **Zod** (validação de DTOs e de variáveis de ambiente) · **Zustand** (estado leve de UI)
- **react-native-gifted-charts** (gráfico de peso/IMC) · **react-native-calendars**-style
  calendário mensal construído sobre `date-fns`
- **Jest** + **Testing Library** para testes

## Arquitetura

Clean Architecture em 5 camadas dentro de `src/`, cada uma só podendo depender das camadas
abaixo dela. A regra é verificada automaticamente pelo ESLint (`eslint-plugin-boundaries`, ver
`eslint.config.js`) — um import fora da direção permitida quebra o lint.

```
src/
├── domain/          entidades, value objects, erros e regras de negócio puras
│                     (zero dependências de React Native ou de banco)
├── application/      use cases (1 por operação) + DTOs (Zod) na borda de entrada
├── infrastructure/   client Supabase, repositórios e mappers (linha a linha, snake_case
│                     do Postgres <-> camelCase do Domain)
├── composition/       composition root — monta repositórios (Infrastructure) e injeta
│                     nos use cases (Application); é a única camada que conhece as duas
├── presentation/      tema, componentes, hooks (ligam use cases + telas) e providers
└── shared/           utilitários puros reaproveitados por qualquer camada (Result, datas, id)

app/                  rotas do Expo Router — finas, delegam para src/presentation
```

Domain e Application não importam nada de React Native/Expo/Supabase — são testáveis com Jest
puro, sem mocks de plataforma (o fake `InMemoryAuthRepository` cobre os use cases de auth nos
testes).

## Setup

Pré-requisitos: Node 18+, um projeto no [Supabase](https://supabase.com), e um **development
build** do app (o login com Google via navegador não funciona no Expo Go — use
`npx expo run:android` / `npx expo run:ios`, ou um build EAS).

1. Crie um projeto no Supabase e rode o SQL de schema + Row Level Security (tabelas `profiles`,
   `exercises`, `workout_plans`, `workout_plan_exercises`, `attendances`, `weight_entries`) no
   SQL Editor do painel.
2. Em Authentication → Providers, habilite Email e Google (o Google exige um OAuth Client ID
   tipo "Web application" no Google Cloud Console, com redirect URI
   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`).
3. Copie a Project URL e a chave anon/publishable (Settings → API) para o `.env`:

```bash
npm install
cp .env.example .env
# edite EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY com os valores do seu projeto
npm run android   # ou: npm run ios
```

O catálogo de exercícios pré-cadastrados é semeado uma única vez direto no banco (via SQL),
não mais pelo app no boot. No primeiro uso, o app abre no fluxo de autenticação — depois de
criar conta/entrar, segue para o onboarding de criação de perfil.

## Scripts

| Comando                           | O que faz                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `npm start`                       | Sobe o Metro bundler / Expo Dev Tools                                                   |
| `npm run android` / `ios` / `web` | Abre direto numa plataforma                                                             |
| `npm run typecheck`               | `tsc --noEmit`                                                                          |
| `npm run lint`                    | ESLint, incluindo a regra de fronteira de camadas                                       |
| `npm run format` / `format:check` | Prettier                                                                                |
| `npm test` / `test:watch`         | Jest                                                                                    |

## Testes

```bash
npm test              # roda tudo
npx jest --coverage   # com relatório de cobertura
```

Cobertos com Jest + repositórios fake em memória (`src/application/testing/`), sem tocar o
Supabase:

- **Domain**: value objects (`Height`, `Weight`, `Bmi` — incluindo os limiares de
  classificação abaixo/saudável/sobrepeso/obesidade), `GoalProgressService`, e as entidades
  (`Profile`, `WorkoutPlan` + `WorkoutPlanExercise`, `Exercise`, `Attendance`, `WeightEntry`),
  cobrindo caminhos felizes e casos de borda (valores fora do intervalo, nomes vazios,
  reordenação ao remover exercício, etc.)
- **Application**: os use cases com lógica de orquestração real — criação combinada de perfil e
  peso inicial, exclusividade do "treino da vez" (★), validação cruzada ao adicionar exercício
  a uma ficha, montagem do grid mensal do calendário, cálculo de progresso da meta

Use cases que são puro repasse ao repositório (`GetProfile`, `ListWorkoutPlans`, etc.) foram
deixados sem teste dedicado — a lógica que importa já está coberta nas entidades de Domain que
eles delegam.

## Decisões e limitações conhecidas

- **Multi-usuário via Supabase**: cada conta tem seu próprio `profile` (1:1 com `auth.users`,
  mesmo `id`) e Row Level Security isola todas as demais tabelas por `profile_id`/`user_id`. A
  Infrastructure fala com o Postgres via `supabase-js` (PostgREST sobre HTTPS) — é o caminho
  correto para RLS baseada em sessão a partir de um client React Native, ao contrário de um ORM
  como Drizzle com conexão TCP direta, que não roda no runtime do RN.
- **Sem suporte offline**: o app depende de conexão com a internet; não há cache local nem
  sincronização.
- **Sessão de treino**: a tela em `app/treino/[fichaId]/sessao.tsx` (marcar exercícios,
  concluir e registrar presença) foi inferida — não havia mockup para essa tela específica.
- **Ícones/splash placeholder**: `assets/images/` usa os assets padrão do template Expo. Troque
  pela identidade visual real do FORJA quando tiver os arquivos.
- **Tipos do Supabase não gerados**: os mappers em `src/infrastructure/mappers/` tipam as linhas
  manualmente (interfaces `Supabase*Row`). Rodar `supabase gen types typescript` e apontar o
  `createClient<Database>` para o resultado é uma melhoria futura opcional.
- **`WorkoutPlanRepository.save` sem transação**: `supabase-js` não oferece transação
  client-side multi-tabela, então salvar uma ficha é upsert do plano seguido de delete+insert
  dos exercícios (duas chamadas). Se aparecer inconsistência em uso real, migrar para uma RPC
  Postgres (`client.rpc(...)`) resolveria com atomicidade real.
