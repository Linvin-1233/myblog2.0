<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# myblog2.0

Markdown-driven Next.js 16 App Router blog. Content pages are statically
prerendered; `app/api/*` remains live as Vercel Serverless Functions.

## Commands
- `npm ci` installs the lockfile; Node.js 20+ is required.
- `npm run dev` optimizes post images first, then serves `localhost:3000`.
- `npm run build` optimizes images first, then creates the production `.next` build.
- `npm start` serves an existing production build; run `npm run build` first.
- `npm run lint` runs the flat ESLint config. For focused linting, use
  `npx eslint path/to/file.tsx`.
- There is no test suite or typecheck script. Run `npx tsc --noEmit` for a
  standalone typecheck.

## Runtime Boundaries
- `lib/posts.ts`, `lib/markdown.ts`, and `lib/siteConfig.ts` read local files with
  `fs`; keep them out of client-component imports. Pass derived data as props.
- Keep `next.config.ts` without `output: "export"` on Vercel: adding it disables
  the live geo, location, and Gitalk proxy APIs. `images.unoptimized` preserves
  plain-static-host compatibility.
- Keep `trailingSlash: true`; sitemap/RSS and other absolute URLs must end in `/`.
- Dynamic pages `[slug]` and `[tag]` need `generateStaticParams`. Next 16 page
  `params` is a Promise and must be awaited.
- Tag static params must use the raw lowercase slug. Do not pre-encode them;
  Next encodes params, and pre-encoding produces production-only double encoding.

## Content
- `posts/*.md` is the source of truth; the filename is the URL slug. Supported
  frontmatter is defined by `normalizeMeta` in `lib/posts.ts`: `title`,
  `description`, `date`, `updated`, `tags`, `cover`, and `draft`.
- `draft: true` posts are visible in development but excluded when
  `NODE_ENV=production`.
- `config.yml` owns site metadata, pagination, social/about text, author
  location, post licensing, and Gitalk. `NEXT_PUBLIC_SITE_URL` overrides
  `site.url` and drives metadata, canonical links, sitemap, and RSS.
- Markdown is rendered at build time by `lib/markdown.ts`. Raw HTML is trusted
  repository content and is injected without sanitization; do not feed it
  untrusted runtime input.

## Images
- Store sources under `posts/images/` and reference them as
  `![alt](images/path.png)`, not by their generated public path.
- `scripts/optimize-images.mjs` generates gitignored `public/post-images/` plus
  `manifest.json`; `lib/markdown.ts` rewrites the `images/` prefix and injects
  dimensions. Keep all three path conventions synchronized.

## APIs And Environment
- `.env.example` is the environment inventory. Never place credentials in
  `config.yml`; Gitalk's `NEXT_PUBLIC_*` OAuth values are intentionally bundled
  client-side and are not secrets at runtime.
- `/api/geo` depends on Vercel geo headers and returns null fields locally.
- `/api/location` needs Upstash `KV_REST_API_URL`/`KV_REST_API_TOKEN` and
  `LOCATION_WRITE_SECRET`; without storage, the UI falls back to `config.yml`.
- Gitalk JS and CSS must remain browser-only dynamic imports in `Comments.tsx`.

## Styling
- Tailwind v4 has no `tailwind.config.js`; theme tokens are CSS variables exposed
  through `@theme inline` in `app/globals.css`. Markdown uses `.post-content`.
- Visual language is "Dadaism × Brutalism × Marathon UI typography × controlled
  glitch": real image cutouts, rotated paper fragments, hard 2px borders with
  offset shadows, strong whitespace, exposed grid rails, and dense mono metadata.
  Route changes use `RouteSwapTransition`: two flush half-screen fields
  (`--poster-ice` / `--poster-deep`) that wipe in and out, with no text and no
  glitch; keep glitch out of ambient backgrounds and off permanent titles.
  Reusable pieces (`.hard-hover`, `.frame`, `.slab`, `.stamp`,
  `.corner-frame`, `.cutout-a/b`, `.dada-collage`, `.hatch`, `.grid-field`,
  `.route-swap`, `.type-display`, `.type-condensed`) live in `app/globals.css`
  and may only use the `--poster-*` palette; do not introduce new hues.
- Large colour blocks follow the Swiss basic treatment, and that is the
  benchmark for every block in the system: **a whole grid cell (column or grid
  unit) becomes a solid field, flush to the grid, with no border and no shadow;
  hierarchy comes from the field's area, not from stroke weight or depth.**
  Four classes carry it: `.block-ice`, `.block-deep`, `.block-panel`,
  `.block-paper`. A block's ink is `var(--poster-bg)`, which is near-white in
  light mode and near-black in dark mode, so it holds contrast on the blue
  fields in both — never introduce a third ink for block interiors.
  `.block-paper` is the one exception and hard-codes `#33383f`, because
  `--poster-paper` is a light field in *both* themes while `--poster-text*`
  flips light in dark mode; keep that literal if you touch the class.
- Blocks have two roles, and both are legitimate. **Structural** blocks are
  resident and carry the layout: the `PageHeader` left rail, its meta panel,
  the homepage telemetry corner and its two section spines, the post dossier,
  the distance field, the search input, the 404 numeral. **Reactive** blocks
  fire on interaction: the `PostRow` full-row inversion, tag cells, buttons.
  Marathon already did the reactive kind; the structural kind is what the Swiss
  reference adds. When a page reads as unanchored, add a structural block
  rather than another border — but do not add so many that the page becomes a
  checkerboard, and leave the site header and footer on hairlines only.
- Any "random" rotation/offset must come from `lib/dada.ts`'s deterministic
  `seedFrom`/`chanceInt`/`chanceTilt` helpers (never `Math.random`), otherwise
  SSR output and hydration diverge.
- `--poster-fault` is the second glitch channel and stays inside the blue
  palette (light deep sea blue `#1d4e89`, dark sky blue `#7fc4f2`).
- The palette is deliberately low-contrast for comfort: warm paper background,
  soft gray structural lines (`--poster-line`), charcoal ink for text, and a
  single blue accent — deep sea blue in light mode, sky blue in dark mode.
  Avoid adding pure black rules or high-saturation accents.
- Font roles: Anton (display), Bebas Neue (condensed), Chakra Petch (body/tech),
  Instrument Serif (editorial), local JetBrains Mono Bold (code/labels), then the
  `--font-cjk` system stack for CJK. `next/font/google` downloads at build time,
  so builds need network access.
- Theme state is `data-theme` on `<html>` and is set before paint by
  `ThemeScript`; preserve `suppressHydrationWarning` on the root element.
- JSX text beginning with `//` violates `react/jsx-no-comment-textnodes`; render
  it as an expression such as `{"// DOC"}`.
- `SiteHeader` lives inside `<main>` as a borderless, non-sticky row —
  header/body/footer share one paper surface. Its mobile panel must stay a
  sibling element (fixed-position inside a transformed/filtered ancestor can be
  trapped by its containing block).

## Deploy
- Deployment is Vercel native Git integration, not a repository workflow.
- Keep `vercel.json` limited to the Next.js framework preset. An
  `outputDirectory: "out"` bypasses the Next.js builder and breaks API routing.
