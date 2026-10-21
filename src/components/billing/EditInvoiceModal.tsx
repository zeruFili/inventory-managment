import React, { useState, useEffect } from "react";
import { Invoice, PaymentStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface EditInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const EditInvoiceModal: React.FC<EditInvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { customers, updateInvoice } = useApp();

  const [customerId, setCustomerId] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [relatedType, setRelatedType] = useState<string>("Rental");
  const [relatedReference, setRelatedReference] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Unpaid");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (invoice) {
      setCustomerId(invoice.customerId || "");
      setCustomerName(invoice.customerName || "");
      setRelatedType(invoice.relatedType || "Rental");
      setRelatedReference(invoice.relatedReference || "");
      setDueDate(invoice.dueDate || "");
      setTotalAmount(invoice.totalAmount || 0);
      setAmountPaid(invoice.amountPaid || 0);
      setPaymentStatus(invoice.paymentStatus || "Unpaid");
      setNotes(invoice.notes || "");
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleCustomerChange = (newCustId: string) => {
    setCustomerId(newCustId);
    const found = customers.find((c) => c.id === newCustId);
    if (found) {
      setCustomerName(found.name);
    }
  };

  const handleTotalChange = (val: number) => {
    const num = Math.max(0, val);
    setTotalAmount(num);
    const bal = Math.max(0, num - amountPaid);
    if (bal === 0) setPaymentStatus("Paid");
    else if (amountPaid > 0) setPaymentStatus("Partial");
    else setPaymentStatus("Unpaid");
  };

  const handlePaidChange = (val: number) => {
    const num = Math.max(0, val);
    setAmountPaid(num);
    const bal = Math.max(0, totalAmount - num);
    if (bal === 0) setPaymentStatus("Paid");
    else if (num > 0) setPaymentStatus("Partial");
    else setPaymentStatus("Unpaid");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = Math.max(0, totalAmount - amountPaid);
    updateInvoice(invoice.id, {
      customerId,
      customerName,
      relatedType,
      relatedReference,
      dueDate,
      totalAmount,
      amountPaid,
      outstandingBalance: balance,
      paymentStatus,
      notes,
    });
    onClose();
  };

  const outstandingBalance = Math.max(0, totalAmount - amountPaid);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Invoice ${invoice.invoiceNumber}`}
      subtitle={`Modify billing details, payment status, and due dates for ${customerName || invoice.customerName}`}
      badge="EDIT INVOICE"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Customer Account
            </label>
            <select
              value={customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
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
              Billing Category / Type
            </label>
            <select
              value={relatedType}
              onChange={(e) => setRelatedType(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
            >
              <option value="Rental">Equipment Rental</option>
              <option value="Sales">Direct Sales & Supplies</option>
              <option value="Damage Assessment">Damage Assessment & Gear Loss</option>
              <option value="Rental Surcharge">Rental Extension / Surcharge</option>
              <option value="Service & Labor">Service, Delivery & Labor</option>
              <option value="General Billing">General Billing Record</option>
            </select>
          </div>
        </div>

        {/* Reference & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Related Reference
            </label>
            <input
              type="text"
              value={relatedReference}
              onChange={(e) => setRelatedReference(e.target.value)}
              placeholder="e.g. RNT-1048 or SO-2025-081"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Payment Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Financial Fields */}
        <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-200/80 space-y-3">
          <span className="text-[11px] font-bold uppercase text-gray-500 tracking-wider block">
            Financial Reconciliation
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Total Invoiced ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={totalAmount}
                onChange={(e) => handleTotalChange(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">
                Amount Paid ($)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amountPaid}
                onChange={(e) => handlePaidChange(Number(e.target.value))}
                className="w-full text-xs font-bold border border-emerald-300 rounded-lg p-2.5 bg-emerald-50/30 text-emerald-950 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-rose-800 uppercase mb-1">
                Outstanding Balance
              </label>
              <div className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2.5 bg-gray-100 text-rose-700 flex items-center justify-between">
                <span>${outstandingBalance.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-mono font-normal text-gray-500">Auto</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Internal Remarks / Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional notes or terms..."
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none focus:border-emerald-500"
              />
            </div>
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
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditInvoiceModal;
