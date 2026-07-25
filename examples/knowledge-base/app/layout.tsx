import type { Metadata } from "next";
import Link from "next/link";
import "@reactdays/react/styles.css";
import "./globals.css";
import { reactdays } from "./reactdays";
import { KbTree } from "./KbTree";

export const metadata: Metadata = {
  title: "Acme Support",
  description: "Knowledge base powered by the ReactDays CMS.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The tree is shared across every page, so we fetch it in the layout.
  const tree = await reactdays.getKbTree();

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="inner">
            <Link href="/" style={{ textDecoration: "none" }}>
              Acme Support
            </Link>
          </div>
        </header>
        <div className="layout">
          <aside className="sidebar">
            <h3>Knowledge base</h3>
            <KbTree nodes={tree} />
          </aside>
          <div className="content">{children}</div>
        </div>
      </body>
    </html>
  );
}
