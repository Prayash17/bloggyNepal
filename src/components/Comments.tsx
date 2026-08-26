"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  parent_id: string | null;
  created_at: string;
}

interface CommentsProps {
  postSlug: string;
  contentType:
    | "district"
    | "destination"
    | "story";
}

export default function Comments({
  postSlug,
  contentType,
}: CommentsProps) {
  const [comments, setComments] =
    useState<Comment[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [success, setSuccess] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      authorName: "",
      authorEmail: "",
      content: "",
      website: "",
    });

  useEffect(() => {
    let active = true;

    async function loadComments() {
      try {
        setLoading(true);
        setError("");

        const params =
          new URLSearchParams({
            postSlug,
            contentType,
          });

        const response = await fetch(
          `/api/comments?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Unable to load comments."
          );
        }

        if (active) {
          setComments(
            data.comments || []
          );
        }
      } catch (err) {
        console.error(
          "Comments loading failed:",
          err
        );

        if (active) {
          setError(
            "Comments are temporarily unavailable."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadComments();

    return () => {
      active = false;
    };
  }, [postSlug, contentType]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSubmitting(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(
        "/api/comments",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...form,
            postSlug,
            contentType,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to submit comment."
        );
        return;
      }

      setSuccess(
        data.message ||
          "Your comment has been submitted."
      );

      setForm({
        authorName: "",
        authorEmail: "",
        content: "",
        website: "",
      });
    } catch (err) {
      console.error(
        "Comment submission failed:",
        err
      );

      setError(
        "Network error. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(
    date: string
  ) {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    ).format(new Date(date));
  }

  function initials(
    name: string
  ) {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) => part[0]
      )
      .join("")
      .toUpperCase();
  }

  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      className="mt-20 border-t border-stone-200 pt-14"
    >
      <div className="max-w-2xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-800">
          Community
        </p>

        <h2
          id="comments-heading"
          className="mt-2 font-serif text-3xl font-bold text-slate-900 sm:text-4xl"
        >
          Join the conversation
        </h2>

        <p className="mt-3 leading-7 text-slate-600">
          Have a question, correction,
          recommendation or a story of your own?
          Leave a note below.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
      >
        {/* Honeypot */}
        <div
          className="hidden"
          aria-hidden="true"
        >
          <label htmlFor="comment-website">
            Website

            <input
              id="comment-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(event) =>
                setForm({
                  ...form,
                  website:
                    event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="comment-author-name"
              className="sr-only"
            >
              Your name
            </label>

            <input
              id="comment-author-name"
              name="authorName"
              type="text"
              required
              maxLength={50}
              autoComplete="name"
              placeholder="Your name"
              value={
                form.authorName
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  authorName:
                    event.target.value,
                })
              }
              className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
            />
          </div>

          <div>
            <label
              htmlFor="comment-author-email"
              className="sr-only"
            >
              Email address
            </label>

            <input
              id="comment-author-email"
              name="authorEmail"
              type="email"
              required
              autoComplete="email"
              placeholder="Email (not shown publicly)"
              value={
                form.authorEmail
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  authorEmail:
                    event.target.value,
                })
              }
              className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
            />
          </div>
        </div>

        <div className="mt-4">
          <label
            htmlFor="comment-content"
            className="sr-only"
          >
            Comment
          </label>

          <textarea
            id="comment-content"
            name="content"
            required
            rows={5}
            maxLength={2000}
            placeholder="Share your thoughts..."
            value={form.content}
            onChange={(event) =>
              setForm({
                ...form,
                content:
                  event.target.value,
              })
            }
            className="w-full resize-none rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
          />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {form.content.length}/2000
            {" · "}
            Comments are reviewed before publishing.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Sending..."
              : "Post comment →"}
          </button>
        </div>

        {success && (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            ✅ {success}
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
      </form>

      {error && comments.length === 0 && !success && (
        <p className="mt-5 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-10 space-y-5">
        {loading ? (
          <>
            {[1, 2].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-stone-200 bg-white p-5"
                >
                  <div className="h-4 w-32 rounded bg-stone-200" />
                  <div className="mt-4 h-4 w-full rounded bg-stone-100" />
                  <div className="mt-2 h-4 w-3/4 rounded bg-stone-100" />
                </div>
              )
            )}
          </>
        ) : comments.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50 px-6 py-10 text-center">
            <div className="text-3xl">
              💬
            </div>

            <p className="mt-3 font-semibold text-slate-800">
              No comments yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Be the first person to start the conversation.
            </p>
          </div>
        ) : (
          comments.map(
            (comment) => (
              <article
                key={comment.id}
                className={`flex gap-4 rounded-[24px] border border-stone-200 bg-white p-5 shadow-sm ${
                  comment.parent_id
                    ? "ml-8 sm:ml-12"
                    : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-300 font-bold text-slate-950">
                  {initials(
                    comment.author_name
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <p className="font-bold text-slate-900">
                      {
                        comment.author_name
                      }
                    </p>

                    <time
                      dateTime={
                        comment.created_at
                      }
                      className="text-xs text-slate-400"
                    >
                      {formatDate(
                        comment.created_at
                      )}
                    </time>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-700">
                    {
                      comment.content
                    }
                  </p>
                </div>
              </article>
            )
          )
        )}
      </div>
    </section>
  );
}