# Blog example

A Next.js App Router site that renders ReactDays content:

- **Home page** (`app/page.tsx`): a grid of the latest articles and a FAQ
  section, both fetched in a Server Component.
- **Article page** (`app/blog/[slug]/page.tsx`): a single article with SEO
  metadata generated from the CMS fields.

## Run it

```bash
cp .env.example .env.local
# fill in REACTDAYS_API_KEY, REACTDAYS_ORG, REACTDAYS_PROJECT
npm install
npm run dev
```

Open http://localhost:3000.

## What to look at

- `app/reactdays.ts` builds one `ReactDaysClient` from environment variables.
- The home page calls `listArticles`, `listFaqGroups`, and `getFaqGroup`, then
  renders with the `ArticleList` and `FaqGroupView` components.
- The article page uses `getArticle` plus `ArticleContent`, and maps
  `article_not_found` to a Next.js 404 via `notFound()`.
