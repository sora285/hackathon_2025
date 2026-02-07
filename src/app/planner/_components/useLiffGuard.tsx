"use client";

import { useEffect, useState } from "react";
import liff from "@line/liff";

type GuardState =
    | { status: "loading" }
    | { status: "authed"; userId: string; idToken?: string }
    | { status: "denied"; reason: string };

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID_PLANNER!;

export function useLiffGuard() {
    const [state, setState] = useState<GuardState>({ status: "loading" });

    useEffect(() => {
        (async () => {
            try {
                if (!LIFF_ID) {
                    setState({ status: "denied", reason: "NEXT_PUBLIC_LIFF_ID_PLANNER が未設定です" });
                    return;
                }
                await liff.init({ liffId: LIFF_ID });

                if (!liff.isLoggedIn()) {
                    // 参加側と同じ“ログイン挟む”動き
                    liff.login({ redirectUri: window.location.href });
                    return;
                }

                const decoded = liff.getDecodedIDToken() as { sub?: string } | null;
                if (!decoded?.sub) {
                    setState({ status: "denied", reason: "ユーザーIDが取得できませんでした" });
                    return;
                }

                setState({ status: "authed", userId: decoded.sub, idToken: liff.getIDToken() ?? undefined });
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setState({ status: "denied", reason: e.message || "不明なエラー" });
                } else {
                    setState({ status: "denied", reason: "不明なエラー" });
                }
            }
        })();
    }, []);

    return state;
}