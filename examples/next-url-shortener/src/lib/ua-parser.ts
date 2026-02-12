/**
 * User-Agent string parser.
 *
 * Parses browser name, version, OS, and device type from raw
 * User-Agent strings WITHOUT any external dependencies.
 *
 * This is the most complex module in the app, with extensive
 * branching logic for different browsers, operating systems,
 * and device form factors.
 */

// ─── Types ───────────────────────────────────────────────────────────

export interface ParsedUA {
  browser: string;
  browserVersion: string;
  os: string;
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
}

// ─── Main Parser ─────────────────────────────────────────────────────

export function parseUserAgent(ua: string | null): ParsedUA {
  if (!ua) {
    return {
      browser: "Unknown",
      browserVersion: "",
      os: "Unknown",
      deviceType: "unknown",
    };
  }

  return {
    browser: detectBrowser(ua),
    browserVersion: detectBrowserVersion(ua),
    os: detectOS(ua),
    deviceType: detectDeviceType(ua),
  };
}

// ─── Browser Detection ───────────────────────────────────────────────

/**
 * Detect the browser name from a User-Agent string.
 *
 * Order matters: more specific browsers must be checked before
 * generic ones. For example, Edge and Opera both contain "Chrome"
 * in their UA strings, so they must be checked first.
 */
function detectBrowser(ua: string): string {
  // Edge (Chromium-based) - must check before Chrome
  if (ua.includes("Edg/") || ua.includes("Edge/")) {
    return "Edge";
  }

  // Opera / Opera GX - must check before Chrome
  if (ua.includes("OPR/") || ua.includes("Opera/")) {
    return "Opera";
  }

  // Samsung Internet - must check before Chrome
  if (ua.includes("SamsungBrowser/")) {
    return "Samsung Internet";
  }

  // UC Browser - must check before Chrome
  if (ua.includes("UCBrowser/") || ua.includes("UCWEB/")) {
    return "UC Browser";
  }

  // Brave - identifies as Chrome but includes "Brave" (in some versions)
  if (ua.includes("Brave/")) {
    return "Brave";
  }

  // Vivaldi - must check before Chrome
  if (ua.includes("Vivaldi/")) {
    return "Vivaldi";
  }

  // Yandex Browser
  if (ua.includes("YaBrowser/")) {
    return "Yandex Browser";
  }

  // Firefox Focus / Firefox for iOS
  if (ua.includes("FxiOS/")) {
    return "Firefox";
  }

  // Chrome for iOS
  if (ua.includes("CriOS/")) {
    return "Chrome";
  }

  // Standard Firefox
  if (ua.includes("Firefox/") && !ua.includes("Seamonkey/")) {
    return "Firefox";
  }

  // Safari - must check after Chrome, Edge, Opera
  // Safari UA contains "Safari/" but Chrome also does, so check for "Chrome/" absence
  if (
    ua.includes("Safari/") &&
    !ua.includes("Chrome/") &&
    !ua.includes("Chromium/")
  ) {
    return "Safari";
  }

  // Standard Chrome / Chromium (checked after all Chromium-based browsers)
  if (ua.includes("Chrome/") || ua.includes("Chromium/")) {
    return "Chrome";
  }

  // Internet Explorer
  if (ua.includes("MSIE ") || ua.includes("Trident/")) {
    return "Internet Explorer";
  }

  // Bots and crawlers
  if (
    ua.includes("Googlebot") ||
    ua.includes("bingbot") ||
    ua.includes("Slurp") ||
    ua.includes("DuckDuckBot") ||
    ua.includes("Baiduspider")
  ) {
    return "Bot";
  }

  // curl, wget, etc
  if (ua.startsWith("curl/") || ua.startsWith("Wget/")) {
    return "CLI";
  }

  return "Unknown";
}

// ─── Browser Version Detection ───────────────────────────────────────

/**
 * Extract the browser version string.
 *
 * Maps each known browser to the UA token that contains its version.
 */
function detectBrowserVersion(ua: string): string {
  const browser = detectBrowser(ua);

  const versionPatterns: Record<string, RegExp> = {
    Edge: /Edg(?:e)?\/(\d+[\d.]*)/,
    Opera: /OPR\/(\d+[\d.]*)|Opera\/(\d+[\d.]*)/,
    "Samsung Internet": /SamsungBrowser\/(\d+[\d.]*)/,
    "UC Browser": /UCBrowser\/(\d+[\d.]*)/,
    Brave: /Brave\/(\d+[\d.]*)/,
    Vivaldi: /Vivaldi\/(\d+[\d.]*)/,
    "Yandex Browser": /YaBrowser\/(\d+[\d.]*)/,
    Firefox: /Firefox\/(\d+[\d.]*)|FxiOS\/(\d+[\d.]*)/,
    Chrome: /Chrome\/(\d+[\d.]*)|CriOS\/(\d+[\d.]*)/,
    Safari: /Version\/(\d+[\d.]*)/,
    "Internet Explorer": /MSIE (\d+[\d.]*)|rv:(\d+[\d.]*)/,
    CLI: /curl\/(\d+[\d.]*)|Wget\/(\d+[\d.]*)/,
  };

  const pattern = versionPatterns[browser];
  if (!pattern) return "";

  const match = ua.match(pattern);
  if (!match) return "";

  // Return the first matched group (some patterns have alternatives)
  for (let i = 1; i < match.length; i++) {
    if (match[i]) return match[i];
  }

  return "";
}

// ─── OS Detection ────────────────────────────────────────────────────

/**
 * Detect the operating system from the User-Agent string.
 *
 * Checks platform tokens within the parenthesized section of the UA.
 */
function detectOS(ua: string): string {
  // iOS detection - must be before macOS since iPad can masquerade
  if (
    ua.includes("iPhone") ||
    ua.includes("iPad") ||
    ua.includes("iPod") ||
    ua.includes("FxiOS") ||
    ua.includes("CriOS")
  ) {
    // Extract iOS version
    const iosMatch = ua.match(/OS (\d+[_\d]*)/);
    if (iosMatch) {
      const version = iosMatch[1].replace(/_/g, ".");
      return `iOS ${version}`;
    }
    return "iOS";
  }

  // Android
  if (ua.includes("Android")) {
    const androidMatch = ua.match(/Android (\d+[\d.]*)/);
    if (androidMatch) {
      return `Android ${androidMatch[1]}`;
    }
    return "Android";
  }

  // Windows
  if (ua.includes("Windows")) {
    if (ua.includes("Windows NT 10.0")) {
      // Could be Windows 10 or 11, but UA doesn't distinguish reliably
      return "Windows 10+";
    }
    if (ua.includes("Windows NT 6.3")) return "Windows 8.1";
    if (ua.includes("Windows NT 6.2")) return "Windows 8";
    if (ua.includes("Windows NT 6.1")) return "Windows 7";
    if (ua.includes("Windows NT 6.0")) return "Windows Vista";
    if (ua.includes("Windows NT 5.1") || ua.includes("Windows XP")) {
      return "Windows XP";
    }
    return "Windows";
  }

  // macOS (checked after iOS to avoid iPad misdetection)
  if (ua.includes("Macintosh") || ua.includes("Mac OS X")) {
    const macMatch = ua.match(/Mac OS X (\d+[_\d]*)/);
    if (macMatch) {
      const version = macMatch[1].replace(/_/g, ".");
      return `macOS ${version}`;
    }
    return "macOS";
  }

  // Chrome OS
  if (ua.includes("CrOS")) {
    return "Chrome OS";
  }

  // Linux distributions
  if (ua.includes("Ubuntu")) return "Ubuntu Linux";
  if (ua.includes("Fedora")) return "Fedora Linux";
  if (ua.includes("Linux")) return "Linux";

  // FreeBSD
  if (ua.includes("FreeBSD")) return "FreeBSD";

  return "Unknown";
}

// ─── Device Type Detection ───────────────────────────────────────────

/**
 * Detect the device form factor.
 *
 * Uses a combination of UA tokens and heuristics to classify
 * the device as mobile, tablet, or desktop.
 */
function detectDeviceType(
  ua: string
): "desktop" | "mobile" | "tablet" | "unknown" {
  // ── Tablet indicators ──────────────────────────────────────────

  // iPad (explicit)
  if (ua.includes("iPad")) {
    return "tablet";
  }

  // Android tablets typically do NOT include "Mobile" in the UA
  if (ua.includes("Android") && !ua.includes("Mobile")) {
    return "tablet";
  }

  // Kindle / Silk browser (Amazon tablets)
  if (ua.includes("Kindle") || ua.includes("Silk/")) {
    return "tablet";
  }

  // ── Mobile indicators ──────────────────────────────────────────

  // Explicit mobile tokens
  if (
    ua.includes("iPhone") ||
    ua.includes("iPod") ||
    ua.includes("Windows Phone") ||
    ua.includes("BlackBerry") ||
    ua.includes("BB10")
  ) {
    return "mobile";
  }

  // Android with "Mobile" token
  if (ua.includes("Android") && ua.includes("Mobile")) {
    return "mobile";
  }

  // Generic mobile keywords
  if (
    ua.includes("Mobile") ||
    ua.includes("Opera Mini") ||
    ua.includes("Opera Mobi") ||
    ua.includes("IEMobile")
  ) {
    return "mobile";
  }

  // Mobile browser tokens
  if (ua.includes("FxiOS") || ua.includes("CriOS")) {
    // iOS browsers are always mobile (or tablet, but iPad is caught above)
    return "mobile";
  }

  // ── Desktop indicators ─────────────────────────────────────────

  if (
    ua.includes("Windows NT") ||
    ua.includes("Macintosh") ||
    ua.includes("X11") ||
    ua.includes("CrOS") ||
    ua.includes("Linux") // Linux without Android
  ) {
    // Exclude cases already caught above
    if (!ua.includes("Android")) {
      return "desktop";
    }
  }

  // ── Bots and CLI tools ─────────────────────────────────────────

  if (
    ua.includes("bot") ||
    ua.includes("Bot") ||
    ua.includes("crawl") ||
    ua.includes("spider") ||
    ua.startsWith("curl/") ||
    ua.startsWith("Wget/")
  ) {
    return "unknown";
  }

  return "unknown";
}
