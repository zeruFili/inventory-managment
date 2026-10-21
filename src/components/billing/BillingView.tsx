import React, { useState, useMemo } from "react";
import { Invoice, SecurityDepositRecord } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import Modal from "../common/Modal";
import PaymentModal from "./PaymentModal";
import CreateInvoiceModal from "./CreateInvoiceModal";
import EditInvoiceModal from "./EditInvoiceModal";
import CreateDepositModal from "./CreateDepositModal";
import EditDepositModal from "./EditDepositModal";
import MaterialSelectorSection, { SelectedItemLine } from "../common/MaterialSelectorSection";

export const BillingView: React.FC = () => {
  const {
    invoices,
    securityDeposits,
    materials,
    deleteInvoice,
    deleteSecurityDeposit,
    recordDepositDeduction,
    recordDepositRefund,
    can,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>("All Invoices");
  const [search, setSearch] = useState("");

  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [deleteInvoiceTarget, setDeleteInvoiceTarget] = useState<Invoice | null>(null);

  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);

  // Security Deposit modals state
  const [isCreateDepositOpen, setIsCreateDepositOpen] = useState(false);
  const [editDepositTarget, setEditDepositTarget] = useState<SecurityDepositRecord | null>(null);
  const [deleteDepositTarget, setDeleteDepositTarget] = useState<SecurityDepositRecord | null>(null);

  // Deposit actions state
  const [depositModal, setDepositModal] = useState<{
    deposit: SecurityDepositRecord;
    action: "deduct" | "refund";
  } | null>(null);
  const [depositActionAmount, setDepositActionAmount] = useState<number>(100);
  const [depositActionNote, setDepositActionNote] = useState<string>("");
  const [depositDamageLines, setDepositDamageLines] = useState<SelectedItemLine[]>([]);

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

  const filteredDeposits = useMemo(() => {
    return securityDeposits.filter((d) => {
      const q = search.toLowerCase();
      return (
        d.id.toLowerCase().includes(q) ||
        d.rentalReference.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q) ||
        (d.deductionsExplanation && d.deductionsExplanation.toLowerCase().includes(q))
      );
    });
  }, [securityDeposits, search]);

  const handleDepositActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositModal) return;

    if (depositModal.action === "deduct") {
      const deductedItems = depositDamageLines.map((line) => {
        const mat = materials.find((m) => m.id === line.materialId);
        const unitVal = mat ? (mat.replacementValue || mat.purchaseCost) : 0;
        return {
          materialId: line.materialId,
          materialName: mat ? mat.name : "Material Item",
          quantity: line.quantity,
          amount: unitVal * line.quantity,
        };
      });

      recordDepositDeduction(
        depositModal.deposit.id,
        Number(depositActionAmount),
        depositActionNote || "Damage assessment deduction",
        deductedItems.length > 0 ? deductedItems : undefined
      );
    } else {
      recordDepositRefund(depositModal.deposit.id, Number(depositActionAmount));
    }
    setDepositModal(null);
    setDepositDamageLines([]);
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
            Manage multi-payment receivables and isolate security deposit liabilities in dedicated trust vaults.
          </p>
        </div>

        {can("manage_billing") && (
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {activeTab === "Security Deposits Vault" ? (
              <>
                <button
                  onClick={() => setIsCreateInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-2xs"
                >
                  <Icon name="plus" size={13} />
                  <span>New Invoice</span>
                </button>
                <button
                  onClick={() => setIsCreateDepositOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-xl transition-all shadow-xs"
                >
                  <Icon name="plus" size={14} />
                  <span>New Deposit Record</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsCreateDepositOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-all shadow-2xs"
                >
                  <Icon name="plus" size={13} />
                  <span>New Deposit</span>
                </button>
                <button
                  onClick={() => setIsCreateInvoiceOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-xl transition-all shadow-xs"
                >
                  <Icon name="plus" size={14} />
                  <span>New Invoice</span>
                </button>
              </>
            )}
          </div>
        )}
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
              placeholder={
                activeTab === "Security Deposits Vault"
                  ? "Search deposits, rental ref, customer..."
                  : "Search invoices, customers, references..."
              }
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

                        {can("manage_billing") && (
                          <>
                            <button
                              onClick={() => setEditInvoice(inv)}
                              className="p-1.5 text-gray-500 hover:text-emerald-900 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Edit Invoice"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteInvoiceTarget(inv)}
                              className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Invoice"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                          <Icon name="receipt" size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-gray-800">No invoices found</h4>
                        <p className="text-[11px] text-gray-500">
                          {search
                            ? `No records match "${search}". Try adjusting your search.`
                            : `No ${activeTab.toLowerCase()} invoices found in this view.`}
                        </p>
                        {can("manage_billing") && (
                          <button
                            onClick={() => setIsCreateInvoiceOpen(true)}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-2xs"
                          >
                            <Icon name="plus" size={12} />
                            Create Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Security Deposits Vault */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-amber-50/50 border-b border-amber-200/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Icon name="shield" size={16} className="text-amber-700 shrink-0" />
              <span>
                <strong>Security Deposit Trust Vault:</strong> Deposits are strictly held liabilities and NOT recognized as earned rental income until forfeited or deducted for damages.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <strong className="text-amber-950 font-display">
                Total Trust Held: ${totalDepositLiability.toLocaleString()}
              </strong>
              {can("manage_billing") && (
                <button
                  onClick={() => setIsCreateDepositOpen(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200/80 hover:bg-amber-300 rounded-lg transition-colors border border-amber-300 shadow-2xs"
                >
                  <Icon name="plus" size={13} />
                  <span>Add Security Deposit</span>
                </button>
              )}
            </div>
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
                {filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      <div>{dep.rentalReference}</div>
                      <span className="text-[10px] text-gray-400 font-mono">{dep.id}</span>
                    </td>

                    <td className="py-3 px-3 font-bold text-gray-900">
                      {dep.customerName}
                      {dep.deductionsExplanation && (
                        <span className="block text-[10px] font-normal text-gray-400 truncate max-w-xs">
                          {dep.deductionsExplanation}
                        </span>
                      )}
                    </td>

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
                      <div className="inline-flex items-center gap-1">
                        {dep.remainingLiability > 0 && can("manage_billing") && (
                          <>
                            <button
                              onClick={() => {
                                setDepositModal({ deposit: dep, action: "deduct" });
                                setDepositActionAmount(Math.min(100, dep.remainingLiability));
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors"
                              title="Deduct Damage"
                            >
                              Deduct
                            </button>
                            <button
                              onClick={() => {
                                setDepositModal({ deposit: dep, action: "refund" });
                                setDepositActionAmount(dep.remainingLiability);
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 rounded-md transition-colors"
                              title="Refund Deposit"
                            >
                              Refund
                            </button>
                          </>
                        )}

                        {can("manage_billing") && (
                          <>
                            <button
                              onClick={() => setEditDepositTarget(dep)}
                              className="p-1.5 text-gray-500 hover:text-amber-950 hover:bg-amber-100/60 rounded-md transition-colors"
                              title="Edit Deposit Record"
                            >
                              <Icon name="edit" size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteDepositTarget(dep)}
                              className="p-1.5 text-gray-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Deposit Record"
                            >
                              <Icon name="trash" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredDeposits.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="max-w-xs mx-auto space-y-2">
                        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                          <Icon name="shield" size={20} />
                        </div>
                        <h4 className="text-xs font-bold text-gray-800">No deposit records found</h4>
                        <p className="text-[11px] text-gray-500">
                          {search
                            ? `No deposit entries match "${search}". Try adjusting your search.`
                            : "There are currently no security deposits in the trust vault."}
                        </p>
                        {can("manage_billing") && (
                          <button
                            onClick={() => setIsCreateDepositOpen(true)}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-2xs"
                          >
                            <Icon name="plus" size={12} />
                            Add Security Deposit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        invoice={paymentInvoice}
      />

      {/* Deposit Action Modal */}
      {depositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-xs">
          <div
            className={`w-full ${
              depositModal.action === "deduct" ? "max-w-2xl" : "max-w-md"
            } bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-white shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900 font-display">
                  {depositModal.action === "deduct" ? "Deduct Damage Fee from Deposit" : "Refund Security Deposit"}
                </h3>
                <span className="text-xs text-gray-500 block">
                  Rental Ref: {depositModal.deposit.rentalReference} · {depositModal.deposit.customerName}
                </span>
              </div>
              <button
                onClick={() => {
                  setDepositModal(null);
                  setDepositDamageLines([]);
                }}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <Icon name="close" size={16} />
              </button>
            </div>

            <form onSubmit={handleDepositActionSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* If deducting damage, display reusable MaterialSelectorSection */}
              {depositModal.action === "deduct" && (
                <div className="pb-2">
                  <MaterialSelectorSection
                    mode="billing"
                    title="Damaged Equipment & Materials"
                    subtitle="Select damaged returned gear to evaluate deduction cost based on catalog replacement values"
                    addButtonLabel="Add Damaged Material"
                    items={depositDamageLines}
                    onItemsChange={(newLines) => {
                      setDepositDamageLines(newLines);
                      const damageSum = newLines.reduce((acc, line) => {
                        const mat = materials.find((m) => m.id === line.materialId);
                        const val = mat ? (mat.replacementValue || mat.purchaseCost) : 0;
                        return acc + val * line.quantity;
                      }, 0);
                      if (damageSum > 0) {
                        setDepositActionAmount(
                          Math.min(depositModal.deposit.remainingLiability, damageSum)
                        );
                        const names = newLines
                          .map((l) => {
                            const mat = materials.find((m) => m.id === l.materialId);
                            return mat ? `${mat.name} (x${l.quantity})` : "";
                          })
                          .filter(Boolean)
                          .join(", ");
                        setDepositActionNote(`Damage deduction for: ${names}`);
                      }
                    }}
                  />
                </div>
              )}

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
                  onClick={() => {
                    setDepositModal(null);
                    setDepositDamageLines([]);
                  }}
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

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
      />

      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        isOpen={!!editInvoice}
        onClose={() => setEditInvoice(null)}
        invoice={editInvoice}
      />

      {/* Create Security Deposit Modal */}
      <CreateDepositModal
        isOpen={isCreateDepositOpen}
        onClose={() => setIsCreateDepositOpen(false)}
      />

      {/* Edit Security Deposit Modal */}
      <EditDepositModal
        isOpen={!!editDepositTarget}
        onClose={() => setEditDepositTarget(null)}
        deposit={editDepositTarget}
      />

      {/* Delete Invoice Confirmation Modal */}
      {deleteInvoiceTarget && (
        <Modal
          isOpen={!!deleteInvoiceTarget}
          onClose={() => setDeleteInvoiceTarget(null)}
          title="Delete Invoice Record"
          subtitle={`Are you sure you want to permanently delete invoice ${deleteInvoiceTarget.invoiceNumber}?`}
          badge="DANGER"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-xs text-rose-950">
              <div className="flex justify-between">
                <span className="text-rose-700">Invoice Number:</span>
                <strong className="font-mono">{deleteInvoiceTarget.invoiceNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700">Customer:</span>
                <strong className="font-semibold">{deleteInvoiceTarget.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700">Total Invoiced:</span>
                <strong className="font-display">${deleteInvoiceTarget.totalAmount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-rose-700">Outstanding Balance:</span>
                <strong className="font-display text-rose-800">${deleteInvoiceTarget.outstandingBalance.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              This action cannot be undone. The invoice, along with its payment records and outstanding balance, will be removed from financial reconciliation.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteInvoiceTarget(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteInvoice(deleteInvoiceTarget.id);
                  setDeleteInvoiceTarget(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors shadow-xs"
              >
                Delete Invoice
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Deposit Confirmation Modal */}
      {deleteDepositTarget && (
        <Modal
          isOpen={!!deleteDepositTarget}
          onClose={() => setDeleteDepositTarget(null)}
          title="Delete Security Deposit Record"
          subtitle={`Are you sure you want to delete deposit record ${deleteDepositTarget.id}?`}
          badge="DANGER"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-950">
              <div className="flex justify-between">
                <span className="text-amber-800">Deposit ID:</span>
                <strong className="font-mono">{deleteDepositTarget.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">Rental Reference:</span>
                <strong className="font-mono">{deleteDepositTarget.rentalReference}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">Customer:</span>
                <strong className="font-semibold">{deleteDepositTarget.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">Deposit Received:</span>
                <strong className="font-display">${deleteDepositTarget.receivedAmount.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-800">Remaining Liability:</span>
                <strong className="font-display font-bold text-amber-900">${deleteDepositTarget.remainingLiability.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Deleting this record will remove the escrow liability from the Security Deposits Vault.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteDepositTarget(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSecurityDeposit(deleteDepositTarget.id);
                  setDeleteDepositTarget(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors shadow-xs"
              >
                Delete Deposit Record
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BillingView;
