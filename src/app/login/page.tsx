// app/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireLogin } from "@/lib/liff";

export default function LoginPage() {
    const router = useRouter();
    const [msg, setMsg] = useState("LIFF 初期化中...");

    useEffect(() => {
        (async () => {
            try {
                const ok = await requireLogin();
                if (!ok) return; // login画面へ飛んだ
                setMsg("ログイン済み！ホームへ移動します...");
                router.replace("/"); // ホームへ
            } catch (e: any) {
                console.error(e);
                setMsg("ログイン処理でエラー: " + (e?.message ?? ""));
            }
        })();
    }, [router]);

    return <main style={{ padding: 16 }}>{msg}</main>;
}