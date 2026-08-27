import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ActivityLogPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-sm text-gray-500">Audit trail of administrative actions and site events.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Details</th>
              <th className="px-6 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {logs && logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{log.action || "System Event"}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{log.details || "-"}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-400">
                  No system activity logged.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}