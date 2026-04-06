import type { ChangeInsight } from "../types/insights";

type ChangesTableProps = {
  changes: ChangeInsight[];
  isLoading?: boolean;
};

export function ChangesTable({ changes, isLoading = false }: ChangesTableProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <h2 className="text-lg font-semibold text-slate-100">Where Changes Happened</h2>
      {isLoading ? (
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-slate-700" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-slate-700" />
          <div className="h-4 w-10/12 animate-pulse rounded bg-slate-700" />
        </div>
      ) : changes.length === 0 ? (
        <p className="mt-4 text-sm text-slate-400">No explicit change log signals found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-300">
                <th className="px-3 py-2 font-medium">Area</th>
                <th className="px-3 py-2 font-medium">What Changed</th>
                <th className="px-3 py-2 font-medium">Impact</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change, index) => (
                <tr key={`${change.area}-${index}`} className="border-b border-slate-800/60">
                  <td className="px-3 py-2 text-slate-200">{change.area}</td>
                  <td className="px-3 py-2 text-slate-300">{change.whatChanged}</td>
                  <td className="px-3 py-2 text-slate-300">{change.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
