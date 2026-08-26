import FeedbackForm from "@/components/FeedbackForm";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = {
  title: "Send Feedback | BloggyNepal",
  description:
    "Send feedback, report an issue, suggest an improvement, or help us make BloggyNepal better.",
};

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] px-6 py-12 text-slate-700 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <Breadcrumb
          items={[
            {
              label: "Home",
              href: "/",
            },
            {
              label: "Feedback",
            },
          ]}
        />

        <section className="mt-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-800">
              We want to hear from you
            </p>

            <h1 className="mt-3 font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
              Help us make BloggyNepal better.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Found a problem, spotted inaccurate information,
              or have an idea that could make travelling through
              Nepal easier? Send it our way.
            </p>
          </div>

          <FeedbackForm />
        </section>
      </div>
    </main>
  );
}