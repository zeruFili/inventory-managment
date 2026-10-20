import React, { useState, useMemo } from "react";
import { Customer, Supplier } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import CustomerModal from "./CustomerModal";
import SupplierModal from "./SupplierModal";
import CustomerProfileDrawer from "./CustomerProfileDrawer";

export const CustomersSuppliersView: React.FC = () => {
  const { customers, suppliers, can } = useApp();

  const [activeSection, setActiveSection] = useState<"customers" | "suppliers">("customers");
  const [customerFilter, setCustomerFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selected360Customer, setSelected360Customer] = useState<Customer | null>(null);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (customerFilter === "Companies" && c.type !== "Company") return false;
      if (customerFilter === "Individuals" && c.type !== "Individual") return false;
      if (customerFilter === "With Balance" && c.currentBalance <= 0) return false;
      if (customerFilter === "VIP" && c.status !== "VIP") return false;

      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [customers, customerFilter, search]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.companyName.toLowerCase().includes(q) ||
        s.contactPerson.toLowerCase().includes(q) ||
        s.suppliedCategories.some((cat) => cat.toLowerCase().includes(q))
      );
    });
  }, [suppliers, search]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            RELATIONSHIPS & DIRECTORIES
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Customer & Supplier Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage customer 360° histories, contracts, credit terms, and vendor supply agreements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSection === "customers" ? (
            <button
              onClick={() => {
                setCustomerToEdit(null);
                setIsCustomerModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              Add Customer
            </button>
          ) : (
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

      {/* Main Switcher: Customers vs Suppliers */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveSection("customers");
                setSearch("");
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeSection === "customers"
                  ? "bg-emerald-950 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon name="users" size={15} />
              Customers ({customers.length})
            </button>
            <button
              onClick={() => {
                setActiveSection("suppliers");
                setSearch("");
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                activeSection === "suppliers"
                  ? "bg-emerald-950 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon name="truck" size={15} />
              Suppliers ({suppliers.length})
            </button>
          </div>

          {activeSection === "customers" && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {["All", "Companies", "Individuals", "With Balance", "VIP"].map((f) => (
                <button
                  key={f}
                  onClick={() => setCustomerFilter(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    customerFilter === f ? "bg-emerald-100 text-emerald-950" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="pt-2 border-t border-gray-100">
          <div className="relative">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeSection === "customers"
                  ? "Search customers by company, contact person, email, or phone..."
                  : "Search suppliers by company name, contact, or supplied category..."
              }
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tables */}
      {activeSection === "customers" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Primary Contact</th>
                  <th className="py-3 px-3">Active Activity</th>
                  <th className="py-3 px-3">Outstanding Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <strong
                        onClick={() => setSelected360Customer(cust)}
                        className="text-xs font-bold text-gray-900 hover:text-emerald-800 cursor-pointer block"
                      >
                        {cust.name}
                      </strong>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {cust.id}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-gray-700 font-medium">{cust.type}</span>
                      {cust.contractSigned && (
                        <span className="text-[9px] text-emerald-700 font-bold block">✓ Contract Signed</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-gray-900 font-semibold block">{cust.contactPerson}</span>
                      <span className="text-[10px] text-gray-400">{cust.phone}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-gray-800 font-bold block">{cust.totalRentalsCount} Rentals</span>
                      <span className="text-[10px] text-gray-500">{cust.totalSalesCount} Orders</span>
                    </td>

                    <td className="py-3 px-3">
                      <strong className={`font-display font-bold ${cust.currentBalance > 0 ? "text-rose-700" : "text-emerald-700"}`}>
                        ${cust.currentBalance.toLocaleString()}
                      </strong>
                      {cust.securityDepositHeld > 0 && (
                        <span className="text-[10px] text-amber-700 block">
                          ${cust.securityDepositHeld} deposit
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        tone={
                          cust.status === "VIP"
                            ? "yellow"
                            : cust.status === "Restricted"
                            ? "red"
                            : cust.status === "Under Review"
                            ? "amber"
                            : "green"
                        }
                        size="sm"
                      >
                        {cust.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelected360Customer(cust)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                          title="Open Customer 360° Profile"
                        >
                          View 360° Profile
                        </button>
                        <button
                          onClick={() => {
                            setCustomerToEdit(cust);
                            setIsCustomerModalOpen(true);
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Edit Customer"
                        >
                          <Icon name="wrench" size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Suppliers Table */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Supplier Company</th>
                  <th className="py-3 px-3">Contact & Phone</th>
                  <th className="py-3 px-3">Supplied Categories</th>
                  <th className="py-3 px-3">Total Purchases</th>
                  <th className="py-3 px-3">Outstanding Balance</th>
                  <th className="py-3 px-3">Warranty Agreement</th>
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
                      <div className="flex flex-wrap gap-1">
                        {sup.suppliedCategories.map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60"
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
                      <strong className={`font-display font-bold ${sup.outstandingBalance > 0 ? "text-amber-800" : "text-emerald-700"}`}>
                        ${sup.outstandingBalance.toLocaleString()}
                      </strong>
                    </td>

                    <td className="py-3 px-3">
                      <p className="text-[11px] text-gray-600 line-clamp-1">{sup.warrantyTerms}</p>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSupplierToEdit(sup);
                          setIsSupplierModalOpen(true);
                        }}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Edit Supplier"
                      >
                        <Icon name="wrench" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals & Profile Drawer */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        supplierToEdit={supplierToEdit}
      />

      <CustomerProfileDrawer
        isOpen={!!selected360Customer}
        onClose={() => setSelected360Customer(null)}
        customer={selected360Customer}
      />
    </div>
  );
};

export default CustomersSuppliersView;
