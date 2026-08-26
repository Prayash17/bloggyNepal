"use client";

import { useEffect, useState } from "react";

const REACTIONS = [
  {
    emoji: "❤️",
    value: "heart",
    label: "Loved it",
  },
  {
    emoji: "🔥",
    value: "fire",
    label: "Helpful",
  },
  {
    emoji: "🤩",
    value: "star",
    label: "Inspiring",
  },
  {
    emoji: "😢",
    value: "cry",
    label: "Emotional",
  },
  {
    emoji: "💡",
    value: "bulb",
    label: "Insightful",
  },
] as const;

type ContentType =
  | "district"
  | "destination"
  | "story";

interface ReactionBarProps {
  postId: string;
  postSlug: string;
  contentType: ContentType;
}

interface ReactionResponse {
  counts?: Record<string, number>;
  total?: number;
  myReaction?: string | null;
  success?: boolean;
  action?: "added" | "updated" | "removed";
  emoji?: string;
  previousEmoji?: string;
  error?: string;
}

export default function ReactionBar({
  postId,
  postSlug,
  contentType,
}: ReactionBarProps) {
  const [counts, setCounts] =
    useState<Record<string, number>>({});

  const [userReaction, setUserReaction] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    async function loadReactions() {
      try {
        setError("");

        const params =
          new URLSearchParams({
            postSlug,
            contentType,
          });

        const response = await fetch(
          `/api/reactions?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data: ReactionResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Failed to load reactions."
          );
        }

        if (!active) return;

        setCounts(data.counts || {});
        setUserReaction(
          data.myReaction || null
        );
      } catch (err) {
        console.error(
          "Reaction loading failed:",
          err
        );

        if (active) {
          setError(
            "Reactions are temporarily unavailable."
          );
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    loadReactions();

    return () => {
      active = false;
    };
  }, [postSlug, contentType]);

  async function toggle(
    emoji: string
  ) {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/reactions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            postId,
            postSlug,
            contentType,
            emoji,
          }),
        }
      );

      const data: ReactionResponse =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Unable to save reaction."
        );
        return;
      }

      if (data.action === "added") {
        setCounts((current) => ({
          ...current,
          [emoji]:
            (current[emoji] || 0) + 1,
        }));

        setUserReaction(emoji);
      }

      if (
        data.action === "updated"
      ) {
        setCounts((current) => {
          const next = {
            ...current,
          };

          if (
            data.previousEmoji
          ) {
            next[
              data.previousEmoji
            ] = Math.max(
              0,
              (next[
                data.previousEmoji
              ] || 0) - 1
            );
          }

          next[emoji] =
            (next[emoji] || 0) + 1;

          return next;
        });

        setUserReaction(emoji);
      }

      if (
        data.action === "removed"
      ) {
        setCounts((current) => ({
          ...current,
          [emoji]: Math.max(
            0,
            (current[emoji] || 0) - 1
          ),
        }));

        setUserReaction(null);
      }
    } catch (err) {
      console.error(
        "Reaction failed:",
        err
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const totalReactions =
    Object.values(counts).reduce(
      (total, count) =>
        total + count,
      0
    );

  return (
    <section
      aria-label="Article reactions"
      className="my-12 overflow-hidden rounded-[28px] border border-stone-200 bg-[#fbfaf7] shadow-sm"
    >
      <div className="px-6 py-7 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-800">
              Your reaction
            </p>

            <h3 className="mt-1 font-serif text-2xl font-bold text-slate-900">
              How did this story make you feel?
            </h3>
          </div>

          {loaded &&
            totalReactions > 0 && (
              <p className="text-sm font-medium text-slate-500">
                {totalReactions}{" "}
                {totalReactions === 1
                  ? "reaction"
                  : "reactions"}
              </p>
            )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {REACTIONS.map(
            (reaction) => {
              const count =
                counts[
                  reaction.value
                ] || 0;

              const active =
                userReaction ===
                reaction.value;

              return (
                <button
                  key={
                    reaction.value
                  }
                  type="button"
                  onClick={() =>
                    toggle(
                      reaction.value
                    )
                  }
                  disabled={loading}
                  aria-label={
                    reaction.label
                  }
                  aria-pressed={
                    active
                  }
                  className={[
                    "group inline-flex items-center gap-2 rounded-full border px-4 py-2.5",
                    "text-sm font-semibold transition-all duration-200",
                    "hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
                    active
                      ? "border-amber-400 bg-amber-100 text-slate-900 shadow-md shadow-amber-500/10"
                      : "border-stone-200 bg-white text-slate-700 hover:border-red-800 hover:bg-red-50",
                  ].join(" ")}
                >
                  <span className="text-xl transition-transform duration-200 group-hover:scale-125">
                    {reaction.emoji}
                  </span>

                  <span className="hidden sm:inline">
                    {
                      reaction.label
                    }
                  </span>

                  {count > 0 && (
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        active
                          ? "bg-amber-300 text-slate-950"
                          : "bg-slate-100 text-slate-700",
                      ].join(" ")}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <p className="mt-5 text-xs text-slate-400">
          One reaction per reader. Click again to remove
          your reaction.
        </p>
      </div>
    </section>
  );
}