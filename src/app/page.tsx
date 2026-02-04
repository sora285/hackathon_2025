// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { initLiff } from "@/lib/liff";
import liff from "@line/liff";
import { fetchEvents } from "@/lib/api";

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#0b1220",
  },
  container: {
    maxWidth: 920,
    margin: "0 auto",
    padding: "24px 16px 64px",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
    fontSize: 18,
    lineHeight: 1.6,
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: "8px 0 0",
    fontSize: 18,
    color: "#334155",
  },
  searchBar: {
    display: "grid",
    gap: 12,
    alignItems: "center",
    padding: 16,
    border: "2px solid #cbd5e1",
    borderRadius: 16,
    background: "#f8fafc",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: 14,
    border: "2px solid #94a3b8",
    outline: "none",
    background: "#ffffff",
    fontSize: 20,
    lineHeight: 1.4,
  },
  button: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "2px solid #0b1220",
    background: "#0b1220",
    color: "#ffffff",
    fontSize: 20,
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 56,
  },
  buttonSecondary: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "2px solid #0b1220",
    background: "#ffffff",
    color: "#0b1220",
    fontSize: 18,
    fontWeight: 800,
    cursor: "pointer",
    minHeight: 56,
  },
  message: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "2px solid #cbd5e1",
    background: "#ffffff",
    color: "#0b1220",
    marginBottom: 16,
    fontSize: 18,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
  },
  card: {
    border: "2px solid #cbd5e1",
    borderRadius: 18,
    padding: 18,
    background: "#ffffff",
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardTop: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 900,
    margin: 0,
    lineHeight: 1.35,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 16,
    fontWeight: 900,
    border: "2px solid #0b1220",
    background: "#ffffff",
    color: "#0b1220",
    whiteSpace: "nowrap",
  },
  meta: {
    display: "grid",
    gap: 8,
    color: "#0b1220",
    fontSize: 18,
  },
  metaRow: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    color: "#0b1220",
    fontSize: 18,
  },
  ctaRow: {
    display: "flex",
    gap: 12,
    marginTop: 6,
  },
  cta: {
    flex: 1,
    padding: "16px 16px",
    borderRadius: 16,
    border: "2px solid #0b1220",
    background: "#0b1220",
    color: "#ffffff",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
    minHeight: 60,
  },
  ctaDisabled: {
    flex: 1,
    padding: "16px 16px",
    borderRadius: 16,
    border: "2px solid #94a3b8",
    background: "#e2e8f0",
    color: "#334155",
    fontSize: 22,
    fontWeight: 900,
    cursor: "not-allowed",
    minHeight: 60,
  },
};

function getErrorMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return String(e);
}

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
      } catch (e: unknown) {
        console.error(e);
        setMsg("読み込み失敗: " + getErrorMessage(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onReserve = (pk: string) => {
    const eventId = eventIdFromPK(pk);
    router.push(`/reserve/${encodeURIComponent(eventId)}`);
  };

  return (
      <main style={styles.page}>
        <div style={styles.container}>
          <div style={styles.headerRow}>
            <div>
              <h1 style={styles.title}>イベント一覧</h1>
              <p style={styles.subtitle}>地域名を入力して「検索」を押してください（例：横浜市）</p>
            </div>
            <button
                type="button"
                onClick={() => {
                  // 軽いUX: 一番上へ
                  if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={styles.buttonSecondary}
            >
              ↑ Top
            </button>
          </div>

          <div style={styles.searchBar}>
            <label htmlFor="area" style={{ fontSize: 18, fontWeight: 800 }}>
              地域名
            </label>
            <input
                id="area"
                inputMode="search"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="例: 横浜市"
                aria-label="検索エリア"
                style={styles.input}
            />
            <button
                type="button"
                onClick={async () => {
                  try {
                    setMsg("");
                    const data = await fetchEvents(area);
                    setEvents(data);
                  } catch (e: unknown) {
                    setMsg("検索失敗: " + getErrorMessage(e));
                  }
                }}
                style={styles.button}
            >
              検索
            </button>
          </div>

          {msg && <div style={styles.message}>{msg}</div>}

          <ul style={styles.list}>
            {events.map((ev) => {
              const canJoin = ev.status !== "full" && ev.status !== "closed";
              return (
                  <li key={ev.PK} style={styles.card}>
                    <div style={styles.cardTop}>
                      <h2 style={styles.cardTitle}>{ev.title}</h2>
                      <span style={styles.badge}>{ev.status}</span>
                    </div>

                    <div style={styles.meta}>
                      <div>{ev.place}</div>
                      <div>
                        {ev.startAt} 〜 {ev.endAt}
                      </div>
                    </div>

                    <div style={styles.metaRow}>
                      <span>定員</span>
                      <span>
                    {ev.capacity} / 状態: {ev.status}
                  </span>
                    </div>

                    <div style={styles.ctaRow}>
                      <button
                          type="button"
                          onClick={() => onReserve(ev.PK)}
                          style={canJoin ? styles.cta : styles.ctaDisabled}
                          disabled={!canJoin}
                      >
                        {canJoin ? "参加する" : "受付終了"}
                      </button>
                    </div>
                  </li>
              );
            })}
          </ul>
        </div>
      </main>
  );
}