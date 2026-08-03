 import { client, urlForImage } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";

// This tells Next.js to always fetch fresh data
export const dynamic = "force-dynamic";

// Define what fields we want from each post
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  region: string;
  publishedAt: string;
  coverImage?: any;
}

// The actual data fetch
async function getPosts(): Promise<Post[]> {
  const query = `*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    region,
    publishedAt,
    coverImage
  }`;
  return client.fetch(query);
}

// Format date nicely
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-[#8B0000]">
            The Blog
          </p>
          <h1 className="text-4xl font-semibold text-slate-800 md:text-5xl">
            Stories from Nepal
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Slow writing from my travels across the Himalayas. Updated when
            there is something worth sharing — not on a schedule.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="h-px w-24 bg-[#8B0000]" />
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="rounded-sm border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-lg text-slate-500">
              No stories yet. The first one is on its way.
            </p>
          </div>
        ) : (
          <div className="grid gap-12 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post._id}
                className="group cursor-pointer border-b border-slate-200 pb-10 transition hover:border-[#8B0000]"
              >
                {/* Cover Image */}
                {post.coverImage ? (
                  <div className="mb-6 h-56 overflow-hidden rounded-sm">
                    <Image
                      src={urlForImage(post.coverImage).width(800).height(400).url()}
                      alt={post.coverImage.alt || post.title}
                      width={800}
                      height={400}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="mb-6 flex h-56 items-center justify-center rounded-sm bg-gradient-to-br from-slate-300 to-slate-500">
                    <span className="text-5xl text-white/70">🏔️</span>
                  </div>
                )}

                {/* Meta */}
                <p className="mb-2 text-xs uppercase tracking-widest text-slate-500">
                  {formatDate(post.publishedAt)}
                  {post.region && ` • ${post.region}`}
                </p>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-slate-800 transition group-hover:text-[#8B0000]">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="mt-3 leading-relaxed text-slate-600">
                  {post.excerpt}
                </p>

                {/* Read more link */}
                <Link
                  href={`/blog/${post.slug.current}`}
                  className="mt-4 inline-block text-sm font-medium uppercase tracking-wider text-[#8B0000]"
                >
                  Read story →
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Bottom note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">
            More stories coming soon — subscribe to be notified.
          </p>
        </div>
      </section>
    </main>
  );
}
