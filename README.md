# ScaleOps (frontend)

## Trocas de turno

O funcionário A pede a troca de um turno a um colega B. B aceita ou recusa; só depois do aceite o supervisor autoriza ou não. As telas deixam cada mudança de estado explícita: selo do estado, linha do tempo (pedido → resposta do colega → decisão do supervisor), confirmação que mostra `estado atual → novo estado` e um aviso depois de cada ação.

| Rota | Quem | O que faz |
| --- | --- | --- |
| `/turnos` | Funcionário | Lista os turnos e abre o pedido de troca (escolhe o colega) |
| `/trocas` | Funcionário | *Para eu responder*: aceitar ou recusar. *Meus pedidos*: acompanhar e cancelar |
| `/aprovacoes` | Supervisor | Aprovar ou rejeitar (com motivo) o que já foi aceito; filtro por estado |

As regras de quem pode fazer o quê em cada estado ficam em [`src/lib/solicitacao-estado.ts`](src/lib/solicitacao-estado.ts), que espelha a máquina de estados da lib `shift-swap`; o backend continua sendo quem valida. Precisa do backend com os endpoints de `/solicitacoes-troca`, `/funcionarios/colegas` e `/turnos/meus`; a URL vem de `VITE_API_URL`.

---

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
