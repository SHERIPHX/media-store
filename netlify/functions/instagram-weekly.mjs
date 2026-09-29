// Runs automatically once a week: pulls the latest posts + views/likes/saves.
import { refreshAll } from "../lib/instagram.mjs";

export default async () => {
  const feed = await refreshAll();
  console.log(`Instagram refreshed: ${feed.items.length} posts`);
};

export const config = { schedule: "@weekly" };
