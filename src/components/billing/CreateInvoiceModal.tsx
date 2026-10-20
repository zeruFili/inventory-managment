import React, { useState, useMemo } from "react";
import { Invoice, PaymentStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";
import MaterialSelectorSection, { SelectedItemLine } from "../common/MaterialSelectorSection";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ isOpen, onClose }) => {
  const { customers, materials, createInvoice, currentUser } = useApp();

  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || "");
  const [relatedType, setRelatedType] = useState<string>("Damage Assessment");
  const [relatedReference, setRelatedReference] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );

  // Line items via reusable material selector
  const [lines, setLines] = useState<SelectedItemLine[]>([]);

  // Additional charges
  const [damageCharges, setDamageCharges] = useState<number>(0);
  const [lateFees, setLateFees] = useState<number>(0);
  const [transportFees, setTransportFees] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);

  // Payment info
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === customerId) || customers[0];
  }, [customers, customerId]);

  // Compute invoice material lines and subtotal
  const invoiceItems = useMemo(() => {
    return lines.map((line) => {
      const mat = materials.find((m) => m.id === line.materialId);
      const unitPrice = mat ? (mat.replacementValue || mat.purchaseCost) : 0;
      return {
        materialId: line.materialId,
        materialName: mat ? mat.name : "Material Item",
        quantity: line.quantity,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
      };
    });
  }, [lines, materials]);

  const itemsSubtotal = useMemo(() => {
    return invoiceItems.reduce((acc, item) => acc + item.lineTotal, 0);
  }, [invoiceItems]);

  const netSubtotal = Math.max(0, itemsSubtotal + damageCharges + lateFees + transportFees - discount);
  const tax = Math.round(netSubtotal * 0.05 * 100) / 100; // 5% standard VAT
  const totalAmount = Math.round((netSubtotal + tax) * 100) / 100;
  const outstandingBalance = Math.max(0, totalAmount - Number(amountPaid));

  const handleStatusChange = (status: PaymentStatus) => {
    setPaymentStatus(status);
    if (status === "Paid") {
      setAmountPaid(totalAmount);
    } else if (status === "Unpaid") {
      setAmountPaid(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeCustomer) return;

    createInvoice({
      relatedType,
      relatedReference: relatedReference || `BIL-${Date.now().toString().slice(-4)}`,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate,
      subtotal: itemsSubtotal,
      tax,
      lateFees: Number(lateFees),
      damageCharges: Number(damageCharges),
      transportFees: Number(transportFees),
      totalAmount,
      amountPaid: Number(amountPaid),
      outstandingBalance,
      paymentStatus:
        amountPaid >= totalAmount ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid",
      items: invoiceItems,
      notes,
      payments:
        amountPaid > 0
          ? [
              {
                paymentId: `PAY-${Date.now().toString().slice(-4)}`,
                amount: Number(amountPaid),
                method: paymentMethod,
                reference: `REC-${Date.now().toString().slice(-5)}`,
                recordedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
                recordedBy: currentUser.name,
              },
            ]
          : [],
      isVerbalAgreement: false,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Billing Record & Invoice"
      subtitle="Bill for damaged gear, replacement items, surcharges, or custom services"
      badge="FINANCE & BILLING"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer and Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Customer / Billing Account *
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type}) — {c.email}
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
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Damage Assessment">Damage Assessment & Gear Loss</option>
              <option value="Rental Surcharge">Rental Extension / Late Surcharge</option>
              <option value="Consumables & Materials">Consumables & Materials Sale</option>
              <option value="Service & Labor">Service, Setup & Technician Labor</option>
              <option value="General Billing">General Billing Record</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Related Reference (Rental / Work Order / PO)
            </label>
            <input
              type="text"
              value={relatedReference}
              onChange={(e) => setRelatedReference(e.target.value)}
              placeholder="e.g. RNT-1048 or WO-2025-081"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Payment Due Date *
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Reusable Material Selector Section */}
        <MaterialSelectorSection
          mode="billing"
          title="Billed Materials & Items"
          subtitle="Add replacement items, damaged gear, or billable materials using catalog values"
          addButtonLabel="Add Material"
          items={lines}
          onItemsChange={setLines}
        />

        {/* Financial Adjustments Grid */}
        <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3">
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
            Additional Surcharges & Adjustments
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Damage Fee ($)</label>
              <input
                type="number"
                min="0"
                value={damageCharges}
                onChange={(e) => setDamageCharges(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Late Fee ($)</label>
              <input
                type="number"
                min="0"
                value={lateFees}
                onChange={(e) => setLateFees(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Transport Fee ($)</label>
              <input
                type="number"
                min="0"
                value={transportFees}
                onChange={(e) => setTransportFees(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Discount ($)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white outline-none"
              />
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div className="pt-3 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Items Subtotal:</span>
              <strong className="text-gray-900 font-display">${itemsSubtotal.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">VAT (5%):</span>
              <strong className="text-gray-900 font-display">${tax.toFixed(2)}</strong>
            </div>
            <div>
              <span className="text-gray-500 block">Invoice Total:</span>
              <strong className="text-emerald-950 text-base font-bold font-display block">
                ${totalAmount.toFixed(2)}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block">Balance Due:</span>
              <strong
                className={`text-base font-bold font-display block ${
                  outstandingBalance > 0 ? "text-rose-700" : "text-emerald-700"
                }`}
              >
                ${outstandingBalance.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Immediate Settlement / Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => handleStatusChange(e.target.value as PaymentStatus)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none font-bold"
            >
              <option value="Unpaid">Unpaid (Issue Open Invoice)</option>
              <option value="Partial">Partial Payment</option>
              <option value="Paid">Fully Paid (Immediate Receipt)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Bank Transfer">Bank Transfer / Wire</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Check">Company Check</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Amount Collected Now ($)
            </label>
            <input
              type="number"
              min="0"
              max={totalAmount}
              value={amountPaid}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAmountPaid(val);
                if (val >= totalAmount && totalAmount > 0) {
                  setPaymentStatus("Paid");
                } else if (val > 0) {
                  setPaymentStatus("Partial");
                } else {
                  setPaymentStatus("Unpaid");
                }
              }}
              className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Billing Notes & Assessment Details
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal notes, incident report linkage, or customer settlement agreements..."
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
          >
            <Icon name="check" size={14} />
            <span>Generate Invoice</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInvoiceModal;
