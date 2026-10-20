import React, { useState } from "react";
import { Material, StockMovementType } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface StockMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMaterial?: Material | null;
}

export const StockMovementModal: React.FC<StockMovementModalProps> = ({
  isOpen,
  onClose,
  selectedMaterial,
}) => {
  const { materials, recordStockMovement, showToast } = useApp();

  const [materialId, setMaterialId] = useState<string>(selectedMaterial ? selectedMaterial.id : materials[0]?.id || "");
  const [movementType, setMovementType] = useState<StockMovementType>("Purchase Receipt");
  const [quantity, setQuantity] = useState<number>(10);
  const [fromLoc, setFromLoc] = useState<string>("Supplier / Inbound");
  const [toLoc, setToLoc] = useState<string>("Central Warehouse (Bay A-01)");
  const [referenceId, setReferenceId] = useState<string>("PO-2025-010");
  const [notes, setNotes] = useState<string>("");

  const activeMat = materials.find((m) => m.id === (selectedMaterial?.id || materialId)) || materials[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMat) return;
    if (quantity <= 0) {
      showToast("Quantity must be greater than zero.", "warning");
      return;
    }

    recordStockMovement(
      activeMat.id,
      movementType,
      quantity,
      fromLoc,
      toLoc,
      referenceId,
      notes || `${movementType} executed by user`
    );

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock Movement"
      subtitle="Adjust stock levels, receive shipments, or transfer between warehouses"
      badge="STOCK CONTROL"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Material</label>
          <select
            value={selectedMaterial ? selectedMaterial.id : materialId}
            disabled={!!selectedMaterial}
            onChange={(e) => setMaterialId(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code}) — {m.physicallyAvailable} Available / {m.totalOwned} Total
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Movement Type</label>
            <select
              value={movementType}
              onChange={(e) => {
                const val = e.target.value as StockMovementType;
                setMovementType(val);
                if (val === "Purchase Receipt") {
                  setFromLoc("Supplier Inbound");
                  setToLoc(activeMat?.warehouse || "Central Warehouse");
                  setReferenceId(`PO-${Date.now().toString().slice(-4)}`);
                } else if (val === "Warehouse Transfer") {
                  setFromLoc(activeMat?.warehouse || "Central Warehouse");
                  setToLoc("East Branch Depot");
                  setReferenceId(`TRF-${Date.now().toString().slice(-4)}`);
                } else if (val === "Damage Write-off") {
                  setFromLoc(activeMat?.storageLocation || "Central Yard");
                  setToLoc("Decommissioned Salvage");
                  setReferenceId(`WOFF-${Date.now().toString().slice(-4)}`);
                } else if (val === "Repair Release") {
                  setFromLoc("Repair Workshop");
                  setToLoc(activeMat?.warehouse || "Central Warehouse");
                  setReferenceId(`WO-RELEASE-${Date.now().toString().slice(-4)}`);
                }
              }}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Purchase Receipt">Purchase Receipt (Add Total & Available)</option>
              <option value="Warehouse Transfer">Warehouse Transfer (Move Location)</option>
              <option value="Damage Write-off">Damage Write-off (Deduct Permanently)</option>
              <option value="Repair Release">Repair Release (Return from Repair)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Quantity ({activeMat?.unitOfMeasure || "units"})
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">From Location</label>
            <input
              type="text"
              value={fromLoc}
              onChange={(e) => setFromLoc(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">To Location</label>
            <input
              type="text"
              value={toLoc}
              onChange={(e) => setToLoc(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reference ID (PO / TRF / RMA)</label>
          <input
            type="text"
            required
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Movement Notes & Reason</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document reason for adjustment, delivery carrier bill of lading, or inspection findings..."
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            Confirm & Log Movement
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockMovementModal;
