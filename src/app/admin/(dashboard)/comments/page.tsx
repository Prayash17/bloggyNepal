"use client";

import { useEffect, useState } from "react";

type CommentStatus = "pending" | "approved" | "rejected" | "spam";

type Comment = {
  id: string;
  content_type: string;
  post_slug: string;
  author_name: string;
  author_email: string;
  content: string;
  parent_id: string | null;
  status: CommentStatus;
  created_at: string;
  updated_at: string;
};

const statusStyles: Record<CommentStatus, string> = {
  pending:
    "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  approved:
    "bg-green-50 text-green-700 ring-green-600/20",
  rejected:
    "bg-red-50 text-red-700 ring-red-600/20",
  spam:
    "bg-gray-100 text-gray-700 ring-gray-500/20",
};

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  async function loadComments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/comments", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load comments."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("Invalid comments response.");
      }

      setComments(data);
    } catch (err) {
      console.error("Comments page load error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load comments."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  async function updateComment(
    id: string,
    status: "approved" | "rejected" | "spam"
  ) {
    try {
      setProcessingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/comments/${id}`,
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
          data?.error || "Failed to update comment."
        );
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === id
            ? {
                ...comment,
                status,
                updated_at:
                  data.updated_at || new Date().toISOString(),
              }
            : comment
        )
      );
    } catch (err) {
      console.error("Comment update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update comment."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteComment(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this comment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/comments/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete comment."
        );
      }

      setComments((current) =>
        current.filter((comment) => comment.id !== id)
      );
    } catch (err) {
      console.error("Comment delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete comment."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Comments Moderation
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Review and moderate visitor comments across your posts.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm text-gray-500">
              Loading comments...
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-200">
            <p className="text-sm font-medium text-gray-700">
              No comments found.
            </p>

            <p className="mt-1 text-sm text-gray-400">
              New visitor comments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Author
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Comment
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
                  {comments.map((comment) => {
                    const isProcessing =
                      processingId === comment.id;

                    return (
                      <tr
                        key={comment.id}
                        className="align-top hover:bg-gray-50"
                      >
                        {/* Author */}
                        <td className="px-6 py-5">
                          <div className="font-medium text-gray-900">
                            {comment.author_name || "Anonymous"}
                          </div>

                          {comment.author_email && (
                            <div className="mt-1 text-xs text-gray-400">
                              {comment.author_email}
                            </div>
                          )}

                          <div className="mt-2 text-xs text-gray-400">
                            {comment.content_type}
                          </div>
                        </td>

                        {/* Comment */}
                        <td className="max-w-xl px-6 py-5">
                          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                            {comment.content}
                          </p>

                          <p className="mt-2 break-all text-xs text-gray-400">
                            /{comment.post_slug}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                              statusStyles[comment.status] ??
                              statusStyles.pending
                            }`}
                          >
                            {comment.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-500">
                          {new Date(
                            comment.created_at
                          ).toLocaleString()}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex min-w-[180px] flex-col items-end gap-2">
                            {comment.status !== "approved" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  updateComment(
                                    comment.id,
                                    "approved"
                                  )
                                }
                                className="w-full rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "Approve"}
                              </button>
                            )}

                            {comment.status !== "rejected" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  updateComment(
                                    comment.id,
                                    "rejected"
                                  )
                                }
                                className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            )}

                            {comment.status !== "spam" && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() =>
                                  updateComment(
                                    comment.id,
                                    "spam"
                                  )
                                }
                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Mark Spam
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() =>
                                deleteComment(comment.id)
                              }
                              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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