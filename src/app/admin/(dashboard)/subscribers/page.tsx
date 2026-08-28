"use client";

import { useEffect, useState } from "react";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  source: string | null;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSubscribers() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/subscribers",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load subscribers."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid subscribers response.");
      }

      setSubscribers(data);
    } catch (err) {
      console.error("Subscribers page load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load subscribers."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSubscribers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  async function exportSubscribers() {
    try {
      setError("");

      const response = await fetch(
        "/api/admin/subscribers/export",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error || "Failed to export subscribers."
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "subscribers.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Subscriber export error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to export subscribers."
      );
    }
  }

  const activeCount = subscribers.filter(
    (subscriber) => subscriber.status === "active"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Newsletter Subscribers
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage visitors who subscribed to BloggyNepal updates.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadSubscribers}
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={exportSubscribers}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">
              Total Subscribers
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {subscribers.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-500">
              Active Subscribers
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {activeCount}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              Loading subscribers...
            </p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-700">
              No subscribers found.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Source
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Subscribed
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-gray-900">
                          {subscriber.email}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {subscriber.name || "—"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            subscriber.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {subscriber.status}
                        </span>
                      </td>

                      <td className="max-w-sm px-6 py-5">
                        <p className="break-all text-xs text-gray-500">
                          {subscriber.source || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                        {new Date(
                          subscriber.subscribed_at
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}