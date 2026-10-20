import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import StatCard from "../common/StatCard";
import Badge from "../common/Badge";

export const DashboardView: React.FC<{
  onNavigate: (module: string) => void;
  onOpenAddMaterial: () => void;
  onOpenNewRental: () => void;
}> = ({ onNavigate, onOpenAddMaterial, onOpenNewRental }) => {
  const {
    currentUser,
    materials,
    rentals,
    invoices,
    securityDeposits,
    damageReports,
    workOrders,
    deliveryTasks,
    showToast,
  } = useApp();

  const [dashboardMode, setDashboardMode] = useState<"operational" | "executive">(
    currentUser.role === "general_management" ? "executive" : "operational"
  );
  const [period, setPeriod] = useState<"7days" | "month" | "quarter" | "year">("month");

  // Operational metrics
  const totalMaterialsCount = materials.reduce((acc, m) => acc + m.totalOwned, 0);
  const totalAvailableCount = materials.reduce((acc, m) => acc + m.physicallyAvailable, 0);
  const totalReservedCount = materials.reduce((acc, m) => acc + m.reserved, 0);
  const totalRentedCount = materials.reduce((acc, m) => acc + m.rentedOut, 0);
  const lowStockCount = materials.filter((m) => m.physicallyAvailable <= m.lowStockThreshold).length;
  const overdueRentals = rentals.filter((r) => r.isOverdue || r.status === "Overdue");
  const underRepairCount = materials.reduce((acc, m) => acc + m.underRepair, 0);

  // Executive financial metrics
  const totalInventoryValuation = materials.reduce((acc, m) => acc + m.totalOwned * m.purchaseCost, 0);
  const totalRentalRevenue = invoices
    .filter((inv) => inv.relatedType === "Rental")
    .reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalSalesRevenue = invoices
    .filter((inv) => inv.relatedType === "Sales")
    .reduce((acc, inv) => acc + inv.amountPaid, 0);
  const totalReceivables = invoices.reduce((acc, inv) => acc + inv.outstandingBalance, 0);
  const totalDepositLiabilities = securityDeposits.reduce((acc, d) => acc + d.remainingLiability, 0);
  const totalMaintenanceExpense = workOrders.reduce((acc, wo) => acc + wo.totalCost, 0);

  // Today's logistics tasks
  const todayTasks = deliveryTasks.slice(0, 4);

  const handleExport = (type: string) => {
    showToast(`Executive ${type} report downloaded successfully.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              {currentUser.branch}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500 font-medium">Tuesday, 18 June 2025</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {dashboardMode === "operational"
              ? "Live overview of stock control, active rentals, and today's logistics."
              : "Executive business intelligence, profit margins, asset valuation, and revenue performance."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Executive switcher if admin or GM */}
          {(currentUser.role === "admin" || currentUser.role === "general_management") && (
            <div className="bg-gray-100/80 p-1 rounded-xl flex items-center border border-gray-200">
              <button
                onClick={() => setDashboardMode("operational")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  dashboardMode === "operational"
                    ? "bg-white text-emerald-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Operational
              </button>
              <button
                onClick={() => setDashboardMode("executive")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  dashboardMode === "executive"
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                CEO Executive
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport("PDF")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
            >
              <Icon name="printer" size={14} />
              Print
            </button>
            <button
              onClick={onOpenNewRental}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              New Rental
            </button>
          </div>
        </div>
      </div>

      {dashboardMode === "operational" ? (
        /* ================= OPERATIONAL DASHBOARD ================= */
        <div className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Inventory"
              value={totalMaterialsCount.toLocaleString()}
              note="Across 8 main categories"
              trend="up"
              icon="box"
              tone="green"
              onClick={() => onNavigate("Inventory")}
            />
            <StatCard
              title="Available Stock"
              value={totalAvailableCount.toLocaleString()}
              note={`${Math.round((totalAvailableCount / totalMaterialsCount) * 100)}% ready for dispatch`}
              trend="neutral"
              icon="check"
              tone="lime"
              onClick={() => onNavigate("Inventory")}
            />
            <StatCard
              title="Currently Rented"
              value={totalRentedCount.toLocaleString()}
              note={`${totalReservedCount} additional items reserved`}
              trend="up"
              icon="calendar"
              tone="yellow"
              onClick={() => onNavigate("Rentals")}
            />
            <StatCard
              title="Overdue Rentals"
              value={overdueRentals.length}
              note="Requires review & follow-up"
              trend={overdueRentals.length > 0 ? "alert" : "neutral"}
              icon="clock"
              tone="red"
              onClick={() => onNavigate("Rentals")}
            />
          </div>

          {/* Middle Layout: Revenue Trend + Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Overview chart */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900 font-display">Revenue Overview</h2>
                  <p className="text-xs text-gray-500">Sales vs Rental income performance</p>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setPeriod("7days")}
                    className={`px-2.5 py-1 rounded-md font-medium ${
                      period === "7days" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-500"
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setPeriod("month")}
                    className={`px-2.5 py-1 rounded-md font-medium ${
                      period === "month" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-500"
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setPeriod("year")}
                    className={`px-2.5 py-1 rounded-md font-medium ${
                      period === "year" ? "bg-white text-gray-900 shadow-2xs font-semibold" : "text-gray-500"
                    }`}
                  >
                    This Year
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between my-5">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    TOTAL CASH COLLECTED
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-gray-900 font-display">
                      ${(totalRentalRevenue + totalSalesRevenue).toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ↑ 18.2% vs previous
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-emerald-800" /> Rental ($
                    {totalRentalRevenue.toLocaleString()})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Sales ($
                    {totalSalesRevenue.toLocaleString()})
                  </span>
                </div>
              </div>

              {/* Bar Chart Visual */}
              <div className="h-44 pt-4 flex items-end justify-between gap-3 border-t border-gray-100">
                {[
                  { month: "Jan", rental: 45, sales: 30 },
                  { month: "Feb", rental: 58, sales: 40 },
                  { month: "Mar", rental: 52, sales: 38 },
                  { month: "Apr", rental: 72, sales: 48 },
                  { month: "May", rental: 85, sales: 62 },
                  { month: "Jun", rental: 94, sales: 70 },
                ].map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-32">
                      <div
                        style={{ height: `${item.rental}%` }}
                        className="w-3.5 bg-emerald-800 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-900"
                        title={`Rental: ${item.rental}%`}
                      />
                      <div
                        style={{ height: `${item.sales}%` }}
                        className="w-3.5 bg-amber-400 rounded-t-sm transition-all duration-300 group-hover:bg-amber-500"
                        title={`Sales: ${item.sales}%`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-gray-500">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Client Reservations & Dispatches */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-base font-bold text-gray-900 font-display">Client Reservations & Dispatches</h2>
                    <p className="text-xs text-gray-500">Upcoming rental bookings and equipment dispatches</p>
                  </div>
                  <button
                    onClick={() => onNavigate("Rentals")}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                  >
                    View All <Icon name="arrow" size={12} />
                  </button>
                </div>

                <div className="divide-y divide-gray-100 mt-2">
                  {rentals.slice(0, 4).map((rent) => (
                    <div key={rent.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                          <Icon name="calendar" size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-xs font-bold text-gray-900">{rent.customerName}</strong>
                            <Badge
                              tone={
                                rent.status === "Active"
                                  ? "green"
                                  : rent.status === "Confirmed"
                                  ? "yellow"
                                  : rent.status === "Overdue"
                                  ? "red"
                                  : "gray"
                              }
                              size="sm"
                            >
                              {rent.status}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {rent.items.length} material lines · {rent.reservationNumber}
                          </p>
                          <span className="text-[10px] text-gray-400 font-medium font-mono">
                            {rent.startDate.slice(0, 10)} → {rent.expectedReturnDate.slice(0, 10)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/60 shrink-0 font-display">
                        ${rent.totalCost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onNavigate("Rentals")}
                className="w-full mt-4 py-2.5 px-3 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Icon name="calendar" size={14} /> View All Rental Reservations
              </button>
            </div>
          </div>

          {/* Lower Grid: Needs Attention + Stock Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Inventory Snapshot */}
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-bold text-gray-900 font-display">Inventory Snapshot</h2>
                  <p className="text-xs text-gray-500">Current availability, reservations, and condition</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenAddMaterial}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Icon name="plus" size={13} /> Add Material
                  </button>
                  <button
                    onClick={() => onNavigate("Inventory")}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
                  >
                    View All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400">
                      <th className="py-2.5">Material</th>
                      <th className="py-2.5">Category</th>
                      <th className="py-2.5">Total</th>
                      <th className="py-2.5">Available</th>
                      <th className="py-2.5">Reserved</th>
                      <th className="py-2.5">Rented</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {materials.slice(0, 6).map((item) => (
                      <tr key={item.id} className="hover:bg-emerald-50/30 transition-colors">
                        <td className="py-3 flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                          />
                          <div>
                            <strong className="text-xs font-bold text-gray-900 block">{item.name}</strong>
                            <span className="text-[10px] text-gray-400 font-mono">{item.code}</span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 font-medium">{item.category}</td>
                        <td className="py-3 text-gray-900 font-bold">{item.totalOwned}</td>
                        <td className="py-3 font-bold text-emerald-700">{item.physicallyAvailable}</td>
                        <td className="py-3 text-gray-600">{item.reserved}</td>
                        <td className="py-3 text-gray-600">{item.rentedOut}</td>
                        <td className="py-3">
                          <Badge
                            tone={
                              item.physicallyAvailable <= item.lowStockThreshold
                                ? "yellow"
                                : item.underRepair > 0
                                ? "amber"
                                : "green"
                            }
                            size="sm"
                          >
                            {item.physicallyAvailable <= item.lowStockThreshold
                              ? "Low Stock"
                              : item.underRepair > 0
                              ? "In Repair"
                              : "In Stock"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Needs Attention Panel */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 font-display">Needs Attention</h2>
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center justify-center">
                      {overdueRentals.length + (lowStockCount > 0 ? 1 : 0) + (damageReports.length > 0 ? 1 : 0)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">Action required</span>
                </div>

                <div className="space-y-3 mt-4">
                  {overdueRentals.map((rental) => (
                    <div
                      key={rental.id}
                      className="p-3 bg-rose-50/60 rounded-xl border border-rose-200/80 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <Icon name="clock" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-bold text-rose-950">Overdue Return: {rental.id}</strong>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-200/60 px-1.5 py-0.5 rounded">
                            {rental.overdueDays || 2}d Late
                          </span>
                        </div>
                        <p className="text-[11px] text-rose-800 mt-0.5 line-clamp-1">{rental.customerName}</p>
                        <button
                          onClick={() => onNavigate("Rentals")}
                          className="mt-2 text-[10px] font-bold text-rose-900 underline hover:text-rose-950 block"
                        >
                          Resolve overdue & late fees →
                        </button>
                      </div>
                    </div>
                  ))}

                  {lowStockCount > 0 && (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Icon name="alert" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <strong className="text-xs font-bold text-amber-950">Low Stock Threshold</strong>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {lowStockCount} materials have reached minimum storage threshold.
                        </p>
                        <button
                          onClick={() => onNavigate("Inventory")}
                          className="mt-2 text-[10px] font-bold text-amber-900 underline hover:text-amber-950 block"
                        >
                          Review reorder levels →
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Icon name="wrench" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="text-xs font-bold text-emerald-950">Inspection Desk</strong>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        {underRepairCount} items currently under maintenance / inspection hold.
                      </p>
                      <button
                        onClick={() => onNavigate("Maintenance")}
                        className="mt-2 text-[10px] font-bold text-emerald-900 underline hover:text-emerald-950 block"
                      >
                        Open maintenance queue →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>System status: Online</span>
                <span className="font-semibold text-emerald-700">All services operational</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CEO & GENERAL MANAGEMENT EXECUTIVE DASHBOARD ================= */
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-gray-900 text-white p-6 rounded-2xl shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-amber-400/10 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
              <div>
                <span className="text-[11px] font-bold tracking-widest text-amber-400 uppercase bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/30 inline-block">
                  C-SUITE EXECUTIVE INTELLIGENCE
                </span>
                <h2 className="text-2xl font-bold font-display mt-2">Executive Business Performance</h2>
                <p className="text-xs text-emerald-200 mt-1 max-w-xl">
                  Holistic financial reconciliation, asset valuation, rental utilization index, and gross margin analysis
                  across all operating branches.
                </p>
              </div>

              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15">
                <div>
                  <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                    TOTAL ASSET VALUATION
                  </span>
                  <strong className="text-2xl font-bold text-amber-300 font-display">
                    ${totalInventoryValuation.toLocaleString()}
                  </strong>
                </div>
                <div className="h-8 w-px bg-white/20" />
                <div>
                  <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider block">
                    GROSS MARGIN
                  </span>
                  <strong className="text-2xl font-bold text-white font-display">48.6%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Executive 4 KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Rental Revenue"
              value={`$${totalRentalRevenue.toLocaleString()}`}
              note="+14.2% vs previous period"
              trend="up"
              icon="receipt"
              tone="green"
              onClick={() => onNavigate("Billing & Payments")}
            />
            <StatCard
              title="Direct Sales Revenue"
              value={`$${totalSalesRevenue.toLocaleString()}`}
              note="+22.8% vs previous period"
              trend="up"
              icon="cart"
              tone="yellow"
              onClick={() => onNavigate("Sales & Orders")}
            />
            <StatCard
              title="Outstanding Receivables"
              value={`$${totalReceivables.toLocaleString()}`}
              note="17 open customer balances"
              trend="alert"
              icon="dollar"
              tone="red"
              onClick={() => onNavigate("Billing & Payments")}
            />
            <StatCard
              title="Security Deposit Liability"
              value={`$${totalDepositLiabilities.toLocaleString()}`}
              note="Customer deposits held in trust"
              trend="neutral"
              icon="shield"
              tone="blue"
              onClick={() => onNavigate("Billing & Payments")}
            />
          </div>

          {/* Deep Dive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Profit & Loss by Category */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-display">Gross Profit by Category</h3>
                  <p className="text-xs text-gray-500">Margin contribution per equipment department</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  P&L Statement
                </span>
              </div>

              <div className="space-y-4 mt-5">
                {[
                  { category: "Structures & Tents", revenue: "$24,500", profit: "$16,200", margin: "66%", color: "bg-emerald-600" },
                  { category: "Audio & Sound", revenue: "$18,900", profit: "$11,800", margin: "62%", color: "bg-emerald-500" },
                  { category: "Seating & Tables", revenue: "$19,400", profit: "$10,100", margin: "52%", color: "bg-lime-500" },
                  { category: "Lighting & Effects", revenue: "$14,200", profit: "$8,400", margin: "59%", color: "bg-amber-400" },
                  { category: "Power & Climate", revenue: "$7,320", profit: "$4,200", margin: "57%", color: "bg-amber-500" },
                ].map((row) => (
                  <div key={row.category}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-gray-900">{row.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{row.revenue} rev</span>
                        <strong className="text-emerald-800 font-bold">{row.profit} profit</strong>
                        <span className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                          {row.margin}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: row.margin }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asset Utilization & Maintenance Losses */}
            <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-display">
                      Asset Utilization & Maintenance
                    </h3>
                    <p className="text-xs text-gray-500">Fleet operational efficiency and damage costs</p>
                  </div>
                  <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-md">
                    Fleet Metrics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      FLEET UTILIZATION RATE
                    </span>
                    <strong className="text-2xl font-bold text-emerald-950 font-display mt-1 block">
                      68.4%
                    </strong>
                    <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
                      +4.2 points vs May target
                    </span>
                  </div>

                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                      MAINTENANCE EXPENSE
                    </span>
                    <strong className="text-2xl font-bold text-amber-950 font-display mt-1 block">
                      ${totalMaintenanceExpense.toLocaleString()}
                    </strong>
                    <span className="text-[11px] text-amber-800 mt-1 block font-medium">
                      -8.4% cost reduction
                    </span>
                  </div>
                </div>

                {/* Top Performing Gear */}
                <div className="mt-5">
                  <span className="text-xs font-bold text-gray-700 block mb-2">Most Frequently Rented Items</span>
                  <div className="space-y-2">
                    {materials.slice(0, 3).map((item, idx) => (
                      <div
                        key={item.id}
                        className="p-2.5 bg-gray-50/70 rounded-lg flex items-center justify-between text-xs border border-gray-200/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-gray-900">{item.name}</span>
                        </div>
                        <span className="text-gray-500 font-medium">
                          {item.rentedOut + item.reserved} units active · ${item.rentalPriceDaily}/day
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Executive Report generated for: {currentUser.name}</span>
                <button
                  onClick={() => handleExport("CSV")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/70 rounded-lg transition-colors"
                >
                  <Icon name="download" size={13} /> Export Executive CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
