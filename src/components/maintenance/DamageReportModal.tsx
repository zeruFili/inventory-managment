import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface DamageReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DamageReportModal: React.FC<DamageReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { materials, rentals, customers, createDamageReport } = useApp();

  const [materialId, setMaterialId] = useState<string>(materials[2]?.id || materials[0]?.id || "");
  const [rentalReference, setRentalReference] = useState<string>(rentals[0]?.id || "");
  const [customerId, setCustomerId] = useState<string>(customers[0]?.id || "");
  const [severity, setSeverity] = useState<"Minor" | "Moderate" | "Severe">("Moderate");
  const [description, setDescription] = useState<string>("Bent bracket and cracked housing on lighting fixture.");
  const [suspectedCause, setSuspectedCause] = useState<any>("Accidental Handling");
  const [responsibilityAssessment, setResponsibilityAssessment] = useState<any>("Customer Fault");
  const [estimatedRepairCost, setEstimatedRepairCost] = useState<number>(180);
  const [proposedCustomerCharge, setProposedCustomerCharge] = useState<number>(150);
  const [disputeStatus, setDisputeStatus] = useState<any>("Agreed");
  const [handlerName, setHandlerName] = useState<string>("Eric James (Driver)");

  const activeMat = materials.find((m) => m.id === materialId) || materials[0];
  const activeCustomer = customers.find((c) => c.id === customerId) || customers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createDamageReport({
      rentalReference,
      materialId: activeMat.id,
      materialName: activeMat.name,
      serialNumber: activeMat.trackedItems?.[0]?.serialNumber,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      handlerName,
      severity,
      description,
      beforePhotoUrl: activeMat.imageUrl,
      afterPhotoUrl: activeMat.imageUrl,
      suspectedCause,
      responsibilityAssessment,
      estimatedRepairCost: Number(estimatedRepairCost),
      proposedCustomerCharge: Number(proposedCustomerCharge),
      disputeStatus,
      resolutionNotes: "Incident logged for repair work order generation.",
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="File Damage Incident Report"
      subtitle="Document damaged gear, responsibility determination, and repair cost estimation"
      badge="DAMAGE CLAIMS"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Damaged Material *</label>
            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Related Rental Ref</label>
            <select
              value={rentalReference}
              onChange={(e) => {
                setRentalReference(e.target.value);
                const r = rentals.find((rent) => rent.id === e.target.value);
                if (r) setCustomerId(r.customerId);
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Damage Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Minor">Minor (Cosmetic / Superficial)</option>
              <option value="Moderate">Moderate (Component replacement)</option>
              <option value="Severe">Severe (Structural / Potential Write-off)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Suspected Cause</label>
            <select
              value={suspectedCause}
              onChange={(e) => setSuspectedCause(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Customer Misuse">Customer Misuse / Negligence</option>
              <option value="Accidental Handling">Accidental Handling at Venue</option>
              <option value="Transport Transit">Transport Transit Vibration / Impact</option>
              <option value="Normal Wear & Tear">Normal Wear & Tear</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Responsibility Assessment</label>
            <select
              value={responsibilityAssessment}
              onChange={(e) => setResponsibilityAssessment(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none font-bold text-emerald-950"
            >
              <option value="Customer Fault">Customer Fault (Billable)</option>
              <option value="Company Transport">Company Transport (Internal Cost)</option>
              <option value="Courier Partner">Courier Partner (Courier Claim)</option>
              <option value="Under Investigation">Under Investigation (Disputed)</option>
              <option value="Exempt/Wear">Exempt / Normal Wear (Waived)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Damage Description *</label>
          <textarea
            rows={2}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/80">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estimated Repair Cost ($)</label>
            <input
              type="number"
              min="0"
              value={estimatedRepairCost}
              onChange={(e) => setEstimatedRepairCost(Number(e.target.value))}
              className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Proposed Customer Charge ($)</label>
            <input
              type="number"
              min="0"
              value={proposedCustomerCharge}
              onChange={(e) => setProposedCustomerCharge(Number(e.target.value))}
              className="w-full text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white text-rose-800 outline-none"
            />
          </div>
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
            className="px-5 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors shadow-xs"
          >
            File Damage Report
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DamageReportModal;
