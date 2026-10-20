import React, { useState } from "react";
import { RentalReservation } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";

interface OverdueResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalReservation | null;
}

export const OverdueResolutionModal: React.FC<OverdueResolutionModalProps> = ({
  isOpen,
  onClose,
  rental,
}) => {
  const { resolveOverdueRental, currentUser } = useApp();

  const [cause, setCause] = useState<string>("Company Transport Failed to Collect");
  const [contactAttempts, setContactAttempts] = useState<string>("Phone call on June 17, client stated items ready for pickup");
  const [promisedReturnDate, setPromisedReturnDate] = useState<string>("2025-06-20");
  const [standardLateFee, setStandardLateFee] = useState<number>(120);
  const [waiveFee, setWaiveFee] = useState<boolean>(true);
  const [investigationNotes, setInvestigationNotes] = useState<string>(
    "Driver vehicle had a flat tire on scheduled collection date. Customer was ready and is not at fault. Late fee waived."
  );

  if (!rental) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feeToCharge = waiveFee ? 0 : standardLateFee;
    resolveOverdueRental(rental.id, cause, feeToCharge, waiveFee, `${contactAttempts} | ${investigationNotes} | Promised: ${promisedReturnDate}`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Overdue Resolution: ${rental.reservationNumber}`}
      subtitle={`Customer: ${rental.customerName} · Expected Return: ${rental.expectedReturnDate.slice(0, 10)} (${rental.overdueDays || 2} days overdue)`}
      badge="OVERDUE & RESPONSIBILITY INVESTIGATION"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Icon name="alert" size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Fair Responsibility Policy:</strong> Do not automatically penalize or blame the customer. Investigate whether the delay was caused by company transport, courier delays, or unresolved dispute.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Root Cause of Delay</label>
          <select
            value={cause}
            onChange={(e) => {
              setCause(e.target.value);
              if (e.target.value.includes("Company Transport") || e.target.value.includes("Dispute")) {
                setWaiveFee(true);
              } else {
                setWaiveFee(false);
              }
            }}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Company Transport Failed to Collect">Company Transport Failed to Collect (Driver Issue / Logistics Delay)</option>
            <option value="Courier Partner Transit Delay">Courier Partner Transit Delay</option>
            <option value="Customer Unexcused Delay">Customer Unexcused Delay (Items withheld without notice)</option>
            <option value="Weather / Force Majeure Event">Weather / Force Majeure Event</option>
            <option value="Unresolved Responsibility Dispute">Unresolved Responsibility Dispute (Escalated to Management)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Contact Attempts</label>
            <input
              type="text"
              required
              value={contactAttempts}
              onChange={(e) => setContactAttempts(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Promised Return Date</label>
            <input
              type="date"
              required
              value={promisedReturnDate}
              onChange={(e) => setPromisedReturnDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-900">Calculated Late-Return Charge:</span>
            <span className="text-sm font-bold text-gray-900">${standardLateFee}</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
            <input
              type="checkbox"
              id="waiveFee"
              checked={waiveFee}
              onChange={(e) => setWaiveFee(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <label htmlFor="waiveFee" className="text-xs font-bold text-emerald-950 cursor-pointer">
              Waive Late Charge (Approved by {currentUser.name} - {currentUser.role.replace("_", " ").toUpperCase()})
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Investigation Evidence & Manager Notes
          </label>
          <textarea
            rows={2}
            required
            value={investigationNotes}
            onChange={(e) => setInvestigationNotes(e.target.value)}
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
            Save Resolution & Log Audit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default OverdueResolutionModal;
