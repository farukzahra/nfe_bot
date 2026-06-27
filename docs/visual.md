# Identidade Visual

Tema base oficial do projeto: **Vuetify 3 - Vite Theme FREE**.

| Recurso | Link |
|---|---|
| Store | [Vuetify 3 - Vite Theme FREE](https://store.vuetifyjs.com/products/vite-theme-free) |
| Demo | [Live Preview](https://theme-vite-free.vercel.app/) |
| Repositório | [vuetifyjs/theme-vite-free](https://github.com/vuetifyjs/theme-vite-free) |

---

## Decisão

Usar o tema gratuito oficial da Vuetify como base visual. Ele já traz:

- Vuetify 3 + Vite + Vue 3 (mesma stack do projeto)
- Tema **dark** como padrão
- Cor **primary** `#1697f6`
- `defaults` globais (bordas `rounded: sm`, app bar flat, botões estilizados)
- Tipografia **Roboto**

Adaptamos o layout para um app gerencial (sidebar + auth), mantendo paleta e defaults do tema original.

---

## Paleta

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#1697f6` | Botões, links, destaques |
| `background` | tema dark Vuetify | Fundo geral |
| `surface` | tema dark Vuetify | Cards, drawer, app bar |
| `sheet` | `#212121` | Blocos de destaque (do tema original) |

---

## Defaults globais (Vuetify)

Baseado em `src/plugins/vuetify.ts` do [theme-vite-free](https://github.com/vuetifyjs/theme-vite-free/blob/main/src/plugins/vuetify.js):

| Componente | Default |
|---|---|
| Global | `rounded: sm` |
| `VAppBar` | `flat: true` |
| `VBtn` | `color: primary`, `height: 44` |
| `VBtnAlt` | `color: primary`, `variant: outlined`, `height: 48` |

> Botões de toolbar (ex.: Sair) usam `variant="text"` e sem `min-width` fixo — adaptação para UI admin.

---

## Layouts

### Auth (`/login`, `/register`)

- Fundo dark com gradiente sutil
- Logo **NFe Bot** centralizado
- Card elevado centralizado
- Botão primário full-width

### App autenticado

- `v-navigation-drawer` permanente à esquerda
- `v-app-bar` flat com título da página e email do usuário
- Conteúdo em `v-container fluid`
- Cards com `rounded="sm"` para listagens e placeholders

---

## Componentes internos

| Componente | Arquivo | Função |
|---|---|---|
| `BrandLogo` | `frontend/src/components/BrandLogo.vue` | Logo/marca consistente |
| `AuthLayout` | `frontend/src/layouts/AuthLayout.vue` | Wrapper login e cadastro |
| `PageCard` | `frontend/src/components/PageCard.vue` | Card padrão das telas internas |

---

## Tipografia

- Fonte: **Roboto** (Google Fonts)
- Títulos de página: `text-h5` / `text-h6`
- Corpo: `text-body-2`
- Texto secundário: `text-medium-emphasis`

---

## Regras

- Manter consistência com defaults do Vuetify configurados em `plugins/vuetify.ts`
- Não introduzir biblioteca de UI paralela
- Novas telas devem reutilizar `PageCard` e `AuthLayout`
- Dark mode é o padrão; light mode pode ser adicionado depois via `theme.toggle`
