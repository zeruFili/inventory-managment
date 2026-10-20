import React, { useState } from "react";
import { RentalReservation, MaterialCondition } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface ReturnCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalReservation | null;
}

export const ReturnCheckInModal: React.FC<ReturnCheckInModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  const { processReturnCheckIn, currentUser, showToast } = useApp();

  const [condition, setCondition] = useState<MaterialCondition>("Good");
  const [notes, setNotes] = useState<string>("Standard warehouse check-in inspection passed.");

  // Item returns tracker
  const [returnState, setReturnState] = useState<
    { materialId: string; returnedQty: number; missingQty: number; damagedQty: number }[]
  >([]);

  React.useEffect(() => {
    if (rental) {
      setReturnState(
        rental.items.map((i) => ({
          materialId: i.materialId,
          returnedQty: i.quantity,
          missingQty: 0,
          damagedQty: 0,
        }))
      );
    }
  }, [rental, isOpen]);

  if (!rental) return null;

  const handleUpdateItem = (
    matId: string,
    field: "returnedQty" | "missingQty" | "damagedQty",
    val: number
  ) => {
    setReturnState((prev) =>
      prev.map((item) => (item.materialId === matId ? { ...item, [field]: Math.max(0, val) } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    processReturnCheckIn(rental.id, returnState, condition, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Return Check-In: ${rental.reservationNumber}`}
      subtitle={`Customer: ${rental.customerName} · Receiving Staff: ${currentUser.name}`}
      badge="EQUIPMENT INSPECTION & CHECK-IN"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase block">
            Return Inspection Item Checklist
          </label>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {rental.items.map((item) => {
              const rItem = returnState.find((ri) => ri.materialId === item.materialId) || {
                returnedQty: item.quantity,
                missingQty: 0,
                damagedQty: 0,
              };

              return (
                <div key={item.materialId} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-gray-900 font-bold block">{item.materialName}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.materialCode} · Rented: {item.quantity} units
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-0.5">Quantity Returned</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={rItem.returnedQty}
                        onChange={(e) => handleUpdateItem(item.materialId, "returnedQty", Number(e.target.value))}
                        className="w-full text-xs font-bold border border-gray-300 rounded p-1.5 text-center bg-white text-emerald-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-rose-700 block mb-0.5">Missing Quantity</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={rItem.missingQty}
                        onChange={(e) => handleUpdateItem(item.materialId, "missingQty", Number(e.target.value))}
                        className="w-full text-xs font-bold border border-rose-300 rounded p-1.5 text-center bg-white text-rose-800 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-amber-700 block mb-0.5">Damaged Quantity</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={rItem.damagedQty}
                        onChange={(e) => handleUpdateItem(item.materialId, "damagedQty", Number(e.target.value))}
                        className="w-full text-xs font-bold border border-amber-300 rounded p-1.5 text-center bg-white text-amber-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Overall Physical Condition</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Excellent">Excellent (No defects, clean)</option>
              <option value="Good">Good (Normal event wear & tear)</option>
              <option value="Fair">Fair (Requires cleaning & touch-up)</option>
              <option value="Damaged">Damaged (Requires maintenance repair order)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Receiving Inspector</label>
            <input
              type="text"
              readOnly
              value={currentUser.name}
              className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-600 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Check-in Notes & Evidence</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Record any missing cables, stains, structural bends, or customer feedback..."
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
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
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            Complete Return Check-In
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReturnCheckInModal;
