"use client";

import { useState } from "react";

type Status =
  | "idle"
  | "loading"
  | "success"
  | "error";

const RATINGS = [1, 2, 3, 4, 5];

export default function FeedbackForm() {
  const [status, setStatus] =
    useState<Status>("idle");

  const [rating, setRating] =
    useState(0);

  const [error, setError] =
    useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "general",
    message: "",
    website: "",
  });

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setStatus("loading");
    setError("");

    try {
      const response = await fetch(
        "/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...form,
            rating: rating || null,
            pageUrl:
              window.location.href,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setStatus("error");
        setError(
          data.error ||
            "Unable to submit feedback."
        );
        return;
      }

      setStatus("success");

      setForm({
        name: "",
        email: "",
        type: "general",
        message: "",
        website: "",
      });

      setRating(0);
    } catch (submissionError) {
      console.error(
        "Feedback submission failed:",
        submissionError
      );

      setStatus("error");
      setError(
        "Network error. Please try again."
      );
    }
  }

  if (status === "success") {
    return (
      <section
        aria-live="polite"
        className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-center sm:p-10"
      >
        <div className="text-5xl">
          🙏
        </div>

        <h3 className="mt-4 font-serif text-2xl font-bold text-emerald-900">
          Thank you.
        </h3>

        <p className="mx-auto mt-2 max-w-md text-emerald-800">
          Your feedback helps us make BloggyNepal
          more useful for travellers.
        </p>

        <button
          type="button"
          onClick={() =>
            setStatus("idle")
          }
          className="mt-6 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
        >
          Send another
        </button>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="max-w-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-red-800">
          Feedback
        </p>

        <h3 className="mt-2 font-serif text-2xl font-bold text-slate-900">
          Help us make this better
        </h3>

        <p className="mt-2 text-slate-600">
          Found a bug? Something inaccurate? Have an
          idea for a better travel guide?
        </p>
      </div>

      {/* Honeypot */}
      <div
        className="hidden"
        aria-hidden="true"
      >
        <label htmlFor="feedback-website">
          Website

          <input
            id="feedback-website"
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

      {/* Rating */}
      <fieldset className="mt-6">
        <legend className="mb-2 text-sm font-semibold text-slate-700">
          Rate your experience
        </legend>

        <div
          className="flex gap-1"
          role="radiogroup"
          aria-label="Rating"
        >
          {RATINGS.map(
            (star) => {
              const selected =
                star === rating;

              return (
                <button
                  key={star}
                  type="button"
                  role="radio"
                  aria-checked={
                    selected
                  }
                  aria-label={`${star} star${
                    star === 1
                      ? ""
                      : "s"
                  }`}
                  onClick={() =>
                    setRating(star)
                  }
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
                >
                  {star <= rating
                    ? "⭐"
                    : "☆"}
                </button>
              );
            }
          )}
        </div>
      </fieldset>

      {/* Name / Email */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="feedback-name"
            className="sr-only"
          >
            Your name
          </label>

          <input
            id="feedback-name"
            name="name"
            type="text"
            maxLength={50}
            autoComplete="name"
            placeholder="Your name (optional)"
            value={form.name}
            onChange={(event) =>
              setForm({
                ...form,
                name:
                  event.target.value,
              })
            }
            className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
          />
        </div>

        <div>
          <label
            htmlFor="feedback-email"
            className="sr-only"
          >
            Email address
          </label>

          <input
            id="feedback-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={(event) =>
              setForm({
                ...form,
                email:
                  event.target.value,
              })
            }
            className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
          />
        </div>
      </div>

      {/* Feedback type */}
      <div className="mt-4">
        <label
          htmlFor="feedback-type"
          className="sr-only"
        >
          Feedback type
        </label>

        <select
          id="feedback-type"
          name="type"
          value={form.type}
          onChange={(event) =>
            setForm({
              ...form,
              type:
                event.target.value,
            })
          }
          className="w-full rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
        >
          <option value="general">
            💬 General feedback
          </option>

          <option value="bug">
            🐛 Bug report
          </option>

          <option value="suggestion">
            💡 Suggestion
          </option>

          <option value="correction">
            ✏️ Content correction
          </option>
        </select>
      </div>

      {/* Message */}
      <div className="mt-4">
        <label
          htmlFor="feedback-message"
          className="sr-only"
        >
          Feedback message
        </label>

        <textarea
          id="feedback-message"
          name="message"
          required
          rows={5}
          minLength={10}
          maxLength={3000}
          placeholder="Tell us what's on your mind..."
          value={form.message}
          onChange={(event) =>
            setForm({
              ...form,
              message:
                event.target.value,
            })
          }
          className="w-full resize-none rounded-2xl border border-stone-200 bg-[#fbfaf7] px-4 py-3.5 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/40"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          {form.message.length}/3000
        </p>

        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-slate-950 px-6 py-3.5 font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading"
            ? "Sending..."
            : "Send feedback →"}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}
    </form>
  );
}