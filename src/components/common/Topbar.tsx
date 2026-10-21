import React, { useState } from "react";
import { UserRole } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "./Icons";
import Badge from "./Badge";

interface TopbarProps {
  onSearch: (query: string) => void;
  onOpenNewRental: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onSearch, onOpenNewRental }) => {
  const { currentUser, switchUserRole, users, rentals, materials, showToast } = useApp();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isStockManager = currentUser.role === "stock_manager";

  const overdueCount = rentals.filter((r) => r.isOverdue || r.status === "Overdue").length;
  const lowStockCount = materials.filter((m) => m.physicallyAvailable <= m.lowStockThreshold).length;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch(e.target.value);
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: "admin", label: "Administrator", desc: "Full system control & configuration" },
    { role: "general_management", label: "General Management (CEO)", desc: "Executive P&L & approvals" },
    { role: "stock_manager", label: "Stock Manager", desc: "Catalog, counts & check-ins" },
    { role: "accountant", label: "Accountant", desc: "Invoicing, receivables & deposits" },
  ];

  return (
    <header className="h-16 px-6 bg-white border-b border-gray-200/80 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search */}
      <div className="relative w-full max-w-md hidden sm:block">
        <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder={
            isStockManager
              ? "Global search materials, inventory stock, reservations..."
              : "Global search materials, reservations, customers, invoices..."
          }
          className="w-full text-xs font-medium pl-9 pr-12 py-2 border border-gray-200 rounded-xl bg-gray-50/60 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
        <kbd className="absolute right-2.5 top-2 text-[9px] font-mono text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Role Switcher Button */}
        <div className="relative">
          <button
            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors shadow-2xs"
            title="Switch User Role to test permissions"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="capitalize">{currentUser.role.replace("_", " ")}</span>
            <Icon name="chevron" size={12} className="text-emerald-700" />
          </button>

          {roleMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 animate-scale-up"
              onClick={() => setRoleMenuOpen(false)}
            >
              <div className="px-3 py-2 border-b border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Switch User Perspective
                </span>
                <p className="text-xs text-gray-600 mt-0.5">Test real role-based permissions in real-time:</p>
              </div>

              <div className="space-y-1 mt-1">
                {rolesList.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => switchUserRole(r.role)}
                    className={`w-full text-left p-2 rounded-xl transition-all flex items-start gap-2.5 text-xs ${
                      currentUser.role === r.role
                        ? "bg-emerald-950 text-white font-bold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        currentUser.role === r.role ? "bg-amber-400" : "bg-emerald-500"
                      }`}
                    />
                    <div>
                      <strong className="block">{r.label}</strong>
                      <span className={`text-[10px] block ${currentUser.role === r.role ? "text-emerald-200" : "text-gray-400"}`}>
                        {r.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors relative border border-gray-200"
            aria-label="Notifications"
          >
            <Icon name="bell" size={16} />
            {(overdueCount > 0 || lowStockCount > 0) && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {overdueCount + (lowStockCount > 0 ? 1 : 0)}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 animate-scale-up">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <strong className="text-xs font-bold text-gray-900">Notifications</strong>
                <button onClick={() => setNotificationsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <Icon name="close" size={14} />
                </button>
              </div>

              <div className="space-y-2.5 mt-3 text-xs">
                {overdueCount > 0 && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Overdue Rental Alert
                    </span>
                    <p className="text-[11px] text-rose-800 mt-1">
                      {overdueCount} rental(s) have passed their expected return date. Late return review required.
                    </p>
                  </div>
                )}

                {lowStockCount > 0 && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Low Stock Warning
                    </span>
                    <p className="text-[11px] text-amber-800 mt-1">
                      {lowStockCount} materials have reached their minimum safety stock threshold.
                    </p>
                  </div>
                )}

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> System Live
                  </span>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Event Operations Suite is fully synchronized.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <span className="w-8 h-8 rounded-full bg-emerald-950 text-white font-bold flex items-center justify-center text-xs shadow-2xs font-display">
            {currentUser.avatar}
          </span>
          <div className="hidden lg:block text-left">
            <strong className="text-xs font-bold text-gray-900 block leading-tight">{currentUser.name}</strong>
            <span className="text-[10px] text-gray-400 capitalize">{currentUser.role.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
