# eco-landing

Landing page de [Eco](https://ecotranslate.app) — aplicación macOS de transcripción y traducción en tiempo real.

## Stack

- **Astro 6** — static output, sin framework de UI (los widgets son JavaScript a secas)
- **pnpm** — gestor de paquetes
- **Node 22** — requerido (`.nvmrc` incluido)
- CSS puro — sin Tailwind
- Fuentes: Montserrat + Nunito + Space Mono (Google Fonts)

## Estructura

```
src/
  components/       # Nav, Hero, Features, HowItWorks, Pricing, FAQ, Footer
    tools/          # Armazón de /tools + los 13 widgets
  i18n/
    ui.ts           # Copy del sitio, ES + EN
    tools/          # Copy de las herramientas, ES + EN
  lib/
    tools.ts        # Registro de herramientas: slugs, categorías, rutas
    subtitles.ts    # Parseo y serialización de SRT y VTT
    language-data.ts# Los 184 idiomas con código ISO (generado)
  layouts/
    Layout.astro    # HTML base: meta SEO, hreflang, JSON-LD, fonts
  pages/
    index.astro     # / → Español
    privacy.astro
    terms.astro
    tools/          # /tools + una página por herramienta
    en/
      index.astro   # /en/ → English
      privacy.astro
      terms.astro
      tools/
  styles/
    global.css      # Variables CSS, reset, componentes base
    tools.css       # Estilos compartidos de los widgets
public/
  app-icon.png      # Icono real de la app (Eco.xcassets)
  og-image.png      # Open Graph (es) — og-image-en.png para inglés
  favicon.ico
  apple-touch-icon.png
  robots.txt
```

## Herramientas gratuitas

`/tools` reúne trece utilidades de subtítulos, voz e idiomas, cada una en su propia URL y en los dos idiomas. Se ejecutan enteras en el navegador: no hay backend. Están ahí por SEO — atacan keywords que busca el mismo público que necesita Eco — y todas enlazan de vuelta al producto.

Cómo añadir una nueva: ver `CLAUDE.md`.

## Desarrollo

```bash
nvm use          # Activa Node 22
pnpm install
pnpm dev         # localhost:4321
pnpm build
pnpm preview
```

## i18n

Todo el copy vive en `src/i18n/`: `ui.ts` para el sitio y `tools/{es,en}.ts` para las herramientas. Cada componente recibe `lang: 'es' | 'en'` y llama `useTranslations(lang)` o `useToolTranslations(lang)`. Para editar textos, no hay que tocar los componentes.

## SEO

- `hreflang` alternates en todas las páginas (`es`, `en`, `x-default`)
- `sitemap-index.xml` generado automáticamente por `@astrojs/sitemap`
- `robots.txt` apuntando al sitemap
- JSON-LD: `SoftwareApplication` en Layout, `FAQPage` en FAQ, y `WebApplication` + `FAQPage` + `BreadcrumbList` en cada herramienta
- Meta descriptions y títulos localizados, propios de cada página
- 38 URLs indexables entre los dos idiomas

## Deploy

Genera archivos estáticos en `dist/`. Compatible con Vercel, Netlify, Cloudflare Pages.

Dominio: `ecotranslate.app`
