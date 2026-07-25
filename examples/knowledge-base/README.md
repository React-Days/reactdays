# Knowledge base example

A Next.js App Router support center that renders the ReactDays knowledge base:

- **Sidebar** (`app/layout.tsx` + `app/KbTree.tsx`): the full published tree,
  fetched once in the layout and shown on every page.
- **Landing page** (`app/page.tsx`): a short intro and a list of pages.
- **Page route** (`app/kb/[...path]/page.tsx`): a single KB page fetched by its
  slug path, with breadcrumbs and SEO metadata.

## Run it

```bash
cp .env.example .env.local
# fill in REACTDAYS_API_KEY, REACTDAYS_ORG, REACTDAYS_PROJECT
npm install
npm run dev
```

Open http://localhost:3000.

## What to look at

- `getKbTree` powers the sidebar and the landing page list.
- `getKbPage(path)` accepts the catch-all route segments directly.
- `page_not_found` is mapped to a Next.js 404 via `notFound()`.
