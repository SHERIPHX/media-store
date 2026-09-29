import { getFeed } from "../lib/instagram.mjs";

export default async () => {
  try {
    const feed = await getFeed();
    return Response.json(feed, { headers: { "cache-control": "public, max-age=0", "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch (e) {
    return Response.json({ error: e.message, items: [] }, { status: 503 });
  }
};

export const config = { path: "/api/instagram" };
