# FORJA

App pessoal de gestão de treino de academia: monte fichas com séries, cargas e ajustes de
cadeira, marque o treino do dia, acompanhe a semana no calendário e veja o IMC e o peso
evoluírem em gráfico.

100% local e offline — todos os dados ficam no SQLite do próprio dispositivo, sem backend.

## Stack

- **Expo (managed)** + **Expo Router** + **TypeScript** (strict)
- **Drizzle ORM** sobre **expo-sqlite** (persistência local)
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
├── infrastructure/   Drizzle/SQLite: schema, migrations, repositórios, mappers, seed
├── composition/       composition root — monta repositórios (Infrastructure) e injeta
│                     nos use cases (Application); é a única camada que conhece as duas
├── presentation/      tema, componentes, hooks (ligam use cases + telas) e providers
└── shared/           utilitários puros reaproveitados por qualquer camada (Result, datas, id)

app/                  rotas do Expo Router — finas, delegam para src/presentation
drizzle/               migrations SQL geradas pelo drizzle-kit (versionadas: são bundladas
                     no app e aplicadas no dispositivo no primeiro boot)
```

Domain e Application não importam nada de React Native/Expo/Drizzle — são testáveis com Jest
puro, sem mocks de plataforma.

## Setup

Pré-requisitos: Node 18+, um dispositivo/emulador com o app **Expo Go** instalado (todas as
dependências nativas usadas — expo-sqlite, expo-image, expo-image-picker,
expo-linear-gradient, reanimated, gesture-handler — são compatíveis com Expo Go na versão do
SDK deste projeto; não é necessário gerar um development build).

```bash
npm install
cp .env.example .env   # ajuste se quiser, os valores padrão já funcionam
npm start
```

Escaneie o QR code com o Expo Go (Android) ou a câmera (iOS), ou pressione `a`/`i` no terminal
para abrir num emulador.

No primeiro boot o app roda as migrations do Drizzle automaticamente e popula o catálogo de
~28 exercícios pré-cadastrados (ver `src/infrastructure/database/seed/seedExerciseCatalog.ts`).
Não existe usuário/perfil ainda no primeiro uso — o app abre direto no onboarding.

## Scripts

| Comando                           | O que faz                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `npm start`                       | Sobe o Metro bundler / Expo Dev Tools                                                   |
| `npm run android` / `ios` / `web` | Abre direto numa plataforma                                                             |
| `npm run typecheck`               | `tsc --noEmit`                                                                          |
| `npm run lint`                    | ESLint, incluindo a regra de fronteira de camadas                                       |
| `npm run format` / `format:check` | Prettier                                                                                |
| `npm test` / `test:watch`         | Jest                                                                                    |
| `npm run db:generate`             | Gera uma nova migration a partir de mudanças em `src/infrastructure/database/schema.ts` |

## Testes

```bash
npm test              # roda tudo
npx jest --coverage   # com relatório de cobertura
```

Cobertos com Jest + repositórios fake em memória (`src/application/testing/`), sem tocar
SQLite:

- **Domain**: value objects (`Height`, `Weight`, `Bmi` — incluindo os limiares de
  classificação abaixo/saudável/sobrepeso/obesidade), `GoalProgressService`, e as entidades
  (`Profile`, `WorkoutPlan` + `WorkoutPlanExercise`, `Exercise`, `Attendance`, `WeightEntry`),
  cobrindo caminhos felizes e casos de borda (valores fora do intervalo, nomes vazios,
  reordenação ao remover exercício, etc.)
- **Application**: os use cases com lógica de orquestração real — criação combinada de perfil e
  peso inicial, exclusividade do "treino de hoje" (★), validação cruzada ao adicionar exercício
  a uma ficha, montagem do grid mensal do calendário, cálculo de progresso da meta

Use cases que são puro repasse ao repositório (`GetProfile`, `ListWorkoutPlans`, etc.) foram
deixados sem teste dedicado — a lógica que importa já está coberta nas entidades de Domain que
eles delegam.

## Decisões e limitações conhecidas

- **Perfil único**: o app foi desenhado para uso pessoal (uma pessoa, um dispositivo). As
  entidades já carregam `profileId` para não precisar de migração de schema se um dia isso
  virar multi-usuário — só a camada de Infrastructure mudaria.
- **Sessão de treino**: a tela em `app/treino/[fichaId]/sessao.tsx` (marcar exercícios,
  concluir e registrar presença) foi inferida — não havia mockup para essa tela específica.
- **Ícones/splash placeholder**: `assets/images/` usa os assets padrão do template Expo. Troque
  pela identidade visual real do FORJA quando tiver os arquivos.
- **Sem backend**: tudo local. Se um dia for preciso sincronizar entre dispositivos ou lançar
  publicamente, a Infrastructure já isola Drizzle/SQLite atrás de interfaces de Repository
  (`src/domain/repositories/`) — trocar para um backend real (ex. Postgres via Drizzle, ou
  Turso) significa reimplementar essas interfaces, sem tocar em Domain/Application/Presentation.
