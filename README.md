# Sessão Estratégica

Landing page do produto **Sessão Estratégica** — diagnóstico tributário sob a Reforma (IBS/CBS), com modelo de honorário de êxito sobre economia comprovada.

Stack: **Astro 5 · Tailwind v4 · Preact (island)**, deploy estático.

---

## Setup local

```bash
npm install
cp .env.example .env  # ajuste se necessário
npm run dev           # http://localhost:4321
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento com HMR |
| `npm run build` | Build estático em `dist/` |
| `npm run preview` | Preview do build de produção localmente |
| `npm run typecheck` | `astro check` (TypeScript + Astro diagnostics) |

## Variáveis de ambiente

| Nome | Descrição | Padrão |
|---|---|---|
| `PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp do escritório (E.164 sem `+`) | `5519940028922` |
| `PUBLIC_SITE_URL` | URL canônica para sitemap, JSON-LD, OG | `https://sessaoestrategica.com.br` |

Ambas têm fallback hardcoded em `src/lib/whatsapp.ts` e `astro.config.mjs`.

---

## Arquitetura

```
src/
├── components/
│   ├── layout/         # Container, Header, Footer
│   ├── ui/             # Button, Badge, SectionHeading, Accordion, Logo
│   ├── sections/       # Hero, PainPoints, Method, Differentiators,
│   │                   # SuccessFee, Credentials, FAQ, Qualification, ClosingCTA
│   └── quiz/           # QualificationQuiz.tsx (island Preact) + quiz-config.ts
├── content/faq.ts      # Perguntas/respostas tipadas
├── layouts/BaseLayout.astro
├── lib/whatsapp.ts     # Builder de URL wa.me com payload do quiz
├── pages/
│   ├── index.astro
│   ├── nao-elegivel.astro    # ?motivo=porte|dado|preco
│   ├── obrigado.astro
│   ├── politica-privacidade.astro
│   └── 404.astro
└── styles/global.css   # Tokens da paleta + utilitários
```

## Quiz de qualificação

- **Stepped form Preact**, 6 perguntas + tela de contato + resultado
- Hidratação `client:visible` (carrega só quando o usuário rola até a seção)
- ~6.7 KB gzipped no bundle do quiz
- Honeypot anti-bot, validação client-side, sem persistência server-side

Lógica em `src/components/quiz/quiz-config.ts`:

- **Disqualificação dura** (anti-personas): faturamento até R$ 4,8M, "planilhas + contador", ou "pesquisando preço" → redireciona para `/nao-elegivel?motivo=...`
- **Aprovado** (score ≥ 12) → WhatsApp com mensagem completa
- **Aprovado parcial** (8 ≤ score < 12) → WhatsApp com flag `[FIT PARCIAL]`

## Integração WhatsApp

`src/lib/whatsapp.ts` constrói:

```
https://wa.me/5519940028922?text=<mensagem urlencoded com dossiê do lead>
```

Mensagem inclui: nome, papel, empresa, faturamento, setor, ERP, momento, abertura ao êxito, e-mail e (opcional) telefone.

---

## Paleta de cores

Tokens em `src/styles/global.css` via `@theme`:

- **Brand:** navy `#1B2A4E` (primary), `#0B1220` (deep)
- **Acento:** copper `#B8743A`
- **Neutros:** gray `#F4F5F7` → `#14171F`
- **Tipografia:** Fraunces (display) + Inter (sans), self-hosted via Fontsource

Validada em WCAG AA mínimo. Todos os pares texto/fundo testados.

---

## Deploy

Recomendação: **Cloudflare Pages** (build command `npm run build`, output dir `dist`). Configure as duas variáveis de ambiente na dashboard.

Alternativas equivalentes: Netlify, Vercel.

---

## Checklist antes do go-live

Procurar por `TODO_CLIENT` nos arquivos para encontrar os placeholders:

- [ ] Logo definitivo (substituir `src/components/ui/Logo.astro` por SVG real)
- [ ] CNPJ, razão social, endereço, OAB no `Footer.astro`
- [ ] Selos reais em `Credentials.astro`
- [ ] Política de privacidade revisada juridicamente (`pages/politica-privacidade.astro`)
- [ ] Domínio definitivo (atualizar `PUBLIC_SITE_URL`)
- [ ] OG image final (substituir `public/og-image.svg` por JPG 1200x630 se desejar)
- [ ] Decisão sobre depoimentos / cases anônimos (não criar mock — adicionar quando real)
- [ ] Validar copy de FAQ com tributarista responsável (provimento OAB 205/2021)

---

## Verificação end-to-end

1. `npm run build && npm run preview`
2. **Quiz golden path** — CFO, indústria, R$ 80M-300M, TOTVS, planejando, sim ao êxito → redireciona para `wa.me/5519940028922?text=...` com mensagem completa
3. **Rejeição porte** — selecionar "Até R$ 4,8M" → `/nao-elegivel?motivo=porte`
4. **Rejeição Desorganizado** — selecionar "Planilhas + contador" → `/nao-elegivel?motivo=dado`
5. **Rejeição Pechincheiro** — selecionar "Pesquisando preço" → `/nao-elegivel?motivo=preco`
6. **Fit parcial** — escolher combinação que dá score 8-11 → mensagem WhatsApp deve conter `[FIT PARCIAL]`
7. **Mobile** — viewport 375px, validar quiz e leitura de todas as seções
8. **Acessibilidade** — navegação só com teclado (Tab/Enter/Setas), foco visível em todos os controles
