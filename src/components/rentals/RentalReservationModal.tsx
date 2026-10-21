import React, { useState } from "react";
import { RentalItemLine } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import MaterialSelectorSection from "../common/MaterialSelectorSection";

interface RentalReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RentalReservationModal: React.FC<RentalReservationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    customers,
    materials,
    checkMaterialAvailability,
    createRentalReservation,
    currentUser,
    users,
    showToast,
  } = useApp();

  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || "");
  const [startDate, setStartDate] = useState<string>("2025-06-22T09:00");
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>("2025-06-25T18:00");
  const [deliveryType, setDeliveryType] = useState<"Delivery & Collection" | "Customer Pickup">("Delivery & Collection");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("Waterfront Convention Hall");
  const [assignedDriverId, setAssignedDriverId] = useState<string>("usr-04");
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [amountPaid, setAmountPaid] = useState<number>(500);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("Corporate banquet setup.");

  const isStockManager = currentUser.role === "stock_manager";

  // Multi-item lines
  const [selectedItems, setSelectedItems] = useState<
    { materialId: string; quantity: number }[]
  >([
    { materialId: materials[0]?.id || "", quantity: 50 },
    { materialId: materials[1]?.id || "", quantity: 5 },
  ]);

  const activeCustomer = customers.find((c) => c.id === customerId) || customers[0];
  const drivers = users.filter((u) => u.role === "driver" || u.role === "courier");

  // Calculate duration
  const startMs = new Date(startDate).getTime();
  const endMs = new Date(expectedReturnDate).getTime();
  const rentalDurationDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));

  // Build items and check availability
  const itemLines: (RentalItemLine & { isAvailable: boolean; maxAvailable: number })[] = (
    selectedItems
      .map((si) => {
        const mat = materials.find((m) => m.id === si.materialId);
        if (!mat) return null;
        const availCheck = checkMaterialAvailability(mat.id, startDate, expectedReturnDate, si.quantity);
        const lineTotal = mat.rentalPriceDaily * si.quantity * rentalDurationDays;

        const line: RentalItemLine & { isAvailable: boolean; maxAvailable: number } = {
          materialId: mat.id,
          materialCode: mat.code,
          materialName: mat.name,
          category: mat.category,
          quantity: si.quantity,
          dailyRate: mat.rentalPriceDaily,
          totalDays: rentalDurationDays,
          lineTotal,
          returnedQuantity: 0,
          missingQuantity: 0,
          damagedQuantity: 0,
          isAvailable: availCheck.available,
          maxAvailable: availCheck.maxAvailable,
        };
        return line;
      })
      .filter((item): item is RentalItemLine & { isAvailable: boolean; maxAvailable: number } => item !== null)
  );

  const subtotal = itemLines.reduce((acc, item) => acc + item.lineTotal, 0);
  const taxAmount = Number(((subtotal - discountAmount) * 0.085).toFixed(2));
  const transportCost = deliveryType.includes("Delivery") ? 150 : 0;
  const totalCost = Math.max(0, subtotal - discountAmount + taxAmount + transportCost);
  const outstandingBalance = Math.max(0, totalCost - amountPaid);
  const paymentStatus = amountPaid >= totalCost ? "Paid" : amountPaid > 0 ? "Partial" : "Unpaid";

  const handleAddItemLine = () => {
    setSelectedItems((prev) => [...prev, { materialId: materials[0]?.id || "", quantity: 10 }]);
  };

  const handleRemoveItemLine = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemLine = (index: number, matId: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { materialId: matId, quantity: Math.max(1, qty) } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItems.length) {
      showToast("Please select at least one material to reserve.", "warning");
      return;
    }

    // Availability validation check
    const hasUnavail = itemLines.some((item) => !item.isAvailable);
    if (hasUnavail) {
      showToast("One or more items exceed available stock for requested period!", "error");
      return;
    }

    const assignedDriver = users.find((u) => u.id === assignedDriverId);

    const success = createRentalReservation({
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      customerEmail: activeCustomer.email,
      startDate,
      expectedReturnDate,
      rentalDurationDays,
      items: itemLines.map(({ isAvailable, maxAvailable, ...clean }) => clean),
      subtotal,
      taxAmount,
      discountAmount,
      totalCost,
      depositAmount: Number(depositAmount),
      depositStatus: "Held",
      paymentStatus,
      amountPaid: Number(amountPaid),
      outstandingBalance,
      status: "Confirmed",
      deliveryType,
      deliveryAddress,
      assignedDriverId: deliveryType.includes("Delivery") ? assignedDriverId : undefined,
      assignedDriverName: deliveryType.includes("Delivery") ? assignedDriver?.name : undefined,
      responsibleEmployee: currentUser.name,
      warehouse: "Central Warehouse",
      contractNumber: `CTR-2025-${Date.now().toString().slice(-4)}`,
      notes,
      isOverdue: false,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Rental Reservation"
      subtitle="Automated date-range stock availability checking with conflict protection"
      badge="RESERVATION DESK"
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer *</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rental Start Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Expected Return Date & Time *</label>
            <input
              type="datetime-local"
              required
              value={expectedReturnDate}
              onChange={(e) => setExpectedReturnDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg text-xs text-emerald-900">
          <span>
            Calculated Duration: <strong>{rentalDurationDays} Day(s)</strong>
          </span>
          <span className="text-[11px] text-emerald-700">
            Contact: {activeCustomer.contactPerson} · {activeCustomer.phone}
          </span>
        </div>

        {/* Reusable Material Selection Section */}
        <MaterialSelectorSection
          mode="rental"
          startDate={startDate}
          expectedReturnDate={expectedReturnDate}
          items={selectedItems}
          onItemsChange={setSelectedItems}
        />

        {/* Logistics & Delivery Arrangement */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fulfillment Mode</label>
            <select
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
            >
              <option value="Delivery & Collection">
                {isStockManager ? "Delivery & Collection" : "Delivery & Collection (+ $150 transport)"}
              </option>
              <option value="Customer Pickup">Customer Pickup at Central Warehouse</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Venue / Delivery Address</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Driver / Fleet</label>
            <select
              value={assignedDriverId}
              onChange={(e) => setAssignedDriverId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
            >
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financials & Billing Details */}
        {!isStockManager && (
          <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Rental Subtotal</span>
              <strong className="text-sm font-bold text-gray-900">${subtotal}</strong>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Security Deposit (Held)</span>
              <input
                type="number"
                min="0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full max-w-[120px] text-xs font-bold border border-gray-300 rounded p-1 bg-white"
              />
            </div>

            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Advance Payment Received</span>
              <input
                type="number"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full max-w-[120px] text-xs font-bold border border-gray-300 rounded p-1 bg-white text-emerald-800"
              />
            </div>

            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">Estimated Total Cost</span>
              <strong className="text-base font-extrabold text-emerald-950 font-display">${totalCost}</strong>
              <span className="text-[10px] text-gray-500 block">Balance: ${outstandingBalance}</span>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-end gap-2">
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
            Confirm Reservation & Lock Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RentalReservationModal;
