"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
}

export default function ShareButtons({
  title,
}: ShareButtonsProps) {
  const [copied, setCopied] =
    useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      setTimeout(
        () => setCopied(false),
        2000
      );
    } catch {
      console.error(
        "Failed to copy URL"
      );
    }
  }

  function shareFacebook() {
    const url = encodeURIComponent(
      window.location.href
    );

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareX() {
    const url = encodeURIComponent(
      window.location.href
    );

    const text = encodeURIComponent(
      title
    );

    window.open(
      `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function shareWhatsApp() {
    const url = encodeURIComponent(
      `${title} ${window.location.href}`
    );

    window.open(
      `https://wa.me/?text=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Share
      </span>

      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-amber-400 hover:bg-amber-50"
      >
        {copied
          ? "✓ Copied"
          : "🔗 Copy link"}
      </button>

      <button
        type="button"
        onClick={shareFacebook}
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
      >
        Facebook
      </button>

      <button
        type="button"
        onClick={shareX}
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
      >
        X
      </button>

      <button
        type="button"
        onClick={shareWhatsApp}
        className="rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"
      >
        WhatsApp
      </button>
    </div>
  );
}