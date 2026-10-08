import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";

import { client } from "@/sanity/lib/client";
import { allProvincesQuery, provinceBySlugQuery, provinceSlugsQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DistrictCard } from "@/components/DistrictCard";
import { ProvinceMap } from "@/components/ProvinceMap";
import type { Province } from "@/types/province";
import { pageMetadata } from "@/lib/page-metadata";

export const revalidate = 3600;

function label(p: Province) {
  return p.officialName || (p.name.includes("Province") ? p.name : `${p.name} Province`);
}

function img(image: Province["coverImage"], width: number, height?: number) {
  if (!image?.asset?._ref) return null;
  try {
    let builder = urlForImage(image).width(width).auto("format");
    if (height) builder = builder.height(height).fit("crop");
    return builder.url();
  } catch {
    return null;
  }
}

function Heading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-7">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-800">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(provinceSlugsQuery);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const province = await client.fetch<Province | null>(provinceBySlugQuery, { slug });
  if (!province) return {};

  return pageMetadata(
    province.seo?.metaTitle || `${label(province)} Travel Guide`,
    province.seo?.metaDescription || province.shortDescription || `Explore ${label(province)} in Nepal.`,
    `/provinces/${slug}`
  );
}

export default async function ProvincePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [province, provinces] = await Promise.all([
    client.fetch<Province | null>(provinceBySlugQuery, { slug }),
    client.fetch<Province[]>(allProvincesQuery),
  ]);
  if (!province) notFound();

  const name = label(province);
  const cover = img(province.coverImage, 2200, 1200);
  const map = img(province.mapImage, 1600);
  const ordered = [...provinces].sort((a, b) => a.number - b.number);
  const index = ordered.findIndex((p) => p._id === province._id);
  const prev = ordered[index > 0 ? index - 1 : ordered.length - 1];
  const next = ordered[index >= 0 && index < ordered.length - 1 ? index + 1 : 0];
  const seatDiffers = province.headquarters && province.headquarters !== province.capital;

  const nav = [
    province.body?.length ? ["overview", "Overview"] : null,
    ["map", "Map"],
    province.highlights?.length ? ["highlights", "Highlights"] : null,
    province.destinations?.length ? ["destinations", "Destinations"] : null,
    province.districts?.length ? ["districts", "Districts"] : null,
    province.gettingThere?.length ? ["getting-there", "Getting there"] : null,
    province.geography?.length ? ["geography", "Geography"] : null,
    province.cultureAndHistory?.length ? ["culture", "Culture"] : null,
    province.bestTimeToVisit?.length ? ["best-time", "Best time"] : null,
    province.stories?.length ? ["stories", "Stories"] : null,
  ].filter(Boolean) as string[][];

  return (
    <main className="bg-[#fbfaf7] text-slate-900">
      <section className="relative min-h-[540px] overflow-hidden bg-slate-950">
        {cover && <Image src={cover} alt={province.coverImage?.alt || name} fill priority className="object-cover" sizes="100vw" />}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/20" />
        <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-end px-4 pb-14 pt-28 sm:px-6">
          <div className="max-w-5xl text-white">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">Province {province.number}</p>
            <h1 className="mt-4 font-serif text-5xl font-bold sm:text-6xl lg:text-7xl">{name}</h1>
            {province.nepaliName && <p className="mt-2 text-xl text-white/70">{province.nepaliName}</p>}
            {province.shortDescription && <p className="mt-6 max-w-4xl text-lg leading-8 text-white/80">{province.shortDescription}</p>}
            {!!province.travelThemes?.length && (
              <div className="mt-6 flex flex-wrap gap-2">
                {province.travelThemes.map((theme) => <span key={theme} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider">{theme}</span>)}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Provinces", href: "/provinces" }, { label: name }]} />
        </div>
      </div>

      <nav className="sticky top-[78px] z-30 border-b border-stone-200 bg-[#fbfaf7]/95 backdrop-blur-xl" aria-label="Province sections">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {nav.map(([id, text]) => <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-amber-300 hover:text-red-900">{text}</a>)}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <section className="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Population", province.population?.toLocaleString() || "N/A", "NPHC 2021"],
            ["Area", province.area ? `${province.area.toLocaleString()} km²` : "N/A", ""],
            ["Capital", province.capital || "N/A", seatDiffers ? `Admin seat: ${province.headquarters}` : ""],
            ["Districts", String(province.districts?.length || province.noOfDistricts || 0), ""],
            ["Density", province.density ? `${province.density}/km²` : "N/A", "NPHC 2021"],
          ].map(([k, v, note]) => (
            <div key={k} className="rounded-3xl border border-stone-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{k}</p>
              <p className="mt-2 font-serif text-2xl font-bold">{v}</p>
              {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
            </div>
          ))}
        </section>

        {!!province.body?.length && <section id="overview" className="mb-20 scroll-mt-32"><Heading eyebrow="Regional story" title={`Why ${name} matters`} /><div className="prose prose-lg max-w-4xl text-slate-700"><PortableText value={province.body} /></div></section>}

        <section id="map" className="mb-20 scroll-mt-32">
          <Heading eyebrow="Orientation" title={`Map of ${name}`} />
          <div className={`grid gap-6 ${map ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
            {map && <figure className="overflow-hidden rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"><Image src={map} alt={province.mapImage?.alt || `Map of ${name}`} width={1600} height={1100} className="h-auto w-full rounded-2xl" />{province.mapImage?.caption && <figcaption className="px-3 pb-2 pt-4 text-sm text-slate-500">{province.mapImage.caption}</figcaption>}</figure>}
            <div className="rounded-3xl border border-stone-200 bg-white p-3 shadow-sm"><ProvinceMap provinceName={province.name} height="460px" /><p className="px-3 pb-2 pt-4 text-xs text-slate-500">Interactive map for orientation; use district and destination guides for route-level planning.</p></div>
          </div>
        </section>

        {!!province.highlights?.length && <section id="highlights" className="mb-20 scroll-mt-32"><Heading eyebrow="Start here" title={`What to experience in ${province.name}`} /><div className="grid gap-4 md:grid-cols-2">{province.highlights.map((h, i) => { const [title, ...rest] = h.split(" — "); return <div key={`${title}-${i}`} className="rounded-3xl border border-stone-200 bg-white p-6"><p className="text-xs font-bold text-amber-700">{String(i + 1).padStart(2, "0")}</p><h3 className="mt-2 font-serif text-xl font-bold">{title}</h3>{rest.length > 0 && <p className="mt-3 text-sm leading-6 text-slate-600">{rest.join(" — ")}</p>}</div>; })}</div></section>}

        {!!province.destinations?.length && <section id="destinations" className="mb-20 scroll-mt-32"><Heading eyebrow="Go deeper" title={`Destination guides in ${province.name}`} /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{province.destinations.map((d) => { const coverUrl = img(d.coverImage, 900, 560); return <Link key={d._id} href={`/destinations/${d.slug.current}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm hover:border-amber-300 hover:shadow-lg"><div className="relative h-44 bg-slate-900">{coverUrl && <Image src={coverUrl} alt={d.coverImage?.alt || d.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw,25vw" />}</div><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-red-800">{d.district?.name || d.region || "Destination"}</p><h3 className="mt-2 font-serif text-xl font-bold">{d.title}</h3>{d.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{d.excerpt}</p>}</div></Link>; })}</div><Link href="/destinations" className="mt-6 inline-block text-sm font-bold text-red-800">Browse all destinations →</Link></section>}

        {!!province.districts?.length && <section id="districts" className="mb-20 scroll-mt-32"><Heading eyebrow="Explore locally" title={`All districts in ${province.name}`} /><div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">{province.districts.map((district) => <DistrictCard key={district._id} district={{ ...district, province: { name: province.name, slug: province.slug } }} />)}</div></section>}

        {!!province.gettingThere?.length && <section id="getting-there" className="mb-20 scroll-mt-32"><Heading eyebrow="Plan the route" title="Getting there & moving around" /><div className="prose prose-lg max-w-4xl text-slate-700"><PortableText value={province.gettingThere} /></div></section>}
        {!!province.geography?.length && <section id="geography" className="mb-20 scroll-mt-32"><Heading eyebrow="Landscape" title="Geography & climate" /><div className="prose prose-lg max-w-4xl text-slate-700"><PortableText value={province.geography} /></div></section>}
        {!!province.cultureAndHistory?.length && <section id="culture" className="mb-20 scroll-mt-32"><Heading eyebrow="Living heritage" title="Culture & history" /><div className="prose prose-lg max-w-4xl text-slate-700"><PortableText value={province.cultureAndHistory} /></div></section>}
        {!!province.bestTimeToVisit?.length && <section id="best-time" className="mb-20 scroll-mt-32"><Heading eyebrow="Seasonality" title={`Best time to visit ${province.name}`} /><div className="prose prose-lg max-w-4xl text-slate-700"><PortableText value={province.bestTimeToVisit} /></div></section>}

        {!!province.practicalNotes?.length && <section className="mb-20 rounded-3xl border border-amber-200 bg-amber-50 p-7"><p className="text-xs font-bold uppercase tracking-[0.22em] text-red-800">Before you go</p><h2 className="mt-3 font-serif text-3xl font-bold">Practical notes</h2><ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">{province.practicalNotes.map((n) => <li key={n}>• {n}</li>)}</ul></section>}

        {!!province.stories?.length && <section id="stories" className="mb-20 scroll-mt-32"><Heading eyebrow="From the road" title={`Stories from ${province.name}`} /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{province.stories.map((s) => { const coverUrl = img(s.coverImage, 800, 500); return <Link key={s._id} href={`/blog/${s.slug.current}`} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white hover:border-amber-300 hover:shadow-lg"><div className="relative h-40 bg-slate-900">{coverUrl && <Image src={coverUrl} alt={s.coverImage?.alt || s.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw,33vw" />}</div><div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-red-800">{s.category || s.district?.name || "Story"}</p><h3 className="mt-2 font-serif text-xl font-bold">{s.title}</h3>{s.excerpt && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{s.excerpt}</p>}</div></Link>; })}</div><Link href="/blog" className="mt-6 inline-block text-sm font-bold text-red-800">Read all stories →</Link></section>}

        <section className="border-t border-stone-200 pt-10"><p className="text-xs font-bold uppercase tracking-[0.22em] text-red-800">Continue exploring Nepal</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><Link href={`/provinces/${prev.slug.current}`} className="rounded-3xl border border-stone-200 bg-white p-6 hover:border-amber-300"><p className="text-xs uppercase tracking-wider text-slate-400">Previous province</p><p className="mt-2 font-serif text-2xl font-bold">← {label(prev)}</p></Link><Link href={`/provinces/${next.slug.current}`} className="rounded-3xl border border-stone-200 bg-white p-6 text-right hover:border-amber-300"><p className="text-xs uppercase tracking-wider text-slate-400">Next province</p><p className="mt-2 font-serif text-2xl font-bold">{label(next)} →</p></Link></div></section>
      </div>
    </main>
  );
}
