"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Moment = {
  id: string;
  kind: "fact" | "reflection";
  heading: string;
  detail: string;
  question: string;
  source?: { label: string; url: string };
  destination?: { label: string; href: string };
};

const facts: Moment[] = [
  {
    id: "rara-lake",
    kind: "fact",
    heading: "Nepal's largest lake sits high in the mountains.",
    detail: "Rara Lake, in Mugu, is Nepal's largest lake. It lies at about 2,990 metres above sea level, surrounded by forest and mountains.",
    question: "Imagine arriving there at sunrise. What would you notice first?",
    source: { label: "Nepal Tourism Board", url: "https://ntb.gov.np/en/rara" },
    destination: { label: "Discover Mugu", href: "/explore-nepal/mugu" },
  },
  {
    id: "kathmandu-monuments",
    kind: "fact",
    heading: "One World Heritage property, seven monument zones.",
    detail: "UNESCO's Kathmandu Valley World Heritage property includes the three Durbar Squares and the religious sites of Swayambhu, Bauddhanath, Pashupati and Changu Narayan.",
    question: "How many have you visited — and which one would you explore next?",
    source: { label: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/121" },
    destination: { label: "Explore Kathmandu", href: "/explore-nepal/kathmandu" },
  },
  {
    id: "lumbini",
    kind: "fact",
    heading: "Lumbini is more than a destination. It's a birthplace.",
    detail: "The birthplace of Siddhartha Gautama, the Buddha, is in Nepal's southern plains. UNESCO inscribed Lumbini as a World Heritage Site in 1997.",
    question: "What can an ancient place teach us about the world today?",
    source: { label: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/666" },
    destination: { label: "Explore Rupandehi", href: "/explore-nepal/rupandehi" },
  },
  {
    id: "chitwan",
    kind: "fact",
    heading: "Nepal's first national park began in the Terai.",
    detail: "Established in 1973, Chitwan was Nepal's first national park. Its habitats protect wildlife including the greater one-horned rhinoceros and Bengal tiger.",
    question: "How can we visit wild places without putting them at risk?",
    source: { label: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/284/" },
    destination: { label: "Explore Chitwan", href: "/explore-nepal/chitwan" },
  },
  {
    id: "nepal-time",
    kind: "fact",
    heading: "Nepal keeps time a little differently.",
    detail: "Nepal Standard Time is UTC+5:45 — 45 minutes beyond a full-hour offset. The same offset is observed throughout the year.",
    question: "What other small details make a country distinctive?",
    source: { label: "Timeanddate: Nepal Time", url: "https://www.timeanddate.com/time/zone/nepal" },
    destination: { label: "Discover Nepal", href: "/explore-nepal" },
  },
  {
    id: "sagarmatha",
    kind: "fact",
    heading: "The highest mountain is part of a living landscape.",
    detail: "Sagarmatha National Park was inscribed on UNESCO's World Heritage List in 1979. The park protects Himalayan habitats and is home to Sherpa communities.",
    question: "What stories exist beyond the famous summit?",
    source: { label: "UNESCO World Heritage Centre", url: "https://whc.unesco.org/en/list/120/" },
    destination: { label: "Explore Solukhumbu", href: "/explore-nepal/solukhumbu" },
  },
];

const reflections: Moment[] = [
  {
    id: "questions",
    kind: "reflection",
    heading: "A place becomes more interesting when you arrive with questions instead of expectations.",
    detail: "You don't have to know everything about a place before you go. Curiosity is a better starting point than certainty.",
    question: "What would you ask someone who calls that place home?",
  },
  {
    id: "close-to-home",
    kind: "reflection",
    heading: "Not every unforgettable journey begins far from home.",
    detail: "Sometimes the most overlooked path is the one we've walked a hundred times without paying attention.",
    question: "Which familiar place have you never truly explored?",
  },
  {
    id: "conversations",
    kind: "reflection",
    heading: "A photograph shows you a place. A conversation helps you understand it.",
    detail: "Landscapes stay in our memory, but so do the people who share what those landscapes mean to them.",
    question: "Whose story would you make time to hear?",
  },
  {
    id: "unplanned-moments",
    kind: "reflection",
    heading: "You can plan a route, but not every moment that makes a journey worthwhile.",
    detail: "Leave room for an unhurried cup of tea, a change of weather, or a conversation you didn't expect.",
    question: "What surprised you on your last journey?",
  },
  {
    id: "slow-travel",
    kind: "reflection",
    heading: "Travel slowly enough for ordinary details to become extraordinary.",
    detail: "A trail, a morning market, or a shared meal can tell you more than a list of famous viewpoints.",
    question: "What changes when you stop rushing?",
  },
  {
    id: "return",
    kind: "reflection",
    heading: "The best part of a journey might be what you notice after you return.",
    detail: "A new perspective doesn't have to be dramatic. Sometimes it's simply learning to see home differently.",
    question: "What has travel changed about the way you see your own place?",
  },
];

const mixed: Moment[] = facts.flatMap((fact, i) => [fact, reflections[i]]);
type View = "mixed" | "facts" | "reflections";

export default function NepalCuriosityCorner() {
  const sectionRef = useRef<HTMLElement>(null);
  const [view, setView] = useState<View>("mixed");
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const items = view === "mixed" ? mixed : view === "facts" ? facts : reflections;
  const moment = items[index % items.length];

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setTabVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (paused || !inView || !tabVisible) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 60_000);
    return () => window.clearInterval(timer);
  }, [index, inView, items.length, paused, tabVisible, view]);

  const changeView = (next: View) => {
    setView(next);
    setIndex(0);
  };

  return (
    <section ref={sectionRef} aria-labelledby="nepal-curiosity-heading" className="bg-[#f4eee2] px-6 py-16 sm:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-center lg:gap-14">
        <div className="max-w-xl">
          <p className="editorial-kicker">A minute to wander</p>
          <h2 id="nepal-curiosity-heading" className="mt-5 font-serif text-4xl leading-tight tracking-tight text-[#243e32] sm:text-5xl">
            Come for a place. <span className="italic text-[#a4533b]">Leave with a new thought.</span>
          </h2>
          <p className="mt-5 text-base leading-8 text-stone-700">
            Little discoveries about Nepal, and original field notes for curious travellers. One gentle moment at a time.
          </p>
          <p className="mt-5 text-sm text-stone-600">
            Verified facts link to their sources. Reflections are original BloggyNepal writing, not attributed quotations.
          </p>
          <Link href="/explore-nepal" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-[#27483b] underline decoration-[#a4533b]/50 underline-offset-4 transition-colors hover:text-[#a4533b]">
            Explore Nepal beyond the postcard <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="min-w-0 rounded-[1.75rem] border border-[#d7d9ce] bg-white p-5 shadow-[0_20px_55px_-35px_rgba(32,53,40,0.35)] sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-5">
            <div role="group" aria-label="Choose discovery type" className="flex flex-wrap gap-2">
              {([
                ["mixed", "For you"],
                ["facts", "Nepal facts"],
                ["reflections", "Field notes"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={view === key}
                  onClick={() => changeView(key)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27483b] ${view === key ? "border-[#27483b] bg-[#27483b] text-white" : "border-stone-200 bg-[#fbfaf7] text-[#456051] hover:border-[#a6b7aa]"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs font-semibold tabular-nums text-stone-500">
              {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
          </div>

          <div key={moment.id} aria-live="off" className="moment-enter flex min-h-[285px] flex-col justify-center py-8 sm:min-h-[305px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a4533b]">
              {moment.kind === "fact" ? "Did you know? · Verified Nepal fact" : "A thought for the journey · Original reflection"}
            </p>
            <h3 className="mt-4 max-w-2xl font-serif text-3xl leading-[1.2] tracking-tight text-[#27483b] sm:text-4xl">
              {moment.heading}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
              {moment.detail}
            </p>
            <p className="mt-4 max-w-2xl border-l-2 border-[#c68c72] pl-4 text-sm font-medium italic leading-6 text-[#705740]">
              {moment.question}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
              {moment.source ? (
                <a href={moment.source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#27483b] underline decoration-stone-300 underline-offset-4 hover:decoration-[#27483b]">
                  Source: {moment.source.label} ↗
                </a>
              ) : (
                <span className="font-medium text-stone-500">Written by BloggyNepal</span>
              )}
              {moment.destination && (
                <Link href={moment.destination.href} className="font-bold text-[#a4533b] underline decoration-[#a4533b]/30 underline-offset-4 hover:decoration-[#a4533b]">
                  {moment.destination.label} →
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={paused ? "Resume automatic discoveries" : "Pause automatic discoveries"}
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
                className="rounded-full border border-stone-200 p-2.5 text-[#27483b] transition-colors hover:bg-[#eff4ee] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27483b]"
              >
                {paused ? "▶" : "Ⅱ"}
              </button>
              <button
                type="button"
                onClick={() => setIndex((current) => (current + 1) % items.length)}
                aria-label="Show another thought or fact"
                className="rounded-full bg-[#27483b] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1b362b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#27483b]"
              >
                Another one <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <p className="mt-3 text-right text-[11px] text-stone-500">
            {paused ? "Paused until you resume" : "Changes every 60 seconds while this section is visible"}
          </p>
        </div>
      </div>
    </section>
  );
}
