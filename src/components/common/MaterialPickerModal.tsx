import React, { useState, useMemo } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "./Modal";
import Icon from "./Icons";
import Badge from "./Badge";

export type MaterialPickerMode = "rental" | "sales" | "billing" | "maintenance";

export interface MaterialPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: MaterialPickerMode;

  // Rental mode date props
  startDate?: string;
  expectedReturnDate?: string;

  // Multi-selection (Rentals, Sales, Billing)
  selectedItems?: { materialId: string; quantity: number }[];
  onApplySelection?: (items: { materialId: string; quantity: number }[]) => void;

  // Single-selection (Maintenance: Equipment Under Repair)
  singleSelection?: boolean;
  selectedMaterialId?: string;
  onSelectMaterial?: (material: Material) => void;

  // Customization
  title?: string;
  subtitle?: string;
  badge?: string;
}

export const MaterialPickerModal: React.FC<MaterialPickerModalProps> = ({
  isOpen,
  onClose,
  mode = "rental",
  startDate = new Date().toISOString().slice(0, 16),
  expectedReturnDate = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
  selectedItems = [],
  onApplySelection,
  singleSelection = false,
  selectedMaterialId,
  onSelectMaterial,
  title,
  subtitle,
  badge,
}) => {
  const { materials, checkMaterialAvailability, showToast } = useApp();

  // Local state of selected items mapped by materialId -> quantity
  const [tempSelection, setTempSelection] = useState<Record<string, number>>({});

  // Search & Filtering
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "All" | "Available" | "Low Stock" | "Under Repair" | "Damaged"
  >(mode === "maintenance" ? "Under Repair" : "All");
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
      if (singleSelection && selectedMaterialId) {
        setTempSelection({ [selectedMaterialId]: 1 });
      } else {
        const map: Record<string, number> = {};
        selectedItems.forEach((item) => {
          map[item.materialId] = item.quantity;
        });
        setTempSelection(map);
      }
    }
  }, [isOpen, selectedItems, singleSelection, selectedMaterialId]);

  // Compute availability depending on mode
  const materialsWithAvailability = useMemo(() => {
    return materials
      .filter((m) => !m.isArchived)
      .map((mat) => {
        if (mode === "rental") {
          const availCheck = checkMaterialAvailability(
            mat.id,
            startDate,
            expectedReturnDate,
            1
          );
          return {
            ...mat,
            dateAvailable: availCheck.available,
            effectiveAvailable: availCheck.maxAvailable,
            conflictsCount: availCheck.conflictingRentals.length,
          };
        }

        // Sales mode: available is physical stock
        if (mode === "sales") {
          return {
            ...mat,
            dateAvailable: mat.physicallyAvailable > 0,
            effectiveAvailable: mat.physicallyAvailable,
            conflictsCount: 0,
          };
        }

        // Maintenance or Billing mode:
        return {
          ...mat,
          dateAvailable: mat.physicallyAvailable > 0,
          effectiveAvailable: mat.totalOwned,
          conflictsCount: 0,
        };
      });
  }, [materials, mode, startDate, expectedReturnDate, checkMaterialAvailability]);

  // Filter materials based on search, tabs, category, warehouse
  const filteredMaterials = useMemo(() => {
    return materialsWithAvailability.filter((item) => {
      // Tab filter
      if (activeTab === "Available" && item.effectiveAvailable <= 0) return false;
      if (activeTab === "Low Stock" && item.physicallyAvailable > item.lowStockThreshold) return false;
      if (activeTab === "Under Repair" && item.underRepair <= 0) return false;
      if (activeTab === "Damaged" && item.physicalCondition !== "Damaged" && item.physicalCondition !== "Fair") return false;

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

  // Quantity helpers for multi-selection
  const handleSetQuantity = (matId: string, qty: number, maxAvail: number) => {
    if (qty <= 0) {
      setTempSelection((prev) => {
        const next = { ...prev };
        delete next[matId];
        return next;
      });
    } else {
      const maxLimit = mode === "billing" || mode === "maintenance" ? 9999 : Math.max(1, maxAvail);
      const clamped = Math.min(qty, maxLimit);
      setTempSelection((prev) => ({
        ...prev,
        [matId]: clamped,
      }));
    }
  };

  const handleToggleAdd = (mat: typeof materialsWithAvailability[0]) => {
    if (singleSelection) {
      if (onSelectMaterial) {
        onSelectMaterial(mat);
        onClose();
      }
      return;
    }

    if (mode === "rental" && mat.effectiveAvailable <= 0) {
      showToast(`No units of ${mat.name} are available for the selected dates!`, "error");
      return;
    }
    if (mode === "sales" && mat.physicallyAvailable <= 0) {
      showToast(`${mat.name} is currently out of stock for immediate sale!`, "warning");
      return;
    }

    if (tempSelection[mat.id]) {
      setTempSelection((prev) => {
        const next = { ...prev };
        delete next[mat.id];
        return next;
      });
    } else {
      const defaultQty = mode === "sales"
        ? Math.min(5, mat.physicallyAvailable || 1)
        : Math.min(10, mat.effectiveAvailable || 1);
      setTempSelection((prev) => ({
        ...prev,
        [mat.id]: defaultQty,
      }));
    }
  };

  const handleSingleSelect = (mat: Material) => {
    if (onSelectMaterial) {
      onSelectMaterial(mat);
      showToast(`Selected equipment: ${mat.name}`);
      onClose();
    }
  };

  const selectedCount = Object.keys(tempSelection).length;
  const totalUnitsSelected = Object.values(tempSelection).reduce((acc, q) => acc + q, 0);

  const estimatedValue = useMemo(() => {
    return Object.entries(tempSelection).reduce((acc, [matId, qty]) => {
      const mat = materials.find((m) => m.id === matId);
      if (!mat) return acc;
      if (mode === "sales") return acc + mat.sellingPrice * qty;
      if (mode === "billing") return acc + (mat.replacementValue || mat.purchaseCost) * qty;
      return acc + mat.rentalPriceDaily * qty;
    }, 0);
  }, [tempSelection, materials, mode]);

  const handleApply = () => {
    const newItems = Object.entries(tempSelection).map(([materialId, quantity]) => ({
      materialId,
      quantity,
    }));
    if (onApplySelection) {
      onApplySelection(newItems);
      showToast(`Applied ${newItems.length} material(s) to order.`);
    }
    onClose();
  };

  const modalTitle =
    title ||
    (mode === "rental"
      ? "Select Materials & Equipment for Rental"
      : mode === "sales"
      ? "Select Products for Sales Order"
      : mode === "billing"
      ? "Select Materials for Billing / Damage Assessment"
      : "Select Equipment for Maintenance & Repair");

  const modalSubtitle =
    subtitle ||
    (mode === "rental"
      ? `Real-time availability validated for ${startDate.slice(0, 10)} to ${expectedReturnDate.slice(0, 10)}`
      : mode === "sales"
      ? "Select on-hand inventory items, consumables, or fleet gear for direct purchase"
      : mode === "billing"
      ? "Add items to invoice lines, replacement fee assessments, or deposit deductions"
      : "Choose the physical equipment model requiring diagnostic testing or repair");

  const modalBadge =
    badge ||
    (mode === "rental"
      ? "RENTAL ALLOCATION"
      : mode === "sales"
      ? "SALES CATALOG"
      : mode === "billing"
      ? "BILLING VALUATION"
      : "MAINTENANCE QUEUE");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      subtitle={modalSubtitle}
      badge={modalBadge}
      maxWidth="6xl"
      zIndex="z-60"
    >
      <div className="space-y-4">
        {/* Context Banner */}
        {mode === "rental" && (
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
        )}

        {mode === "sales" && (
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-950 text-amber-400 flex items-center justify-center font-bold">
                <Icon name="cart" size={14} />
              </span>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-bold block">
                  Direct Sales Catalog
                </span>
                <strong className="text-gray-900 font-display">
                  On-hand warehouse stock available for immediate fulfillment
                </strong>
              </div>
            </div>
            <span className="text-[11px] text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold shadow-2xs">
              Wholesale & Retail selling pricing active
            </span>
          </div>
        )}

        {mode === "maintenance" && (
          <div className="p-3 bg-gradient-to-r from-amber-50 to-rose-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                <Icon name="wrench" size={14} />
              </span>
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-bold block">
                  Equipment Workshop Intake
                </span>
                <strong className="text-gray-900 font-display">
                  Select equipment model to assign repair technician, record parts & labor
                </strong>
              </div>
            </div>
            <span className="text-[11px] text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300 font-semibold shadow-2xs">
              Click any equipment to select
            </span>
          </div>
        )}

        {/* Filter Controls Toolbar */}
        <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b md:border-b-0 border-gray-100">
              {(mode === "maintenance"
                ? (["All", "Under Repair", "Damaged", "Available"] as const)
                : (["All", "Available", "Low Stock", "Under Repair"] as const)
              ).map((tab) => (
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
                  {tab === "Under Repair" && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                      {materials.filter((m) => m.underRepair > 0).length}
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
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md ${
                    viewMode === "table"
                      ? "bg-white text-emerald-900 shadow-2xs"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Table view"
                >
                  <Icon name="grid" size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md ${
                    viewMode === "grid"
                      ? "bg-white text-emerald-900 shadow-2xs"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Card grid view"
                >
                  <Icon name="box" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
            <div className="sm:col-span-6 relative">
              <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, SKU, category, brand, model, or rack location..."
                className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
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

          {/* Quick Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-100">
            {categories.map((cat) => {
              const count =
                cat === "All"
                  ? materials.filter((m) => !m.isArchived).length
                  : materials.filter((m) => m.category === cat && !m.isArchived).length;
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

        {/* Material Items List (Table or Grid) */}
        <div className="max-h-[50vh] overflow-y-auto pr-1">
          {viewMode === "table" ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Material & SKU</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3 text-center">Owned</th>
                      <th className="py-3 px-3 text-center">
                        {mode === "rental" ? "Date Avail" : "Stock Avail"}
                      </th>
                      <th className="py-3 px-3">
                        {mode === "sales"
                          ? "Selling Price"
                          : mode === "billing"
                          ? "Replacement Value"
                          : "Daily Rate"}
                      </th>
                      <th className="py-3 px-3">Condition</th>
                      <th className="py-3 px-4 text-right">Selection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMaterials.map((mat) => {
                      const isSelected = !!tempSelection[mat.id];
                      const selectedQty = tempSelection[mat.id] || 0;
                      const maxLimit = mat.effectiveAvailable;

                      return (
                        <tr
                          key={mat.id}
                          className={`transition-colors ${
                            isSelected ? "bg-emerald-50/40" : "hover:bg-gray-50/50"
                          }`}
                        >
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={mat.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                            />
                            <div>
                              <strong className="text-xs font-bold text-gray-900 block">
                                {mat.name}
                              </strong>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {mat.code}
                                </span>
                                <span className="text-gray-300">·</span>
                                <span className="text-[10px] text-gray-400">{mat.brand}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3 font-medium text-gray-600">{mat.category}</td>

                          <td className="py-3 px-3">
                            <span className="text-gray-900 font-semibold block">{mat.warehouse}</span>
                            <span className="text-[10px] text-gray-400">{mat.storageLocation}</span>
                          </td>

                          <td className="py-3 px-3 text-center font-bold text-gray-700">
                            {mat.totalOwned}
                          </td>

                          <td className="py-3 px-3 text-center">
                            {mat.effectiveAvailable > 0 ? (
                              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                {mat.effectiveAvailable} ready
                              </span>
                            ) : (
                              <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                                0 avail
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 font-bold text-gray-900 font-display">
                            {mode === "sales"
                              ? `$${mat.sellingPrice}`
                              : mode === "billing"
                              ? `$${mat.replacementValue || mat.purchaseCost}`
                              : `$${mat.rentalPriceDaily}/d`}
                          </td>

                          <td className="py-3 px-3">
                            <Badge
                              tone={
                                mat.physicalCondition === "Excellent" || mat.physicalCondition === "New"
                                  ? "green"
                                  : mat.physicalCondition === "Good"
                                  ? "lime"
                                  : mat.physicalCondition === "Fair"
                                  ? "yellow"
                                  : "red"
                              }
                              size="sm"
                            >
                              {mat.physicalCondition}
                            </Badge>
                          </td>

                          <td className="py-3 px-4 text-right">
                            {singleSelection ? (
                              <button
                                type="button"
                                onClick={() => handleSingleSelect(mat)}
                                className="px-3 py-1 text-xs font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors"
                              >
                                Select
                              </button>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 justify-end">
                                {isSelected ? (
                                  <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-lg p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSetQuantity(mat.id, selectedQty - 1, maxLimit)}
                                      className="w-6 h-6 flex items-center justify-center font-bold text-emerald-950 hover:bg-white rounded transition-colors"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      max={maxLimit}
                                      value={selectedQty}
                                      onChange={(e) =>
                                        handleSetQuantity(mat.id, Number(e.target.value), maxLimit)
                                      }
                                      className="w-12 text-center text-xs font-bold bg-transparent text-emerald-950 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleSetQuantity(mat.id, selectedQty + 1, maxLimit)}
                                      className="w-6 h-6 flex items-center justify-center font-bold text-emerald-950 hover:bg-white rounded transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleAdd(mat)}
                                    className="px-3 py-1 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                                  >
                                    + Add
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}

                    {!filteredMaterials.length && (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-gray-400">
                          <Icon name="box" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                          <strong className="block text-gray-700">No equipment matches your filters</strong>
                          <span className="text-xs">Try selecting another category or clearing search terms.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filteredMaterials.map((mat) => {
                const isSelected = !!tempSelection[mat.id];
                const selectedQty = tempSelection[mat.id] || 0;
                const maxLimit = mat.effectiveAvailable;

                return (
                  <div
                    key={mat.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-600 ring-2 ring-emerald-500/20 shadow-md"
                        : "border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="relative h-36 w-full bg-gray-100 overflow-hidden">
                        <img
                          src={mat.imageUrl}
                          alt={mat.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge
                            tone={mat.effectiveAvailable > 0 ? "green" : "red"}
                            size="sm"
                          >
                            {mat.effectiveAvailable} avail
                          </Badge>
                        </div>
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                          {mat.code}
                        </span>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                            {mat.category}
                          </span>
                          <span className="text-xs font-bold text-gray-900 font-display">
                            {mode === "sales"
                              ? `$${mat.sellingPrice}`
                              : mode === "billing"
                              ? `$${mat.replacementValue || mat.purchaseCost}`
                              : `$${mat.rentalPriceDaily}/day`}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{mat.name}</h4>

                        <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
                          <span>{mat.warehouse}</span>
                          <span className="font-mono text-gray-400">{mat.storageLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-gray-50/80 border-t border-gray-100">
                      {singleSelection ? (
                        <button
                          type="button"
                          onClick={() => handleSingleSelect(mat)}
                          className="w-full py-1.5 px-3 text-xs font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Icon name="check" size={12} />
                          <span>Select Equipment</span>
                        </button>
                      ) : isSelected ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center bg-white border border-emerald-300 rounded-lg p-0.5 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleSetQuantity(mat.id, selectedQty - 1, maxLimit)}
                              className="w-6 h-6 flex items-center justify-center font-bold text-emerald-950 hover:bg-emerald-50 rounded"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={maxLimit}
                              value={selectedQty}
                              onChange={(e) =>
                                handleSetQuantity(mat.id, Number(e.target.value), maxLimit)
                              }
                              className="w-12 text-center text-xs font-bold text-emerald-950 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleSetQuantity(mat.id, selectedQty + 1, maxLimit)}
                              className="w-6 h-6 flex items-center justify-center font-bold text-emerald-950 hover:bg-emerald-50 rounded"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSetQuantity(mat.id, 0, maxLimit)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleAdd(mat)}
                          className="w-full py-1.5 px-3 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Icon name="plus" size={12} />
                          <span>Add to Selection</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Cart Bar (for multi-selection modes) */}
        {!singleSelection && (
          <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-950 flex items-center justify-center font-bold text-xs">
                {selectedCount}
              </span>
              <div>
                <strong className="text-xs font-bold text-gray-900 block">
                  {selectedCount} material type{selectedCount === 1 ? "" : "s"} ({totalUnitsSelected} total units)
                </strong>
                <span className="text-[11px] text-gray-500">
                  {mode === "sales"
                    ? `Estimated subtotal: $${estimatedValue.toLocaleString()}`
                    : mode === "billing"
                    ? `Total valuation: $${estimatedValue.toLocaleString()}`
                    : `Daily rate sum: $${estimatedValue.toLocaleString()}/day`}
                </span>
              </div>
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
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
              >
                {mode === "sales"
                  ? "Apply to Sales Order"
                  : mode === "billing"
                  ? "Apply to Billing Record"
                  : "Apply Equipment Selection"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MaterialPickerModal;
