// Instagram feed — shared logic for the API route and the weekly job.
// Needs one Netlify environment variable: IG_TOKEN (Instagram long-lived token).
import { getStore } from "@netlify/blobs";

const API = "https://graph.instagram.com";
const FIELDS = "id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,like_count,comments_count,timestamp";
const WEEK = 7 * 864e5;
const URL_TTL = 2 * 864e5; // Instagram media links expire; re-sign every 2 days
const LIMIT = Number(process.env.IG_LIMIT || 12);

const store = () => getStore("instagram");
const token = async s => (await s.get("token")) || process.env.IG_TOKEN;

async function call(path, t) {
  const r = await fetch(`${API}${path}${path.includes("?") ? "&" : "?"}access_token=${t}`);
  const d = await r.json();
  if (!r.ok || d.error) throw new Error(d.error?.message || `HTTP ${r.status}`);
  return d;
}

const pick = m => ({
  id: m.id,
  type: m.media_type,
  video: m.media_type === "VIDEO" ? m.media_url : null,
  image: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url
});

async function insights(m, t) {
  const out = {};
  try {
    const r = await call(`/${m.id}/insights?metric=views,likes,saved,comments`, t);
    for (const x of r.data || []) out[x.name] = x.values?.[0]?.value ?? x.total_value?.value ?? null;
  } catch (e) {}
  return out;
}

export async function refreshAll() {
  const s = store();
  const t = await token(s);
  if (!t) throw new Error("IG_TOKEN is not set");
  const { data = [] } = await call(`/me/media?fields=${FIELDS}&limit=${LIMIT}`, t);
  const items = await Promise.all(data.map(async m => {
    const i = await insights(m, t);
    return {
      ...pick(m),
      permalink: m.permalink,
      caption: m.caption || "",
      timestamp: m.timestamp,
      views: i.views ?? null,
      likes: i.likes ?? m.like_count ?? null,
      saves: i.saved ?? null,
      comments: i.comments ?? m.comments_count ?? null
    };
  }));
  const feed = { updatedAt: Date.now(), urlsAt: Date.now(), items };
  await s.setJSON("feed", feed);
  try {
    const r = await call(`/refresh_access_token?grant_type=ig_refresh_token`, t);
    if (r.access_token) await s.set("token", r.access_token);
  } catch (e) {}
  return feed;
}

async function refreshUrls(feed) {
  const s = store();
  const t = await token(s);
  const { data = [] } = await call(`/me/media?fields=id,media_type,media_url,thumbnail_url&limit=${LIMIT}`, t);
  const fresh = Object.fromEntries(data.map(m => [m.id, pick(m)]));
  feed.items = feed.items.map(it => fresh[it.id] ? { ...it, ...fresh[it.id] } : it);
  feed.urlsAt = Date.now();
  await s.setJSON("feed", feed);
  return feed;
}

export async function getFeed() {
  const feed = await store().get("feed", { type: "json" });
  if (!feed || Date.now() - feed.updatedAt > WEEK) return refreshAll();
  if (Date.now() - feed.urlsAt > URL_TTL) {
    try { return await refreshUrls(feed); } catch (e) {}
  }
  return feed;
}
