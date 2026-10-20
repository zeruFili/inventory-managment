import React, { useState, useMemo } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";
import Badge from "../common/Badge";

interface MaterialPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  expectedReturnDate: string;
  selectedItems: { materialId: string; quantity: number }[];
  onApplySelection: (items: { materialId: string; quantity: number }[]) => void;
}

export const MaterialPickerModal: React.FC<MaterialPickerModalProps> = ({
  isOpen,
  onClose,
  startDate,
  expectedReturnDate,
  selectedItems,
  onApplySelection,
}) => {
  const { materials, checkMaterialAvailability, showToast } = useApp();

  // Local state of selected items mapped by materialId -> quantity
  const [tempSelection, setTempSelection] = useState<Record<string, number>>({});

  // Search & Filtering identical to InventoryView
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [activeTab, setActiveTab] = useState<"All" | "Available" | "Low Stock" | "Under Repair">("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

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

  const warehouses = [
    "All",
    "Central Warehouse",
    "East Branch Depot",
    "North Hub",
  ];

  // Initialize selection when opening
  React.useEffect(() => {
    if (isOpen) {
      const map: Record<string, number> = {};
      selectedItems.forEach((item) => {
        map[item.materialId] = item.quantity;
      });
      setTempSelection(map);
    }
  }, [isOpen, selectedItems]);

  // Compute availability for requested reservation dates for all materials
  const materialsWithAvailability = useMemo(() => {
    return materials
      .filter((m) => !m.isArchived)
      .map((mat) => {
        const availCheck = checkMaterialAvailability(
          mat.id,
          startDate,
          expectedReturnDate,
          1
        );
        return {
          ...mat,
          dateAvailable: availCheck.available,
          maxDateAvailable: availCheck.maxAvailable,
          conflictsCount: availCheck.conflictingRentals.length,
        };
      });
  }, [materials, startDate, expectedReturnDate, checkMaterialAvailability]);

  // Filter materials based on search, tabs, category, warehouse
  const filteredMaterials = useMemo(() => {
    return materialsWithAvailability.filter((item) => {
      // Tab filter
      if (activeTab === "Available" && item.maxDateAvailable <= 0) return false;
      if (activeTab === "Low Stock" && item.physicallyAvailable > item.lowStockThreshold) return false;
      if (activeTab === "Under Repair" && item.underRepair <= 0) return false;

      // Dropdown filters
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (selectedWarehouse !== "All" && item.warehouse !== selectedWarehouse) return false;

      // Search bar matches: Name, Code/SKU, Brand, Model, Category, Storage Location, Warehouse
      const q = search.toLowerCase().trim();
      if (!q) return true;

      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.model.toLowerCase().includes(q) ||
        item.warehouse.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q)
      );
    });
  }, [materialsWithAvailability, activeTab, selectedCategory, selectedWarehouse, search]);

  // Quantity helpers
  const handleSetQuantity = (matId: string, qty: number, maxAvail: number) => {
    if (qty <= 0) {
      setTempSelection((prev) => {
        const next = { ...prev };
        delete next[matId];
        return next;
      });
    } else {
      const clamped = Math.min(qty, Math.max(1, maxAvail));
      setTempSelection((prev) => ({
        ...prev,
        [matId]: clamped,
      }));
    }
  };

  const handleToggleAdd = (mat: typeof materialsWithAvailability[0]) => {
    if (mat.maxDateAvailable <= 0) {
      showToast(`No units of ${mat.name} are available for the selected dates!`, "error");
      return;
    }

    if (tempSelection[mat.id]) {
      // remove
      setTempSelection((prev) => {
        const next = { ...prev };
        delete next[mat.id];
        return next;
      });
    } else {
      // add default quantity (either 1, 10, or max available if less)
      const defaultQty = Math.min(10, mat.maxDateAvailable);
      setTempSelection((prev) => ({
        ...prev,
        [mat.id]: defaultQty,
      }));
    }
  };

  const selectedCount = Object.keys(tempSelection).length;
  const totalUnitsSelected = Object.values(tempSelection).reduce((acc, q) => acc + q, 0);

  const estimatedDailyRate = Object.entries(tempSelection).reduce((acc, [matId, qty]) => {
    const mat = materials.find((m) => m.id === matId);
    return acc + (mat ? mat.rentalPriceDaily * qty : 0);
  }, 0);

  const handleApply = () => {
    const newItems = Object.entries(tempSelection).map(([materialId, quantity]) => ({
      materialId,
      quantity,
    }));
    onApplySelection(newItems);
    showToast(`Updated reservation with ${newItems.length} equipment materials.`);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Materials from Inventory"
      subtitle={`Browsing stock with real-time availability for requested period: ${startDate.slice(0, 10)} to ${expectedReturnDate.slice(0, 10)}`}
      badge="INVENTORY BROWSER & ALLOCATION"
      maxWidth="6xl"
      zIndex="z-60"
    >
      <div className="space-y-4">
        {/* Reservation Date Window Indicator */}
        <div className="p-3 bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-amber-50/50 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-950 text-amber-400 flex items-center justify-center font-bold">
              <Icon name="calendar" size={14} />
            </span>
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-bold block">
                Target Rental Window
              </span>
              <strong className="text-gray-900 font-display">
                {startDate.replace("T", " ")} → {expectedReturnDate.replace("T", " ")}
              </strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold shadow-2xs">
              ✓ Availability auto-computed for these exact dates
            </span>
          </div>
        </div>

        {/* Filter Controls Toolbar - Reused from InventoryView */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b md:border-b-0 border-gray-100">
              {(["All", "Available", "Low Stock", "Under Repair"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-emerald-950 text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                  {tab === "Available" && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-950 rounded-full text-[10px]">
                      {materialsWithAvailability.filter((m) => m.maxDateAvailable > 0).length}
                    </span>
                  )}
                  {tab === "Low Stock" && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-emerald-950 rounded-full text-[10px]">
                      {materials.filter((m) => m.physicallyAvailable <= m.lowStockThreshold).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md ${
                    viewMode === "grid" ? "bg-white text-emerald-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Grid visual view"
                >
                  <Icon name="box" size={14} />
                </button>
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
              </div>
            </div>
          </div>

          {/* Search Bar & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
            {/* Search input with multi-attribute search */}
            <div className="sm:col-span-6 relative">
              <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by material name, SKU/code, brand, model, category, or storage location..."
                className="w-full text-xs font-medium pl-9 pr-8 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 outline-none"
              >
                {warehouses.map((w) => (
                  <option key={w} value={w}>
                    {w === "All" ? "All Warehouses" : w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Category Selection Chips with Live Counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-gray-100">
            {categories.map((cat) => {
              const count = cat === "All"
                ? materialsWithAvailability.length
                : materialsWithAvailability.filter((m) => m.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-emerald-950 text-white font-bold shadow-2xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 font-medium"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? "bg-emerald-800 text-white"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content: Visual Card Grid or Table View */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[50vh] overflow-y-auto pr-1">
            {filteredMaterials.map((mat) => {
              const isSelected = !!tempSelection[mat.id];
              const selectedQty = tempSelection[mat.id] || 0;
              const isAvail = mat.maxDateAvailable > 0;

              return (
                <div
                  key={mat.id}
                  className={`bg-white rounded-xl border p-3.5 shadow-2xs flex flex-col justify-between transition-all ${
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/15"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div>
                    {/* Image & Badges */}
                    <div className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden mb-2.5">
                      <img
                        src={mat.imageUrl}
                        alt={mat.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {isAvail ? (
                          <span className="text-[10px] font-bold text-emerald-900 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full shadow-2xs border border-emerald-200">
                            {mat.maxDateAvailable} Avail for dates
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-800 bg-rose-100/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-rose-300">
                            Booked Out
                          </span>
                        )}
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.2 rounded">
                        {mat.code}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {mat.category}
                        </span>
                        <strong className="text-xs font-bold text-gray-900 font-display">
                          ${mat.rentalPriceDaily}/day
                        </strong>
                      </div>

                      <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{mat.name}</h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{mat.description}</p>

                      <div className="pt-1.5 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
                        <span>{mat.storageLocation}</span>
                        <span className="font-semibold text-gray-700">Total: {mat.totalOwned} {mat.unitOfMeasure}</span>
                      </div>
                    </div>
                  </div>

                  {/* Add / Quantity Stepper Section */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    {isSelected ? (
                      <div className="w-full flex items-center justify-between gap-2 bg-emerald-100/70 p-1 rounded-lg border border-emerald-300">
                        <span className="text-[11px] font-bold text-emerald-950 pl-1.5">
                          Selected:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetQuantity(mat.id, selectedQty - 5, mat.maxDateAvailable)}
                            className="w-6 h-6 rounded bg-white text-emerald-950 font-bold flex items-center justify-center hover:bg-emerald-50 border border-emerald-200"
                            title="-5 units"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={mat.maxDateAvailable}
                            value={selectedQty}
                            onChange={(e) => handleSetQuantity(mat.id, Number(e.target.value), mat.maxDateAvailable)}
                            className="w-14 text-xs font-extrabold text-center bg-white border border-emerald-300 rounded py-0.5 outline-none font-display text-emerald-950"
                          />
                          <button
                            type="button"
                            onClick={() => handleSetQuantity(mat.id, selectedQty + 5, mat.maxDateAvailable)}
                            disabled={selectedQty >= mat.maxDateAvailable}
                            className="w-6 h-6 rounded bg-white text-emerald-950 font-bold flex items-center justify-center hover:bg-emerald-50 border border-emerald-200 disabled:opacity-40"
                            title="+5 units"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetQuantity(mat.id, 0, mat.maxDateAvailable)}
                            className="p-1 text-rose-600 hover:text-rose-800 ml-1"
                            title="Remove from selection"
                          >
                            <Icon name="close" size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleAdd(mat)}
                        disabled={!isAvail}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                          isAvail
                            ? "bg-emerald-950 text-white hover:bg-emerald-900 shadow-2xs"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <Icon name="plus" size={13} />
                        {isAvail ? "Add Material" : "Unavailable for Dates"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {!filteredMaterials.length && (
              <div className="col-span-full py-12 text-center text-gray-400">
                <Icon name="box" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                <strong className="block text-gray-700">No inventory materials match your filters</strong>
                <span className="text-xs">Try selecting another category, clearing your search, or changing tabs.</span>
              </div>
            )}
          </div>
        ) : (
          /* Table View - Reusing InventoryView's exact columns & layout */
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden max-h-[50vh] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/90 sticky top-0 z-10 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Material & SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Warehouse & Bay</th>
                  <th className="py-2.5 px-3 text-center">Owned</th>
                  <th className="py-2.5 px-3 text-center">Date Available</th>
                  <th className="py-2.5 px-3">Daily Rate</th>
                  <th className="py-2.5 px-3">Condition</th>
                  <th className="py-2.5 px-4 text-right">Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMaterials.map((mat) => {
                  const isSelected = !!tempSelection[mat.id];
                  const selectedQty = tempSelection[mat.id] || 0;
                  const isAvail = mat.maxDateAvailable > 0;

                  return (
                    <tr
                      key={mat.id}
                      className={`hover:bg-emerald-50/20 transition-colors ${
                        isSelected ? "bg-emerald-50/30 font-medium" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2.5">
                        <img
                          src={mat.imageUrl}
                          alt=""
                          className="w-9 h-9 rounded-lg object-cover border border-gray-100 shrink-0"
                        />
                        <div>
                          <strong className="text-xs font-bold text-gray-900 block">{mat.name}</strong>
                          <span className="text-[10px] text-gray-400 font-mono">{mat.code} · {mat.brand}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-gray-600 font-medium">{mat.category}</td>

                      <td className="py-2.5 px-3">
                        <span className="text-gray-900 font-semibold block">{mat.warehouse}</span>
                        <span className="text-[10px] text-gray-400">{mat.storageLocation}</span>
                      </td>

                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">{mat.totalOwned}</td>

                      <td className="py-2.5 px-3 text-center">
                        {isAvail ? (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {mat.maxDateAvailable} Units
                          </span>
                        ) : (
                          <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            0 Avail
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-gray-900">${mat.rentalPriceDaily}</td>

                      <td className="py-2.5 px-3">
                        <Badge
                          tone={
                            mat.physicalCondition === "Excellent"
                              ? "green"
                              : mat.physicalCondition === "Good"
                              ? "lime"
                              : "yellow"
                          }
                          size="sm"
                        >
                          {mat.physicalCondition}
                        </Badge>
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        {isSelected ? (
                          <div className="inline-flex items-center gap-1.5 bg-emerald-100/70 p-1 rounded-lg border border-emerald-300">
                            <button
                              type="button"
                              onClick={() => handleSetQuantity(mat.id, selectedQty - 5, mat.maxDateAvailable)}
                              className="w-5 h-5 rounded bg-white text-emerald-950 font-bold flex items-center justify-center hover:bg-emerald-50 border border-emerald-200"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={mat.maxDateAvailable}
                              value={selectedQty}
                              onChange={(e) => handleSetQuantity(mat.id, Number(e.target.value), mat.maxDateAvailable)}
                              className="w-12 text-xs font-bold text-center bg-white border border-emerald-300 rounded py-0.5 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSetQuantity(mat.id, selectedQty + 5, mat.maxDateAvailable)}
                              disabled={selectedQty >= mat.maxDateAvailable}
                              className="w-5 h-5 rounded bg-white text-emerald-950 font-bold flex items-center justify-center hover:bg-emerald-50 border border-emerald-200 disabled:opacity-40"
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetQuantity(mat.id, 0, mat.maxDateAvailable)}
                              className="p-1 text-rose-600 hover:text-rose-800"
                              title="Remove"
                            >
                              <Icon name="close" size={13} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleAdd(mat)}
                            disabled={!isAvail}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 ${
                              isAvail
                                ? "bg-emerald-950 text-white hover:bg-emerald-900"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <Icon name="plus" size={12} /> Add
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Floating Bar / Action Footer */}
        <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-900 text-white font-bold flex items-center justify-center text-xs">
                {selectedCount}
              </span>
              <span className="text-xs font-bold text-emerald-950">
                Equipment Types Selected ({totalUnitsSelected} Total Units)
              </span>
            </div>
            {estimatedDailyRate > 0 && (
              <span className="text-xs text-gray-600 font-medium">
                Combined Daily Rate: <strong className="text-gray-900">${estimatedDailyRate}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Icon name="check" size={14} />
              Apply {selectedCount} Materials to Reservation
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialPickerModal;
