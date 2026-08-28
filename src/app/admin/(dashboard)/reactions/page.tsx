"use client";

import { useEffect, useState } from "react";

type ReactionResponse = {
  typeCounts: Record<string, number>;
  topPages: {
    slug: string;
    count: number;
  }[];
  total: number;
};

const reactionLabels: Record<string, string> = {
  heart: "❤️ Heart",
  fire: "🔥 Fire",
  star: "⭐ Star",
  cry: "😢 Cry",
  bulb: "💡 Idea",
};

export default function ReactionsPage() {
  const [data, setData] = useState<ReactionResponse>({
    typeCounts: {},
    topPages: [],
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReactions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reactions",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to load reactions."
        );
      }

      setData(result);
    } catch (err) {
      console.error("Reactions page load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reactions."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReactions();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Reactions
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Monitor how visitors are reacting to your stories.
            </p>
          </div>

          <button
            type="button"
            onClick={loadReactions}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              Loading reactions...
            </p>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                <p className="text-sm font-medium text-gray-500">
                  Total Reactions
                </p>

                <p className="mt-3 text-3xl font-bold text-gray-900">
                  {data.total}
                </p>

                <p className="mt-2 text-xs text-gray-400">
                  All recorded visitor reactions
                </p>
              </div>

              {Object.entries(data.typeCounts).map(
                ([type, count]) => (
                  <div
                    key={type}
                    className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                  >
                    <p className="text-sm font-medium text-gray-500">
                      {reactionLabels[type] ?? type}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-gray-900">
                      {count}
                    </p>
                  </div>
                )
              )}
            </section>

            <section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Pages
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Stories receiving the most reactions.
                </p>
              </div>

              {data.topPages.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">
                  No reaction data available.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.topPages.map((page, index) => (
                    <div
                      key={page.slug}
                      className="flex items-center justify-between gap-6 px-6 py-5"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                          {index + 1}
                        </span>

                        <p className="truncate text-sm font-medium text-gray-900">
                          {page.slug}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {page.count}{" "}
                        {page.count === 1
                          ? "reaction"
                          : "reactions"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}