import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import StatCard from "../common/StatCard";

export const ReportsView: React.FC = () => {
  const { materials, invoices, workOrders, salesOrders, showToast } = useApp();

  const [reportType, setReportType] = useState<"financial" | "inventory" | "utilization" | "damage">("financial");
  const [period, setPeriod] = useState<"Q2 2025" | "June 2025" | "2025 YTD">("June 2025");

  const totalAssetValuation = materials.reduce((acc, m) => acc + m.totalOwned * m.purchaseCost, 0);
  const totalRentalIncome = invoices
    .filter((i) => i.relatedType === "Rental")
    .reduce((acc, i) => acc + i.amountPaid, 0);
  const totalSalesIncome = invoices
    .filter((i) => i.relatedType === "Sales")
    .reduce((acc, i) => acc + i.amountPaid, 0);
  const totalMaintenanceCost = workOrders.reduce((acc, w) => acc + w.totalCost, 0);

  const handleDownload = (format: string) => {
    showToast(`Exported ${period} ${reportType.toUpperCase()} report as ${format}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            BUSINESS INTELLIGENCE & AUDITED REPORTS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Executive Reports & Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Audit-ready financial reconciliations, fleet utilization indices, and asset depreciation logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload("CSV")}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Icon name="download" size={14} />
            Export CSV
          </button>
          <button
            onClick={() => handleDownload("PDF")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
          >
            <Icon name="printer" size={14} />
            Print Official PDF
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Combined Revenue"
          value={`$${(totalRentalIncome + totalSalesIncome).toLocaleString()}`}
          note="June 2025 YTD"
          trend="up"
          icon="receipt"
          tone="green"
        />
        <StatCard
          title="Net Gross Margin"
          value="48.6%"
          note="Across all equipment categories"
          trend="up"
          icon="chart"
          tone="lime"
        />
        <StatCard
          title="Equipment Asset Value"
          value={`$${totalAssetValuation.toLocaleString()}`}
          note="Replacement valuation: $890,000"
          trend="neutral"
          icon="box"
          tone="yellow"
        />
        <StatCard
          title="Maintenance Losses"
          value={`$${totalMaintenanceCost.toLocaleString()}`}
          note="-8.4% vs previous budget"
          trend="down"
          icon="wrench"
          tone="blue"
        />
      </div>

      {/* Report Categories Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { id: "financial", label: "Financial Statement (P&L)" },
              { id: "inventory", label: "Inventory Valuation by Category" },
              { id: "utilization", label: "Fleet Utilization Index" },
              { id: "damage", label: "Damage & Loss Reconciliation" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as any)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  reportType === t.id
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Reporting Period:</span>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-800 outline-none"
            >
              <option value="June 2025">June 2025</option>
              <option value="Q2 2025">Q2 2025 (Apr-Jun)</option>
              <option value="2025 YTD">2025 Full Year-to-Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Report Table Container */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-display">
              {reportType === "financial" && "Audited Revenue & Gross Profit Breakdown"}
              {reportType === "inventory" && "Comprehensive Equipment Valuation by Department"}
              {reportType === "utilization" && "Rental Fleet Utilization & Days on Rent"}
              {reportType === "damage" && "Damage Claims, Responsibility & Loss Write-Offs"}
            </h2>
            <p className="text-xs text-gray-500">Period: {period} · Generated by System Intelligence</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            CONFIDENTIAL
          </span>
        </div>

        {reportType === "financial" && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Revenue Stream</th>
                    <th className="py-2.5 px-3 text-right">Gross Invoiced</th>
                    <th className="py-2.5 px-3 text-right">Cash Received</th>
                    <th className="py-2.5 px-3 text-right">Direct Cost</th>
                    <th className="py-2.5 px-3 text-right">Gross Profit</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-3 px-3 font-bold text-gray-900">Equipment Rental Operations</td>
                    <td className="py-3 px-3 text-right font-display">$84,320</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold font-display">${totalRentalIncome.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-gray-500 font-display">$24,200</td>
                    <td className="py-3 px-3 text-right text-emerald-800 font-bold font-display">+$60,120</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">71.3%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-gray-900">Direct Equipment & Supplies Sales</td>
                    <td className="py-3 px-3 text-right font-display">$42,680</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold font-display">${totalSalesIncome.toLocaleString()}</td>
                    <td className="py-3 px-3 text-right text-gray-500 font-display">$23,800</td>
                    <td className="py-3 px-3 text-right text-emerald-800 font-bold font-display">+$18,880</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">44.2%</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-gray-900">Delivery & Transportation Charges</td>
                    <td className="py-3 px-3 text-right font-display">$4,250</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-bold font-display">$4,250</td>
                    <td className="py-3 px-3 text-right text-gray-500 font-display">$2,800</td>
                    <td className="py-3 px-3 text-right text-emerald-800 font-bold font-display">+$1,450</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">34.1%</td>
                  </tr>
                  <tr className="bg-emerald-50/50 font-bold text-emerald-950">
                    <td className="py-3.5 px-3">TOTAL COMBINED EARNINGS</td>
                    <td className="py-3.5 px-3 text-right font-display text-sm">$131,250</td>
                    <td className="py-3.5 px-3 text-right font-display text-sm">${(totalRentalIncome + totalSalesIncome + 4250).toLocaleString()}</td>
                    <td className="py-3.5 px-3 text-right font-display text-sm">$50,800</td>
                    <td className="py-3.5 px-3 text-right font-display text-sm text-emerald-900">+$80,450</td>
                    <td className="py-3.5 px-3 text-right text-sm">61.2%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === "inventory" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Total Units</th>
                  <th className="py-2.5 px-3 text-right">Purchase Cost Basis</th>
                  <th className="py-2.5 px-3 text-right">Replacement Valuation</th>
                  <th className="py-2.5 px-3 text-right">Daily Rental Yield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { cat: "Structures & Tents", units: 18, cost: "$57,600", repl: "$81,000", yield: "$8,640" },
                  { cat: "Audio & Sound", units: 12, cost: "$64,800", repl: "$86,400", yield: "$7,800" },
                  { cat: "Lighting", units: 64, cost: "$17,920", repl: "$22,400", yield: "$2,240" },
                  { cat: "Seating", units: 350, cost: "$15,750", repl: "$21,000", yield: "$2,975" },
                  { cat: "Power & Climate", units: 6, cost: "$87,000", repl: "$96,000", yield: "$2,280" },
                  { cat: "Staging & Truss", units: 48, cost: "$12,480", repl: "$16,800", yield: "$2,160" },
                ].map((row) => (
                  <tr key={row.cat}>
                    <td className="py-3 px-3 font-bold text-gray-900">{row.cat}</td>
                    <td className="py-3 px-3 text-center font-bold text-gray-700">{row.units}</td>
                    <td className="py-3 px-3 text-right font-display font-semibold text-gray-900">{row.cost}</td>
                    <td className="py-3 px-3 text-right font-display font-bold text-emerald-800">{row.repl}</td>
                    <td className="py-3 px-3 text-right font-display text-gray-600">{row.yield}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "utilization" && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Fleet utilization index represents the proportion of total serviceable equipment deployed on active client rentals versus idle in warehouse bays.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Rustic Cross Back Chairs", rate: "74%", rented: "260 / 350 units", status: "Optimal" },
                { name: "Commercial Marquee Tents", rate: "66%", rented: "12 / 18 units", status: "High Demand" },
                { name: "Line Array Sound System", rate: "58%", rented: "7 / 12 sets", status: "Balanced" },
                { name: "Wireless RGBW LED Pars", rate: "82%", rented: "52 / 64 units", status: "Peak Utilization" },
              ].map((item) => (
                <div key={item.name} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="font-bold text-gray-900">{item.name}</strong>
                    <span className="font-extrabold text-emerald-800 font-display text-sm">{item.rate}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: item.rate }} />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-500">
                    <span>{item.rented}</span>
                    <span className="font-semibold text-emerald-700">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {reportType === "damage" && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">
              Audited incident claims, responsibility classifications, and recovery ratios from security deposit deductions.
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">TOTAL DAMAGE ASSESSED</span>
                <strong className="text-xl font-bold text-rose-700 font-display mt-1 block">$1,450</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">RECOVERED FROM CLIENTS</span>
                <strong className="text-xl font-bold text-emerald-700 font-display mt-1 block">$920 (63.4%)</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block">INTERNAL WEAR WRITE-OFFS</span>
                <strong className="text-xl font-bold text-gray-800 font-display mt-1 block">$530 (36.6%)</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsView;
