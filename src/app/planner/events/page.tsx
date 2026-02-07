"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiffGuard } from "../_components/useLiffGuard";

type EventItem = {
    eventId: string;
    title: string;
    area: string;
    place: string;
    startAt: string;
    endAt: string;
    capacity: number;
    status: "DRAFT" | "PUBLISHED";
    createdBy?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

// noinspection HtmlUnknownTarget
const NEW_EVENT_HREF = "/planner/events/new";

export default function PlannerEventsPage() {
    const guard = useLiffGuard();
    const status = guard.status;
    const userId = "userId" in guard ? guard.userId : undefined;
    const reason = "reason" in guard ? guard.reason : undefined;
    const [events, setEvents] = useState<EventItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== "authed") return;

        if (!userId) {
            setError("ユーザーIDが取得できませんでした");
            setLoading(false);
            return;
        }

        if (!API_BASE) {
            setError("NEXT_PUBLIC_API_BASE が未設定です");
            setLoading(false);
            return;
        }

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(
                    `${API_BASE}/events?createdBy=${encodeURIComponent(userId)}`
                );
                if (!res.ok) {
                    setError("HTTP " + String(res.status));
                    return;
                }

                const data = await res.json();
                setEvents(Array.isArray(data.items) ? data.items : data ?? []);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "取得に失敗しました");
            } finally {
                setLoading(false);
            }
        })();
    }, [status, userId]);

    if (status === "loading") {
        return <div style={{ padding: 16 }}>読み込み中...</div>;
    }

    if (status === "denied") {
        return <div style={{ padding: 16 }}>アクセス不可：{reason}</div>;
    }

    return (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: 12 }}>
            {/* ヘッダー */}
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
                企画イベント一覧
            </h1>

            <Link
                href={NEW_EVENT_HREF}
                style={{
                    display: "block",
                    textAlign: "center",
                    marginBottom: 16,
                    padding: "14px",
                    borderRadius: 12,
                    background: "#111",
                    color: "#fff",
                    textDecoration: "none",
                    fontWeight: 600,
                }}
            >
                ＋ イベントを作成する
            </Link>

            {/* ローディング */}
            {loading && <div>読み込み中...</div>}

            {/* エラー */}
            {!loading && error && (
                <div
                    style={{
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #fca5a5",
                        color: "#b91c1c",
                    }}
                >
                    エラー：{error}
                </div>
            )}

            {/* 0件 */}
            {!loading && !error && events.length === 0 && (
                <div
                    style={{
                        textAlign: "center",
                        color: "#666",
                        marginTop: 24,
                    }}
                >
                    <p style={{ marginBottom: 8 }}>まだ企画イベントがありません</p>
                    <p style={{ fontSize: 12 }}>下のボタンから作成できます</p>
                </div>
            )}

            {/* 一覧 */}
            {!loading && !error && events.length > 0 && (
                <div style={{ display: "grid", gap: 12 }}>
                    {events.map((e) => (
                        <div
                            key={e.eventId}
                            style={{
                                padding: 14,
                                borderRadius: 14,
                                border: "1px solid #ddd",
                                background: "#fff",
                            }}
                        >
                            <div style={{ fontWeight: 700, fontSize: 16 }}>
                                {e.title}
                            </div>

                            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                                {e.area} / {e.place}
                            </div>

                            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                                {new Date(e.startAt).toLocaleString("ja-JP")} 〜
                                <br />
                                {new Date(e.endAt).toLocaleString("ja-JP")}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 8,
                                    fontSize: 12,
                                    color: "#666",
                                }}
                            >
                                <span>定員 {e.capacity}</span>
                                <span>
                  {e.status === "DRAFT" ? "下書き" : "公開"}
                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}