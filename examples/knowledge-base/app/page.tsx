import Link from "next/link";
import type { KbNode } from "@reactdays/react";
import { reactdays } from "./reactdays";

export const revalidate = 60;

// Flatten the tree to the pages a reader can actually open.
function collectPages(nodes: KbNode[]): KbNode[] {
  return nodes.flatMap((node) => [
    ...(node.type === "page" ? [node] : []),
    ...collectPages(node.children),
  ]);
}

export default async function KbHome() {
  const tree = await reactdays.getKbTree();
  const pages = collectPages(tree);

  return (
    <div className="content">
      <h1>How can we help?</h1>
      <p>Browse the knowledge base using the menu, or start with a page below.</p>

      {pages.length === 0 ? (
        <p className="notice">No knowledge-base pages published yet.</p>
      ) : (
        <ul>
          {pages.slice(0, 12).map((page) => (
            <li key={page.id}>
              <Link href={`/kb${page.path}`}>{page.title}</Link>
              {page.summary ? ` - ${page.summary}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
