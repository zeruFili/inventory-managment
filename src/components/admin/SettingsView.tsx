import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";

export const SettingsView: React.FC = () => {
  const { showToast } = useApp();

  const [gracePeriodHours, setGracePeriodHours] = useState(2);
  const [defaultTaxRate, setDefaultTaxRate] = useState(8.5);
  const [automaticOverdueAlerts, setAutomaticOverdueAlerts] = useState(true);
  const [depositRetentionPolicy, setDepositRetentionPolicy] = useState("Hold until return check-in signed");
  const [warehouses, setWarehouses] = useState([
    { id: "WH-01", name: "Central Warehouse", location: "44 Logistics Park, Industrial Zone", active: true },
    { id: "WH-02", name: "East Branch Depot", location: "12 Harbor Way, Waterfront District", active: true },
    { id: "WH-03", name: "North Hub Staging", location: "80 Expressway Ave, North Terminal", active: true },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("System settings updated successfully.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            SYSTEM ARCHITECTURE & POLICIES
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            System Configuration & Settings
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure branches, rental return policies, tax calculations, and deposit workflows.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
        >
          <Icon name="check" size={14} />
          Save All Changes
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operating Warehouses */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Operating Warehouses & Depots
              </h2>
              <p className="text-xs text-gray-500">Storage locations for stock allocation</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              3 Active Branches
            </span>
          </div>

          <div className="space-y-3">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <strong className="text-xs font-bold text-gray-900 block">{wh.name}</strong>
                  <span className="text-[11px] text-gray-500">{wh.location}</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-bold">
                  {wh.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rental & Financial Policies */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Rental & Billing Policies
              </h2>
              <p className="text-xs text-gray-500">Standard grace periods, tax rates, and deposit handling</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Return Grace Period (Hours)
              </label>
              <input
                type="number"
                min="0"
                value={gracePeriodHours}
                onChange={(e) => setGracePeriodHours(Number(e.target.value))}
                className="w-full font-bold border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Duration allowed beyond expected return time before flagging as overdue.
              </span>
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Default Sales & Rental Tax Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                className="w-full font-bold border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 uppercase mb-1">
                Security Deposit Liability Policy
              </label>
              <input
                type="text"
                value={depositRetentionPolicy}
                onChange={(e) => setDepositRetentionPolicy(e.target.value)}
                className="w-full font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoAlerts"
                checked={automaticOverdueAlerts}
                onChange={(e) => setAutomaticOverdueAlerts(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-gray-300"
              />
              <label htmlFor="autoAlerts" className="font-bold text-gray-800 cursor-pointer">
                Send real-time alerts for overdue returns & failed collections
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
