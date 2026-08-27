import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ReactionsPage() {
  const supabase = await createClient();
  const { data: reactions } = await supabase
    .from("reactions")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post Reactions</h1>
        <p className="text-sm text-gray-500">Overview of likes, bookmarks, and engagement across articles.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Target Post / Content</th>
              <th className="px-6 py-3">Reaction Type</th>
              <th className="px-6 py-3">Recorded At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reactions && reactions.length > 0 ? (
              reactions.map((reaction) => (
                <tr key={reaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{reaction.post_slug || reaction.post_id || "Article"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                      {reaction.type || "Like"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(reaction.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                  No reactions logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

