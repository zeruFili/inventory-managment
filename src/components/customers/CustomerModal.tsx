import React, { useState, useEffect } from "react";
import { Customer } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
}) => {
  const { addCustomer, updateCustomer } = useApp();

  const [name, setName] = useState("");
  const [type, setType] = useState<"Individual" | "Company">("Company");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [vatTaxId, setVatTaxId] = useState("");
  const [status, setStatus] = useState<Customer["status"]>("Active");
  const [contractSigned, setContractSigned] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setType(customerToEdit.type);
      setContactPerson(customerToEdit.contactPerson);
      setPhone(customerToEdit.phone);
      setEmail(customerToEdit.email);
      setAddress(customerToEdit.address);
      setVatTaxId(customerToEdit.vatTaxId || "");
      setStatus(customerToEdit.status);
      setContractSigned(customerToEdit.contractSigned);
      setNotes(customerToEdit.notes);
    } else {
      setName("");
      setType("Company");
      setContactPerson("");
      setPhone("+1 (555) ");
      setEmail("");
      setAddress("");
      setVatTaxId("");
      setStatus("Active");
      setContractSigned(true);
      setNotes("");
    }
  }, [customerToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        name,
        type,
        contactPerson,
        phone,
        email,
        address,
        vatTaxId,
        status,
        contractSigned,
        notes,
      });
    } else {
      addCustomer({
        name,
        type,
        contactPerson,
        phone,
        email,
        address,
        vatTaxId,
        status,
        contractSigned,
        notes,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? `Edit Customer: ${customerToEdit.name}` : "Register New Customer"}
      subtitle="Corporate or individual client contact records, tax identifiers, and credit terms"
      badge="CUSTOMER MANAGEMENT"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Client / Company Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Skyline Event Productions"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Customer Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Company">Corporate / Company</option>
              <option value="Individual">Individual Private Client</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Person *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tax ID / VAT #</label>
            <input
              type="text"
              value={vatTaxId}
              onChange={(e) => setVatTaxId(e.target.value)}
              placeholder="US-1029384"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Billing & Delivery Address</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Account Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Active">Active Account</option>
              <option value="VIP">VIP Priority Account</option>
              <option value="Under Review">Under Review</option>
              <option value="Restricted">Restricted (Credit / Damage Hold)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="contractSigned"
              checked={contractSigned}
              onChange={(e) => setContractSigned(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <label htmlFor="contractSigned" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Master Rental Agreement Signed On File
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Internal Notes & Policy</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special delivery instructions, preferred payment terms, or client requirements..."
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
            {customerToEdit ? "Update Customer Profile" : "Register Customer"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CustomerModal;
