export class Leaderboard {
  constructor(state, env) {
    this.state = state;
  }

  // Aylık key oluştur (örn: "2024-05")
  getMonthlyKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const monthlyKey = this.getMonthlyKey();

    // POST isteği - yeni skor ekle veya güncelle
    if (request.method === "POST") {
      const { userId, nickname, score } = await request.json(); // userId'yi al

      // Validasyon (userId, nickname ve score kontrolü)
      if (!userId || !nickname || typeof score !== "number" || score < 0) {
        // Geçersiz veri, userId de artık zorunlu
        return new Response(
          "Geçersiz veri: userId, nickname veya score eksik/hatalı",
          { status: 400 }
        );
      }

      // Nickname'i temizle (XSS koruması)
      const cleanNickname = nickname.trim().slice(0, 20);

      // Mevcut aylık verileri al
      let monthlyData = (await this.state.storage.get(monthlyKey)) || {
        entries: [],
      };

      // Kullanıcının mevcut kaydını userId'ye göre bul
      const existingEntryIndex = monthlyData.entries.findIndex(
        (entry) => entry.userId === userId
      );

      if (existingEntryIndex !== -1) {
        // Eğer kayıt varsa, skoru ve nickname'i güncelle
        // Sadece yeni skor daha yüksekse veya nickname değişmişse güncelle
        const existingEntry = monthlyData.entries[existingEntryIndex];
        if (
          score > existingEntry.score ||
          existingEntry.nickname !== cleanNickname
        ) {
          monthlyData.entries[existingEntryIndex] = {
            userId: userId, // userId'yi koru
            nickname: cleanNickname, // Nickname'i güncelle
            score: score,
            updatedAt: Date.now(),
          };
        }
      } else {
        // Yeni kullanıcı ekle
        monthlyData.entries.push({
          userId: userId, // userId'yi kaydet
          nickname: cleanNickname,
          score: score,
          updatedAt: Date.now(),
        });
      }

      // Skorları sırala (en yüksekten en düşüğe)
      monthlyData.entries.sort((a, b) => b.score - a.score);

      // Sadece ilk 100 skoru tut
      monthlyData.entries = monthlyData.entries.slice(0, 100);

      // Verileri kaydet
      await this.state.storage.put(monthlyKey, monthlyData);

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET isteği - skorları getir
    if (request.method === "GET") {
      const monthlyData = (await this.state.storage.get(monthlyKey)) || {
        entries: [],
      };

      // GET isteğinde userId'yi döndürme (isteğe bağlı, gizlilik için)
      const publicEntries = monthlyData.entries.map((entry) => ({
        nickname: entry.nickname,
        score: entry.score,
      }));

      // Son güncelleme zamanını ekle
      const response = {
        entries: publicEntries,
        month: monthlyKey,
        lastUpdated: Date.now(),
      };

      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}
