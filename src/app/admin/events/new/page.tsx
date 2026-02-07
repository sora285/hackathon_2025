"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
    title: string;
    area: string;
    place: string;
    startAt: string; // datetime-local
    endAt: string;   // datetime-local
    capacity: string; // inputは文字列
    description: string;
    status: "DRAFT" | "PUBLISHED";
};

const DEFAULT_AREA = process.env.NEXT_PUBLIC_DEFAULT_AREA ?? "横浜市";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function toIsoFromDatetimeLocal(v: string) {
    // datetime-local はローカル時刻。ISOに変換して保存（JST運用ならこれでOK）
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
}

export default function NewEventPage() {
    const router = useRouter();

    const [form, setForm] = useState<FormState>({
        title: "",
        area: DEFAULT_AREA,
        place: "",
        startAt: "",
        endAt: "",
        capacity: "30",
        description: "",
        status: "DRAFT",
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const validation = useMemo(() => {
        const issues: string[] = [];

        if (!form.title.trim()) issues.push("タイトルは必須です。");
        if (!form.area.trim()) issues.push("エリアは必須です。");
        if (!form.place.trim()) issues.push("場所は必須です。");
        if (!form.startAt) issues.push("開始日時は必須です。");
        if (!form.endAt) issues.push("終了日時は必須です。");

        const cap = Number(form.capacity);
        if (!Number.isInteger(cap) || cap <= 0) issues.push("定員は1以上の整数にしてください。");

        const s = toIsoFromDatetimeLocal(form.startAt);
        const e = toIsoFromDatetimeLocal(form.endAt);
        if (s && e && new Date(s).getTime() >= new Date(e).getTime()) {
            issues.push("終了日時は開始日時より後にしてください。");
        }

        return { ok: issues.length === 0, issues, cap, startIso: s, endIso: e };
    }, [form]);

    async function onSubmit() {
        setError(null);
        setOk(null);

        if (!validation.ok) {
            setError(validation.issues[0] ?? "入力を確認してください。");
            return;
        }
        if (!API_BASE) {
            setError("NEXT_PUBLIC_API_BASE_URL が未設定です。");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                title: form.title.trim(),
                area: form.area.trim(),
                place: form.place.trim(),
                startAt: validation.startIso,
                endAt: validation.endIso,
                capacity: validation.cap,
                description: form.description.trim(),
                status: form.status,
            };

            const res = await fetch(`${API_BASE}/events`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const text = await res.text();
                setError(text || ("HTTP " + String(res.status)));
                return;
            }

            setOk("イベントを作成しました。");
            // すぐ一覧へ戻すなら router.push("/admin/events")
            // ここは一旦成功表示だけ
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message || "作成に失敗しました。");
            } else {
                setError("作成に失敗しました。");
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>イベントを企画する</h1>

            {error && (
                <div style={{ padding: 12, border: "1px solid #fca5a5", borderRadius: 12, marginBottom: 12 }}>
                    <b>エラー</b>
                    <div>{error}</div>
                </div>
            )}
            {ok && (
                <div style={{ padding: 12, border: "1px solid #86efac", borderRadius: 12, marginBottom: 12 }}>
                    <b>OK</b>
                    <div>{ok}</div>
                </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
                <label>
                    タイトル（必須）
                    <input
                        value={form.title}
                        onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                        style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                        placeholder="例：地域防災アプリ勉強会"
                    />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>
                        エリア（必須）
                        <input
                            value={form.area}
                            onChange={(e) => setForm((p) => ({ ...p, area: e.target.value }))}
                            style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                            placeholder="例：横浜市"
                        />
                    </label>

                    <label>
                        定員（必須）
                        <input
                            value={form.capacity}
                            onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                            style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                            inputMode="numeric"
                            placeholder="30"
                        />
                    </label>
                </div>

                <label>
                    場所（必須）
                    <input
                        value={form.place}
                        onChange={(e) => setForm((p) => ({ ...p, place: e.target.value }))}
                        style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                        placeholder="例：情報科学専門学校 7Fホール"
                    />
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <label>
                        開始日時（必須）
                        <input
                            type="datetime-local"
                            value={form.startAt}
                            onChange={(e) => setForm((p) => ({ ...p, startAt: e.target.value }))}
                            style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                        />
                    </label>

                    <label>
                        終了日時（必須）
                        <input
                            type="datetime-local"
                            value={form.endAt}
                            onChange={(e) => setForm((p) => ({ ...p, endAt: e.target.value }))}
                            style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                        />
                    </label>
                </div>

                <label>
                    詳細（任意）
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6, minHeight: 120 }}
                        placeholder="持ち物、参加条件、タイムテーブルなど"
                    />
                </label>

                <label>
                    公開状態
                    <select
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as FormState["status"] }))}
                        style={{ width: "100%", padding: 10, borderRadius: 12, border: "1px solid #ddd", marginTop: 6 }}
                    >
                        <option value="DRAFT">下書き</option>
                        <option value="PUBLISHED">公開</option>
                    </select>
                </label>

                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <button
                        onClick={() => router.back()}
                        style={{ padding: "10px 14px", borderRadius: 999, border: "1px solid #ddd", background: "#fff" }}
                    >
                        戻る
                    </button>
                    <button
                        disabled={submitting}
                        onClick={onSubmit}
                        style={{
                            padding: "10px 14px",
                            borderRadius: 999,
                            border: "1px solid #111",
                            background: submitting ? "#bbb" : "#111",
                            color: "#fff",
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {submitting ? "作成中..." : "作成する"}
                    </button>
                </div>

                {!validation.ok && (
                    <div style={{ color: "#666", fontSize: 12 }}>
                        入力チェック: {validation.issues.join(" / ")}
                    </div>
                )}
            </div>
        </div>
    );
}