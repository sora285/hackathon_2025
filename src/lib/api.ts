// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export async function fetchEvents(area: string) {
    if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set");
    const url = `${API_BASE}/events?area=${encodeURIComponent(area)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function postReservation(eventId: string, userId: string) {
    if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE is not set");
    const res = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId, userId }),
    });

    if (res.status === 201) return { ok: true, code: 201 as const };
    if (res.status === 409) return { ok: false, code: 409 as const };
    return { ok: false, code: res.status as number, text: await res.text() };
}


export async function fetchEvent(eventId: string) {
    const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as {
        eventId: string;
        title: string;
        area: string;
        place: string;
        startAt: string;
        endAt: string;
    };
}