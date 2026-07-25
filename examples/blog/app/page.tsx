import { ArticleList, FaqGroupView } from "@reactdays/react";
import { reactdays } from "./reactdays";

// Revalidate the home page at most once a minute.
export const revalidate = 60;

export default async function HomePage() {
  // Fetch the latest articles and the FAQ groups in parallel.
  const [articlesPage, faqGroups] = await Promise.all([
    reactdays.listArticles({ limit: 6 }),
    reactdays.listFaqGroups(),
  ]);

  // Load the entries for each FAQ group so we can render them on the page.
  const faqGroupsWithEntries = await Promise.all(
    faqGroups.data.map((group) => reactdays.getFaqGroup(group.slug)),
  );

  return (
    <>
      <section className="section">
        <h2>Latest articles</h2>
        <ArticleList
          articles={articlesPage.data}
          getHref={(article) => `/blog/${article.slug}`}
          emptyState={
            <p className="notice">No articles published yet.</p>
          }
        />
      </section>

      <section className="section">
        <h2>Frequently asked questions</h2>
        {faqGroupsWithEntries.length === 0 ? (
          <p className="notice">No FAQs published yet.</p>
        ) : (
          faqGroupsWithEntries.map((group) => (
            <FaqGroupView key={group.id} group={group} />
          ))
        )}
      </section>
    </>
  );
}
