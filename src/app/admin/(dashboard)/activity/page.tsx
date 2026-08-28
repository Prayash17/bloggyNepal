"use client";

import { useEffect, useState } from "react";

type Activity = {
  id: string;
  admin_id: string | null;
  action: string;
  entity: string;
  entity_id: string;
  created_at: string;
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadActivity() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/activity",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load activity."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid activity response.");
      }

      setActivities(data);
    } catch (err) {
      console.error("Activity page load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load activity."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivity();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Activity Log
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Track important actions performed from the admin panel.
            </p>
          </div>

          <button
            type="button"
            onClick={loadActivity}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
              Loading activity...
            </p>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-700">
              No activity recorded yet.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Admin actions will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Entity
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Entity ID
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Admin
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {activities.map((activity) => (
                    <tr
                      key={activity.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {activity.action}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="text-sm font-medium capitalize text-gray-900">
                          {activity.entity}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <p className="max-w-xs break-all font-mono text-xs text-gray-500">
                          {activity.entity_id}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="max-w-xs break-all font-mono text-xs text-gray-400">
                          {activity.admin_id || "—"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                        {new Date(
                          activity.created_at
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