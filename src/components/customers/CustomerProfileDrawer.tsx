import React, { useState } from "react";
import { Customer } from "../../types";
import { useApp } from "../../context/AppContext";
import Drawer from "../common/Drawer";
import Badge from "../common/Badge";
import Icon from "../common/Icons";

interface CustomerProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export const CustomerProfileDrawer: React.FC<CustomerProfileDrawerProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { rentals, salesOrders, invoices, securityDeposits, damageReports } = useApp();
  const [activeTab, setActiveTab] = useState<"rentals" | "sales" | "payments" | "claims">("rentals");

  if (!customer) return null;

  const customerRentals = rentals.filter((r) => r.customerId === customer.id);
  const customerSales = salesOrders.filter((s) => s.customerId === customer.id);
  const customerInvoices = invoices.filter((i) => i.customerId === customer.id);
  const customerDeposits = securityDeposits.filter((d) => d.customerId === customer.id);
  const customerClaims = damageReports.filter((dm) => dm.customerId === customer.id);

  const totalOutstanding = customerInvoices.reduce((acc, i) => acc + i.outstandingBalance, 0);
  const totalDepositHeld = customerDeposits.reduce((acc, d) => acc + d.remainingLiability, 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={customer.name}
      subtitle={`${customer.type} · ID: ${customer.id}`}
      badge={customer.status.toUpperCase()}
      width="2xl"
    >
      <div className="space-y-6 text-xs">
        {/* Customer Header Info */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Contact Person</span>
            <strong className="text-gray-900 block">{customer.contactPerson}</strong>
            <span className="text-[10px] text-gray-400">{customer.phone}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Email</span>
            <strong className="text-gray-900 block truncate">{customer.email}</strong>
            <span className="text-[10px] text-gray-400">VAT: {customer.vatTaxId || "N/A"}</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Outstanding Balance</span>
            <strong className={`block text-sm font-display ${totalOutstanding > 0 ? "text-rose-700" : "text-emerald-700"}`}>
              ${totalOutstanding.toLocaleString()}
            </strong>
          </div>

          <div>
            <span className="text-[10px] text-gray-500 uppercase font-bold block">Security Deposit Held</span>
            <strong className="block text-sm font-display text-amber-700">
              ${totalDepositHeld.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* 360 Tabs */}
        <div>
          <div className="flex items-center gap-1 border-b border-gray-200 pb-2">
            {[
              { id: "rentals", label: `Rentals (${customerRentals.length})` },
              { id: "sales", label: `Sales Orders (${customerSales.length})` },
              { id: "payments", label: `Invoices & Payments (${customerInvoices.length})` },
              { id: "claims", label: `Damage Claims (${customerClaims.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-3">
            {activeTab === "rentals" && (
              <div className="space-y-2">
                {customerRentals.map((r) => (
                  <div key={r.id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-gray-900 font-bold">{r.reservationNumber}</strong>
                        <Badge tone={r.status === "Overdue" ? "red" : r.status === "Active" ? "yellow" : "green"} size="sm">
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {r.startDate.slice(0, 10)} → {r.expectedReturnDate.slice(0, 10)} · {r.rentalDurationDays} days · {r.items.length} materials
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-gray-900 block font-display">${r.totalCost}</strong>
                      <span className="text-[10px] text-gray-400">Balance: ${r.outstandingBalance}</span>
                    </div>
                  </div>
                ))}
                {!customerRentals.length && <p className="text-gray-400 italic py-4 text-center">No rental history for this customer.</p>}
              </div>
            )}

            {activeTab === "sales" && (
              <div className="space-y-2">
                {customerSales.map((s) => (
                  <div key={s.id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-gray-900 font-bold">{s.orderNumber}</strong>
                        <Badge tone={s.orderStatus === "Fulfilled" ? "green" : "yellow"} size="sm">
                          {s.orderStatus}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Order Date: {s.orderDate} · {s.items.length} line items
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-gray-900 block font-display">${s.totalAmount}</strong>
                      <span className="text-[10px] text-emerald-700 font-bold">Profit: +${s.grossProfit}</span>
                    </div>
                  </div>
                ))}
                {!customerSales.length && <p className="text-gray-400 italic py-4 text-center">No direct purchase history.</p>}
              </div>
            )}

            {activeTab === "payments" && (
              <div className="space-y-2">
                {customerInvoices.map((inv) => (
                  <div key={inv.id} className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-gray-900 font-bold">{inv.invoiceNumber}</strong>
                        <Badge tone={inv.paymentStatus === "Paid" ? "green" : "red"} size="sm">
                          {inv.paymentStatus}
                        </Badge>
                        {inv.isVerbalAgreement && (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                            Verbal Agreement
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Due: {inv.dueDate} · Ref: {inv.relatedReference}
                      </p>
                    </div>
                    <div className="text-right">
                      <strong className="text-gray-900 block font-display">${inv.totalAmount}</strong>
                      <span className="text-[10px] text-rose-700 font-bold">Unpaid: ${inv.outstandingBalance}</span>
                    </div>
                  </div>
                ))}
                {!customerInvoices.length && <p className="text-gray-400 italic py-4 text-center">No invoices recorded.</p>}
              </div>
            )}

            {activeTab === "claims" && (
              <div className="space-y-2">
                {customerClaims.map((claim) => (
                  <div key={claim.id} className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-rose-950 font-bold">{claim.reportNumber}</strong>
                        <Badge tone="red" size="sm">
                          {claim.severity} Damage
                        </Badge>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">{claim.materialName} · {claim.description}</p>
                      <span className="text-[10px] text-gray-400 font-medium">Responsibility: {claim.responsibilityAssessment}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-rose-800 font-display block">${claim.proposedCustomerCharge}</strong>
                      <span className="text-[10px] text-gray-500">{claim.disputeStatus}</span>
                    </div>
                  </div>
                ))}
                {!customerClaims.length && <p className="text-emerald-700 italic py-4 text-center">✓ Clean record: No open damage claims.</p>}
              </div>
            )}
          </div>
        </div>

        {/* Address and Notes */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Billing / Dispatch Address:</span>
            <p className="text-gray-800 mt-0.5">{customer.address}</p>
          </div>
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase block">Internal Notes:</span>
            <p className="text-gray-600 italic mt-0.5">"{customer.notes}"</p>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default CustomerProfileDrawer;
