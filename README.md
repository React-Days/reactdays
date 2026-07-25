# @reactdays/react

Official React SDK for the [ReactDays](https://reactdays.com) CMS. Render the
articles, knowledge base, FAQs, and categories you publish from the ReactDays
dashboard on your own site: your domain, your design system, your build pipeline.
We host the editor; you own the front end.

> This repository is the open-source home of the ReactDays ecosystem and the
> official React SDK. For the product roadmap see [ROADMAP.md](./ROADMAP.md); to
> contribute see [CONTRIBUTING.md](./CONTRIBUTING.md). Full API docs live at
> [reactdays.com/docs](https://reactdays.com/docs).

## Features

- Typed API client for every endpoint. Works in Node 18+, edge, and the browser.
- Use the client directly in React Server Components (no client-side JavaScript).
- Client hooks (`useArticles`, `useArticle`, `useKbPage`, and more) via `@reactdays/react/client`.
- Presentational components: `ArticleList`, `ArticleContent`, `FaqGroupView`, `CategoryList`.
- Pass `{ next: { revalidate } }` straight through to `fetch` for Next.js caching.
- No runtime dependencies (uses the platform `fetch`).

## Install

```bash
npm install @reactdays/react
```

Requires React 18 or later (a peer dependency).

## Configuration

Create a public-read API key in your dashboard at
`/dashboard/orgs/<your-org>/settings?tab=developers`, then add your values to a
`.env` file (see [.env.example](./.env.example)):

```dotenv
REACTDAYS_API_KEY=rd_pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACTDAYS_ORG=acme
REACTDAYS_PROJECT=marketing-site
# optional, defaults to https://api.reactdays.com/v1
REACTDAYS_BASE_URL=https://api.reactdays.com/v1
```

| Variable | Required | Description |
| --- | --- | --- |
| `REACTDAYS_API_KEY` | Yes | Public-read API key (`rd_pk_...`). Also accepts `NEXT_PUBLIC_REACTDAYS_API_KEY`. |
| `REACTDAYS_ORG` | Yes | Org slug/ID. Aliases: `REACTDAYS_ORG_ID`, `NEXT_PUBLIC_REACTDAYS_ORG`. |
| `REACTDAYS_PROJECT` | Yes | Project slug/ID. Aliases: `REACTDAYS_PROJECT_ID`, `NEXT_PUBLIC_REACTDAYS_PROJECT`. |
| `REACTDAYS_BASE_URL` | No | Override the API base URL. Alias: `NEXT_PUBLIC_REACTDAYS_BASE_URL`. |

With these set, construct the client without arguments and it reads the
environment automatically. Options passed in code always override env vars:

```ts
import { ReactDaysClient } from "@reactdays/react";

const client = new ReactDaysClient();                     // all from .env
const staging = new ReactDaysClient({ project: "docs" }); // override one field
```

Note on browser use: bundlers only inline vars with a public prefix. For client
components, set the `NEXT_PUBLIC_REACTDAYS_*` variants, and only expose the API
key client-side once your org's origin allowlist is configured. To opt out of
env resolution entirely, pass `env: false`.

## Quick start

### React Server Components

```tsx
// app/blog/page.tsx
import { ReactDaysClient, ArticleList } from "@reactdays/react";

const client = new ReactDaysClient(); // reads REACTDAYS_* from the environment

export default async function BlogPage() {
  const { data: articles } = await client.listArticles(
    { limit: 12 },
    { next: { revalidate: 60 } }, // Next.js edge caching
  );

  return <ArticleList articles={articles} getHref={(a) => `/blog/${a.slug}`} />;
}
```

```tsx
// app/blog/[slug]/page.tsx
import { ReactDaysClient, ArticleContent, ReactDaysApiError } from "@reactdays/react";
import { notFound } from "next/navigation";

const client = new ReactDaysClient(); // reads REACTDAYS_* from the environment

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  try {
    const article = await client.getArticle(params.slug, { next: { revalidate: 300 } });
    return (
      <article>
        <h1>{article.title}</h1>
        <ArticleContent html={article.body_html} />
      </article>
    );
  } catch (err) {
    if (err instanceof ReactDaysApiError && err.code === "article_not_found") notFound();
    throw err;
  }
}
```

### Client components (hooks)

Wrap your tree in the provider, then use hooks. Because these run in the browser,
the API key must be allowlisted for your origin in the dashboard.

```tsx
"use client";
import { ReactDaysProvider, useArticles } from "@reactdays/react/client";

function Feed() {
  const { data, loading, error } = useArticles({ limit: 10 });
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong.</p>;
  return (
    <ul>
      {data!.data.map((a) => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}

export function App() {
  // With NEXT_PUBLIC_REACTDAYS_* set, the provider needs no options.
  return (
    <ReactDaysProvider>
      <Feed />
    </ReactDaysProvider>
  );
}
```

### Optional default styles

The components are unstyled by default (namespaced `.rd-*` classes). To use the
bundled theme:

```ts
import "@reactdays/react/styles.css";
```

## API client

```ts
// Any option omitted falls back to its REACTDAYS_* environment variable.
const client = new ReactDaysClient({ apiKey, org, project /*, baseUrl, fetch, headers, env */ });
```

| Method | Returns | Endpoint |
| --- | --- | --- |
| `listArticles(params?, opts?)` | `ListResponse<ArticleSummary>` | `GET .../articles` |
| `listAllArticles(params?, opts?)` | `AsyncGenerator<ArticleSummary>` | auto-paginates |
| `getArticle(slug, opts?)` | `Article` | `GET .../articles/:slug` |
| `listCategories(opts?)` | `Category[]` | `GET .../categories` |
| `getCategory(slug, opts?)` | `CategoryDetail` | `GET .../categories/:slug` |
| `listFaqGroups(params?, opts?)` | `ListResponse<FaqGroupSummary>` | `GET .../faq-groups` |
| `getFaqGroup(slug, opts?)` | `FaqGroup` | `GET .../faq-groups/:slug` |
| `getKbTree(opts?)` | `KbNode[]` | `GET .../kb` |
| `getKbPage(path, opts?)` | `KbPage` | `GET .../kb/by-path/...` |

Every method accepts a `RequestOptions` object: `{ signal, cache, next, headers }`.

## Components (server-safe)

Exported from the package root; safe in Server Components (no client JS).

- `<ArticleList articles getHref? renderItem? emptyState? />`
- `<ArticleCard article href? formatDate? hideImage? />`
- `<ArticleContent html />` renders pre-sanitized `body_html`.
- `<FaqGroupView group defaultOpen? hideHeader? />` renders a native `<details>` accordion.
- `<CategoryList categories getHref? showDescription? />`

## Hooks (client)

Exported from `@reactdays/react/client`: `useArticles`, `useArticle`,
`useCategories`, `useCategory`, `useFaqGroups`, `useFaqGroup`, `useKbTree`,
`useKbPage`. Each returns `{ data, error, loading, refetch }`.

## Error handling

Failed requests throw `ReactDaysApiError` with a stable `.code`, `.status`, and
`.retryAfterSeconds` (on 429). Branch on `.code`, never on `.message`.

## Security

- Keep your API key server-side unless the org origin allowlist is configured.
- For browser use, add each hostname in the dashboard and expose the key via a
  `NEXT_PUBLIC_`-style public env var.
- `body_html` and `answer_html` are pre-sanitized by the API; still apply your own CSP.

## License

MIT. See [LICENSE](./LICENSE).
