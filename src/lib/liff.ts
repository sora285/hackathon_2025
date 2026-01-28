// lib/liff.ts
import liff from "@line/liff";

let inited = false;

export async function initLiff() {
    if (inited) return;
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) throw new Error("NEXT_PUBLIC_LIFF_ID is not set");
    await liff.init({ liffId });
    inited = true;
}

export async function requireLogin() {
    await initLiff();
    if (!liff.isLoggedIn()) {
        // ログイン後に戻ってくる先を固定
        liff.login({ redirectUri: window.location.origin + "/login" });
        return false;
    }
    return true;
}

export async function getUserId() {
    await initLiff();
    const profile = await liff.getProfile();
    return profile.userId;
}