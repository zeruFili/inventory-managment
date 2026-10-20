import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";

interface SalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesOrderModal: React.FC<SalesOrderModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, materials, createSalesOrder, showToast } = useApp();

  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || "");
  const [orderStatus, setOrderStatus] = useState<"Quotation" | "Confirmed" | "Fulfilled">("Confirmed");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Bank Transfer" | "Credit Card" | "Mobile Payment">("Bank Transfer");
  const [amountPaid, setAmountPaid] = useState<number>(1500);
  const [discount, setDiscount] = useState<number>(50);
  const [notes, setNotes] = useState<string>("Direct sale of event gear.");

  // Multi-item sales lines
  const [lines, setLines] = useState<{ materialId: string; quantity: number }[]>([
    { materialId: materials[0]?.id || "", quantity: 10 },
  ]);

  const activeCustomer = customers.find((c) => c.id === customerId) || customers[0];

  const salesItems = lines.map((line) => {
    const mat = materials.find((m) => m.id === line.materialId) || materials[0];
    const unitPrice = mat.sellingPrice;
    const purchaseCost = mat.purchaseCost;
    const lineTotal = unitPrice * line.quantity;

    return {
      materialId: mat.id,
      materialName: mat.name,
      materialCode: mat.code,
      quantity: line.quantity,
      unitPrice,
      purchaseCost,
      lineTotal,
    };
  });

  const subtotal = salesItems.reduce((acc, item) => acc + item.lineTotal, 0);
  const totalCostBasis = salesItems.reduce((acc, item) => acc + item.purchaseCost * item.quantity, 0);
  const tax = Number(((subtotal - discount) * 0.085).toFixed(2));
  const totalAmount = Math.max(0, subtotal - discount + tax);
  const grossProfit = Math.max(0, subtotal - discount - totalCostBasis);
  const paymentStatus = amountPaid >= totalAmount ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";

  const handleAddLine = () => {
    setLines((prev) => [...prev, { materialId: materials[0]?.id || "", quantity: 5 }]);
  };

  const handleRemoveLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, matId: string, qty: number) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { materialId: matId, quantity: Math.max(1, qty) } : l))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createSalesOrder({
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      items: salesItems,
      subtotal,
      discount: Number(discount),
      tax,
      totalAmount,
      grossProfit,
      paymentStatus,
      paymentMethod,
      amountPaid: Number(amountPaid),
      orderStatus,
      orderDate: new Date().toISOString().slice(0, 10),
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Direct Sales Order / Quotation"
      subtitle="Sale of materials, consumables, or decommissioned fleet inventory"
      badge="SALES MANAGEMENT"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer / Purchaser *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Order Type / Status</label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Confirmed">Confirmed Order (Reserve Stock)</option>
              <option value="Quotation">Sales Quotation (Draft Estimate)</option>
              <option value="Fulfilled">Fulfilled (Immediate Stock Deduction)</option>
            </select>
          </div>
        </div>

        {/* Product Lines */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-700 uppercase">Products & Quantities</label>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <Icon name="plus" size={13} /> Add Product
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {salesItems.map((line, idx) => (
              <div key={idx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-7">
                    <select
                      value={line.materialId}
                      onChange={(e) => handleUpdateLine(idx, e.target.value, line.quantity)}
                      className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
                    >
                      {materials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} (${m.sellingPrice} sell / cost: ${m.purchaseCost})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-5 flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">Qty:</span>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => handleUpdateLine(idx, line.materialId, Number(e.target.value))}
                      className="w-16 text-xs font-bold border border-gray-300 rounded-lg p-1.5 text-center bg-white text-gray-900 outline-none"
                    />
                    <span className="text-xs font-bold text-gray-900 font-display min-w-[70px] text-right">
                      ${line.lineTotal}
                    </span>
                  </div>
                </div>

                {salesItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(idx)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Profit Summary */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Payment Method</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded p-1.5 bg-white text-gray-900 outline-none mt-1"
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Mobile Payment">Mobile Payment</option>
            </select>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Amount Paid ($)</span>
            <input
              type="number"
              min="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(Number(e.target.value))}
              className="w-full text-xs font-bold border border-gray-300 rounded p-1.5 bg-white text-gray-900 outline-none mt-1"
            />
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Gross Profit Contribution</span>
            <strong className="text-base font-bold text-emerald-800 font-display mt-1 block">
              +${grossProfit.toLocaleString()}
            </strong>
            <span className="text-[10px] text-emerald-700 font-medium">Margin: {Math.round((grossProfit / (subtotal || 1)) * 100)}%</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Total Amount (Inc. 8.5% Tax)</span>
            <strong className="text-base font-extrabold text-emerald-950 font-display mt-1 block">
              ${totalAmount.toLocaleString()}
            </strong>
            <span className="text-[10px] text-gray-500">Status: {paymentStatus}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            Generate Sales Order & Invoice
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SalesOrderModal;
