import React, { useState } from "react";
import { RepairWorkOrder, RentalReservation } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import ReturnCheckInModal from "./ReturnCheckInModal";
import DamageReportModal from "./DamageReportModal";
import WorkOrderModal from "./WorkOrderModal";

export const MaintenanceView: React.FC = () => {
  const { rentals, damageReports, workOrders, materials, can } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "damage" | "returns">("orders");

  // Modals
  const [returnRental, setReturnRental] = useState<RentalReservation | null>(null);
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderToEdit, setWorkOrderToEdit] = useState<RepairWorkOrder | null>(null);

  const activeRentalsToReturn = rentals.filter((r) => r.status === "Active" || r.status === "Overdue");
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
            MAINTENANCE EXPENSE
          </span>
          <strong className="text-2xl font-bold text-emerald-950 font-display mt-1 block">
            ${totalRepairCost.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">-8.4% vs May budget</span>
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
            <Icon name="check" size={14} />
            Check-In Desk ({activeRentalsToReturn.length} Active Rentals)
          </button>
        </div>
      </div>

      {/* Content */}
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
                      {can("manage_maintenance") && (
                        <button
                          onClick={() => {
                            setWorkOrderToEdit(wo);
                            setIsWorkOrderModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Update work order or sign off inspection"
                        >
                          Update / Certify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {activeTab === "returns" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
            <span className="font-bold">Receiving Desk: Active & Overdue Rentals Awaiting Return Check-In</span>
            <span className="text-gray-500">{activeRentalsToReturn.length} active events</span>
          </div>

          <div className="divide-y divide-gray-100">
            {activeRentalsToReturn.map((rent) => (
              <div key={rent.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-gray-900">{rent.reservationNumber}</strong>
                    <Badge tone={rent.isOverdue ? "red" : "yellow"} size="sm">
                      {rent.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-0.5">
                    Customer: <strong>{rent.customerName}</strong> · Expected: {rent.expectedReturnDate.replace("T", " ")}
                  </p>
                  <span className="text-[11px] text-gray-400">
                    Cargo: {rent.items.map((i) => `${i.quantity}x ${i.materialName}`).join(", ")}
                  </span>
                </div>

                <button
                  onClick={() => setReturnRental(rent)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs"
                >
                  Start Return Check-In & Checklist
                </button>
              </div>
            ))}

            {!activeRentalsToReturn.length && (
              <p className="py-12 text-center text-gray-400 italic">No active rentals currently awaiting check-in.</p>
            )}
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
    </div>
  );
};

export default MaintenanceView;
