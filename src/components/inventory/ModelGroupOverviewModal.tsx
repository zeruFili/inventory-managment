import React, { useState, useMemo } from "react";
import { Material, RentalReservation, RepairWorkOrder, DamageReport } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";
import {
  getIndividualItemsForModel,
  calculateModelConditionBreakdown,
  getModelPriceHistory,
  calculateModelFinancialAnalytics,
} from "../../utils/inventoryUtils";

interface ModelGroupOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
  onViewIndividualItems?: () => void;
}

export const ModelGroupOverviewModal: React.FC<ModelGroupOverviewModalProps> = ({
  isOpen,
  onClose,
  material,
  onViewIndividualItems,
}) => {
  const { rentals, workOrders, damageReports, can, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<
    "overview" | "rentals" | "maintenance" | "financials"
  >("overview");

  const isStockManager = currentUser.role === "stock_manager";
  const isAdmin = can("view_financials") || currentUser.role === "admin";

  React.useEffect(() => {
    if (isStockManager && activeTab === "rentals") {
      setActiveTab("overview");
    }
  }, [isStockManager, activeTab]);

  // Compute all group-level metrics
  const individualItems = useMemo(() => {
    if (!material) return [];
    return getIndividualItemsForModel(material, rentals);
  }, [material, rentals]);

  const conditionBreakdown = useMemo(() => {
    return calculateModelConditionBreakdown(individualItems);
  }, [individualItems]);

  const priceHistory = useMemo(() => {
    if (!material) return [];
    return getModelPriceHistory(material);
  }, [material]);

  const financialAnalytics = useMemo(() => {
    if (!material) return null;
    return calculateModelFinancialAnalytics(material, rentals, workOrders);
  }, [material, rentals, workOrders]);

  const modelDamageReports = useMemo(() => {
    if (!material) return [];
    return damageReports.filter((d) => d.materialId === material.id);
  }, [material, damageReports]);

  const modelWorkOrders = useMemo(() => {
    if (!material) return [];
    return workOrders.filter((w) => w.materialId === material.id);
  }, [material, workOrders]);

  if (!material || !financialAnalytics) return null;

  const total = material.totalOwned;
  const availPct = total > 0 ? Math.round((material.physicallyAvailable / total) * 100) : 0;
  const rentedPct = total > 0 ? Math.round((material.rentedOut / total) * 100) : 0;
  const repairPct = total > 0 ? Math.round((material.underRepair / total) * 100) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${material.name} - Model Group Overview`}
      subtitle={`Aggregated group analytics across all ${material.totalOwned} units (${material.code} · ${material.brand})`}
      badge={`${material.category.toUpperCase()} MODEL INSPECTOR`}
      maxWidth="5xl"
    >
      <div className="space-y-4">
        {/* Header Hero Card */}
        <div className="bg-gradient-to-r from-emerald-50/60 via-white to-amber-50/50 p-4 rounded-2xl border border-emerald-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={material.imageUrl}
              alt={material.name}
              className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-950">
                  {material.code}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {material.brand} · {material.model}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 font-display mt-0.5">
                {material.name}
              </h2>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                <span>Warehouse: <strong>{material.warehouse}</strong> ({material.storageLocation})</span>
                <span>•</span>
                <span>Daily Rate: <strong>${material.rentalPriceDaily}/day</strong></span>
                <span>•</span>
                <span>Weekly: <strong>${material.rentalPriceWeekly}/wk</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onViewIndividualItems && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onViewIndividualItems();
                }}
                className="px-3.5 py-2 text-xs font-bold text-emerald-950 bg-white border border-emerald-300 hover:bg-emerald-50 rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <Icon name="grid" size={14} />
                View All {material.totalOwned} Physical Items
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 border-b border-gray-200 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-emerald-950 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon name="box" size={14} />
            Group Inventory & Availability
          </button>

          {!isStockManager && (
            <button
              type="button"
              onClick={() => setActiveTab("rentals")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "rentals"
                  ? "bg-emerald-950 text-white shadow-xs"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon name="calendar" size={14} />
              Rental & Company History ({financialAnalytics.rentalBookingsCount})
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("maintenance")}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "maintenance"
                ? "bg-emerald-950 text-white shadow-xs"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon name="wrench" size={14} />
            Damage & Maintenance ({modelWorkOrders.length + modelDamageReports.length})
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("financials")}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "financials"
                  ? "bg-amber-400 text-emerald-950 shadow-xs ring-2 ring-amber-300/50"
                  : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80"
              }`}
            >
              <Icon name="dollar" size={14} />
              Admin Financial Analytics
            </button>
          )}
        </div>

        {/* Tab 1: Group Inventory & Current Availability */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            {/* KPI Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Total Inventory
                </span>
                <strong className="text-xl font-bold text-gray-900 font-display">
                  {material.totalOwned}
                </strong>
                <span className="text-[10px] text-gray-400 block mt-0.5">Physical items</span>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Available for Rent
                </span>
                <strong className="text-xl font-bold text-emerald-900 font-display">
                  {material.physicallyAvailable}
                </strong>
                <span className="text-[10px] text-emerald-700 block mt-0.5">{availPct}% in warehouse</span>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  Currently Rented
                </span>
                <strong className="text-xl font-bold text-amber-900 font-display">
                  {material.rentedOut}
                </strong>
                <span className="text-[10px] text-amber-700 block mt-0.5">{rentedPct}% deployed</span>
              </div>

              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  Under Repair
                </span>
                <strong className="text-xl font-bold text-rose-900 font-display">
                  {material.underRepair}
                </strong>
                <span className="text-[10px] text-rose-700 block mt-0.5">Workshop servicing</span>
              </div>

              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Inspection / Retired
                </span>
                <strong className="text-xl font-bold text-gray-800 font-display">
                  {material.awaitingInspection + material.retiredQuantity}
                </strong>
                <span className="text-[10px] text-gray-500 block mt-0.5">
                  {material.awaitingInspection} hold · {material.retiredQuantity} retired
                </span>
              </div>
            </div>

            {/* Visual Deployment Meter */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700">Fleet Deployment Ratio</span>
                <span className="text-gray-500">
                  {material.physicallyAvailable} Available · {material.rentedOut} Rented · {material.underRepair} Repair
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${availPct}%` }}
                  title={`Available: ${material.physicallyAvailable}`}
                />
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${rentedPct}%` }}
                  title={`Rented: ${material.rentedOut}`}
                />
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${repairPct}%` }}
                  title={`Under Repair: ${material.underRepair}`}
                />
              </div>
            </div>

            {/* Condition Breakdown Breakdown (New, Excellent, Good, Fair, Damaged, Beyond Repair) */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Physical Item Condition Breakdown
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Aggregated physical inspection grading across all {individualItems.length} individual items of this model.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">New</span>
                  <strong className="text-lg font-bold text-emerald-950 font-display">
                    {conditionBreakdown.newCount}
                  </strong>
                  <span className="text-[10px] text-emerald-700 block">
                    {total > 0 ? Math.round((conditionBreakdown.newCount / total) * 100) : 0}%
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase block">Excellent</span>
                  <strong className="text-lg font-bold text-emerald-900 font-display">
                    {conditionBreakdown.excellentCount}
                  </strong>
                  <span className="text-[10px] text-emerald-600 block">
                    {total > 0 ? Math.round((conditionBreakdown.excellentCount / total) * 100) : 0}%
                  </span>
                </div>

                <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-200 text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Good</span>
                  <strong className="text-lg font-bold text-blue-950 font-display">
                    {conditionBreakdown.goodCount}
                  </strong>
                  <span className="text-[10px] text-blue-700 block">
                    {total > 0 ? Math.round((conditionBreakdown.goodCount / total) * 100) : 0}%
                  </span>
                </div>

                <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 text-center">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block">Fair</span>
                  <strong className="text-lg font-bold text-amber-950 font-display">
                    {conditionBreakdown.fairCount}
                  </strong>
                  <span className="text-[10px] text-amber-700 block">
                    {total > 0 ? Math.round((conditionBreakdown.fairCount / total) * 100) : 0}%
                  </span>
                </div>

                <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200 text-center">
                  <span className="text-[10px] font-bold text-rose-800 uppercase block">Damaged</span>
                  <strong className="text-lg font-bold text-rose-950 font-display">
                    {conditionBreakdown.damagedCount}
                  </strong>
                  <span className="text-[10px] text-rose-700 block">
                    {total > 0 ? Math.round((conditionBreakdown.damagedCount / total) * 100) : 0}%
                  </span>
                </div>

                <div className="p-3 bg-gray-100 rounded-xl border border-gray-300 text-center">
                  <span className="text-[10px] font-bold text-gray-600 uppercase block">Beyond Repair</span>
                  <strong className="text-lg font-bold text-gray-900 font-display">
                    {conditionBreakdown.beyondRepairCount}
                  </strong>
                  <span className="text-[10px] text-gray-500 block">
                    {total > 0 ? Math.round((conditionBreakdown.beyondRepairCount / total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Model Metadata Summary */}
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Supplier</span>
                <strong className="text-gray-900">{material.supplierName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Acquisition Date</span>
                <strong className="text-gray-900">{material.purchaseDate || "2024-01-15"}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Purchase Cost / Unit</span>
                <strong className="text-gray-900">${material.purchaseCost}</strong>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Warranty Info</span>
                <strong className="text-gray-900">{material.warrantyInfo || "Standard 2-Year Warranty"}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rental History & Company Analytics */}
        {activeTab === "rentals" && !isStockManager && (
          <div className="space-y-4">
            {/* Quick Rental Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Total Rental Bookings
                </span>
                <strong className="text-xl font-bold text-emerald-950 font-display">
                  {financialAnalytics.rentalBookingsCount} Reservations
                </strong>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Across all client accounts</span>
              </div>

              <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">
                  Total Cumulative Rental Days
                </span>
                <strong className="text-xl font-bold text-blue-950 font-display">
                  {financialAnalytics.totalDaysRented} Days
                </strong>
                <span className="text-[10px] text-blue-700 block mt-0.5">Average 3.2 days per event</span>
              </div>

              <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase block">
                  Total Units Dispatched
                </span>
                <strong className="text-xl font-bold text-amber-950 font-display">
                  {financialAnalytics.totalUnitsRentedCount} Units
                </strong>
                <span className="text-[10px] text-amber-700 block mt-0.5">Deployment turnover</span>
              </div>
            </div>

            {/* Rental History by Company */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Rental History by Company & Client
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Companies that have rented items from this model and total booking frequencies.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Company Name</th>
                      <th className="py-2.5 px-3">Contact Person</th>
                      <th className="py-2.5 px-3 text-center">Bookings Count</th>
                      <th className="py-2.5 px-3 text-center">Total Units Rented</th>
                      <th className="py-2.5 px-3 text-right">Last Rented Date</th>
                      <th className="py-2.5 px-3 text-right">Total Spend on Model</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {financialAnalytics.companySummaries.map((c) => (
                      <tr key={c.customerId} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-[10px]">
                            {c.customerName.slice(0, 2).toUpperCase()}
                          </span>
                          {c.customerName}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600 capitalize">{c.contactPerson}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                            {c.bookingCount} times
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                          {c.totalUnitsRented}
                        </td>
                        <td className="py-2.5 px-3 text-right text-gray-500">{c.lastRentalDate}</td>
                        <td className="py-2.5 px-3 text-right font-bold font-display text-emerald-950">
                          ${c.totalSpent.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Damage & Maintenance Records */}
        {activeTab === "maintenance" && (
          <div className="space-y-4">
            {/* Maintenance Overview Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Icon name="wrench" size={18} />
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">Current Model Maintenance Status</h3>
                  <p className="text-[11px] text-gray-600">
                    {material.underRepair} unit(s) in repair workshop · {material.awaitingInspection} unit(s) on post-rental inspection hold.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-800 bg-white px-3 py-1 rounded-lg border border-rose-200 shadow-2xs">
                {modelWorkOrders.length} Recorded Work Orders
              </span>
            </div>

            {/* Repair Work Orders */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Associated Repair Work Orders
                </h4>
              </div>

              {modelWorkOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs">
                  No active or past repair work orders recorded for this model.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Work Order #</th>
                        <th className="py-2.5 px-3">Technician</th>
                        <th className="py-2.5 px-3">Scope of Work</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3 text-right">Parts / Labor</th>
                        <th className="py-2.5 px-3 text-right">Total Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {modelWorkOrders.map((wo) => (
                        <tr key={wo.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{wo.workOrderNumber}</td>
                          <td className="py-2.5 px-3 text-gray-700">{wo.assignedTechnician}</td>
                          <td className="py-2.5 px-3 text-gray-600 max-w-xs truncate">{wo.workPerformed}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                wo.status === "Completed"
                                  ? "bg-emerald-100 text-emerald-900"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {wo.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-gray-500 font-mono">
                            ${wo.sparePartsCost} / ${wo.laborCost}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-800 font-display">
                            ${wo.totalCost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Damage Reports */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Damage Incident Reports
                </h4>
              </div>

              {modelDamageReports.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs">
                  Zero damage incident reports filed for this model.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Report #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Client Involved</th>
                        <th className="py-2.5 px-3 text-center">Severity</th>
                        <th className="py-2.5 px-3">Suspected Cause</th>
                        <th className="py-2.5 px-3 text-right">Est. Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {modelDamageReports.map((dr) => (
                        <tr key={dr.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{dr.reportNumber}</td>
                          <td className="py-2.5 px-3 text-gray-500">{dr.dateReported}</td>
                          <td className="py-2.5 px-3 text-gray-800">{dr.customerName}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                dr.severity === "Severe"
                                  ? "bg-rose-100 text-rose-900"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              {dr.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">{dr.suspectedCause}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-800 font-display">
                            ${dr.estimatedRepairCost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Admin Financial Analytics (Admin Only) */}
        {activeTab === "financials" && isAdmin && (
          <div className="space-y-4">
            {/* Financial Overview Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">
                  Total Purchase Cost
                </span>
                <strong className="text-xl font-bold text-gray-900 font-display">
                  ${financialAnalytics.totalPurchaseCost.toLocaleString()}
                </strong>
                <span className="text-[10px] text-gray-400 block mt-0.5">
                  {material.totalOwned} units @ ${material.purchaseCost}
                </span>
              </div>

              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Total Rental Revenue
                </span>
                <strong className="text-xl font-bold text-emerald-950 font-display">
                  ${financialAnalytics.totalRentalRevenue.toLocaleString()}
                </strong>
                <span className="text-[10px] text-emerald-700 block mt-0.5">
                  Earned from rental contracts
                </span>
              </div>

              <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">
                  Repair & Maintenance Costs
                </span>
                <strong className="text-xl font-bold text-rose-950 font-display">
                  ${financialAnalytics.totalMaintenanceCost.toLocaleString()}
                </strong>
                <span className="text-[10px] text-rose-700 block mt-0.5">
                  Parts & labor work orders
                </span>
              </div>

              <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-300 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">
                  Net Profitability
                </span>
                <strong
                  className={`text-xl font-bold font-display ${
                    financialAnalytics.netProfit >= 0 ? "text-emerald-950" : "text-rose-900"
                  }`}
                >
                  ${financialAnalytics.netProfit.toLocaleString()}
                </strong>
                <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">
                  ROI: +{financialAnalytics.roiPercentage}%
                </span>
              </div>
            </div>

            {/* Rental Price Change History */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Rental Price History & Rate Adjustments
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Chronological audit record of daily & weekly rental price adjustments over time.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-3">Effective Date</th>
                      <th className="py-2.5 px-3">Old Daily Rate</th>
                      <th className="py-2.5 px-3">New Daily Rate</th>
                      <th className="py-2.5 px-3">Weekly Rate</th>
                      <th className="py-2.5 px-3">Authorized By</th>
                      <th className="py-2.5 px-3">Reason / Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {priceHistory.map((ph, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-gray-900">{ph.effectiveDate}</td>
                        <td className="py-2.5 px-3 text-gray-500 font-mono">
                          {ph.oldPriceDaily > 0 ? `$${ph.oldPriceDaily}` : "-"}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-900 font-mono">
                          ${ph.newPriceDaily}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-mono">${ph.newPriceWeekly}</td>
                        <td className="py-2.5 px-3 text-gray-700">{ph.changedBy}</td>
                        <td className="py-2.5 px-3 text-gray-500 text-[11px]">{ph.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue and Expense History Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-gray-50 border-b border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Revenue and Expense History Stream
                </h4>
                <p className="text-[11px] text-gray-500">
                  Itemized chronological breakdown of acquisition costs, rental revenues, and repair outlays.
                </p>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
                {financialAnalytics.timeline.map((evt) => (
                  <div key={evt.id} className="p-3 flex items-center justify-between text-xs hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                          evt.type === "Rental Revenue"
                            ? "bg-emerald-100 text-emerald-900"
                            : evt.type === "Purchase"
                            ? "bg-gray-200 text-gray-800"
                            : "bg-rose-100 text-rose-900"
                        }`}
                      >
                        {evt.type === "Rental Revenue" ? "+" : "-"}
                      </span>
                      <div>
                        <strong className="text-gray-900 block">{evt.description}</strong>
                        <span className="text-[10px] text-gray-400">
                          {evt.date} · Ref: {evt.reference}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <strong
                        className={`font-display text-sm font-bold ${
                          evt.amount >= 0 ? "text-emerald-800" : "text-rose-800"
                        }`}
                      >
                        {evt.amount >= 0 ? `+$${evt.amount.toLocaleString()}` : `-$${Math.abs(evt.amount).toLocaleString()}`}
                      </strong>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">
                        {evt.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModelGroupOverviewModal;
