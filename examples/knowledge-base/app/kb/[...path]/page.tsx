import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent, ReactDaysApiError } from "@reactdays/react";
import { reactdays } from "../../reactdays";

export const revalidate = 300;

type Props = { params: { path: string[] } };

async function loadPage(path: string[]) {
  try {
    return await reactdays.getKbPage(path);
  } catch (err) {
    if (err instanceof ReactDaysApiError && err.code === "page_not_found") {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await loadPage(params.path);
  if (!page) return { title: "Not found" };
  return {
    title: page.seo_title ?? page.title,
    description: page.seo_description ?? page.summary ?? undefined,
  };
}

export default async function KbPageRoute({ params }: Props) {
  const page = await loadPage(params.path);
  if (!page) notFound();

  return (
    <article className="article-body">
      <nav className="breadcrumbs">
        <Link href="/">Support</Link>
        {page.breadcrumbs.map((crumb) => (
          <span key={crumb.id}> / {crumb.title}</span>
        ))}
        {` / ${page.title}`}
      </nav>
      <h1>{page.title}</h1>
      <ArticleContent html={page.body_html} />
    </article>
  );
}
