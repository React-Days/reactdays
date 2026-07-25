import type { Metadata } from "next";
import Link from "next/link";
import "@reactdays/react/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acme Blog",
  description: "Articles and FAQs powered by the ReactDays CMS.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              Acme
            </Link>
            <nav>
              <Link href="/">Blog</Link>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
