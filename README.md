# ScaleOps (frontend)

## Trocas de turno

O funcionário A pede a troca de um turno a um colega B. B aceita ou recusa; só depois do aceite o supervisor autoriza ou não. As telas deixam cada mudança de estado explícita: selo do estado, linha do tempo (pedido → resposta do colega → decisão do supervisor), confirmação que mostra `estado atual → novo estado` e um aviso depois de cada ação.

| Rota | Quem | O que faz |
| --- | --- | --- |
| `/turnos` | Funcionário | Lista os turnos e abre o pedido de troca (escolhe o colega) |
| `/trocas` | Funcionário | *Para eu responder*: aceitar ou recusar. *Meus pedidos*: acompanhar e cancelar |
| `/aprovacoes` | Supervisor | Aprovar ou rejeitar (com motivo) o que já foi aceito; filtro por estado |
| `/gestao-turnos` | Supervisor | Cadastrar, editar e excluir turnos; listados por funcionário, do mais recente ao mais distante |

As regras de quem pode fazer o quê em cada estado ficam em [`src/lib/solicitacao-estado.ts`](src/lib/solicitacao-estado.ts), que espelha a máquina de estados da lib `shift-swap`; o backend continua sendo quem valida. Precisa do backend com os endpoints de `/solicitacoes-troca`, `/funcionarios/colegas` e `/turnos/meus`; a gestão de turnos usa `GET/POST /turnos`, `PUT/DELETE /turnos/:id` e `GET /funcionarios` (exige backend com a lib `shift-swap` 0.5+); a URL vem de `VITE_API_URL`.

---

## Deploy (AWS)

O front fica num bucket S3 privado servido pelo CloudFront em **https://dkrzib6ua831y.cloudfront.net**. No mesmo domínio, `/api/*` é encaminhado para a API (AWS Lambda Web Functions), então o cookie de sessão não é de terceiros e não há CORS em produção. Por isso o `VITE_API_URL` de produção (em [`.env.production`](.env.production)) termina em `/api`.

```bash
aws sso login --profile mario   # se a sessão tiver expirado
AWS_PROFILE=mario bun run deploy
```

O script ([`scripts/deploy.sh`](scripts/deploy.sh)) faz o build e envia o `dist/` ao bucket: assets com hash ficam em cache por 1 ano e o `index.html` vai sem cache, então não é preciso invalidar o CloudFront.

### CI/CD (GitHub Actions)

O workflow [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) roda `lint` e `build` em todo PR. Em todo push na `developer`, faz também o deploy (`bun run deploy`) e confere se o CloudFront já está servindo o bundle novo.

O GitHub acessa a AWS por OIDC, sem chaves guardadas: a role `github-actions-shift-swap-frontend` só pode ser assumida pela `developer` deste repositório e só escreve no bucket do front. Ela é criada pelo template `infra/github-actions-roles.yaml` do repositório do backend.

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
