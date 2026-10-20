import React, { useState } from "react";
import { RentalReservation } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";

interface RentalExtensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalReservation | null;
}

export const RentalExtensionModal: React.FC<RentalExtensionModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  const { extendRental, showToast } = useApp();

  const [newReturnDate, setNewReturnDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [managerOverride, setManagerOverride] = useState<boolean>(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  React.useEffect(() => {
    if (rental) {
      // Default new return date +2 days
      const current = new Date(rental.expectedReturnDate);
      current.setDate(current.getDate() + 2);
      setNewReturnDate(current.toISOString().slice(0, 16));
      setConflictWarning(null);
      setManagerOverride(false);
    }
  }, [rental, isOpen]);

  if (!rental) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReturnDate) return;

    const result = extendRental(rental.id, newReturnDate, reason || "Customer requested schedule extension", managerOverride);
    if (!result.success) {
      setConflictWarning(result.conflictMessage || "Availability conflict detected.");
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Extend Rental: ${rental.reservationNumber}`}
      subtitle={`Customer: ${rental.customerName} · Current Return: ${rental.expectedReturnDate.replace("T", " ")}`}
      badge="RENTAL EXTENSION"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {conflictWarning && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
            <Icon name="alert" size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Booking Collision Alert!</strong>
              <p className="mt-0.5">{conflictWarning}</p>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="overrideBox"
                  checked={managerOverride}
                  onChange={(e) => setManagerOverride(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300"
                />
                <label htmlFor="overrideBox" className="font-bold text-rose-950 cursor-pointer">
                  General Management Authorization: Override collision and reallocate backup equipment
                </label>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">New Expected Return Date & Time</label>
          <input
            type="datetime-local"
            required
            value={newReturnDate}
            onChange={(e) => {
              setNewReturnDate(e.target.value);
              setConflictWarning(null);
            }}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Reason for Extension</label>
          <textarea
            rows={2}
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Festival prolonged by 2 days due to additional encore performances..."
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Rented Materials:</span>
            <strong className="text-gray-900">{rental.items.reduce((acc, i) => acc + i.quantity, 0)} items</strong>
          </div>
          <div className="flex justify-between">
            <span>Daily Rental Subtotal:</span>
            <strong className="text-gray-900">${rental.subtotal}</strong>
          </div>
          <p className="text-[11px] text-gray-400 pt-1">
            Additional rental days will be automatically billed on the rental invoice upon return.
          </p>
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
            Confirm Extension
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RentalExtensionModal;
