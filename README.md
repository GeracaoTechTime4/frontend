# ScaleOps (frontend)

## Trocas de turno

O funcionário A pede a troca de um turno a um colega B. B aceita ou recusa; só depois do aceite o supervisor autoriza ou não. As telas deixam cada mudança de estado explícita: selo do estado, linha do tempo (pedido → resposta do colega → decisão do supervisor), confirmação que mostra `estado atual → novo estado` e um aviso depois de cada ação.

| Rota | Quem | O que faz |
| --- | --- | --- |
| `/turnos` | Funcionário | Lista os turnos e abre o pedido de troca (escolhe o colega) |
| `/trocas` | Funcionário | *Para eu responder*: aceitar ou recusar. *Meus pedidos*: acompanhar e cancelar |
| `/aprovacoes` | Supervisor | Aprovar ou rejeitar (com motivo) o que já foi aceito; filtro por estado |
| `/gestao-turnos` | Supervisor | Cadastrar, editar e excluir turnos; listados por funcionário, do mais recente ao mais distante |

As regras de quem pode fazer o quê em cada estado ficam em [`src/lib/solicitacao-estado.ts`](src/lib/solicitacao-estado.ts), que espelha a máquina de estados da lib `shift-swap`; o backend continua sendo quem valida. Precisa do backend com os endpoints de `/solicitacoes-troca`, `/funcionarios/colegas` e `/turnos/meus`; a gestão de turnos usa `GET/POST /turnos`, `PUT/DELETE /turnos/:id` e `GET /funcionarios` (exige backend com a lib `shift-swap` 0.5+); a URL da API vem de `VITE_API_URL` em desenvolvimento e do próprio domínio em produção (veja Deploy).

---

## Testes E2E (Playwright)

```bash
bunx playwright install chromium   # uma vez
bun run test:e2e                   # sobe a API e o front sozinhos (~20 s)
bunx playwright test --ui          # para depurar
```

Os testes ([e2e/](e2e/)) dirigem o front buildado (`vite preview`, porta 4173) contra a API do backend (porta 3000), os dois subidos pelo [playwright.config.ts](playwright.config.ts). O backend vem de `BACKEND_DIR` (padrão `../backend`, o repositório ao lado) e roda com um PGlite novo a cada execução, já com o seed (`supervisor@example.com`, `joao@example.com`, `maria@example.com`, senha `turno-local-seed-2026`). Nada de staging, dados reais ou rede externa: a API sobe com `AUTH_CHECK_PWNED=false` e se recusa a rodar com uma `DATABASE_URL` que não seja PGlite.

Fluxos cobertos: cadastro e login, rotas protegidas por papel, gestão de turnos (criar, editar, excluir), troca aprovada (o turno muda de dono) e troca recusada/rejeitada. As regras em detalhe ficam nos testes de integração do backend.

- **Seletores:** por label, papel e texto (`getByLabel`, `getByRole`), como um usuário enxerga a tela. Cada teste cria o seu turno com um horário único (`horarioUnico` em [e2e/helpers.ts](e2e/helpers.ts)) para achá-lo sem depender de ordem.
- **CI:** o job `e2e` roda em todo PR e push na `developer`, contra a `main` do backend; o deploy em staging depende dele. Em falha, o relatório do Playwright (com trace e vídeo) fica nos artefatos da execução.

## Deploy (AWS)

Dois ambientes, cada um com um bucket S3 privado servido por um CloudFront que também encaminha `/api/*` para a API (AWS Lambda Web Functions):

| Ambiente | URL | Config |
|---|---|---|
| staging | https://so-staging.mariochaves.click | [config/env/staging.json](config/env/staging.json) |
| produção | https://so.mariochaves.click | [config/env/prod.json](config/env/prod.json) |

Como front e API ficam no mesmo domínio, o build de produção chama a API em `${window.location.origin}/api` ([src/services/api-url.ts](src/services/api-url.ts)): sem CORS, com o cookie de sessão no próprio domínio, e **o mesmo build serve os dois ambientes**. Em desenvolvimento a URL vem de `VITE_API_URL` em [.env.development](.env.development).

Deploy manual (o script envia o `dist/` ao bucket; assets com hash ficam em cache por 1 ano e o `index.html` vai sem cache, então não é preciso invalidar o CloudFront):

```bash
AWS_PROFILE=mario DEPLOY_CONFIG=config/env/staging.json bun run deploy
```

### CI/CD (GitHub Actions)

- **Todo PR:** `lint` e `build` ([ci-cd.yml](.github/workflows/ci-cd.yml)).
- **Push na `developer`:** o mesmo build é publicado em **staging** ([deploy.yml](.github/workflows/deploy.yml)), com um smoke test que confere se o bundle novo está sendo servido.
- **Produção:** Actions → **"Promover para produção"** → Run workflow ([promote.yml](.github/workflows/promote.yml)). Publica o build de uma execução que já passou por staging (sem `run_id`, a mais recente). Só roda a partir da `developer`.

O GitHub acessa a AWS por OIDC, sem chaves guardadas, com uma role por ambiente que só pode ser assumida por jobs do GitHub Environment correspondente (`staging` ou `production`) e só escreve no bucket daquele ambiente. As roles são criadas pela infra do repositório do backend (`infra/cdk`).

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
