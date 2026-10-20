import React, { useState, useMemo } from "react";
import { RentalReservation, RentalStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import Drawer from "../common/Drawer";
import RentalCalendar from "./RentalCalendar";
import RentalReservationModal from "./RentalReservationModal";
import RentalExtensionModal from "./RentalExtensionModal";
import OverdueResolutionModal from "./OverdueResolutionModal";

export const RentalsView: React.FC = () => {
  const { rentals, updateRentalStatus, can } = useApp();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [viewType, setViewType] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");

  // Modals
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [selectedRentalForDetail, setSelectedRentalForDetail] = useState<RentalReservation | null>(null);
  const [rentalToExtend, setRentalToExtend] = useState<RentalReservation | null>(null);
  const [rentalToResolveOverdue, setRentalToResolveOverdue] = useState<RentalReservation | null>(null);

  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      if (activeTab === "Active" && r.status !== "Active") return false;
      if (activeTab === "Confirmed" && r.status !== "Confirmed") return false;
      if (activeTab === "Overdue" && !r.isOverdue && r.status !== "Overdue") return false;
      if (activeTab === "Returned" && r.status !== "Returned") return false;

      const q = search.toLowerCase();
      return (
        r.reservationNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.deliveryAddress?.toLowerCase().includes(q) ||
        r.items.some((i) => i.materialName.toLowerCase().includes(q) || i.materialCode.toLowerCase().includes(q))
      );
    });
  }, [rentals, activeTab, search]);

  const handleDispatch = (rentalId: string) => {
    updateRentalStatus(rentalId, "Active");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            RENTAL RESERVATIONS & SCHEDULING
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Rental Operations & Reservations
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Plan reservations, prevent equipment double-booking, manage extensions, and track returns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can("manage_rentals") && (
            <button
              onClick={() => setIsNewReservationOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              New Rental Reservation
            </button>
          )}
        </div>
      </div>

      {/* View Switcher and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b md:border-b-0 border-gray-100">
            {["All", "Active", "Confirmed", "Overdue", "Returned"].map((tab) => (
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
                {tab === "Overdue" && rentals.some((r) => r.isOverdue || r.status === "Overdue") && (
                  <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                    {rentals.filter((r) => r.isOverdue || r.status === "Overdue").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-0.5 rounded-lg border border-gray-200 flex items-center text-xs">
              <button
                onClick={() => setViewType("list")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  viewType === "list" ? "bg-white text-emerald-950 shadow-2xs font-bold" : "text-gray-500"
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setViewType("calendar")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  viewType === "calendar" ? "bg-white text-emerald-950 shadow-2xs font-bold" : "text-gray-500"
                }`}
              >
                <Icon name="calendar" size={13} />
                Calendar
              </button>
            </div>
          </div>
        </div>

        {viewType === "list" && (
          <div className="pt-2 border-t border-gray-100">
            <div className="relative">
              <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by reservation number, customer name, equipment item, or delivery address..."
                className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main View: Calendar or Table List */}
      {viewType === "calendar" ? (
        <RentalCalendar onSelectRental={(r) => setSelectedRentalForDetail(r)} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reservation #</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Rental Window</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3">Total Cost</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRentals.map((rental) => (
                  <tr key={rental.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      <button
                        onClick={() => setSelectedRentalForDetail(rental)}
                        className="hover:text-emerald-800 hover:underline"
                      >
                        {rental.reservationNumber}
                      </button>
                      <span className="text-[10px] text-gray-400 block font-sans">{rental.deliveryType}</span>
                    </td>

                    <td className="py-3 px-3">
                      <strong className="text-gray-900 font-bold block">{rental.customerName}</strong>
                      <span className="text-[10px] text-gray-400">{rental.customerPhone}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-medium text-gray-700">
                        <span>{rental.startDate.slice(5, 10)}</span>
                        <span className="text-gray-400">→</span>
                        <span>{rental.expectedReturnDate.slice(5, 10)}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800">
                        {rental.rentalDurationDays} Day(s) duration
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-gray-900 font-bold block">
                        {rental.items.reduce((acc, i) => acc + i.quantity, 0)} total items
                      </span>
                      <span className="text-[10px] text-gray-500 line-clamp-1">
                        {rental.items.map((i) => `${i.quantity}x ${i.materialName}`).join(", ")}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-bold text-gray-900 font-display">
                      ${rental.totalCost}
                      <span className="text-[10px] text-gray-400 font-sans block">
                        Deposit: ${rental.depositAmount}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        tone={
                          rental.paymentStatus === "Paid"
                            ? "green"
                            : rental.paymentStatus === "Partial"
                            ? "yellow"
                            : "red"
                        }
                        size="sm"
                      >
                        {rental.paymentStatus}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      <Badge
                        tone={
                          rental.status === "Overdue"
                            ? "red"
                            : rental.status === "Active"
                            ? "yellow"
                            : rental.status === "Returned"
                            ? "gray"
                            : "green"
                        }
                        size="sm"
                      >
                        {rental.status}
                        {rental.isOverdue && ` (${rental.overdueDays || 2}d)`}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {rental.status === "Confirmed" && can("manage_rentals") && (
                          <button
                            onClick={() => handleDispatch(rental.id)}
                            className="px-2 py-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200 rounded-md transition-colors"
                            title="Dispatch to Customer (Mark Active)"
                          >
                            Dispatch
                          </button>
                        )}

                        <button
                          onClick={() => setRentalToExtend(rental)}
                          className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                          title="Extend Rental Period"
                        >
                          <Icon name="clock" size={14} />
                        </button>

                        {(rental.isOverdue || rental.status === "Overdue") && (
                          <button
                            onClick={() => setRentalToResolveOverdue(rental)}
                            className="px-2 py-1 text-[11px] font-bold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-md transition-colors"
                            title="Resolve Overdue & Late Fees"
                          >
                            Resolve Overdue
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedRentalForDetail(rental)}
                          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Icon name="eye" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!filteredRentals.length && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <Icon name="calendar" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                      <strong className="block text-gray-700">No rental reservations found</strong>
                      <span className="text-xs">Adjust search or add a new reservation.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <Drawer
        isOpen={!!selectedRentalForDetail}
        onClose={() => setSelectedRentalForDetail(null)}
        title={selectedRentalForDetail?.reservationNumber || "Rental Details"}
        subtitle={`Customer: ${selectedRentalForDetail?.customerName}`}
        badge={selectedRentalForDetail?.status.toUpperCase()}
        width="xl"
      >
        {selectedRentalForDetail && (
          <div className="space-y-6 text-xs">
            {/* Status & Contract Banner */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-sm">Contract: {selectedRentalForDetail.contractNumber}</span>
                <Badge
                  tone={
                    selectedRentalForDetail.status === "Overdue"
                      ? "red"
                      : selectedRentalForDetail.status === "Active"
                      ? "yellow"
                      : "green"
                  }
                >
                  {selectedRentalForDetail.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <div>Start: <strong>{selectedRentalForDetail.startDate.replace("T", " ")}</strong></div>
                <div>Expected Return: <strong>{selectedRentalForDetail.expectedReturnDate.replace("T", " ")}</strong></div>
                <div>Responsible Officer: <strong>{selectedRentalForDetail.responsibleEmployee}</strong></div>
                <div>Fulfillment: <strong>{selectedRentalForDetail.deliveryType}</strong></div>
              </div>
            </div>

            {/* Equipment Breakdown */}
            <div>
              <h3 className="font-bold text-gray-900 uppercase tracking-wider mb-2">Reserved Materials List</h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                {selectedRentalForDetail.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <strong className="text-gray-900 block font-bold">{item.materialName}</strong>
                      <span className="text-[10px] text-gray-400 font-mono">{item.materialCode} · {item.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 block">{item.quantity} units</span>
                      <span className="text-[10px] text-gray-500">${item.dailyRate}/day · Line: ${item.lineTotal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials & Deposit Breakdown */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
              <h3 className="font-bold text-gray-900 uppercase tracking-wider">Billing & Deposits</h3>
              <div className="flex justify-between">
                <span>Rental Subtotal:</span>
                <strong className="text-gray-900">${selectedRentalForDetail.subtotal}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tax (VAT 8.5%):</span>
                <strong className="text-gray-900">${selectedRentalForDetail.taxAmount}</strong>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200 font-bold">
                <span>Total Amount:</span>
                <span className="text-emerald-950 font-display">${selectedRentalForDetail.totalCost}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1">
                <span>Amount Paid:</span>
                <span className="text-emerald-700 font-bold">${selectedRentalForDetail.amountPaid}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Outstanding Balance:</span>
                <span className="text-rose-700 font-bold">${selectedRentalForDetail.outstandingBalance}</span>
              </div>
              <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
                <span>Security Deposit Held:</span>
                <span className="text-amber-700 font-bold">${selectedRentalForDetail.depositAmount} ({selectedRentalForDetail.depositStatus})</span>
              </div>
            </div>

            {/* Notes & Address */}
            <div className="space-y-1">
              <span className="font-bold text-gray-700">Delivery Address:</span>
              <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedRentalForDetail.deliveryAddress || "N/A"}</p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-gray-700">Internal Notes:</span>
              <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedRentalForDetail.notes}</p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Modals */}
      <RentalReservationModal
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
      />

      <RentalExtensionModal
        isOpen={!!rentalToExtend}
        onClose={() => setRentalToExtend(null)}
        rental={rentalToExtend}
      />

      <OverdueResolutionModal
        isOpen={!!rentalToResolveOverdue}
        onClose={() => setRentalToResolveOverdue(null)}
        rental={rentalToResolveOverdue}
      />
    </div>
  );
};

export default RentalsView;
