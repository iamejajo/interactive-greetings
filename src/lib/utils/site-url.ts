const LOCAL_URL = "http://localhost:3000";

/**
 * Public base URL of the site, without a trailing slash.
 *
 * Prefers an explicit NEXT_PUBLIC_SITE_URL, then Vercel's production domain,
 * then the per-deployment Vercel URL (previews), then localhost.
 */
export function getSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);

  const vercelHost =
    env.VERCEL_ENV === "production"
      ? env.VERCEL_PROJECT_PRODUCTION_URL
      : env.VERCEL_URL;
  if (vercelHost) return `https://${stripTrailingSlash(vercelHost)}`;

  return LOCAL_URL;
}

/** Absolute URL for an app path, e.g. absoluteUrl("/v/a8K29x"). */
export function absoluteUrl(
  path: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl(env)}${normalizedPath}`;
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
