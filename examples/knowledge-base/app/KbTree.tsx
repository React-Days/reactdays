import Link from "next/link";
import type { KbNode } from "@reactdays/react";

// Recursively renders the KB tree as a nested list. Pages link to their route;
// groups are shown as labels (a group is a container, not a page with a body).
export function KbTree({ nodes }: { nodes: KbNode[] }) {
  if (nodes.length === 0) return null;
  return (
    <ul className="kb-tree">
      {nodes.map((node) => (
        <li key={node.id}>
          {node.type === "page" ? (
            <Link href={`/kb${node.path}`}>{node.title}</Link>
          ) : (
            <span className="group-label">{node.title}</span>
          )}
          {node.children.length > 0 ? <KbTree nodes={node.children} /> : null}
        </li>
      ))}
    </ul>
  );
}
