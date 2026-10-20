import React, { useState, useMemo } from "react";
import { RentalReservation } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";

interface RentalCalendarProps {
  onSelectRental: (rental: RentalReservation) => void;
}

export const RentalCalendar: React.FC<RentalCalendarProps> = ({ onSelectRental }) => {
  const { rentals, materials, customers } = useApp();

  const [calendarView, setCalendarView] = useState<"day" | "week" | "month" | "year">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 5, 18)); // June 18, 2025
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("All");

  const categories = [
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

  // Navigate dates
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (calendarView === "day") d.setDate(d.getDate() - 1);
    else if (calendarView === "week") d.setDate(d.getDate() - 7);
    else if (calendarView === "month") d.setMonth(d.getMonth() - 1);
    else if (calendarView === "year") d.setFullYear(d.getFullYear() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (calendarView === "day") d.setDate(d.getDate() + 1);
    else if (calendarView === "week") d.setDate(d.getDate() + 7);
    else if (calendarView === "month") d.setMonth(d.getMonth() + 1);
    else if (calendarView === "year") d.setFullYear(d.getFullYear() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2025, 5, 18));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Filter rentals
  const filteredRentals = useMemo(() => {
    return rentals.filter((r) => {
      if (filterStatus !== "All" && r.status !== filterStatus) return false;
      if (filterWarehouse !== "All" && r.warehouse !== filterWarehouse) return false;
      if (filterCategory !== "All") {
        const hasCat = r.items.some((i) => i.category === filterCategory);
        if (!hasCat) return false;
      }
      return true;
    });
  }, [rentals, filterCategory, filterStatus, filterWarehouse]);

  // Month grid calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyStartDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden space-y-4 p-5">
      {/* Calendar Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Previous"
            >
              <Icon name="chevron" size={14} className="rotate-90" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
              title="Next"
            >
              <Icon name="chevron" size={14} className="-rotate-90" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200/80 transition-colors ml-1"
            >
              Today
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-900 font-display">
            {calendarView === "year" && `${year}`}
            {calendarView === "month" && `${monthNames[month]} ${year}`}
            {calendarView === "week" && `Week of ${monthNames[month]} ${currentDate.getDate()}, ${year}`}
            {calendarView === "day" && `${monthNames[month]} ${currentDate.getDate()}, ${year}`}
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-0.5 rounded-lg border border-gray-200 flex items-center text-xs font-semibold">
            {(["day", "week", "month", "year"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setCalendarView(v)}
                className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                  calendarView === v ? "bg-white text-emerald-950 shadow-2xs font-bold" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-2 border-b border-gray-100">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Equipment Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2 bg-gray-50/50 text-gray-900 outline-none"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Rental Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2 bg-gray-50/50 text-gray-900 outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Active">Active (In Transit / On Site)</option>
            <option value="Overdue">Overdue Return</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Warehouse Location</label>
          <select
            value={filterWarehouse}
            onChange={(e) => setFilterWarehouse(e.target.value)}
            className="w-full text-xs font-medium border border-gray-200 rounded-lg p-2 bg-gray-50/50 text-gray-900 outline-none"
          >
            <option value="All">All Locations</option>
            <option value="Central Warehouse">Central Warehouse</option>
            <option value="East Branch Depot">East Branch Depot</option>
          </select>
        </div>
      </div>

      {/* Calendar Views */}
      {calendarView === "month" && (
        <div>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-px border-b border-gray-200 text-center text-[11px] font-bold text-gray-500 uppercase py-2 bg-gray-50/70 rounded-t-lg">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-b-lg overflow-hidden border border-gray-200">
            {emptyStartDays.map((i) => (
              <div key={`empty-${i}`} className="bg-gray-50/40 min-h-24 p-2 text-gray-300" />
            ))}

            {daysArray.map((day) => {
              const dateStr = `2025-06-${day.toString().padStart(2, "0")}`;
              const dayRentals = filteredRentals.filter((r) => {
                const s = r.startDate.slice(0, 10);
                const e = r.expectedReturnDate.slice(0, 10);
                return dateStr >= s && dateStr <= e;
              });

              const isToday = day === 18 && month === 5 && year === 2025;

              return (
                <div
                  key={day}
                  className={`bg-white min-h-24 p-1.5 flex flex-col justify-between transition-colors hover:bg-emerald-50/20 ${
                    isToday ? "ring-2 ring-emerald-600 inset-0 z-10" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday ? "bg-emerald-950 text-white" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                    {dayRentals.length > 0 && (
                      <span className="text-[10px] font-mono text-gray-400 font-semibold">
                        {dayRentals.length} rent
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {dayRentals.slice(0, 2).map((r) => (
                      <button
                        key={r.id}
                        onClick={() => onSelectRental(r)}
                        className={`w-full text-left p-1 rounded-md text-[10px] font-bold line-clamp-1 border transition-all ${
                          r.status === "Overdue"
                            ? "bg-rose-50 text-rose-800 border-rose-200"
                            : r.status === "Active"
                            ? "bg-amber-50 text-amber-900 border-amber-200"
                            : "bg-emerald-50 text-emerald-900 border-emerald-200"
                        }`}
                      >
                        {r.customerName.slice(0, 14)}.. ({r.items.length})
                      </button>
                    ))}
                    {dayRentals.length > 2 && (
                      <span className="text-[9px] text-gray-400 font-medium block text-center">
                        +{dayRentals.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calendarView === "week" && (
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-3">
            {[16, 17, 18, 19, 20, 21, 22].map((day) => {
              const dateStr = `2025-06-${day}`;
              const dayRentals = filteredRentals.filter((r) => {
                const s = r.startDate.slice(0, 10);
                const e = r.expectedReturnDate.slice(0, 10);
                return dateStr >= s && dateStr <= e;
              });

              return (
                <div key={day} className="bg-gray-50/70 p-3 rounded-xl border border-gray-200 min-h-60 flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 mb-2">
                    <span className="text-xs font-bold text-gray-900 font-display">June {day}</span>
                    {day === 18 && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        Today
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayRentals.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => onSelectRental(r)}
                        className="p-2 bg-white rounded-lg border border-gray-200 shadow-2xs cursor-pointer hover:border-emerald-400 text-xs"
                      >
                        <strong className="text-gray-900 font-bold block">{r.customerName}</strong>
                        <span className="text-[10px] text-gray-500 mt-0.5 block">
                          {r.reservationNumber} · {r.items.length} items
                        </span>
                        <div className="mt-1.5">
                          <Badge tone={r.status === "Overdue" ? "red" : r.status === "Active" ? "yellow" : "green"} size="sm">
                            {r.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {!dayRentals.length && <span className="text-[11px] text-gray-400 italic">No bookings</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {calendarView === "day" && (
        <div className="space-y-3">
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-900 uppercase">DAY SCHEDULE VIEW</span>
              <h3 className="text-base font-bold text-gray-900 mt-0.5">
                Active Operations for {monthNames[month]} {currentDate.getDate()}, {year}
              </h3>
            </div>
            <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200">
              {filteredRentals.length} Active Rentals
            </span>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
            {filteredRentals.map((r) => (
              <div
                key={r.id}
                onClick={() => onSelectRental(r)}
                className="p-4 bg-white hover:bg-emerald-50/30 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-950 flex flex-col items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold uppercase">{r.startDate.slice(5, 7)}/25</span>
                    <strong className="text-sm font-bold">{r.startDate.slice(8, 10)}</strong>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-gray-900">{r.customerName}</strong>
                      <Badge tone={r.status === "Overdue" ? "red" : r.status === "Active" ? "yellow" : "green"} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {r.reservationNumber} · {r.rentalDurationDays} Days · {r.deliveryType}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      Materials: {r.items.map((i) => `${i.quantity}x ${i.materialName}`).join(", ")}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <strong className="text-sm font-bold text-gray-900 block font-display">${r.totalCost}</strong>
                  <span className="text-xs text-gray-500 font-medium">Deposit: ${r.depositAmount} ({r.depositStatus})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {calendarView === "year" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {monthNames.map((mName, mIdx) => (
            <div
              key={mName}
              onClick={() => {
                const d = new Date(year, mIdx, 1);
                setCurrentDate(d);
                setCalendarView("month");
              }}
              className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-emerald-400 cursor-pointer transition-all hover:bg-white"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <strong className="text-xs font-bold text-gray-900">{mName}</strong>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                  {mIdx === 5 ? "12 events" : "8 events"}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                Click to expand daily view and scheduled material reservations.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalCalendar;
