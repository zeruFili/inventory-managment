import React, { useState, useMemo } from "react";
import { Customer } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import CustomerModal from "./CustomerModal";
import CustomerProfileDrawer from "./CustomerProfileDrawer";

export const CustomersView: React.FC = () => {
  const { customers, can } = useApp();

  const [customerFilter, setCustomerFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals & Drawers
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [selected360Customer, setSelected360Customer] = useState<Customer | null>(null);

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

  const totalOutstanding = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.currentBalance, 0);
  }, [customers]);

  const totalDeposits = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.securityDepositHeld, 0);
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            CLIENT RELATIONSHIP MANAGEMENT
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Customer Directory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage customer accounts, 360° rental histories, signed master agreements, and credit limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("manage_inventory") && (
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
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Total Customers
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-gray-900 font-display">
              {customers.length}
            </span>
            <span className="text-xs text-gray-500">
              ({customers.filter((c) => c.type === "Company").length} corporate)
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            VIP Priority Clients
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-900 font-display">
              {customers.filter((c) => c.status === "VIP").length}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Tier 1 accounts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
            Outstanding Receivables
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-rose-800 font-display">
              ${totalOutstanding.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">across balances</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            Security Deposits Held
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-900 font-display">
              ${totalDeposits.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-700">vault liability</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {["All", "Companies", "Individuals", "With Balance", "VIP"].map((f) => (
              <button
                key={f}
                onClick={() => setCustomerFilter(f)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  customerFilter === f
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {f}
                {f === "VIP" && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-emerald-950 rounded-full text-[10px]">
                    {customers.filter((c) => c.status === "VIP").length}
                  </span>
                )}
                {f === "With Balance" && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded-full text-[10px]">
                    {customers.filter((c) => c.currentBalance > 0).length}
                  </span>
                )}
              </button>
            ))}
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
              placeholder="Search customers by company, contact person, email, or phone..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Content: Table or Grid */}
      {viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Primary Contact</th>
                  <th className="py-3 px-3">Lifetime Activity</th>
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
                      <strong
                        className={`font-display font-bold ${
                          cust.currentBalance > 0 ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        ${cust.currentBalance.toLocaleString()}
                      </strong>
                      {cust.securityDepositHeld > 0 && (
                        <span className="text-[10px] text-amber-700 block">
                          ${cust.securityDepositHeld} deposit held
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
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelected360Customer(cust)}
                          className="px-2.5 py-1 text-[11px] font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-md transition-colors"
                          title="Open Customer 360° Profile"
                        >
                          View 360° Profile
                        </button>
                        <button
                          type="button"
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

                {!filteredCustomers.length && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <Icon name="users" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                      <strong className="block text-gray-700">No customers match your criteria</strong>
                      <span className="text-xs">Try resetting your search query or filters.</span>
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
          {filteredCustomers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      onClick={() => setSelected360Customer(cust)}
                      className="text-sm font-bold text-gray-900 hover:text-emerald-800 cursor-pointer"
                    >
                      {cust.name}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono">ID: {cust.id}</span>
                  </div>
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
                </div>

                <div className="p-3 bg-gray-50/70 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[11px] text-gray-400">Contact:</span>
                    <strong className="text-gray-900">{cust.contactPerson}</strong>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[11px] text-gray-400">Phone:</span>
                    <span>{cust.phone}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="text-[11px] text-gray-400">Email:</span>
                    <span className="truncate max-w-[160px]">{cust.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 uppercase block font-bold">Rentals</span>
                    <strong className="text-emerald-950 font-display text-sm">{cust.totalRentalsCount}</strong>
                  </div>
                  <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-[10px] text-gray-500 uppercase block font-bold">Balance</span>
                    <strong
                      className={`font-display text-sm ${
                        cust.currentBalance > 0 ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      ${cust.currentBalance.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelected360Customer(cust)}
                  className="px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                >
                  View 360° Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerToEdit(cust);
                    setIsCustomerModalOpen(true);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Icon name="wrench" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals & Profile Drawer */}
      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={customerToEdit}
      />

      <CustomerProfileDrawer
        isOpen={!!selected360Customer}
        onClose={() => setSelected360Customer(null)}
        customer={selected360Customer}
      />
    </div>
  );
};

export default CustomersView;
