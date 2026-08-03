import { client, urlForImage } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "next-sanity";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// Custom components for rich text rendering
const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-8 overflow-hidden rounded-sm">
        <Image
          src={urlForImage(value).width(1000).url()}
          alt={value.alt || ""}
          width={1000}
          height={600}
          className="h-auto w-full"
        />
      </div>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#8B0000] underline hover:text-[#DC143C]"
      >
        {children}
      </a>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="mb-6 mt-12 text-4xl font-semibold text-slate-800">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="mb-4 mt-10 text-3xl font-semibold text-slate-800">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="mb-3 mt-8 text-2xl font-semibold text-slate-800">
        {children}
      </h3>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="my-6 border-l-4 border-[#8B0000] bg-stone-100 px-6 py-4 italic text-slate-700">
        {children}
      </blockquote>
    ),
    normal: ({ children }: any) => (
      <p className="mb-5 text-lg leading-relaxed text-slate-700">{children}</p>
    ),
  },
};

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  region: string;
  publishedAt: string;
  coverImage?: any;
  body?: any[];
}

async function getPost(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    region,
    publishedAt,
    coverImage,
    body
  }`;
  return client.fetch(query, { slug });
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 pt-24 text-slate-700">
      <article className="mx-auto max-w-3xl px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="mb-8 inline-block text-sm font-medium uppercase tracking-wider text-[#8B0000] hover:text-[#DC143C]"
        >
          ← Back to Stories
        </Link>

        {/* Header */}
        <header className="mb-10">
          <p className="mb-4 text-sm uppercase tracking-widest text-slate-500">
            {formatDate(post.publishedAt)}
            {post.region && ` • ${post.region}`}
          </p>
          <h1 className="mb-6 text-4xl font-semibold text-slate-800 md:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-xl leading-relaxed text-slate-600">
              {post.excerpt}
            </p>
          )}
          <div className="mt-8 h-px w-24 bg-[#8B0000]" />
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-12 overflow-hidden rounded-sm">
            <Image
              src={urlForImage(post.coverImage).width(1200).height(700).url()}
              alt={post.coverImage.alt || post.title}
              width={1200}
              height={700}
              className="h-auto w-full"
              priority
            />
          </div>
        )}

        {/* Body Content */}
        <div className="prose prose-lg max-w-none">
          {post.body ? (
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          ) : (
            <p className="text-slate-500">No content yet.</p>
          )}
        </div>

        {/* Footer / CTA */}
        <div className="mt-16 border-t border-slate-200 pt-10">
          <Link
            href="/blog"
            className="inline-block rounded-sm border-2 border-[#8B0000] px-10 py-3 font-medium text-[#8B0000] transition hover:bg-[#8B0000] hover:text-white"
          >
            ← All Stories
          </Link>
        </div>
      </article>
    </main>
  );
}
