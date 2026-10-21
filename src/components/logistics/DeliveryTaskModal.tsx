import React, { useState } from "react";
import { DeliveryTask } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface DeliveryTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryTaskModal: React.FC<DeliveryTaskModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customers, rentals, users, createDeliveryTask, showToast } = useApp();

  const [type, setType] = useState<"Delivery" | "Collection">("Delivery");
  const [rentalReference, setRentalReference] = useState<string>(rentals[0]?.id || "");
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || "");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("Waterfront Convention Hall");
  const [scheduledDateTime, setScheduledDateTime] = useState<string>("2025-06-21T09:00");
  const [assignedToType, setAssignedToType] = useState<"Driver" | "Courier">("Driver");
  const [assignedPersonId, setAssignedPersonId] = useState<string>("usr-04");
  const [vehicleInfo, setVehicleInfo] = useState<string>("Mercedes Sprinter VAN-04");
  const [notes, setNotes] = useState<string>("Deliver to Stage loading bay.");

  const activeCustomer = customers.find((c) => c.id === customerId) || customers[0];
  const eligiblePersonnel = users.filter((u) => (assignedToType === "Driver" ? u.role === "driver" : u.role === "courier"));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assigned = users.find((u) => u.id === assignedPersonId);

    createDeliveryTask({
      type,
      rentalReference,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      deliveryAddress,
      scheduledDateTime,
      assignedToType,
      assignedPersonId,
      assignedPersonName: assigned ? assigned.name : "Driver",
      vehicleInfo,
      materials: [
        { materialId: "MAT-2025-01", materialName: "Rustic Cross Back Chair", quantity: 100 },
        { materialId: "MAT-2025-02", materialName: "Folding Banquet Round Table", quantity: 10 },
      ],
      status: "Assigned",
      notes,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Delivery or Collection Task"
      subtitle="Assign vehicle, driver or courier partner, and manifest"
      badge="TRANSPORT & LOGISTICS"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Task Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Delivery">Outbound Delivery</option>
              <option value="Collection">Inbound Return Collection</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rental Reference</label>
            <select
              value={rentalReference}
              onChange={(e) => {
                setRentalReference(e.target.value);
                const r = rentals.find((rent) => rent.id === e.target.value);
                if (r) {
                  setCustomerId(r.customerId);
                  if (r.deliveryAddress) setDeliveryAddress(r.deliveryAddress);
                }
              }}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {rentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.reservationNumber} — {r.customerName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Destination Address *</label>
          <input
            type="text"
            required
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Carrier Type</label>
            <select
              value={assignedToType}
              onChange={(e) => {
                const val = e.target.value as any;
                setAssignedToType(val);
                if (val === "Courier") {
                  setAssignedPersonId("usr-05");
                  setVehicleInfo("City Courier Express Unit 09");
                } else {
                  setAssignedPersonId("usr-04");
                  setVehicleInfo("Mercedes Sprinter VAN-04");
                }
              }}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Driver">Internal Fleet Driver</option>
              <option value="Courier">Third-Party Courier Partner</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Person</label>
            <select
              value={assignedPersonId}
              onChange={(e) => setAssignedPersonId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {eligiblePersonnel.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Vehicle / Unit Info</label>
            <input
              type="text"
              required
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Schedule Date & Time</label>
          <input
            type="datetime-local"
            required
            value={scheduledDateTime}
            onChange={(e) => setScheduledDateTime(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Instructions for Driver / Courier</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special loading dock access, parking instructions, or customer site contact..."
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
            Assign Task
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DeliveryTaskModal;
