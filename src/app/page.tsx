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
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 60%)",
    color: "#0f172a",
  },
  container: {
    maxWidth: 980,
    margin: "0 auto",
    padding: "24px 16px 48px",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  title: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.2,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    margin: "6px 0 0",
    fontSize: 13,
    color: "#64748b",
  },
  searchBar: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 12,
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
    marginBottom: 14,
  },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    outline: "none",
    background: "#fff",
    fontSize: 14,
  },
  button: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  buttonSecondary: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  message: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#334155",
    marginBottom: 14,
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },
  card: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 14,
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardTop: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    margin: 0,
    lineHeight: 1.35,
    letterSpacing: "-0.01em",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#334155",
    whiteSpace: "nowrap",
  },
  meta: {
    display: "grid",
    gap: 6,
    color: "#334155",
    fontSize: 13,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    color: "#475569",
    fontSize: 12,
  },
  ctaRow: {
    display: "flex",
    gap: 10,
    marginTop: 4,
  },
  cta: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#fff",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  ctaDisabled: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    background: "#e2e8f0",
    color: "#64748b",
    fontSize: 14,
    fontWeight: 800,
    cursor: "not-allowed",
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
            <p style={styles.subtitle}>エリアで検索して、参加したいイベントを見つけよう</p>
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
          <input
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
                    {ev.startAt} <span style={{ color: "#94a3b8" }}>〜</span> {ev.endAt}
                  </div>
                </div>

                <div style={styles.metaRow}>
                  <span>定員</span>
                  <span>
                    {ev.capacity} <span style={{ color: "#94a3b8" }}>/</span> 状態: {ev.status}
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