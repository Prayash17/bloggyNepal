import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Verify the authenticated user on the server.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // If there is no valid authenticated user, send them to admin login.
  if (userError || !user) {
    redirect("/admin/login");
  }

  // Fetch dashboard statistics in parallel.
  const [
    pendingCommentsResult,
    newFeedbackResult,
    activeSubscribersResult,
    totalReactionsResult,
  ] = await Promise.all([
    supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),

    supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),

    supabase
      .from("subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),

    supabase
      .from("reactions")
      .select("*", { count: "exact", head: true }),
  ]);

  // Log database errors without exposing sensitive information to visitors.
  if (pendingCommentsResult.error) {
    console.error(
      "Admin dashboard - pending comments error:",
      pendingCommentsResult.error
    );
  }

  if (newFeedbackResult.error) {
    console.error(
      "Admin dashboard - feedback error:",
      newFeedbackResult.error
    );
  }

  if (activeSubscribersResult.error) {
    console.error(
      "Admin dashboard - subscribers error:",
      activeSubscribersResult.error
    );
  }

  if (totalReactionsResult.error) {
    console.error(
      "Admin dashboard - reactions error:",
      totalReactionsResult.error
    );
  }

  const pendingComments = pendingCommentsResult.count ?? 0;
  const newFeedback = newFeedbackResult.count ?? 0;
  const activeSubscribers = activeSubscribersResult.count ?? 0;
  const totalReactions = totalReactionsResult.count ?? 0;

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Welcome back. Here&apos;s what&apos;s happening on BloggyNepal.
              </p>
            </div>

            <div className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-gray-200">
              <span className="text-gray-500">Signed in as </span>
              <span className="font-medium text-gray-900">
                {user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <section
          aria-label="Website statistics"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            label="Pending Comments"
            value={pendingComments}
            description="Waiting for moderation"
          />

          <StatCard
            label="New Feedback"
            value={newFeedback}
            description="Feedback requiring attention"
          />

          <StatCard
            label="Active Subscribers"
            value={activeSubscribers}
            description="Currently subscribed"
          />

          <StatCard
            label="Total Reactions"
            value={totalReactions}
            description="All recorded reactions"
          />
        </section>

        {/* Quick overview */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Overview
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Use the admin panel to moderate comments, review feedback,
            monitor newsletter subscribers, and keep track of visitor
            engagement.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <OverviewItem
              title="Comments"
              value={pendingComments}
              status={
                pendingComments > 0
                  ? "Needs attention"
                  : "Everything is clear"
              }
            />

            <OverviewItem
              title="Feedback"
              value={newFeedback}
              status={
                newFeedback > 0
                  ? "New messages available"
                  : "No new feedback"
              }
            />

            <OverviewItem
              title="Subscribers"
              value={activeSubscribers}
              status="Active subscribers"
            />

            <OverviewItem
              title="Reactions"
              value={totalReactions}
              status="Total engagement"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-400">{description}</p>
    </div>
  );
}

function OverviewItem({
  title,
  value,
  status,
}: {
  title: string;
  value: number;
  status: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>

        <span className="text-lg font-bold text-gray-900">{value}</span>
      </div>

      <p className="mt-2 text-xs text-gray-500">{status}</p>
    </div>
  );
}