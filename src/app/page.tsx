// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { initLiff } from "@/lib/liff";
import liff from "@line/liff";
import { fetchEvents } from "@/lib/api";

type EventItem = {
  PK: string; // EVENT#...
  title: string;
  area: string;
  place: string;
  startAt: string;
  endAt: string;
  capacity: number;
  status: string;
};

const DEFAULT_AREA = process.env.NEXT_PUBLIC_DEFAULT_AREA ?? "横浜市";

const eventIdFromPK = (pk: string) => (pk.startsWith("EVENT#") ? pk.slice(6) : pk);

export default function HomePage() {
  const router = useRouter();
  const [area, setArea] = useState(DEFAULT_AREA);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await initLiff();
        if (!liff.isLoggedIn()) {
          router.replace("/login");
          return;
        }

        const data = await fetchEvents(area);
        setEvents(data);
      } catch (e: any) {
        console.error(e);
        setMsg("読み込み失敗: " + (e?.message ?? ""));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReserve = (pk: string) => {
    const eventId = eventIdFromPK(pk);
    router.push(`/reserve/${encodeURIComponent(eventId)}`);
  };

  return (
      <main style={{ padding: 16, fontFamily: "sans-serif" }}>
        <h1>イベント一覧</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={area} onChange={(e) => setArea(e.target.value)} style={{ padding: 8 }} />
          <button
              onClick={async () => {
                try {
                  setMsg("");
                  const data = await fetchEvents(area);
                  setEvents(data);
                } catch (e: any) {
                  setMsg("検索失敗: " + (e?.message ?? ""));
                }
              }}
              style={{ padding: "8px 12px" }}
          >
            検索
          </button>
        </div>

        {msg && <div style={{ marginBottom: 12 }}>{msg}</div>}

        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
          {events.map((ev) => (
              <li key={ev.PK} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 12 }}>
                <div style={{ fontWeight: 700 }}>{ev.title}</div>
                <div>{ev.place}</div>
                <div>{ev.startAt} 〜 {ev.endAt}</div>
                <div>定員: {ev.capacity} / 状態: {ev.status}</div>

                <button onClick={() => onReserve(ev.PK)} style={{ marginTop: 10, padding: "8px 12px" }}>
                  参加する
                </button>
              </li>
          ))}
        </ul>
      </main>
  );
}