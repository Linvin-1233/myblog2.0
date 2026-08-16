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
- Theme state is `data-theme` on `<html>` and is set before paint by
  `ThemeScript`; preserve `suppressHydrationWarning` on the root element.
- JSX text beginning with `//` violates `react/jsx-no-comment-textnodes`; render
  it as an expression such as `{"// DOC"}`.

## Deploy
- Deployment is Vercel native Git integration, not a repository workflow.
- Keep `vercel.json` limited to the Next.js framework preset. An
  `outputDirectory: "out"` bypasses the Next.js builder and breaks API routing.
