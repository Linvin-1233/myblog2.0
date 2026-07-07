<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# myblog2.0

Markdown-driven static blog. Next.js 16 (App Router) + React 19 + TypeScript +
Tailwind v4. Deployed on Vercel via native Git integration — blog pages are
statically prerendered, `/api/gitalk` OAuth proxy runs as a Serverless Function.

## Commands
- `npm run dev` — dev server (localhost:3000)
- `npm run build` — build; emits static pages + bundles
- `npm run lint` — ESLint (flat config, runs `eslint` with no args)
- No typecheck script (`tsc` is `noEmit`). No test setup exists.

## Code style (enforced by request, not tooling)
- camelCase variables.
- Max 800 lines/file, max 100 chars/line.
- Comments explain WHY/HOW, never WHAT. Existing files follow this — match it.

## Static-export constraints (easy to break)
- **No `output: 'export'`** on Vercel. The Next.js builder auto-generates static
  HTML for pages with `generateStaticParams` and runs Route Handlers
  (`app/api/gitalk`) as Serverless Functions on demand. To deploy to a plain
  static server, add `output: 'export'` back in `next.config.ts`.
- `next/image` is set to `unoptimized`; keep it that way.
- `trailingSlash: true` — real output is `/posts/slug/index.html`. Keep sitemap
  URLs and links consistent with trailing slashes.
- Dynamic segments (`[slug]`, `[tag]`) require `generateStaticParams`. In Next 16
  `params` is a Promise — `await` it.

## Content model
- Posts are `posts/*.md`. Filename = URL slug (`welcome.md` -> `/posts/welcome/`).
- Frontmatter fields (see `lib/posts.ts` `normalizeMeta`): `title`, `description`,
  `date` (YYYY-MM-DD), optional `updated`, `tags` (array or comma string),
  `cover`, `draft`. `draft: true` is hidden in production builds only.
- Site-wide content lives in `config.yml` (repo root), loaded by `lib/siteConfig.ts`
  at build time via `js-yaml` (named import `load`; v4 has no default export).
  It holds `site.*` (name/title/desc/author/locale/url/pagination), `copyright`
  (`{year}` placeholder), `social[]`, `about` (markdown), and `gitalk`.
  `lib/siteConfig.ts` uses `fs` — server-only; never import it in a client
  component (pass needed values as props, e.g. `gitalkConfig` -> `Comments`).
- Adding a post = drop a `.md` in `posts/` and rebuild. No code changes needed.

## Images
- Put images in `posts/images/` (any subfolders). Reference them in markdown with
  the `images/` prefix: `![alt](images/foo.png)`.
- `scripts/optimize-images.mjs` (runs before `dev`/`build` via npm scripts, plain
  `.mjs` so any Node runs it) compresses each image with `sharp`, keeping the
  original format/extension, into `public/post-images/` (gitignored, regenerated).
- `lib/markdown.ts` rewrites rendered `src="images/..."` -> `/post-images/...`.
  Keep the prefix mapping and the output dir name in sync if you change either.

## Comments (Gitalk)
- `app/components/Comments.tsx` (client) renders Gitalk (GitHub-Issues based).
  `gitalk` is dynamically imported inside `useEffect` (touches `window`; must not
  run during prerender); the CSS is a top-level side-effect import.
- Enabled only when `config.yml` `gitalk.enable` + repo/owner are set.
  `clientID`/`clientSecret` come from `NEXT_PUBLIC_GITALK_*` env vars (see
  `.env.example`), falling back to `config.yml`. Note: Gitalk's `clientSecret` is
  bundled client-side by design — env only keeps it out of git.
- Set `gitalk.proxy: true` to route OAuth token exchange through
  `/api/gitalk` (helps mainland China accessibility).

## Architecture
- `lib/siteConfig.ts` — single source for title/description/author/URL, social
  links, pagination sizes. Site URL comes from `NEXT_PUBLIC_SITE_URL` env
  (falls back to blog.linvin.net). Used by all SEO/metadata.
- `lib/posts.ts` — build-time markdown loading via `fs` (server-only). Sorting,
  tags, year grouping.
- `lib/markdown.ts` — `marked` + `marked-highlight` + `highlight.js`, configured
  once at module load. Rendered HTML is trusted (own repo), injected via
  `dangerouslySetInnerHTML`; no runtime sanitization.
- `app/components/*` — poster-style UI. `PostCard` is intentionally NOT a client
  component so the client `PostList` can reuse it.
- Theme: dark/light via `data-theme` on `<html>`. `ThemeScript` sets it pre-paint
  (no FOUC); `ThemeToggle` persists to localStorage. Colors are CSS variables in
  `app/globals.css` exposed to Tailwind via `@theme inline` (e.g. `bg-poster-bg`).
  Rendered markdown is styled by the `.post-content` block, not Tailwind classes.

## SEO
- `app/layout.tsx` sets `metadataBase` + title template + OG/Twitter defaults.
- Per-post `generateMetadata` + `BlogPosting` JSON-LD in `app/posts/[slug]`.
- `app/sitemap.ts`, `app/robots.ts`, `app/feed.xml/route.ts` (RSS).

## Conventions
- Import alias `@/*` maps to repo root.
- Tailwind v4: no `tailwind.config.js`; theme tokens via `@theme` in
  `app/globals.css`.
- JSX text starting with `//` trips `react/jsx-no-comment-textnodes` — wrap as
  `{"// ..."}`.

## Deploy
- Hosted on Vercel via native Git integration (NO GitHub Action). Vercel runs
  `next build` — pages are statically prerendered, `/api/gitalk` runs as a
  Serverless Function on demand.
- `vercel.json` only pins `framework: nextjs`. Do NOT add `outputDirectory: out`
  — that bypasses the Next.js builder and breaks routing.
- Set `NEXT_PUBLIC_SITE_URL` in Vercel Project Settings > Environment Variables
  (drives canonical/OG/sitemap absolute URLs). `trailingSlash: true` matches
  Vercel's static serving.
