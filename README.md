# eco-landing

Landing page de [Eco](https://ecotranslate.app) — aplicación macOS de transcripción y traducción en tiempo real.

## Stack

- **Astro 6** — static output, sin framework de UI
- **pnpm** — gestor de paquetes
- **Node 22** — requerido (`.nvmrc` incluido)
- CSS puro — sin Tailwind
- Fuentes: Montserrat + Nunito + Space Mono (Google Fonts)

## Estructura

```
src/
  components/       # Nav, Hero, Features, HowItWorks, Pricing, FAQ, Footer
  i18n/
    ui.ts           # Todas las traducciones ES + EN
  layouts/
    Layout.astro    # HTML base: meta SEO, hreflang, JSON-LD, fonts
  pages/
    index.astro     # / → Español
    privacy.astro
    terms.astro
    en/
      index.astro   # /en/ → English
      privacy.astro
      terms.astro
  styles/
    global.css      # Variables CSS, reset, componentes base
public/
  app-icon.png      # Icono real de la app (Eco.xcassets)
  favicon.ico
  apple-touch-icon.png
  robots.txt
```

## Desarrollo

```bash
nvm use          # Activa Node 22
pnpm install
pnpm dev         # localhost:4321
pnpm build
pnpm preview
```

## i18n

Todo el copy vive en `src/i18n/ui.ts`. Cada componente recibe `lang: 'es' | 'en'` y llama `useTranslations(lang)`. Para editar textos, solo modificar `ui.ts`.

## SEO

- `hreflang` alternates en todas las páginas (`es`, `en`, `x-default`)
- `sitemap-index.xml` generado automáticamente por `@astrojs/sitemap`
- `robots.txt` apuntando al sitemap
- JSON-LD: `SoftwareApplication` en Layout, `FAQPage` en FAQ (rich snippets)
- Meta descriptions y títulos localizados

## Deploy

Genera archivos estáticos en `dist/`. Compatible con Vercel, Netlify, Cloudflare Pages.

Dominio: `ecotranslate.app`
