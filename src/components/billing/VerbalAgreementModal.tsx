import React, { useState } from "react";
import { Invoice } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";

interface VerbalAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export const VerbalAgreementModal: React.FC<VerbalAgreementModalProps> = ({
  isOpen,
  onClose,
  invoice,
}) => {
  const { recordVerbalAgreement, currentUser } = useApp();

  const [agreedTerms, setAgreedTerms] = useState<string>("Client verbally committed to settle balance upon final delivery check-in.");
  const [promisedDate, setPromisedDate] = useState<string>("2025-06-25");
  const [notes, setNotes] = useState<string>("Authorized by phone call with executive coordinator.");

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordVerbalAgreement(invoice.id, agreedTerms, promisedDate, notes);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Log Verbal Agreement: ${invoice.invoiceNumber}`}
      subtitle={`Customer: ${invoice.customerName} · Balance: $${invoice.outstandingBalance}`}
      badge="EXECUTIVE VERBAL AGREEMENT LOG"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <Icon name="alert" size={16} className="text-amber-700 shrink-0 mt-0.5" />
          <p>
            <strong>Important Policy Notice:</strong> Verbal agreements must be clearly identified and will be marked with a <em>"Pending Verification"</em> status. A verbal agreement is NOT proof that payment was received and does not close invoices automatically.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Agreed Terms & Conditions *</label>
          <textarea
            rows={2}
            required
            value={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Promised Payment / Settlement Date *</label>
          <input
            type="date"
            required
            value={promisedDate}
            onChange={(e) => setPromisedDate(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Authorizing Officer</label>
          <input
            type="text"
            readOnly
            value={`${currentUser.name} (${currentUser.role.replace("_", " ").toUpperCase()})`}
            className="w-full text-xs font-bold border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-600 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supporting Notes & Follow-up Plan</label>
          <textarea
            rows={2}
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
            className="px-5 py-2 text-xs font-bold text-white bg-amber-950 hover:bg-amber-900 rounded-lg transition-colors shadow-xs"
          >
            Register Verbal Agreement
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default VerbalAgreementModal;
