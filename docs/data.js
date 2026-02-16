const LEVELS = {
  root: {
    title: 'URL Shortener Architecture',
    description: 'Next.js App Router — click nodes to drill down',
    nodes: [
      { id: 'frontend', title: 'Frontend\n(React)', description: 'Home page & Analytics page', icon: '\u{1F5A5}', color: '#3B82F6', x: 12, y: 50, techs: ['React', 'Next.js'], file: 'src/app/page.tsx', hasChildren: true },
      { id: 'api-links', title: 'API Route\n/api/links', description: 'Create & list short URLs', icon: '\u{1F517}', color: '#8B5CF6', x: 37, y: 30, techs: ['Next.js'], file: 'src/app/api/links/route.ts', hasChildren: true },
      { id: 'api-redirect', title: 'API Route\n/api/r/[slug]', description: 'Redirect & record click analytics', icon: '\u2197', color: '#EF4444', x: 37, y: 70, techs: ['Next.js'], file: 'src/app/api/r/[slug]/route.ts', hasChildren: true },
      { id: 'api-analytics', title: 'API Route\n/api/analytics', description: 'Aggregated click statistics', icon: '\u{1F4CA}', color: '#F59E0B', x: 62, y: 30, techs: ['Next.js'], file: 'src/app/api/analytics/[slug]/route.ts', hasChildren: false, input: 'slug param', output: 'AnalyticsSummary', details: ['Timeline (hourly buckets)', 'Top referrers (top 10)', 'Device / Browser / OS breakdown'] },
      { id: 'store', title: 'In-Memory\nStore', description: 'Maps for links & clicks', icon: '\u{1F4BE}', color: '#10B981', x: 88, y: 50, techs: ['TypeScript'], file: 'src/lib/store.ts', hasChildren: true },
      { id: 'note-boundary', title: 'Network boundary', description: 'Indigo arrows = HTTP fetch across client/server boundary', icon: '\u{1F4CC}', color: '#F59E0B', x: 24, y: 50, annotation: true },
    ],
    connections: [
      { from: 'frontend', to: 'api-links', boundary: true, label: 'fetch' },
      { from: 'frontend', to: 'api-redirect', boundary: true, label: 'navigate' },
      { from: 'frontend', to: 'api-analytics', boundary: true, label: 'fetch' },
      { from: 'api-links', to: 'store' },
      { from: 'api-redirect', to: 'store' },
      { from: 'api-analytics', to: 'store' },
    ]
  },

  'frontend': {
    title: 'Frontend Layer',
    description: 'React components with client-side state management',
    nodes: [
      { id: 'fe-home', title: 'Home Page', description: 'URL input form + link list', icon: '\u{1F3E0}', color: '#3B82F6', x: 15, y: 35, techs: ['React', 'useState'], file: 'src/app/page.tsx:56', hasChildren: false, input: 'User types URL', output: 'Short URL displayed', details: ['Form with URL input', 'POST /api/links on submit', 'Shows created short URL', 'Auto-refreshes link list'] },
      { id: 'fe-linklist', title: 'Link List', description: 'All created URLs with click counts', icon: '\u{1F4CB}', color: '#3B82F6', x: 50, y: 35, techs: ['React', 'useEffect'], file: 'src/app/page.tsx:64', hasChildren: false, input: 'GET /api/links response', output: 'Rendered card grid', details: ['fetchLinks() on mount', 'Shows slug, original URL, click count', 'Links to analytics page'] },
      { id: 'fe-analytics', title: 'Analytics Page', description: 'Per-link click analytics dashboard', icon: '\u{1F4CA}', color: '#F59E0B', x: 85, y: 35, techs: ['React', 'useEffect'], file: 'src/app/analytics/[slug]/page.tsx:82', hasChildren: false, input: 'slug from URL params', output: 'Charts & tables', details: ['5s auto-refresh interval', 'Hourly timeline bar chart', 'Top referrers table', 'Device/Browser/OS breakdown'] },
      { id: 'fe-layout', title: 'Root Layout', description: 'Shared header & metadata', icon: '\u{1F4D0}', color: '#94A3B8', x: 50, y: 75, techs: ['Next.js'], file: 'src/app/layout.tsx', hasChildren: false, details: ['Metadata: title, description', 'Shared header with nav', 'Wraps all pages'] },
    ],
    connections: [
      { from: 'fe-home', to: 'fe-linklist', label: 'refreshes' },
      { from: 'fe-linklist', to: 'fe-analytics', label: 'navigate' },
    ]
  },

  'api-links': {
    title: 'POST /api/links — Create Short URL',
    description: 'Validation \u2192 slug generation \u2192 storage pipeline',
    nodes: [
      { id: 'al-parse', title: 'Parse Request', description: 'Extract URL from JSON body', icon: '1', color: '#8B5CF6', x: 10, y: 50, techs: ['Next.js'], file: 'src/app/api/links/route.ts:19', hasChildren: false, input: '{ url: string }', output: 'body.url' },
      { id: 'al-validate', title: 'Validate URL', description: 'Format, protocol & hostname checks', icon: '2', color: '#8B5CF6', x: 28, y: 50, techs: ['TypeScript'], file: 'src/lib/validators.ts:18', hasChildren: false, input: 'raw URL string', output: '{ valid, error? }', details: ['Empty string check', 'Max 2048 chars', 'new URL() syntax parse', 'http/https only', 'Hostname must contain "."'] },
      { id: 'al-slug', title: 'Generate Slug', description: 'crypto.randomBytes \u2192 6-char slug', icon: '3', color: '#8B5CF6', x: 46, y: 50, techs: ['crypto'], file: 'src/lib/slug.ts:23', hasChildren: false, input: 'length (default 6)', output: '"abc123"', details: ['randomBytes(length)', 'Map to 62-char alphabet', 'a-z, A-Z, 0-9'] },
      { id: 'al-dedup', title: 'Dedup Check', description: 'Retry if slug already exists (max 10)', icon: '4', color: '#8B5CF6', x: 64, y: 50, techs: ['TypeScript'], file: 'src/app/api/links/route.ts:39', hasChildren: false, input: 'slug', output: 'unique slug', details: ['while loop max 10 attempts', 'slugExists() check', 'Regenerate if collision'] },
      { id: 'al-store', title: 'Create Link', description: 'Store link + init empty clicks array', icon: '5', color: '#10B981', x: 82, y: 50, techs: ['TypeScript'], file: 'src/lib/store.ts:72', hasChildren: false, input: 'slug, originalUrl', output: 'Link object', details: ['links.set(slug, link)', 'clicks.set(slug, [])'] },
      { id: 'al-error', title: '400 Error', description: 'Return validation error', icon: '\u26A0', color: '#EF4444', x: 28, y: 82, hasChildren: false, details: ['Invalid URL format', 'Missing protocol', 'Bad hostname'] },
    ],
    connections: [
      { from: 'al-parse', to: 'al-validate' },
      { from: 'al-validate', to: 'al-slug' },
      { from: 'al-slug', to: 'al-dedup' },
      { from: 'al-dedup', to: 'al-store' },
      { from: 'al-validate', to: 'al-error', dashed: true, label: 'invalid' },
    ]
  },

  'api-redirect': {
    title: 'GET /api/r/[slug] — Redirect Flow',
    description: 'Lookup \u2192 analytics recording \u2192 302 redirect',
    nodes: [
      { id: 'ar-lookup', title: 'Lookup Slug', description: 'Find original URL in store', icon: '1', color: '#EF4444', x: 12, y: 40, techs: ['TypeScript'], file: 'src/app/api/r/[slug]/route.ts:19', hasChildren: false, input: 'slug from URL param', output: 'Link | undefined' },
      { id: 'ar-ua', title: 'Parse User-Agent', description: 'Extract browser, OS, device type', icon: '2', color: '#EF4444', x: 35, y: 40, techs: ['TypeScript'], file: 'src/lib/ua-parser.ts:23', hasChildren: false, input: 'User-Agent header', output: 'ParsedUA', details: ['detectBrowser(): 44-step chain', 'detectBrowserVersion(): regex map', 'detectOS(): 15+ patterns', 'detectDeviceType(): mobile/desktop/tablet'] },
      { id: 'ar-headers', title: 'Extract Headers', description: 'Referrer & IP from request', icon: '3', color: '#EF4444', x: 58, y: 40, techs: ['Next.js'], file: 'src/app/api/r/[slug]/route.ts:33', hasChildren: false, input: 'Request headers', output: 'referrer, ip', details: ['Referer header', 'X-Forwarded-For (comma split)', 'X-Real-IP fallback', 'Default: "unknown"'] },
      { id: 'ar-record', title: 'Record Click', description: 'Push click data to store', icon: '4', color: '#10B981', x: 81, y: 40, techs: ['TypeScript'], file: 'src/lib/store.ts:106', hasChildren: false, input: 'slug + Click object', output: 'void', details: ['timestamp', 'browser + version', 'OS', 'deviceType', 'referrer', 'IP'] },
      { id: 'ar-redirect', title: '302 Redirect', description: 'Navigate to original URL', icon: '\u2197', color: '#14B8A6', x: 81, y: 72, techs: ['Next.js'], file: 'src/app/api/r/[slug]/route.ts:53', hasChildren: false, output: 'Location: originalUrl' },
      { id: 'ar-404', title: '404 Not Found', description: 'Slug does not exist', icon: '\u26A0', color: '#EF4444', x: 12, y: 72, hasChildren: false },
    ],
    connections: [
      { from: 'ar-lookup', to: 'ar-ua' },
      { from: 'ar-ua', to: 'ar-headers' },
      { from: 'ar-headers', to: 'ar-record' },
      { from: 'ar-record', to: 'ar-redirect' },
      { from: 'ar-lookup', to: 'ar-404', dashed: true, label: 'not found' },
    ]
  },

  'store': {
    title: 'In-Memory Store',
    description: 'Map-based data layer with aggregation functions',
    nodes: [
      { id: 'st-links', title: 'Links Map', description: 'Map<slug, Link>', icon: '\u{1F5C2}', color: '#10B981', x: 20, y: 30, techs: ['TypeScript'], file: 'src/lib/store.ts:66', hasChildren: false, details: ['createLink()', 'getLink()', 'getAllLinks()', 'slugExists()'] },
      { id: 'st-clicks', title: 'Clicks Map', description: 'Map<slug, Click[]>', icon: '\u{1F4CA}', color: '#10B981', x: 20, y: 70, techs: ['TypeScript'], file: 'src/lib/store.ts:67', hasChildren: false, details: ['recordClick()', 'getClicks()'] },
      { id: 'st-timeline', title: 'Build Timeline', description: 'Group clicks by hour', icon: '\u23F1', color: '#F59E0B', x: 55, y: 22, techs: ['TypeScript'], file: 'src/lib/store.ts:138', hasChildren: false, input: 'Click[]', output: 'TimelineEntry[]', details: ['Bucket by hour (ISO string)', 'Sort ascending'] },
      { id: 'st-referrers', title: 'Build Referrers', description: 'Top 10 referrer domains', icon: '\u{1F310}', color: '#F59E0B', x: 55, y: 44, techs: ['TypeScript'], file: 'src/lib/store.ts:159', hasChildren: false, input: 'Click[]', output: 'ReferrerStat[]', details: ['Count per referrer', 'Sort desc', 'Slice top 10'] },
      { id: 'st-device', title: 'Build Device\nStats', description: 'Mobile / Desktop / Tablet', icon: '\u{1F4F1}', color: '#F59E0B', x: 55, y: 66, techs: ['TypeScript'], file: 'src/lib/store.ts:175', hasChildren: false, input: 'Click[]', output: 'DeviceStat[]' },
      { id: 'st-browser', title: 'Build Browser\nStats', description: 'Chrome, Firefox, Safari...', icon: '\u{1F30D}', color: '#F59E0B', x: 85, y: 33, techs: ['TypeScript'], file: 'src/lib/store.ts:191', hasChildren: false, input: 'Click[]', output: 'BrowserStat[]' },
      { id: 'st-os', title: 'Build OS\nStats', description: 'Windows, macOS, Linux...', icon: '\u{1F4BB}', color: '#F59E0B', x: 85, y: 66, techs: ['TypeScript'], file: 'src/lib/store.ts:207', hasChildren: false, input: 'Click[]', output: 'OsStat[]' },
      { id: 'st-summary', title: 'getAnalytics()', description: 'Orchestrates all aggregations', icon: '\u{1F4C8}', color: '#8B5CF6', x: 85, y: 50, techs: ['TypeScript'], file: 'src/lib/store.ts:119', hasChildren: false, input: 'slug', output: 'AnalyticsSummary' },
    ],
    connections: [
      { from: 'st-links', to: 'st-summary' },
      { from: 'st-clicks', to: 'st-timeline' },
      { from: 'st-clicks', to: 'st-referrers' },
      { from: 'st-clicks', to: 'st-device' },
      { from: 'st-timeline', to: 'st-summary' },
      { from: 'st-referrers', to: 'st-summary' },
      { from: 'st-device', to: 'st-summary' },
      { from: 'st-browser', to: 'st-summary' },
      { from: 'st-os', to: 'st-summary' },
    ]
  },
};

const HEADER_LOGO = 'URL Shortener';
document.title = 'URL Shortener Architecture | Layered Flow Chart';
