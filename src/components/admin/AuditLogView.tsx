import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();

  const [search, setSearch] = useState("");
  const [selectedModule, setSelectedModule] = useState("All");

  const modules = ["All", "Inventory", "Rentals", "Customers", "Logistics", "Sales", "Billing", "Maintenance", "Security"];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (selectedModule !== "All" && log.module !== selectedModule) return false;

      const q = search.toLowerCase();
      return (
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.recordId.toLowerCase().includes(q) ||
        log.recordDescription.toLowerCase().includes(q)
      );
    });
  }, [auditLogs, selectedModule, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            AUDIT TRAIL & COMPLIANCE LOGS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            System Security & Audit Trail
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Immutable operation history recording every transaction, user action, timestamp, and before/after values.
          </p>
        </div>

        <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
          Retention: 7 Years Active
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {modules.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  selectedModule === m
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user, action code, or record ID..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Record ID</th>
                <th className="py-3 px-3">Description & Diffs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-emerald-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>

                  <td className="py-3 px-3">
                    <strong className="text-gray-900 font-bold block">{log.user}</strong>
                    <span className="text-[10px] font-mono text-emerald-800 uppercase font-bold">
                      {log.userRole.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-gray-700 font-medium">{log.module}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="text-[10px] font-mono font-bold text-emerald-950 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-gray-900">{log.recordId}</td>

                  <td className="py-3 px-3">
                    <p className="text-gray-800 font-medium">{log.recordDescription}</p>
                    {(log.previousValue || log.newValue) && (
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                        {log.previousValue && (
                          <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 line-through">
                            {log.previousValue}
                          </span>
                        )}
                        {log.previousValue && log.newValue && <span className="text-gray-400">→</span>}
                        {log.newValue && (
                          <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200">
                            {log.newValue}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogView;
