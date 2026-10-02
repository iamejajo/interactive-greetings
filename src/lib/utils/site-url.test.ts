import { describe, expect, it } from "vitest";
import { absoluteUrl, getSiteUrl } from "./site-url";

const env = (vars: Record<string, string>) => vars as NodeJS.ProcessEnv;

describe("getSiteUrl", () => {
  it("falls back to localhost", () => {
    expect(getSiteUrl(env({}))).toBe("http://localhost:3000");
  });

  it("prefers NEXT_PUBLIC_SITE_URL and strips trailing slashes", () => {
    expect(
      getSiteUrl(
        env({
          NEXT_PUBLIC_SITE_URL: "https://example.com//",
          VERCEL_URL: "preview.vercel.app",
        }),
      ),
    ).toBe("https://example.com");
  });

  it("uses the production domain on Vercel production", () => {
    expect(
      getSiteUrl(
        env({
          VERCEL_ENV: "production",
          VERCEL_PROJECT_PRODUCTION_URL: "app.example.com",
          VERCEL_URL: "app-abc123.vercel.app",
        }),
      ),
    ).toBe("https://app.example.com");
  });

  it("uses the deployment URL on Vercel previews", () => {
    expect(
      getSiteUrl(
        env({ VERCEL_ENV: "preview", VERCEL_URL: "app-abc123.vercel.app" }),
      ),
    ).toBe("https://app-abc123.vercel.app");
  });
});

describe("absoluteUrl", () => {
  it("joins base and path with exactly one slash", () => {
    const e = env({ NEXT_PUBLIC_SITE_URL: "https://example.com/" });
    expect(absoluteUrl("/v/a8K29x", e)).toBe("https://example.com/v/a8K29x");
    expect(absoluteUrl("v/a8K29x", e)).toBe("https://example.com/v/a8K29x");
  });
});
