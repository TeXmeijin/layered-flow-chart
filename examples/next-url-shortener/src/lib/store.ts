/**
 * In-memory data store for links and click analytics.
 *
 * Uses Maps for O(1) lookups by slug. Data is lost on server restart,
 * which is fine for this demo application.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface Link {
  slug: string;
  originalUrl: string;
  createdAt: string;
}

export interface Click {
  timestamp: string;
  referrer: string | null;
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  ip: string;
}

export interface LinkWithClicks extends Link {
  clickCount: number;
}

export interface AnalyticsSummary {
  link: Link;
  totalClicks: number;
  timeline: TimelineBucket[];
  topReferrers: ReferrerStat[];
  deviceBreakdown: DeviceStat[];
  browserBreakdown: BrowserStat[];
  osBreakdown: OsStat[];
}

export interface TimelineBucket {
  hour: string; // ISO string truncated to hour
  clicks: number;
}

export interface ReferrerStat {
  referrer: string;
  count: number;
}

export interface DeviceStat {
  deviceType: string;
  count: number;
}

export interface BrowserStat {
  browser: string;
  count: number;
}

export interface OsStat {
  os: string;
  count: number;
}

// ─── Storage ─────────────────────────────────────────────────────────

const links = new Map<string, Link>();
const clicks = new Map<string, Click[]>();

// ─── Link Operations ─────────────────────────────────────────────────

export function createLink(slug: string, originalUrl: string): Link {
  const link: Link = {
    slug,
    originalUrl,
    createdAt: new Date().toISOString(),
  };
  links.set(slug, link);
  clicks.set(slug, []);
  return link;
}

export function getLink(slug: string): Link | undefined {
  return links.get(slug);
}

export function getAllLinks(): LinkWithClicks[] {
  const result: LinkWithClicks[] = [];
  for (const link of links.values()) {
    const linkClicks = clicks.get(link.slug) ?? [];
    result.push({ ...link, clickCount: linkClicks.length });
  }
  // Most recent first
  result.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return result;
}

export function slugExists(slug: string): boolean {
  return links.has(slug);
}

// ─── Click Operations ────────────────────────────────────────────────

export function recordClick(slug: string, click: Click): void {
  const existing = clicks.get(slug);
  if (existing) {
    existing.push(click);
  }
}

export function getClicks(slug: string): Click[] {
  return clicks.get(slug) ?? [];
}

// ─── Analytics ───────────────────────────────────────────────────────

export function getAnalytics(slug: string): AnalyticsSummary | null {
  const link = links.get(slug);
  if (!link) return null;

  const slugClicks = clicks.get(slug) ?? [];

  return {
    link,
    totalClicks: slugClicks.length,
    timeline: buildTimeline(slugClicks),
    topReferrers: buildReferrerStats(slugClicks),
    deviceBreakdown: buildDeviceStats(slugClicks),
    browserBreakdown: buildBrowserStats(slugClicks),
    osBreakdown: buildOsStats(slugClicks),
  };
}

// ─── Analytics Helpers ───────────────────────────────────────────────

function buildTimeline(clickList: Click[]): TimelineBucket[] {
  const buckets = new Map<string, number>();

  for (const click of clickList) {
    const date = new Date(click.timestamp);
    // Truncate to hour
    date.setMinutes(0, 0, 0);
    const hourKey = date.toISOString();
    buckets.set(hourKey, (buckets.get(hourKey) ?? 0) + 1);
  }

  const timeline: TimelineBucket[] = [];
  for (const [hour, count] of buckets) {
    timeline.push({ hour, clicks: count });
  }
  timeline.sort(
    (a, b) => new Date(a.hour).getTime() - new Date(b.hour).getTime()
  );
  return timeline;
}

function buildReferrerStats(clickList: Click[]): ReferrerStat[] {
  const counts = new Map<string, number>();

  for (const click of clickList) {
    const ref = click.referrer ?? "Direct";
    counts.set(ref, (counts.get(ref) ?? 0) + 1);
  }

  const stats: ReferrerStat[] = [];
  for (const [referrer, count] of counts) {
    stats.push({ referrer, count });
  }
  stats.sort((a, b) => b.count - a.count);
  return stats.slice(0, 10);
}

function buildDeviceStats(clickList: Click[]): DeviceStat[] {
  const counts = new Map<string, number>();

  for (const click of clickList) {
    const device = click.deviceType;
    counts.set(device, (counts.get(device) ?? 0) + 1);
  }

  const stats: DeviceStat[] = [];
  for (const [deviceType, count] of counts) {
    stats.push({ deviceType, count });
  }
  stats.sort((a, b) => b.count - a.count);
  return stats;
}

function buildBrowserStats(clickList: Click[]): BrowserStat[] {
  const counts = new Map<string, number>();

  for (const click of clickList) {
    const browser = click.browser || "Unknown";
    counts.set(browser, (counts.get(browser) ?? 0) + 1);
  }

  const stats: BrowserStat[] = [];
  for (const [browser, count] of counts) {
    stats.push({ browser, count });
  }
  stats.sort((a, b) => b.count - a.count);
  return stats;
}

function buildOsStats(clickList: Click[]): OsStat[] {
  const counts = new Map<string, number>();

  for (const click of clickList) {
    const os = click.os || "Unknown";
    counts.set(os, (counts.get(os) ?? 0) + 1);
  }

  const stats: OsStat[] = [];
  for (const [os, count] of counts) {
    stats.push({ os, count });
  }
  stats.sort((a, b) => b.count - a.count);
  return stats;
}
