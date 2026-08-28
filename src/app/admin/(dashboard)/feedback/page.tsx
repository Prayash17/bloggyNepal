"use client";

import { useEffect, useState } from "react";

type FeedbackStatus = "new" | "reviewing" | "resolved";

type Feedback = {
  id: string;
  name: string;
  email: string | null;
  type: string;
  message: string;
  page_url: string | null;
  rating: number | null;
  status: FeedbackStatus;
  created_at: string;
};

const statusStyles: Record<FeedbackStatus, string> = {
  new: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  reviewing: "bg-blue-50 text-blue-700 ring-blue-600/20",
  resolved: "bg-green-50 text-green-700 ring-green-600/20",
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadFeedback() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/feedback", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load feedback.");
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid feedback response.");
      }

      setFeedback(data);
    } catch (err) {
      console.error("Feedback page load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load feedback."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function updateFeedback(
    id: string,
    status: "reviewing" | "resolved"
  ) {
    try {
      setProcessingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/feedback/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to update feedback."
        );
      }

      setFeedback((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status: data.status ?? status }
            : item
        )
      );
    } catch (err) {
      console.error("Feedback update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update feedback."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteFeedback(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this feedback?"
    );

    if (!confirmed) return;

    try {
      setProcessingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/feedback/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete feedback."
        );
      }

      setFeedback((current) =>
        current.filter((item) => item.id !== id)
      );
    } catch (err) {
      console.error("Feedback delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete feedback."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Feedback
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review visitor feedback and manage follow-up status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadFeedback}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
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
              Loading feedback...
            </p>
          </div>
        ) : feedback.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-700">
              No feedback found.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Visitor feedback will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Visitor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Feedback
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {feedback.map((item) => {
                    const isProcessing =
                      processingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="align-top hover:bg-gray-50"
                      >
                        <td className="px-6 py-5">
                          <p className="font-medium text-gray-900">
                            {item.name || "Anonymous"}
                          </p>

                          {item.email && (
                            <p className="mt-1 text-xs text-gray-400">
                              {item.email}
                            </p>
                          )}
                        </td>

                        <td className="max-w-lg px-6 py-5">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {item.message}
                          </p>

                          {item.page_url && (
                            <p className="mt-2 max-w-md break-all text-xs text-gray-400">
                              {item.page_url}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                            {item.type}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {item.rating ? (
                            <span className="font-semibold text-gray-900">
                              {item.rating}/5
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                              statusStyles[item.status] ??
                              statusStyles.new
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                          {new Date(
                            item.created_at
                          ).toLocaleString()}
                        </td>

                        <td className="px-6 py-5">
                          <div className="flex min-w-[160px] flex-col items-end gap-2">
                            {item.status === "new" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  updateFeedback(
                                    item.id,
                                    "reviewing"
                                  )
                                }
                                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "Mark Reviewing"}
                              </button>
                            )}

                            {item.status !== "resolved" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  updateFeedback(
                                    item.id,
                                    "resolved"
                                  )
                                }
                                className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                Resolve
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                deleteFeedback(item.id)
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}