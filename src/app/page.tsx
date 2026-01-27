"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

export default function Page() {
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          setError("NEXT_PUBLIC_LIFF_ID が未設定です");
          return;
        }

        await liff.init({ liffId });

        if (!liff.isLoggedIn()) {
          // LIFF内で未ログインならログインさせる
          liff.login();
          return;
        }

        const profile = await liff.getProfile();
        setUserId(profile.userId); // ←これが userId
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "LIFF error");
      }
    })();
  }, []);

  return (
      <main style={{ padding: 16 }}>
        <h1>LIFF userId テスト</h1>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <p>userId: {userId ? userId : "取得中..."}</p>
      </main>
  );
}