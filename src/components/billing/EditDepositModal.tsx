import React, { useState, useEffect } from "react";
import { SecurityDepositRecord, DepositStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface EditDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: SecurityDepositRecord | null;
}

export const EditDepositModal: React.FC<EditDepositModalProps> = ({
  isOpen,
  onClose,
  deposit,
}) => {
  const { customers, updateSecurityDeposit } = useApp();

  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [rentalReference, setRentalReference] = useState<string>("");
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [deductedAmount, setDeductedAmount] = useState<number>(0);
  const [refundedAmount, setRefundedAmount] = useState<number>(0);
  const [status, setStatus] = useState<DepositStatus>("Held");
  const [receivedDate, setReceivedDate] = useState<string>("");
  const [deductionsExplanation, setDeductionsExplanation] = useState<string>("");

  useEffect(() => {
    if (deposit) {
      setCustomerId(deposit.customerId || "");
      setCustomerName(deposit.customerName || "");
      setRentalReference(deposit.rentalReference || "");
      setReceivedAmount(deposit.receivedAmount || 0);
      setDeductedAmount(deposit.deductedAmount || 0);
      setRefundedAmount(deposit.refundedAmount || 0);
      setStatus(deposit.status || "Held");
      setReceivedDate(deposit.receivedDate || "");
      setDeductionsExplanation(deposit.deductionsExplanation || "");
    }
  }, [deposit]);

  if (!deposit) return null;

  const handleCustomerChange = (id: string) => {
    setCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomerName(found.name);
    }
  };

  const remainingLiability = Math.max(
    0,
    Number(receivedAmount) - Number(deductedAmount) - Number(refundedAmount)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSecurityDeposit(deposit.id, {
      customerId,
      customerName,
      rentalReference: rentalReference.trim(),
      receivedAmount: Number(receivedAmount),
      deductedAmount: Number(deductedAmount),
      refundedAmount: Number(refundedAmount),
      remainingLiability,
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
      title={`Edit Security Deposit ${deposit.id}`}
      subtitle={`Modify deposit amounts and escrow reconciliation for ${customerName || deposit.customerName}`}
      badge="SECURITY DEPOSIT VAULT"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer & Rental Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Customer Account
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
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
              Rental Reference
            </label>
            <input
              type="text"
              value={rentalReference}
              onChange={(e) => setRentalReference(e.target.value)}
              className="w-full text-xs font-mono font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* Deposit Received & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-amber-900 uppercase mb-1">
              Deposit Received Amount ($)
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={receivedAmount}
              onChange={(e) => setReceivedAmount(Number(e.target.value))}
              className="w-full text-xs font-bold border border-amber-300 rounded-lg p-2.5 bg-amber-50/40 text-amber-950 outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Date Received
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

        {/* Financial Breakdown & Status */}
        <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase text-amber-900 tracking-wider">
              Escrow Liability Calculation
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
                Deducted Amount ($)
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
                Refunded Amount ($)
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
              Deductions / Trust Explanation
            </label>
            <input
              type="text"
              value={deductionsExplanation}
              onChange={(e) => setDeductionsExplanation(e.target.value)}
              placeholder="e.g. Damage deduction or return refund note"
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
            Update Deposit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditDepositModal;
