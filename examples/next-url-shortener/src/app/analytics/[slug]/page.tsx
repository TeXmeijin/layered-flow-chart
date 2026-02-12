"use client";

import { useState, useEffect, use } from "react";

// ─── Types ───────────────────────────────────────────────────────────

interface AnalyticsData {
  link: {
    slug: string;
    originalUrl: string;
    createdAt: string;
  };
  totalClicks: number;
  timeline: { hour: string; clicks: number }[];
  topReferrers: { referrer: string; count: number }[];
  deviceBreakdown: { deviceType: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  osBreakdown: { os: string; count: number }[];
}

// ─── Styles ──────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: "8px",
  padding: "24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  marginBottom: "24px",
};

const statBoxStyle: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "16px",
  backgroundColor: "#f0f4ff",
  borderRadius: "8px",
  flex: 1,
};

const statValueStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 700,
  color: "#1a1a2e",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#666",
  marginTop: "4px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "14px",
};

const thStyle: React.CSSProperties = {
  textAlign: "left" as const,
  padding: "8px 12px",
  borderBottom: "2px solid #eee",
  color: "#666",
  fontWeight: 600,
  fontSize: "12px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid #f0f0f0",
};

const barBgStyle: React.CSSProperties = {
  backgroundColor: "#eee",
  borderRadius: "4px",
  height: "8px",
  flex: 1,
};

// ─── Component ───────────────────────────────────────────────────────

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/analytics/${slug}`);
        if (!res.ok) {
          setError("Short URL not found");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load analytics");
      }
    }

    fetchAnalytics();
    // Refresh every 5 seconds
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  if (error) {
    return (
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, color: "#d32f2f" }}>{error}</h2>
        <a href="/" style={{ color: "#1a6b8a" }}>
          Back to home
        </a>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={cardStyle}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const maxTimelineClicks = Math.max(...data.timeline.map((t) => t.clicks), 1);

  return (
    <>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: "16px" }}>
        <a href="/" style={{ color: "#1a6b8a", fontSize: "14px" }}>
          &larr; Back to all links
        </a>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "8px" }}>
          Analytics for{" "}
          <code style={{ color: "#1a6b8a" }}>/api/r/{data.link.slug}</code>
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "#888",
            wordBreak: "break-all",
          }}
        >
          Destination: {data.link.originalUrl}
        </p>
      </div>

      {/* ── Summary Stats ──────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{data.totalClicks}</div>
          <div style={statLabelStyle}>Total Clicks</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{data.topReferrers.length}</div>
          <div style={statLabelStyle}>Unique Referrers</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{data.deviceBreakdown.length}</div>
          <div style={statLabelStyle}>Device Types</div>
        </div>
        <div style={statBoxStyle}>
          <div style={statValueStyle}>{data.browserBreakdown.length}</div>
          <div style={statLabelStyle}>Browsers</div>
        </div>
      </div>

      {/* ── Click Timeline ─────────────────────────────────────── */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Click Timeline</h3>
        {data.timeline.length === 0 ? (
          <p style={{ color: "#888", margin: 0 }}>No clicks recorded yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.timeline.map((bucket) => (
              <div
                key={bucket.hour}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    minWidth: "140px",
                    fontFamily: "monospace",
                  }}
                >
                  {new Date(bucket.hour).toLocaleString()}
                </span>
                <div style={barBgStyle}>
                  <div
                    style={{
                      backgroundColor: "#1a6b8a",
                      borderRadius: "4px",
                      height: "8px",
                      width: `${(bucket.clicks / maxTimelineClicks) * 100}%`,
                      minWidth: "4px",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    minWidth: "30px",
                    textAlign: "right",
                  }}
                >
                  {bucket.clicks}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Breakdown Grid ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
        }}
      >
        {/* Top Referrers */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Top Referrers</h3>
          {data.topReferrers.length === 0 ? (
            <p style={{ color: "#888", margin: 0 }}>No data yet.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Referrer</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.topReferrers.map((r) => (
                  <tr key={r.referrer}>
                    <td style={tdStyle}>
                      {r.referrer === "Direct" ? (
                        <em style={{ color: "#888" }}>Direct / None</em>
                      ) : (
                        <span style={{ wordBreak: "break-all" }}>
                          {r.referrer}
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                      {r.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Device Breakdown */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
            Device Breakdown
          </h3>
          {data.deviceBreakdown.length === 0 ? (
            <p style={{ color: "#888", margin: 0 }}>No data yet.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Device</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.deviceBreakdown.map((d) => (
                  <tr key={d.deviceType}>
                    <td style={tdStyle}>
                      {d.deviceType.charAt(0).toUpperCase() +
                        d.deviceType.slice(1)}
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                      {d.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Browser Breakdown */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
            Browser Breakdown
          </h3>
          {data.browserBreakdown.length === 0 ? (
            <p style={{ color: "#888", margin: 0 }}>No data yet.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Browser</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.browserBreakdown.map((b) => (
                  <tr key={b.browser}>
                    <td style={tdStyle}>{b.browser}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                      {b.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* OS Breakdown */}
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: "16px" }}>OS Breakdown</h3>
          {data.osBreakdown.length === 0 ? (
            <p style={{ color: "#888", margin: 0 }}>No data yet.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Operating System</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Clicks</th>
                </tr>
              </thead>
              <tbody>
                {data.osBreakdown.map((o) => (
                  <tr key={o.os}>
                    <td style={tdStyle}>{o.os}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                      {o.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
