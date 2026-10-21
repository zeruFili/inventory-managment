import React, { useState } from "react";
import { RepairWorkOrder, RentalReservation, MaterialCondition } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";

interface BackToInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder?: RepairWorkOrder | null;
  rentalOrder?: RentalReservation | null;
}

export const BackToInventoryModal: React.FC<BackToInventoryModalProps> = ({
  isOpen,
  onClose,
  workOrder,
  rentalOrder,
}) => {
  const { materials, updateWorkOrderStatus, restockRentalToInventory } = useApp();
  const [condition, setCondition] = useState<MaterialCondition>("Good");
  const [releaseNotes, setReleaseNotes] = useState<string>("");

  React.useEffect(() => {
    if (rentalOrder) {
      setCondition("Good");
      setReleaseNotes(
        `Maintained order inspection passed. Equipment returned in event-ready condition and restocked to warehouse.`
      );
    } else if (workOrder) {
      setCondition(workOrder.postRepairCondition || "Good");
      setReleaseNotes(
        workOrder.workPerformed
          ? `Work completed: ${workOrder.workPerformed}. Certified and released back to available inventory.`
          : "Maintenance completed. Equipment certified and restored to available stock."
      );
    }
  }, [workOrder, rentalOrder, isOpen]);

  if (!workOrder && !rentalOrder) return null;

  const totalItemsCount = rentalOrder
    ? rentalOrder.items.reduce((acc, i) => acc + i.quantity, 0)
    : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rentalOrder) {
      restockRentalToInventory(rentalOrder.id, condition, releaseNotes);
    } else if (workOrder) {
      updateWorkOrderStatus(workOrder.id, "Completed", true, condition, releaseNotes);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Restock Equipment Back to Inventory"
      subtitle={
        rentalOrder
          ? `Maintained Order: ${rentalOrder.reservationNumber} · Customer: ${rentalOrder.customerName}`
          : `Workshop Order: ${workOrder?.workOrderNumber} · Technician: ${workOrder?.assignedTechnician}`
      }
      badge="INVENTORY RESTOCK"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* If Rental Order: List all materials being restocked */}
        {rentalOrder ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Materials Returning to Inventory ({rentalOrder.items.length} items · {totalItemsCount} units)
              </span>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                {rentalOrder.reservationNumber}
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {rentalOrder.items.map((item) => {
                const mat = materials.find((m) => m.id === item.materialId);
                return (
                  <div
                    key={item.materialId}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {mat?.imageUrl ? (
                        <img
                          src={mat.imageUrl}
                          alt={item.materialName}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200 bg-white shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-bold shrink-0">
                          <Icon name="box" size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <strong className="text-gray-900 block font-bold truncate">
                          {item.materialName}
                        </strong>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {item.materialCode} · Category: {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 text-xs font-bold text-emerald-950 bg-emerald-100/70 border border-emerald-200 rounded-lg">
                        +{item.quantity} units
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : workOrder ? (
          /* If Work Order: Single Material Card */
          (() => {
            const mat = materials.find((m) => m.id === workOrder.materialId);
            return (
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                {mat?.imageUrl ? (
                  <img
                    src={mat.imageUrl}
                    alt={workOrder.materialName}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-white shadow-2xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-emerald-950 text-white flex items-center justify-center font-bold">
                    <Icon name="box" size={20} />
                  </div>
                )}
                <div className="min-w-0 flex-1 text-xs">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">
                    Work Order #{workOrder.workOrderNumber} · {mat?.code || mat?.model || "Item"}
                  </span>
                  <strong className="text-sm font-bold text-gray-900 block truncate">
                    {workOrder.materialName}
                  </strong>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-600">
                    <span>Technician: <strong className="text-gray-900">{workOrder.assignedTechnician}</strong></span>
                    <span>·</span>
                    <span>Repair Cost: <strong className="text-emerald-800 font-display">${workOrder.totalCost}</strong></span>
                  </div>
                </div>
              </div>
            );
          })()
        ) : null}

        {/* Condition Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Select Physical Condition of Restocked Material *
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                id: "New" as MaterialCondition,
                label: "New",
                sub: "Brand new replacement / pristine condition",
                tone: "border-blue-300 bg-blue-50/50 text-blue-900",
              },
              {
                id: "Excellent" as MaterialCondition,
                label: "Excellent",
                sub: "Like new, flawless functionality & zero blemishes",
                tone: "border-emerald-300 bg-emerald-50/50 text-emerald-900",
              },
              {
                id: "Good" as MaterialCondition,
                label: "Good",
                sub: "Standard event operational condition, minor normal wear",
                tone: "border-teal-300 bg-teal-50/50 text-teal-900",
              },
              {
                id: "Fair" as MaterialCondition,
                label: "Fair",
                sub: "Fully operational, visible cosmetic signs of use",
                tone: "border-amber-300 bg-amber-50/50 text-amber-900",
              },
            ].map((cond) => {
              const isSelected = condition === cond.id;
              return (
                <button
                  key={cond.id}
                  type="button"
                  onClick={() => setCondition(cond.id)}
                  className={`p-3 text-left rounded-xl border transition-all ${
                    isSelected
                      ? "border-emerald-950 bg-emerald-50/80 ring-2 ring-emerald-900/20 shadow-xs"
                      : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-bold text-gray-900">{cond.label}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-emerald-950 bg-emerald-950" : "border-gray-300"
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-tight">{cond.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Certification Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Inspection & Restock Notes
          </label>
          <textarea
            rows={2}
            value={releaseNotes}
            onChange={(e) => setReleaseNotes(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 text-gray-900 focus:bg-white focus:border-emerald-900 outline-none"
            placeholder="Document testing, quality sign-off, or return inspection remarks..."
          />
        </div>

        {/* Notice Info Box */}
        <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
          <Icon name="check" size={16} className="text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block">Inventory Balance Impact</strong>
            <span className="text-[11px] text-emerald-800">
              {rentalOrder
                ? `Confirming this restock restores all ${totalItemsCount} units across this order back to "Physically Available" stock under "${condition}" condition, and marks the rental order as Returned.`
                : `Confirming this release decrements 1 unit from "Under Repair" and immediately increments "Physically Available" stock in the inventory catalog under the selected "${condition}" condition.`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-xl transition-colors shadow-xs"
          >
            <Icon name="box" size={14} />
            Confirm Back to Inventory
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BackToInventoryModal;
