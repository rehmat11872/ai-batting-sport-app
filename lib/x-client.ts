/**
 * Minimal X/Twitter API client for server-side usage.
 * Uses app-only bearer token from env (X_BEARER_TOKEN).
 */
export async function searchRecentTweets(query: string) {
  const bearer = process.env.X_BEARER_TOKEN;
  if (!bearer) {
    throw new Error("Missing X_BEARER_TOKEN in environment");
  }

  const params = new URLSearchParams({
    query,
    "tweet.fields": "created_at,lang,entities,public_metrics",
    "user.fields": "username,name,profile_image_url,verified",
    expansions: "author_id",
    max_results: "50",
  });

  const res = await fetch(`https://api.x.com/2/tweets/search/recent?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("X API search error", res.status, body);
    throw new Error(`X API search failed: ${res.status}`);
  }

  return res.json();
}

