import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SubscribersPage() {
  const supabase = await createClient();
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
        <p className="text-sm text-gray-500">Manage your active email subscribers list.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Email Address</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Subscribed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subscribers && subscribers.length > 0 ? (
              subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{sub.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {sub.status || "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                  No subscribers recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
