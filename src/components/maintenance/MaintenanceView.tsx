import React, { useState, useMemo } from "react";
import { RepairWorkOrder, RentalReservation } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import ReturnCheckInModal from "./ReturnCheckInModal";
import DamageReportModal from "./DamageReportModal";
import WorkOrderModal from "./WorkOrderModal";
import BackToInventoryModal from "./BackToInventoryModal";

export const MaintenanceView: React.FC = () => {
  const { rentals, damageReports, workOrders, materials, can } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "damage" | "returns">("orders");

  // Modals
  const [returnRental, setReturnRental] = useState<RentalReservation | null>(null);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderToEdit, setWorkOrderToEdit] = useState<RepairWorkOrder | null>(null);
  const [workOrderToRestock, setWorkOrderToRestock] = useState<RepairWorkOrder | null>(null);
  const [rentalToRestock, setRentalToRestock] = useState<RentalReservation | null>(null);

  // Maintained orders sub-filter & search
  const [maintainedFilter, setMaintainedFilter] = useState<"all" | "awaiting" | "restocked">("all");
  const [maintainedSearch, setMaintainedSearch] = useState<string>("");

  const activeRentalsToReturn = rentals.filter((r) => r.status === "Active" || r.status === "Overdue");
  const restockedRentals = rentals.filter((r) => r.status === "Returned");
  const allMaintainedRentals = rentals.filter((r) => r.status === "Active" || r.status === "Overdue" || r.status === "Returned");

  const filteredMaintainedRentals = useMemo(() => {
    return allMaintainedRentals.filter((r) => {
      if (maintainedFilter === "awaiting" && r.status === "Returned") return false;
      if (maintainedFilter === "restocked" && r.status !== "Returned") return false;

      if (!maintainedSearch.trim()) return true;
      const q = maintainedSearch.toLowerCase();
      return (
        r.reservationNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.items.some((i) => i.materialName.toLowerCase().includes(q) || i.materialCode.toLowerCase().includes(q))
      );
    });
  }, [allMaintainedRentals, maintainedFilter, maintainedSearch]);

  const totalRepairCost = workOrders.reduce((acc, wo) => acc + wo.totalCost, 0);
  const itemsUnderRepairCount = materials.reduce((acc, m) => acc + m.underRepair, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            ASSET INTEGRITY & WORKSHOP
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Inspection, Damage & Maintenance
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Process gear check-in checklists, evaluate damage claims, and track workshop repair certifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("manage_maintenance") && (
            <>
              <button
                onClick={() => setIsDamageModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors shadow-2xs"
              >
                <Icon name="alert" size={14} />
                File Damage Report
              </button>
              <button
                onClick={() => {
                  setWorkOrderToEdit(null);
                  setIsWorkOrderModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
              >
                <Icon name="plus" size={14} />
                New Work Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            ITEMS UNDER REPAIR
          </span>
          <strong className="text-2xl font-bold text-rose-700 font-display mt-1 block">
            {itemsUnderRepairCount} Units
          </strong>
          <span className="text-[11px] text-gray-500 mt-1 block font-medium">Restricted from rentable stock</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-2xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
            ACTIVE WORK ORDERS
          </span>
          <strong className="text-2xl font-bold text-amber-950 font-display mt-1 block">
            {workOrders.filter((w) => w.status !== "Completed").length} In Progress
          </strong>
          <span className="text-[11px] text-amber-800 mt-1 block font-medium">Assigned to certified technicians</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            OPEN DAMAGE CLAIMS
          </span>
          <strong className="text-2xl font-bold text-gray-900 font-display mt-1 block">
            {damageReports.length} Incidents
          </strong>
          <span className="text-[11px] text-gray-500 mt-1 block font-medium">Assessed with photographic evidence</span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
            MAINTAINED ORDERS AWAITING RESTOCK
          </span>
          <strong className="text-2xl font-bold text-emerald-950 font-display mt-1 block">
            {activeRentalsToReturn.length} Orders
          </strong>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">
            {restockedRentals.length} successfully restocked
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "orders" ? "bg-emerald-950 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="wrench" size={14} />
            Repair Work Orders ({workOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("damage")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "damage" ? "bg-emerald-950 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="alert" size={14} />
            Damage Reports ({damageReports.length})
          </button>
          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === "returns" ? "bg-emerald-950 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon name="box" size={14} />
            Maintained Orders ({activeRentalsToReturn.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Repair Work Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Work Order #</th>
                  <th className="py-3 px-3">Equipment Item</th>
                  <th className="py-3 px-3">Assigned Technician</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Cost (Parts + Labor)</th>
                  <th className="py-3 px-3">Final Inspection</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{wo.workOrderNumber}</td>

                    <td className="py-3 px-3">
                      <strong className="text-gray-900 block font-bold">{wo.materialName}</strong>
                      <span className="text-[10px] text-gray-500">{wo.workPerformed}</span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-gray-800">{wo.assignedTechnician}</td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          wo.priority === "Urgent"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : wo.priority === "High"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {wo.priority}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <strong className="text-gray-900 font-display">${wo.totalCost}</strong>
                      <span className="text-[10px] text-gray-400 block">
                        Parts: ${wo.sparePartsCost} · Labor: ${wo.laborCost}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {wo.finalInspectionPassed ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Icon name="check" size={12} /> Certified & Passed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Pending Inspection
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        tone={wo.status === "Completed" ? "green" : wo.status === "In Progress" ? "yellow" : "red"}
                        size="sm"
                      >
                        {wo.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {can("manage_maintenance") && (
                          <>
                            {wo.status !== "Completed" ? (
                              <button
                                onClick={() => {
                                  setRentalToRestock(null);
                                  setWorkOrderToRestock(wo);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-md transition-colors shadow-2xs"
                                title="Restock this equipment back to inventory and select its condition"
                              >
                                <Icon name="box" size={12} />
                                Back to Inventory
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md">
                                <Icon name="check" size={10} /> Restocked ({wo.postRepairCondition || "Good"})
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setWorkOrderToEdit(wo);
                                setIsWorkOrderModalOpen(true);
                              }}
                              className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                              title="Update work order or edit details"
                            >
                              Update
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Damage Reports */}
      {activeTab === "damage" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {damageReports.map((claim) => (
            <div
              key={claim.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                  <div>
                    <strong className="text-sm font-bold text-gray-900 block font-mono">{claim.reportNumber}</strong>
                    <span className="text-[10px] text-gray-500 font-medium">Rental Ref: {claim.rentalReference}</span>
                  </div>
                  <Badge tone={claim.severity === "Severe" ? "red" : "yellow"}>
                    {claim.severity} Damage
                  </Badge>
                </div>

                <div className="mt-3 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Material Damaged</span>
                    <strong className="text-gray-900 block font-bold">{claim.materialName}</strong>
                    <p className="text-gray-600 mt-1 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                      "{claim.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Suspected Cause</span>
                      <strong className="text-gray-800">{claim.suspectedCause}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Responsibility</span>
                      <strong className="text-rose-900 font-bold">{claim.responsibilityAssessment}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Estimated Repair</span>
                      <strong className="text-gray-900 font-display">${claim.estimatedRepairCost}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Proposed Client Charge</span>
                      <strong className="text-rose-700 font-display">${claim.proposedCustomerCharge}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                    <span>Reported by: {claim.reportedBy}</span>
                    <Badge tone={claim.disputeStatus === "Agreed" ? "green" : "red"} size="sm">
                      {claim.disputeStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Maintained Orders (formerly Check-In Desk) */}
      {activeTab === "returns" && (
        <div className="space-y-4">
          {/* Maintained Orders Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setMaintainedFilter("all")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  maintainedFilter === "all"
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                All Maintained Orders ({allMaintainedRentals.length})
              </button>
              <button
                onClick={() => setMaintainedFilter("awaiting")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  maintainedFilter === "awaiting"
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                Awaiting Restock
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                  {activeRentalsToReturn.length}
                </span>
              </button>
              <button
                onClick={() => setMaintainedFilter("restocked")}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  maintainedFilter === "restocked"
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                }`}
              >
                Restocked in Inventory
                <span className="px-1.5 py-0.2 bg-emerald-700 text-white rounded-full text-[10px]">
                  {restockedRentals.length}
                </span>
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Search order #, customer, gear..."
                value={maintainedSearch}
                onChange={(e) => setMaintainedSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-emerald-900 outline-none"
              />
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-400">
                <Icon name="search" size={13} />
              </div>
            </div>
          </div>

          {/* Maintained Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
              <div>
                <strong className="font-bold block">Maintained Orders & Inventory Receiving Desk</strong>
                <span className="text-[11px] text-emerald-800">
                  Inspect equipment condition and certify gear to return back to available inventory.
                </span>
              </div>
              <span className="text-gray-500 font-semibold">{filteredMaintainedRentals.length} orders shown</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Order / Reservation #</th>
                    <th className="py-3 px-3">Customer & Contact</th>
                    <th className="py-3 px-3">Expected Return</th>
                    <th className="py-3 px-3">Cargo Items</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMaintainedRentals.map((rent) => (
                    <tr key={rent.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {rent.reservationNumber}
                        <span className="text-[10px] text-gray-400 font-sans block font-normal">
                          {rent.contractNumber || "Standard Contract"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <strong className="text-gray-900 block font-bold">{rent.customerName}</strong>
                        <span className="text-[10px] text-gray-500">{rent.customerPhone}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-gray-900 block">
                          {rent.expectedReturnDate.replace("T", " ")}
                        </span>
                        {rent.isOverdue && (
                          <span className="text-[10px] font-bold text-rose-700 block">
                            Overdue by {rent.overdueDays || 1} day(s)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {rent.items.map((i) => (
                            <span
                              key={i.materialId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md text-[10px] font-medium"
                            >
                              <strong className="text-emerald-950 font-bold">{i.quantity}x</strong> {i.materialName}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        {rent.status === "Returned" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200">
                            <Icon name="check" size={10} /> Restocked
                          </span>
                        ) : (
                          <Badge tone={rent.isOverdue ? "red" : "yellow"} size="sm">
                            {rent.status}
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rent.status !== "Returned" ? (
                            <>
                              <button
                                onClick={() => {
                                  setWorkOrderToRestock(null);
                                  setRentalToRestock(rent);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-2xs"
                                title="Restock this maintained order back to available inventory and select material condition"
                              >
                                <Icon name="box" size={13} />
                                Back to Inventory
                              </button>
                              <button
                                onClick={() => setReturnRental(rent)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Run full checklist inspection"
                              >
                                Checklist
                              </button>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
                              <Icon name="check" size={12} />
                              In Stock
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!filteredMaintainedRentals.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 italic">
                        No maintained orders match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ReturnCheckInModal
        isOpen={!!returnRental}
        onClose={() => setReturnRental(null)}
        rental={returnRental}
      />

      <DamageReportModal
        isOpen={isDamageModalOpen}
        onClose={() => setIsDamageModalOpen(false)}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        orderToUpdate={workOrderToEdit}
      />

      {/* Reusable Back to Inventory Modal with Condition Selection */}
      <BackToInventoryModal
        isOpen={!!workOrderToRestock || !!rentalToRestock}
        onClose={() => {
          setWorkOrderToRestock(null);
          setRentalToRestock(null);
        }}
        workOrder={workOrderToRestock}
        rentalOrder={rentalToRestock}
      />
    </div>
  );
};

export default MaintenanceView;
