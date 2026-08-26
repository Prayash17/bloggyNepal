"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

interface ApiResponse {
  success?: boolean;
  message?: string;
  error?: string;
  stage?: string;
}

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setStatus("error");
      setMessage("Please enter your email address.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");

      console.log("Submitting newsletter:", trimmedEmail);

      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          name: "",
          website: "",
        }),
      });

      const data: ApiResponse = await response.json();

      console.log("Newsletter API response:", {
        status: response.status,
        data,
      });

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to subscribe right now."
        );
      }

      setStatus("success");
      setMessage(
        data.message || "Welcome to BloggyNepal!"
      );

      setEmail("");
    } catch (error) {
      console.error("Newsletter signup failed:", error);

      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-xl sm:px-10 sm:py-14 lg:px-14">
      {/* Decorative elements */}
      <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-red-700/20 blur-3xl" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
        {/* Content */}
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
            Stay inspired
          </p>

          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-bold leading-tight sm:text-4xl">
            Get Nepal travel inspiration in your inbox.
          </h2>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Discover new destinations, practical travel tips,
            hidden places, and useful guides to help you plan
            your next journey through Nepal.
          </p>
        </div>

        {/* Form */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <label
                htmlFor="newsletter-email"
                className="sr-only"
              >
                Email address
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Your email address"
                disabled={status === "loading"}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/40 transition focus:border-amber-300/60 focus:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "loading"
                  ? "Joining..."
                  : "Subscribe"}
              </button>
            </div>
          </form>

          {status === "success" && (
            <p className="mt-3 text-sm font-medium text-emerald-300">
              ✓ {message}
            </p>
          )}

          {status === "error" && (
            <p className="mt-3 text-sm font-medium text-red-300">
              {message}
            </p>
          )}

          <p className="mt-3 text-xs leading-relaxed text-white/40">
            No spam. Just useful Nepal travel content.
            You can unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}