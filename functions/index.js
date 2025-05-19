import { Leaderboard } from "./leaderboard.js";

export { Leaderboard };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // /api/leaderboard çağrılarını Durable Object'a yönlendir
    if (url.pathname.startsWith("/api/leaderboard")) {
      const id = env.LEADERBOARD.idFromName("GLOBAL");
      const stub = env.LEADERBOARD.get(id);
      return stub.fetch(request);
    }

    // Statik içeriği ASSETS binding'inden al
    return env.ASSETS.fetch(request);
  },
};
