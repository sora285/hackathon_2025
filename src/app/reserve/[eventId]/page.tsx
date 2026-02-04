// app/reserve/[eventId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useParams, useRouter } from "next/navigation";
import liff from "@line/liff";
import { initLiff, getUserId } from "@/lib/liff";
import { postReservation } from "@/lib/api";

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#0b1220",
  },
  container: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "24px 16px 64px",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
    fontSize: 18,
    lineHeight: 1.6,
    display: "grid",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 34,
    lineHeight: 1.2,
    letterSpacing: "-0.01em",
  },
  card: {
    border: "2px solid #cbd5e1",
    borderRadius: 18,
    padding: 18,
    background: "#ffffff",
    boxShadow: "0 1px 0 rgba(15, 23, 42, 0.06)",
    display: "grid",
    gap: 12,
  },
  message: {
    padding: "14px 16px",
    borderRadius: 14,
    border: "2px solid #cbd5e1",
    background: "#ffffff",
    color: "#0b1220",
    fontSize: 20,
  },
  hint: {
    margin: 0,
    color: "#334155",
    fontSize: 18,
  },
  buttonRow: {
    display: "grid",
    gap: 12,
  },
  button: {
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
  buttonSecondary: {
    padding: "16px 16px",
    borderRadius: 16,
    border: "2px solid #0b1220",
    background: "#ffffff",
    color: "#0b1220",
    fontSize: 20,
    fontWeight: 900,
    cursor: "pointer",
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

export default function ReservePage() {
    const params = useParams<{ eventId: string }>();
    const router = useRouter();
    const [msg, setMsg] = useState("予約処理中...");
    const eventId = params.eventId;

    useEffect(() => {
        (async () => {
            try {
                await initLiff();
                if (!liff.isLoggedIn()) {
                    router.replace("/login");
                    return;
                }

                const userId = await getUserId();
                const res = await postReservation(eventId, userId);

                if (res.ok) setMsg("✅ 予約完了！");
                else if (res.code === 409) setMsg("⚠️ 満員 / すでに予約済み / クローズ");
                else setMsg(`❌ 予約失敗: ${res.code} ${res.text ?? ""}`);
            } catch (e: unknown) {
                console.error(e);
                setMsg("❌ エラー: " + getErrorMessage(e));
            }
        })();
    }, [eventId, router]);

    return (
      <main style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>予約</h1>

          <div style={styles.card}>
            <p style={styles.hint}>処理結果が表示されるまで、そのままお待ちください。</p>
            <div style={styles.message} aria-live="polite">
              {msg}
            </div>

            <div style={styles.buttonRow}>
              <button type="button" onClick={() => router.replace("/")} style={styles.button}>
                一覧へ戻る
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.location.reload();
                }}
                style={styles.buttonSecondary}
              >
                もう一度試す
              </button>
            </div>
          </div>
        </div>
      </main>
    );
}