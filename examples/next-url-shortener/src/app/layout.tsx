import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Shortener",
  description: "Shorten URLs and track click analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          backgroundColor: "#f5f5f5",
          color: "#333",
          minHeight: "100vh",
        }}
      >
        <header
          style={{
            backgroundColor: "#1a1a2e",
            color: "#fff",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <a
            href="/"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            URL Shortener
          </a>
          <span style={{ color: "#888", fontSize: "14px" }}>
            Click Analytics Demo
          </span>
        </header>
        <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
