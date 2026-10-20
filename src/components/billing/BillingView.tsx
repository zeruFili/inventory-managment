import React, { useState, useMemo } from "react";
import { Invoice, SecurityDepositRecord } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import PaymentModal from "./PaymentModal";
import VerbalAgreementModal from "./VerbalAgreementModal";

export const BillingView: React.FC = () => {
  const {
    invoices,
    securityDeposits,
    recordDepositDeduction,
    recordDepositRefund,
    can,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("All Invoices");
  const [search, setSearch] = useState("");

  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [verbalInvoice, setVerbalInvoice] = useState<Invoice | null>(null);

  // Deposit actions state
  const [depositModal, setDepositModal] = useState<{
    deposit: SecurityDepositRecord;
    action: "deduct" | "refund";
  } | null>(null);
  const [depositActionAmount, setDepositActionAmount] = useState<number>(100);
  const [depositActionNote, setDepositActionNote] = useState<string>("");

  const totalReceivables = invoices.reduce((acc, i) => acc + i.outstandingBalance, 0);
  const totalCollected = invoices.reduce((acc, i) => acc + i.amountPaid, 0);
  const totalDepositLiability = securityDeposits.reduce((acc, d) => acc + d.remainingLiability, 0);
  const overdueInvoicesCount = invoices.filter(
    (i) => i.outstandingBalance > 0 && new Date(i.dueDate).getTime() < new Date("2025-06-18").getTime()
  ).length;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((i) => {
      if (activeTab === "Unpaid" && i.paymentStatus !== "Unpaid") return false;
      if (activeTab === "Partially Paid" && i.paymentStatus !== "Partial") return false;
      if (activeTab === "Paid" && i.paymentStatus !== "Paid") return false;

      const q = search.toLowerCase();
      return (
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q) ||
        i.relatedReference.toLowerCase().includes(q)
      );
    });
  }, [invoices, activeTab, search]);

  const handleDepositActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModal) return;

    if (depositModal.action === "deduct") {
      recordDepositDeduction(depositModal.deposit.id, Number(depositActionAmount), depositActionNote || "Damage assessment deduction");
    } else {
      recordDepositRefund(depositModal.deposit.id, Number(depositActionAmount));
    }
    setDepositModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            FINANCE & SETTLEMENTS
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Billing, Invoices & Deposits
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage multi-payment receivables, isolate security deposit liabilities, and record authorized verbal agreements.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            RECEIVABLES (OUTSTANDING)
          </span>
          <strong className="text-2xl font-bold text-rose-700 font-display mt-1 block">
            ${totalReceivables.toLocaleString()}
          </strong>
          <span className="text-[11px] text-gray-500 mt-1 block font-medium">Across open invoices</span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-2xs">
          <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block">
            COLLECTED REVENUE
          </span>
          <strong className="text-2xl font-bold text-emerald-950 font-display mt-1 block">
            ${totalCollected.toLocaleString()}
          </strong>
          <span className="text-[11px] text-emerald-700 mt-1 block font-semibold">+18.2% vs previous period</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-2xs">
          <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider block">
            SECURITY DEPOSIT LIABILITY
          </span>
          <strong className="text-2xl font-bold text-amber-950 font-display mt-1 block">
            ${totalDepositLiability.toLocaleString()}
          </strong>
          <span className="text-[11px] text-amber-800 mt-1 block font-medium">Held in trust · separate from revenue</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
            OVERDUE INVOICES
          </span>
          <strong className="text-2xl font-bold text-gray-900 font-display mt-1 block">
            {overdueInvoicesCount}
          </strong>
          <span className="text-[11px] text-rose-600 mt-1 block font-semibold">Payment follow-up required</span>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {["All Invoices", "Unpaid", "Partially Paid", "Paid", "Security Deposits Vault"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-emerald-950 text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab}
                {tab === "Security Deposits Vault" && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-emerald-950 rounded-full text-[10px]">
                    ${totalDepositLiability.toLocaleString()}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices, customers, references..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      {activeTab !== "Security Deposits Vault" ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-3">Type & Ref</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Total Amount</th>
                  <th className="py-3 px-3">Paid</th>
                  <th className="py-3 px-3">Balance</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-xs font-bold text-gray-900 block font-mono">{inv.invoiceNumber}</strong>
                      {inv.isVerbalAgreement && (
                        <span className="inline-block mt-0.5 text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                          Verbal Agreement (Pending)
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-semibold text-gray-800">{inv.relatedType}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">{inv.relatedReference}</span>
                    </td>

                    <td className="py-3 px-3 font-bold text-gray-900">{inv.customerName}</td>

                    <td className="py-3 px-3 text-gray-500">{inv.dueDate}</td>

                    <td className="py-3 px-3 font-bold text-gray-900 font-display">${inv.totalAmount}</td>

                    <td className="py-3 px-3 font-semibold text-emerald-700">${inv.amountPaid}</td>

                    <td className="py-3 px-3">
                      <strong
                        className={`font-display font-bold ${
                          inv.outstandingBalance > 0 ? "text-rose-700" : "text-gray-400"
                        }`}
                      >
                        ${inv.outstandingBalance}
                      </strong>
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        tone={
                          inv.paymentStatus === "Paid"
                            ? "green"
                            : inv.paymentStatus === "Partial"
                            ? "yellow"
                            : "red"
                        }
                        size="sm"
                      >
                        {inv.paymentStatus}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {inv.outstandingBalance > 0 && can("manage_billing") && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-md transition-colors shadow-2xs"
                            title="Record Payment"
                          >
                            Record Pay
                          </button>
                        )}

                        {can("record_verbal_agreement") && !inv.isVerbalAgreement && (
                          <button
                            onClick={() => setVerbalInvoice(inv)}
                            className="px-2 py-1 text-[10px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors"
                            title="Log Verbal Agreement"
                          >
                            Verbal Agree
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Security Deposits Vault */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-amber-50/50 border-b border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Icon name="shield" size={16} className="text-amber-700" />
              <span>
                <strong>Security Deposit Trust Vault:</strong> Deposits are strictly held liabilities and NOT recognized as earned rental income until forfeited or deducted for damages.
              </span>
            </div>
            <strong className="text-amber-950 font-display">
              Total Trust Held: ${totalDepositLiability.toLocaleString()}
            </strong>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rental Ref</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Deposit Received</th>
                  <th className="py-3 px-3">Deducted (Damage)</th>
                  <th className="py-3 px-3">Refunded</th>
                  <th className="py-3 px-3">Remaining Liability</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Vault Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {securityDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">{dep.rentalReference}</td>

                    <td className="py-3 px-3 font-bold text-gray-900">{dep.customerName}</td>

                    <td className="py-3 px-3 font-bold text-gray-900 font-display">${dep.receivedAmount}</td>

                    <td className="py-3 px-3 text-rose-700 font-bold">${dep.deductedAmount}</td>

                    <td className="py-3 px-3 text-gray-500">${dep.refundedAmount}</td>

                    <td className="py-3 px-3 font-bold text-amber-900 font-display text-sm">
                      ${dep.remainingLiability}
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        tone={dep.status === "Held" ? "yellow" : dep.status === "Refunded" ? "green" : "red"}
                        size="sm"
                      >
                        {dep.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {dep.remainingLiability > 0 && can("manage_billing") && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setDepositModal({ deposit: dep, action: "deduct" });
                              setDepositActionAmount(Math.min(100, dep.remainingLiability));
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                          >
                            Deduct Damage
                          </button>
                          <button
                            onClick={() => {
                              setDepositModal({ deposit: dep, action: "refund" });
                              setDepositActionAmount(dep.remainingLiability);
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 rounded-md transition-colors"
                          >
                            Refund Deposit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment and Verbal Modals */}
      <PaymentModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
      />

      <VerbalAgreementModal
        isOpen={!!verbalInvoice}
        onClose={() => setVerbalInvoice(null)}
        invoice={verbalInvoice}
      />

      {/* Deposit Action Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white">
              <h3 className="text-base font-bold text-gray-900 font-display">
                {depositModal.action === "deduct" ? "Deduct Damage Fee from Deposit" : "Refund Security Deposit"}
              </h3>
              <button onClick={() => setDepositModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleDepositActionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {depositModal.action === "deduct" ? "Deduction Amount ($)" : "Refund Amount ($)"}
                </label>
                <input
                  type="number"
                  min="1"
                  max={depositModal.deposit.remainingLiability}
                  required
                  value={depositActionAmount}
                  onChange={(e) => setDepositActionAmount(Number(e.target.value))}
                  className="w-full text-base font-bold border border-gray-300 rounded-lg p-2.5 outline-none font-display"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Remaining Deposit Available: ${depositModal.deposit.remainingLiability}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {depositModal.action === "deduct" ? "Damage / Violation Justification" : "Refund Notes"}
                </label>
                <textarea
                  rows={2}
                  required
                  value={depositActionNote}
                  onChange={(e) => setDepositActionNote(e.target.value)}
                  placeholder={
                    depositModal.action === "deduct"
                      ? "e.g. Scratched table surface during banquet; agreed with Sarah Miller."
                      : "Returned in clean condition, full refund processed."
                  }
                  className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs ${
                    depositModal.action === "deduct" ? "bg-rose-700 hover:bg-rose-800" : "bg-emerald-950 hover:bg-emerald-900"
                  }`}
                >
                  {depositModal.action === "deduct" ? "Confirm Deduction" : "Confirm Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingView;
