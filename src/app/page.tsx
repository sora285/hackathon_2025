// app/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import liff from "@line/liff";
import { initLiff } from "@/lib/liff";
import { fetchEvents } from "@/lib/api";
import { Calendar, MapPin, Users, Clock, Search } from "lucide-react";

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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" });
}
function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

export default function HomePage() {
  const router = useRouter();
  const [area, setArea] = useState(DEFAULT_AREA);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (a: string) => {
    setLoading(true);
    setMsg("");
    try {
      const data = await fetchEvents(a);
      setEvents(data);
    } catch (e: any) {
      console.error(e);
      setMsg("読み込み失敗: " + (e?.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await initLiff();
        if (!liff.isLoggedIn()) {
          router.replace("/login");
          return;
        }
        await load(area);
      } catch (e: any) {
        console.error(e);
        setMsg("初期化失敗: " + (e?.message ?? ""));
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpen = (pk: string) => {
    const eventId = eventIdFromPK(pk);
    router.push(`/reserve/${encodeURIComponent(eventId)}`);
  };

  const subtitle = useMemo(() => {
    if (loading) return "読み込み中…";
    if (events.length === 0) return "現在、イベントがありません";
    return `${events.length}件 見つかりました`;
  }, [events.length, loading]);

  return (
      <div className="min-h-dvh bg-gray-50">
        <div className="p-4 pb-20">
          <h2 className="text-3xl font-bold mb-2 text-gray-800">参加できるイベント</h2>
          <p className="text-gray-600 mb-6">{subtitle}</p>

          {/* 検索UI */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border-4 border-blue-100 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">地域</label>
            <div className="flex gap-2">
              <input
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="例）横浜市"
              />
              <button
                  onClick={() => load(area)}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-white font-bold text-lg shadow hover:bg-blue-700 active:scale-[0.99] flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                検索
              </button>
            </div>

            {msg && (
                <div className="mt-3 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">
                  {msg}
                </div>
            )}
          </div>

          {/* 一覧 */}
          <div className="space-y-4">
            {events.map((event) => {
              const date = formatDate(event.startAt);
              const time = `${formatTime(event.startAt)} 〜 ${formatTime(event.endAt)}`;

              return (
                  <button
                      key={event.PK}
                      onClick={() => onOpen(event.PK)}
                      className="w-full text-left block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow border-4 border-blue-100 active:scale-[0.995]"
                  >
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">{event.title}</h3>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-7 h-7 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xl text-gray-700">{date}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-7 h-7 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xl text-gray-700">{time}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-7 h-7 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xl text-gray-700">{event.place}</p>
                          <p className="text-base text-gray-500">{event.area}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="w-7 h-7 text-blue-500 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-xl text-gray-700">定員 {event.capacity} 名</p>
                          <p className="text-base text-gray-500">状態: {event.status}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 bg-blue-50 rounded-xl p-3">
                      <p className="text-xl text-gray-700 text-center">タップして予約へ</p>
                    </div>
                  </button>
              );
            })}
          </div>

          {/* ローディング時の見た目（軽いスケルトン） */}
          {loading && (
              <div className="mt-6 space-y-4">
                {[1, 2].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl shadow-lg p-6 border-4 border-blue-100 animate-pulse"
                    >
                      <div className="h-7 w-2/3 bg-gray-200 rounded mb-4" />
                      <div className="h-5 w-1/2 bg-gray-200 rounded mb-2" />
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-5 w-2/3 bg-gray-200 rounded" />
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}