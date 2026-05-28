export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return !!url && url !== "https://dummy.supabase.co" && !!anonKey && anonKey !== "dummy";
}

export function isGoogleOAuthLikelyConfigured(): boolean {
  // Returns true if Supabase is properly configured and Google OAuth is not explicitly disabled
  return isSupabaseConfigured() && process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ACTIVE !== "false";
}

export function getAuthRedirectBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  // Safe server-side fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  if (siteUrl) {
    const formatted = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
    return formatted.replace(/\/$/, "");
  }
  return "https://naliai.vercel.app";
}
