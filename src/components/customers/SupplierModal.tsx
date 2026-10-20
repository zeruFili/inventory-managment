import React, { useState, useEffect } from "react";
import { Supplier } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  isOpen,
  onClose,
  supplierToEdit,
}) => {
  const { addSupplier, updateSupplier } = useApp();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [suppliedCategories, setSuppliedCategories] = useState("Seating, Tables, Tableware");
  const [warrantyTerms, setWarrantyTerms] = useState("2-year manufacturer warranty, immediate replacement on defect");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (supplierToEdit) {
      setCompanyName(supplierToEdit.companyName);
      setContactPerson(supplierToEdit.contactPerson);
      setPhone(supplierToEdit.phone);
      setEmail(supplierToEdit.email);
      setAddress(supplierToEdit.address);
      setSuppliedCategories(supplierToEdit.suppliedCategories.join(", "));
      setWarrantyTerms(supplierToEdit.warrantyTerms);
      setNotes(supplierToEdit.notes);
    } else {
      setCompanyName("");
      setContactPerson("");
      setPhone("+1 (800) ");
      setEmail("");
      setAddress("");
      setSuppliedCategories("Lighting, Audio & Sound");
      setWarrantyTerms("Standard 2-year warranty");
      setNotes("");
    }
  }, [supplierToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const catArray = suppliedCategories.split(",").map((c) => c.trim()).filter(Boolean);

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, {
        companyName,
        contactPerson,
        phone,
        email,
        address,
        suppliedCategories: catArray,
        warrantyTerms,
        notes,
      });
    } else {
      addSupplier({
        companyName,
        contactPerson,
        phone,
        email,
        address,
        suppliedCategories: catArray,
        warrantyTerms,
        isArchived: false,
        notes,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplierToEdit ? `Edit Supplier: ${supplierToEdit.companyName}` : "Add Equipment Supplier"}
      subtitle="Procurement contacts, warranty agreements, and supplied catalog categories"
      badge="SUPPLIER MANAGEMENT"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company / Manufacturer Name *</label>
          <input
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Prolyte Trussing International"
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
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
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplied Categories (comma-separated)</label>
            <input
              type="text"
              value={suppliedCategories}
              onChange={(e) => setSuppliedCategories(e.target.value)}
              placeholder="e.g. Seating, Tables, Staging & Truss"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address / Depot</label>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warranty & Service Level Terms</label>
          <textarea
            rows={2}
            value={warrantyTerms}
            onChange={(e) => setWarrantyTerms(e.target.value)}
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
            {supplierToEdit ? "Update Supplier" : "Register Supplier"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierModal;
