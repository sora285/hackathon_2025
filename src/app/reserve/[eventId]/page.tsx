// app/reserve/[eventId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import liff from "@line/liff";
import { initLiff, getUserId } from "@/lib/liff";
import { postReservation } from "@/lib/api";

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
            } catch (e: any) {
                console.error(e);
                setMsg("❌ エラー: " + (e?.message ?? ""));
            }
        })();
    }, [eventId, router]);

    return (
        <main style={{ padding: 16 }}>
            <h1>予約</h1>
            <div style={{ marginBottom: 12 }}>{msg}</div>
            <button onClick={() => router.replace("/")} style={{ padding: "8px 12px" }}>
                一覧へ戻る
            </button>
        </main>
    );
}