import React from "react";
import { useApp } from "../../context/AppContext";
import Icon, { IconName } from "./Icons";

interface SidebarProps {
  activeModule: string;
  onNavigate: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onNavigate }) => {
  const { currentUser, rentals, materials, showToast } = useApp();

  const overdueCount = rentals.filter((r) => r.isOverdue || r.status === "Overdue").length;
  const lowStockCount = materials.filter((m) => m.physicallyAvailable <= m.lowStockThreshold).length;

  const navGroups: {
    label: string;
    items: { id: string; label: string; icon: IconName; badge?: number }[];
  }[] = [
    {
      label: "WORKSPACE",
      items: [
        { id: "Dashboard", label: "Dashboard", icon: "grid" },
        { id: "Inventory", label: "Inventory & Stock", icon: "box", badge: lowStockCount > 0 ? lowStockCount : undefined },
        { id: "Rentals", label: "Rentals & Calendar", icon: "calendar", badge: overdueCount > 0 ? overdueCount : undefined },
        { id: "Customers", label: "Customers", icon: "users" },
        { id: "Suppliers", label: "Suppliers", icon: "package" },
      ],
    },
    {
      label: "BUSINESS OPERATIONS",
      items: [
        { id: "Sales", label: "Sales & Orders", icon: "cart" },
        { id: "Billing", label: "Billing & Deposits", icon: "receipt" },
        { id: "Maintenance", label: "Maintenance & Care", icon: "wrench" },
        { id: "Reports", label: "Executive Reports", icon: "chart" },
      ],
    },
    {
      label: "ADMINISTRATION",
      items: [
        { id: "Users", label: "Users & Roles", icon: "shield" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#123d32] text-white flex flex-col fixed inset-y-0 left-0 z-40 shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 font-display font-black flex items-center justify-center text-sm tracking-tight shadow-md">
          ST
        </div>
        <div>
          <strong className="text-sm font-bold font-display text-white tracking-tight block">
            StockTrail Pro
          </strong>
          <span className="text-[10px] text-emerald-300/70 font-semibold tracking-wider uppercase block">
            Event Operations Suite
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <span className="px-3 text-[9px] font-bold tracking-widest text-emerald-300/50 uppercase block mb-1">
              {group.label}
            </span>
            {group.items.map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white/15 text-white font-bold shadow-xs border-l-4 border-amber-400"
                      : "text-emerald-100/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon name={item.icon} size={16} className={isActive ? "text-amber-400" : "text-emerald-300/70"} />
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`ml-auto px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        item.id === "Rentals"
                          ? "bg-rose-500 text-white"
                          : "bg-amber-400 text-emerald-950"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Support Widget */}
        <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
            <Icon name="shield" size={13} />
            <span>Operational Support</span>
          </div>
          <p className="text-[10px] text-emerald-200/60 leading-snug">
            Need equipment allocation assistance?
          </p>
          <button
            onClick={() => showToast("Help center & operations manual opened.", "info")}
            className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline pt-0.5 block"
          >
            Open Operations Guide →
          </button>
        </div>

        {/* Current Active Persona */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-xs font-display">
            {currentUser.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <strong className="text-xs font-bold text-white block truncate">{currentUser.name}</strong>
            <span className="text-[10px] text-emerald-300/70 capitalize block truncate">
              {currentUser.role.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
