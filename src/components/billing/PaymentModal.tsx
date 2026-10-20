import React, { useState } from "react";
import { Invoice } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { recordInvoicePayment, showToast } = useApp();

  const [amount, setAmount] = useState<number>(invoice?.outstandingBalance || 0);
  const [method, setMethod] = useState<string>("Bank Transfer");
  const [reference, setReference] = useState<string>(`TX-${Date.now().toString().slice(-4)}`);

  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.outstandingBalance);
      setReference(`TX-${Date.now().toString().slice(-4)}`);
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      showToast("Payment amount must be greater than zero.", "warning");
      return;
    }

    recordInvoicePayment(invoice.id, Number(amount), method, reference);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${invoice.invoiceNumber}`}
      subtitle={`Customer: ${invoice.customerName} · Outstanding Balance: $${invoice.outstandingBalance}`}
      badge="BILLING & SETTLEMENTS"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Amount ($) *</label>
          <input
            type="number"
            step="0.01"
            min="1"
            max={invoice.outstandingBalance}
            required
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full text-base font-extrabold border border-gray-300 rounded-lg p-2.5 bg-white text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none font-display"
          />
          <span className="text-[10px] text-gray-400 mt-1 block">
            Maximum payable for this invoice: ${invoice.outstandingBalance}
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          >
            <option value="Bank Transfer">Bank Wire / ACH Transfer</option>
            <option value="Credit Card">Credit / Debit Card</option>
            <option value="Cash">Cash at Warehouse Counter</option>
            <option value="Mobile Payment">Mobile Money / Stripe Link</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Payment Reference / Tx Code</label>
          <input
            type="text"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none font-mono"
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
            Record Payment Receipt
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PaymentModal;
