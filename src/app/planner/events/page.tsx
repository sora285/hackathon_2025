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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export default function PlannerEventsPage() {
    const guard = useLiffGuard();
    const [events, setEvents] = useState<EventItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (guard.status !== "authed") return;

        (async () => {
            try {
                setError(null);

                // 誰でも企画一覧を見せるなら scope=planner とか無しでOK
                // 自分が作ったものだけ見せたいなら ?createdBy=... を付ける
                const res = await fetch(`${API_BASE}/events?createdBy=${encodeURIComponent(guard.userId)}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setEvents(data.items ?? data);
            } catch (e: unknown){
                if (e instanceof Error) {
                    setError(e.message || "取得に失敗しました");
                } else {
                    setError("取得に失敗しました");
                }
            }
        })();
    }, [guard.status]);

    if (guard.status === "loading") return <div style={{ padding: 16 }}>読み込み中...</div>;
    if (guard.status === "denied") return <div style={{ padding: 16 }}>アクセス不可：{guard.reason}</div>;

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700 }}>企画イベント一覧</h1>

                <Link
                    href="/planner/events/new"
                    style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: "1px solid #111",
                        background: "#111",
                        color: "#fff",
                        textDecoration: "none",
                    }}
                >
                    ＋ イベント作成
                </Link>
            </div>

            {error && <div style={{ marginTop: 12 }}>エラー：{error}</div>}

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {events.map((e) => (
                    <div key={e.eventId} style={{ padding: 12, border: "1px solid #ddd", borderRadius: 14 }}>
                        <div style={{ fontWeight: 700 }}>{e.title}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>{e.area} / {e.place}</div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                            {new Date(e.startAt).toLocaleString("ja-JP")} 〜 {new Date(e.endAt).toLocaleString("ja-JP")}
                        </div>
                        <div style={{ fontSize: 12, color: "#666" }}>
                            定員 {e.capacity} / {e.status === "DRAFT" ? "下書き" : "公開"}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}