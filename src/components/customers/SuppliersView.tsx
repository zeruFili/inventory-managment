import React, { useState, useMemo } from "react";
import { Supplier } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import SupplierModal from "./SupplierModal";

export const SuppliersView: React.FC = () => {
  const { suppliers, can } = useApp();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const allCategories = [
    "All",
    "Seating",
    "Tables",
    "Lighting",
    "Audio & Sound",
    "Visual & Displays",
    "Structures & Tents",
    "Staging & Truss",
    "Power & Climate",
    "Tableware",
    "Decor & Drapery",
  ];

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      if (
        selectedCategory !== "All" &&
        !s.suppliedCategories.some(
          (cat) => cat.toLowerCase() === selectedCategory.toLowerCase()
        )
      ) {
        return false;
      }

      const q = search.toLowerCase();
      return (
        s.companyName.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.suppliedCategories.some((cat) => cat.toLowerCase().includes(q))
      );
    });
  }, [suppliers, search, selectedCategory]);

  const totalPurchases = useMemo(() => {
    return suppliers.reduce((acc, s) => acc + s.totalPurchasesAmount, 0);
  }, [suppliers]);

  const totalOutstanding = useMemo(() => {
    return suppliers.reduce((acc, s) => acc + s.outstandingBalance, 0);
  }, [suppliers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            SUPPLY CHAIN & PROCUREMENT
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Supplier & Vendor Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage authorized equipment manufacturers, wholesale distributors, warranty terms, and purchase histories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("manage_inventory") && (
            <button
              onClick={() => {
                setSupplierToEdit(null);
                setIsSupplierModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              Add Supplier
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Active Suppliers
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900 font-display">
              {suppliers.length}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">vendors</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
            Supplied Categories
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-900 font-display">
              10
            </span>
            <span className="text-xs text-gray-400">across event lines</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Total Purchase Volume
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-900 font-display">
              ${totalPurchases.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">lifetime POs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Outstanding Payables
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-800 font-display">
              ${totalOutstanding.toLocaleString()}
            </span>
            <span className="text-xs text-amber-700 font-medium">pending invoice settlement</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {allCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    isSelected
                      ? "bg-emerald-950 text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md ${
                  viewMode === "table" ? "bg-white text-emerald-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"
                }`}
                title="Table view"
              >
                <Icon name="grid" size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md ${
                  viewMode === "grid" ? "bg-white text-emerald-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"
                }`}
                title="Grid view"
              >
                <Icon name="box" size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-gray-100">
          <div className="relative">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers by company name, contact person, or category..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-3">Contact & Phone</th>
                  <th className="py-3 px-3">Supplied Categories</th>
                  <th className="py-3 px-3">Total Purchases</th>
                  <th className="py-3 px-3">Outstanding Balance</th>
                  <th className="py-3 px-3">Warranty & Supply Agreement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-xs font-bold text-gray-900 block">{sup.companyName}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {sup.id}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-gray-900 font-semibold block">{sup.contactPerson}</span>
                      <span className="text-[10px] text-gray-400">{sup.phone}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {sup.suppliedCategories.map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-bold text-gray-900 font-display">
                      ${sup.totalPurchasesAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3">
                      <strong
                        className={`font-display font-bold ${
                          sup.outstandingBalance > 0 ? "text-amber-800" : "text-emerald-700"
                        }`}
                      >
                        ${sup.outstandingBalance.toLocaleString()}
                      </strong>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-[11px] text-gray-600 line-clamp-1">{sup.warrantyTerms}</p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {can("manage_inventory") ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSupplierToEdit(sup);
                            setIsSupplierModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                          title="Edit Supplier"
                        >
                          <Icon name="wrench" size={13} />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!filteredSuppliers.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <Icon name="box" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                      <strong className="block text-gray-700">No suppliers match your criteria</strong>
                      <span className="text-xs">Try selecting another category or clearing search terms.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">{sup.companyName}</h3>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {sup.id}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    Vendor
                  </span>
                </div>

                <div className="p-3 bg-gray-50/70 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[11px] text-gray-400">Contact:</span>
                    <strong className="text-gray-900">{sup.contactPerson}</strong>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[11px] text-gray-400">Phone:</span>
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[11px] text-gray-400">Email:</span>
                    <span className="truncate max-w-[160px]">{sup.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Supplied Product Lines
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {sup.suppliedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase block font-bold">Purchases</span>
                    <strong className="text-emerald-950 font-display text-sm">
                      ${sup.totalPurchasesAmount.toLocaleString()}
                    </strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-500 uppercase block font-bold">Balance</span>
                    <strong
                      className={`font-display text-sm ${
                        sup.outstandingBalance > 0 ? "text-amber-800" : "text-emerald-700"
                      }`}
                    >
                      ${sup.outstandingBalance.toLocaleString()}
                    </strong>
                  </div>
                </div>

                {sup.warrantyTerms && (
                  <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                    "{sup.warrantyTerms}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                {can("manage_inventory") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSupplierToEdit(sup);
                      setIsSupplierModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                  >
                    <Icon name="wrench" size={13} />
                    <span>Edit Vendor</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supplier Modal */}
      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplierToEdit={supplierToEdit}
      />
    </div>
  );
};

export default SuppliersView;
