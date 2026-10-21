import React, { useState } from "react";
import { DepositStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface CreateDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateDepositModal: React.FC<CreateDepositModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, rentals, createSecurityDeposit } = useApp();

  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || "");
  const [rentalReference, setRentalReference] = useState<string>(
    rentals[0]?.reservationNumber || "RNT-1050"
  );
  const [receivedAmount, setReceivedAmount] = useState<number>(1000);
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState<DepositStatus>("Held");
  const [deductedAmount, setDeductedAmount] = useState<number>(0);
  const [refundedAmount, setRefundedAmount] = useState<number>(0);
  const [deductionsExplanation, setDeductionsExplanation] = useState<string>("");

  if (!isOpen) return null;

  const handleCustomerSelect = (id: string) => {
    setCustomerId(id);
    // Auto-match rental if available
    const matchedRental = rentals.find((r) => r.customerId === id);
    if (matchedRental) {
      setRentalReference(matchedRental.reservationNumber);
    }
  };

  const remainingLiability = Math.max(
    0,
    Number(receivedAmount) - Number(deductedAmount) - Number(refundedAmount)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === customerId);

    createSecurityDeposit({
      customerId,
      customerName: customer ? customer.name : "Client Account",
      rentalReference: rentalReference.trim() || "RNT-GEN",
      receivedAmount: Number(receivedAmount),
      deductedAmount: Number(deductedAmount),
      refundedAmount: Number(refundedAmount),
      status,
      receivedDate,
      deductionsExplanation: deductionsExplanation.trim() || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Security Deposit Record"
      subtitle="Record new equipment security deposit received into the escrow trust vault"
      badge="SECURITY DEPOSIT VAULT"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer & Rental Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Customer / Client Account *
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerSelect(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-amber-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Rental Reservation Ref *
            </label>
            <input
              type="text"
              value={rentalReference}
              onChange={(e) => setRentalReference(e.target.value)}
              placeholder="e.g. RNT-1048"
              className="w-full text-xs font-mono font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* Deposit Amount & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
              Deposit Received Amount ($) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(Number(e.target.value))}
              className="w-full text-xs font-bold border border-amber-300 rounded-lg p-2.5 bg-amber-50/40 text-amber-950 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Date Received *
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* Status & Deductions */}
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase text-amber-900 tracking-wider">
              Deposit Trust Reconciliation
            </span>
            <span className="text-xs font-bold text-amber-950">
              Remaining Liability: ${remainingLiability.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                Vault Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DepositStatus)}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              >
                <option value="Held">Held (In Escrow)</option>
                <option value="Partially Deducted">Partially Deducted</option>
                <option value="Deducted">Deducted (Damage)</option>
                <option value="Refunded">Refunded (Settled)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-rose-700 uppercase mb-1">
                Deducted ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={deductedAmount}
                onChange={(e) => setDeductedAmount(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white text-rose-700 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-800 uppercase mb-1">
                Refunded ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={refundedAmount}
                onChange={(e) => setRefundedAmount(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white text-emerald-800 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
              Trust Notes / Explanation
            </label>
            <input
              type="text"
              value={deductionsExplanation}
              onChange={(e) => setDeductionsExplanation(e.target.value)}
              placeholder="e.g. Standard 20% security deposit held for wedding marquee rental"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-lg transition-colors shadow-xs"
          >
            Save Deposit Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateDepositModal;
