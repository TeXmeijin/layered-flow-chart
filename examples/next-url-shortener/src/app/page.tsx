"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";

// ─── Types ───────────────────────────────────────────────────────────

interface LinkItem {
  slug: string;
  originalUrl: string;
  createdAt: string;
  clickCount: number;
}

// ─── Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "24px",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "10px 14px",
  fontSize: "16px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: 600,
  backgroundColor: "#1a1a2e",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const tagStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#e8f4f8",
  color: "#1a6b8a",
  padding: "2px 8px",
  borderRadius: "4px",
  fontSize: "13px",
  fontWeight: 600,
};

// ─── Component ───────────────────────────────────────────────────────

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all links
  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(data.links ?? []);
    } catch {
      // Silently fail on fetch error
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Create a new short URL
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      const shortUrl = `${window.location.origin}/api/r/${data.slug}`;
      setSuccess(shortUrl);
      setUrl("");
      fetchLinks();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Create Short URL Form ──────────────────────────────── */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Shorten a URL</h2>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", gap: "12px", alignItems: "center" }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            style={inputStyle}
          />
          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? "Creating..." : "Shorten"}
          </button>
        </form>

        {error && (
          <p
            style={{
              marginTop: "12px",
              color: "#d32f2f",
              fontSize: "14px",
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        )}

        {success && (
          <div
            style={{
              marginTop: "12px",
              padding: "12px 16px",
              backgroundColor: "#e8f5e9",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <strong>Short URL created: </strong>
            <a
              href={success}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2e7d32", wordBreak: "break-all" }}
            >
              {success}
            </a>
          </div>
        )}
      </div>

      {/* ── Links List ─────────────────────────────────────────── */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "16px" }}>Your Links</h2>

        {links.length === 0 ? (
          <p style={{ color: "#888", margin: 0 }}>
            No links created yet. Shorten a URL above to get started.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {links.map((link) => (
              <div
                key={link.slug}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "#fafafa",
                  borderRadius: "6px",
                  border: "1px solid #eee",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <code
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#1a1a2e",
                      }}
                    >
                      /api/r/{link.slug}
                    </code>
                    <span style={tagStyle}>{link.clickCount} clicks</span>
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      marginTop: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {link.originalUrl}
                  </div>
                </div>
                <a
                  href={`/analytics/${link.slug}`}
                  style={{
                    marginLeft: "12px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    fontWeight: 600,
                    backgroundColor: "#e8f4f8",
                    color: "#1a6b8a",
                    border: "none",
                    borderRadius: "4px",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Analytics
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
