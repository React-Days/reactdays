import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent, ReactDaysApiError } from "@reactdays/react";
import { reactdays } from "../../reactdays";

export const revalidate = 300;

type Props = { params: { slug: string } };

async function loadArticle(slug: string) {
  try {
    return await reactdays.getArticle(slug);
  } catch (err) {
    if (err instanceof ReactDaysApiError && err.code === "article_not_found") {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await loadArticle(params.slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.seo_title ?? article.title,
    description: article.seo_description ?? article.summary ?? undefined,
    openGraph: {
      images: article.seo_og_image_url
        ? [article.seo_og_image_url]
        : article.cover_image_url
          ? [article.cover_image_url]
          : undefined,
    },
    alternates: article.canonical_url
      ? { canonical: article.canonical_url }
      : undefined,
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await loadArticle(params.slug);
  if (!article) notFound();

  const published = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(article.published_at));

  return (
    <article className="article-body">
      <Link href="/" className="back-link">
        Back to blog
      </Link>
      <h1>{article.title}</h1>
      <p className="meta">
        {article.author?.display_name ? `${article.author.display_name} - ` : ""}
        {published}
        {article.reading_time_minutes != null
          ? ` - ${article.reading_time_minutes} min read`
          : ""}
      </p>
      <ArticleContent html={article.body_html} />
    </article>
  );
}
