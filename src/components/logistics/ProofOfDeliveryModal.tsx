import React, { useState } from "react";
import { DeliveryTask } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface ProofOfDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: DeliveryTask | null;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  isOpen,
  onClose,
  task,
}) => {
  const { updateDeliveryTaskStatus, showToast } = useApp();

  const [recipientName, setRecipientName] = useState(task?.customerName || "");
  const [deliveryNotes, setDeliveryNotes] = useState("Handed over in pristine condition to on-site event coordinator.");
  const [transitDamageReported, setTransitDamageReported] = useState(false);
  const [delayReason, setDelayReason] = useState("");

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateDeliveryTaskStatus(
      task.id,
      "Completed",
      {
        recipientName,
        signatureTimestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
        notes: deliveryNotes,
        photoEvidenceUrl: "https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=300&q=80",
      },
      delayReason
    );

    showToast(`Proof of ${task.type} recorded. Task marked as Completed.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Proof of ${task.type}: ${task.taskNumber}`}
      subtitle={`Customer: ${task.customerName} · Ref: ${task.rentalReference}`}
      badge="PROOF OF DELIVERY & HANDOVER"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
            Recipient Full Name / Signatory *
          </label>
          <input
            type="text"
            required
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Delivery / Handover Notes</label>
          <textarea
            rows={2}
            required
            value={deliveryNotes}
            onChange={(e) => setDeliveryNotes(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="damageReported"
              checked={transitDamageReported}
              onChange={(e) => setTransitDamageReported(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <label htmlFor="damageReported" className="text-xs font-bold text-gray-800 cursor-pointer">
              Report Transit Damage / Missing Discrepancy
            </label>
          </div>

          {transitDamageReported && (
            <div className="mt-2.5">
              <label className="block text-[11px] font-bold text-rose-800 mb-1">
                Discrepancy Details (Will flag maintenance and stock manager)
              </label>
              <input
                type="text"
                placeholder="e.g. 1 chair leg scratched during vehicle transport; reported to supervisor."
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                className="w-full text-xs font-medium border border-rose-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
            </div>
          )}
        </div>

        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <span>Digital Signature Timestamp:</span>
          <strong>{new Date().toISOString().replace("T", " ").slice(0, 16)}</strong>
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
            Submit Proof of {task.type}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProofOfDeliveryModal;
