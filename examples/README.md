# Examples

Runnable integration samples for [`@reactdays/react`](https://www.npmjs.com/package/@reactdays/react).

| Example | What it shows |
| --- | --- |
| [`blog`](./blog) | A marketing site whose home page renders the latest articles and a FAQ section, plus article detail pages. |
| [`knowledge-base`](./knowledge-base) | A support/help center that renders the knowledge-base tree and individual pages by path. |

Both are Next.js App Router apps that fetch content in Server Components using
the SDK's `ReactDaysClient`.

## Running an example

```bash
cd examples/blog          # or examples/knowledge-base
cp .env.example .env.local
# edit .env.local with your API key, org, and project
npm install
npm run dev
```

Then open http://localhost:3000.

Get an API key and your org/project slugs from your dashboard at
`/dashboard/orgs/<your-org>/settings?tab=developers`.
