import React, { useState } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "./Icons";
import Badge from "./Badge";
import MaterialPickerModal, { MaterialPickerMode } from "./MaterialPickerModal";

export interface SelectedItemLine {
  materialId: string;
  quantity: number;
}

export interface MaterialSelectorSectionProps {
  mode: MaterialPickerMode;

  // Title and labels
  title?: string;
  subtitle?: string;
  addButtonLabel?: string;

  // Multi-selection (Rentals, Sales, Billing)
  items?: SelectedItemLine[];
  onItemsChange?: (items: SelectedItemLine[]) => void;

  // Rental date window (for availability checks)
  startDate?: string;
  expectedReturnDate?: string;

  // Single-selection (Maintenance: Equipment under repair)
  singleSelection?: boolean;
  selectedMaterialId?: string;
  onSelectMaterial?: (material: Material) => void;

  // Optional styling or disabling
  disabled?: boolean;
}

export const MaterialSelectorSection: React.FC<MaterialSelectorSectionProps> = ({
  mode,
  title,
  subtitle,
  addButtonLabel,
  items = [],
  onItemsChange,
  startDate,
  expectedReturnDate,
  singleSelection = false,
  selectedMaterialId,
  onSelectMaterial,
  disabled = false,
}) => {
  const { materials, checkMaterialAvailability, currentUser } = useApp();
  const isStockManager = currentUser.role === "stock_manager";
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Default titles and labels per mode
  const sectionTitle =
    title ||
    (mode === "rental"
      ? "Requested Equipment & Materials"
      : mode === "sales"
      ? "Products & Materials for Sale"
      : mode === "billing"
      ? "Billed Materials & Assessment Lines"
      : "Equipment Under Repair");

  const sectionSubtitle =
    subtitle ||
    (mode === "rental"
      ? "Select event materials with live calendar collision validation"
      : mode === "sales"
      ? "Select warehouse inventory or expendables for direct order fulfillment"
      : mode === "billing"
      ? "Add replacement items or billable material lines"
      : "Choose the physical equipment unit assigned to this maintenance work order");

  const btnLabel =
    addButtonLabel ||
    (mode === "sales"
      ? "Add Product"
      : mode === "maintenance"
      ? "Select Equipment"
      : "Add Material");

  // Multi-item quantity helpers
  const handleUpdateQuantity = (index: number, newQty: number) => {
    if (!onItemsChange) return;
    const clamped = Math.max(1, newQty);
    const updated = items.map((item, i) =>
      i === index ? { ...item, quantity: clamped } : item
    );
    onItemsChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (!onItemsChange) return;
    const updated = items.filter((_, i) => i !== index);
    onItemsChange(updated);
  };

  const handleApplyMulti = (newItems: { materialId: string; quantity: number }[]) => {
    if (onItemsChange) {
      onItemsChange(newItems);
    }
  };

  const handleSingleSelect = (mat: Material) => {
    if (onSelectMaterial) {
      onSelectMaterial(mat);
    }
  };

  // Selected material for single selection
  const singleMaterial = singleSelection
    ? materials.find((m) => m.id === selectedMaterialId)
    : null;

  return (
    <div className="space-y-3 pt-2 border-t border-gray-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700 uppercase block">
              {sectionTitle}
            </label>
            {!singleSelection && (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                {items.length} line{items.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <span className="text-[11px] text-gray-500 block">{sectionSubtitle}</span>
        </div>

        {!disabled && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPickerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
            >
              <Icon name="plus" size={13} />
              <span>{btnLabel}</span>
            </button>
          </div>
        )}
      </div>

      {/* SINGLE SELECTION MODE (e.g. Maintenance Equipment under repair) */}
      {singleSelection ? (
        <div>
          {singleMaterial ? (
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs hover:border-gray-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={singleMaterial.imageUrl}
                  alt={singleMaterial.name}
                  className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-gray-900">
                      {singleMaterial.name}
                    </strong>
                    <span className="font-mono text-[10px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {singleMaterial.code}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-1">
                    <span className="font-semibold text-emerald-800">{singleMaterial.category}</span>
                    <span>•</span>
                    <span>{singleMaterial.warehouse}</span>
                    <span>•</span>
                    <span className="font-mono text-gray-400">{singleMaterial.storageLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      tone={
                        singleMaterial.physicalCondition === "Damaged"
                          ? "red"
                          : singleMaterial.physicalCondition === "Fair"
                          ? "yellow"
                          : "green"
                      }
                      size="sm"
                    >
                      Condition: {singleMaterial.physicalCondition}
                    </Badge>
                    {singleMaterial.underRepair > 0 && (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {singleMaterial.underRepair} currently in repair
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shrink-0"
                >
                  <Icon name="refresh" size={13} />
                  <span>Change Equipment</span>
                </button>
              )}
            </div>
          ) : (
            /* Empty state for single selection */
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-2">
                <Icon name="wrench" size={18} />
              </div>
              <p className="text-xs font-bold text-gray-700">No equipment selected yet</p>
              <p className="text-[11px] text-gray-500 mb-3">
                Browse inventory to pick the equipment model undergoing repair or diagnostic overhaul.
              </p>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                >
                  <Icon name="plus" size={13} /> Select Equipment
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* MULTI-SELECTION MODE (Rentals, Sales, Billing) */
        <div>
          {items.length === 0 ? (
            /* Empty state for multi selection */
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto mb-2">
                <Icon name="box" size={20} />
              </div>
              <p className="text-xs font-bold text-gray-700">No items added yet</p>
              <p className="text-[11px] text-gray-500 mb-3">
                Browse the complete inventory catalog to select materials, check stock, and verify details.
              </p>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
                >
                  <Icon name="plus" size={13} /> {btnLabel}
                </button>
              )}
            </div>
          ) : (
            /* Selected items list */
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((line, idx) => {
                const mat = materials.find((m) => m.id === line.materialId);
                if (!mat) return null;

                // Mode-specific calculations
                let isAvailable = true;
                let maxAvailable = mat.totalOwned;
                let unitPriceLabel = "";
                let lineTotal = 0;

                if (mode === "rental") {
                  if (startDate && expectedReturnDate) {
                    const check = checkMaterialAvailability(
                      mat.id,
                      startDate,
                      expectedReturnDate,
                      line.quantity
                    );
                    isAvailable = check.available;
                    maxAvailable = check.maxAvailable;
                  }
                  unitPriceLabel = `$${mat.rentalPriceDaily}/day`;
                  lineTotal = mat.rentalPriceDaily * line.quantity;
                } else if (mode === "sales") {
                  isAvailable = mat.physicallyAvailable >= line.quantity;
                  maxAvailable = mat.physicallyAvailable;
                  unitPriceLabel = `$${mat.sellingPrice} sell`;
                  lineTotal = mat.sellingPrice * line.quantity;
                } else {
                  // Billing
                  const repCost = mat.replacementValue || mat.purchaseCost;
                  unitPriceLabel = `$${repCost} value`;
                  lineTotal = repCost * line.quantity;
                }

                return (
                  <div
                    key={`${line.materialId}-${idx}`}
                    className={`p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                      isAvailable
                        ? "bg-white border-gray-200 hover:border-gray-300 shadow-2xs"
                        : "bg-rose-50/80 border-rose-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={mat.imageUrl}
                        alt={mat.name}
                        className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 truncate">{mat.name}</span>
                          <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded shrink-0">
                            {mat.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="text-emerald-800 font-semibold">{mat.category}</span>
                          {!isStockManager && (
                            <>
                              <span>•</span>
                              <span>{unitPriceLabel}</span>
                            </>
                          )}
                          {mat.warehouse && (
                            <>
                              <span>•</span>
                              <span className="text-gray-400 truncate">{mat.warehouse}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Availability status badge */}
                      {!isAvailable && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          Only {maxAvailable} avail
                        </span>
                      )}

                      {/* Quantity stepper */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          type="button"
                          disabled={disabled || line.quantity <= 1}
                          onClick={() => handleUpdateQuantity(idx, line.quantity - 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-700 font-bold transition-colors disabled:opacity-30"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          disabled={disabled}
                          min="1"
                          max={maxAvailable > 0 ? maxAvailable : 9999}
                          value={line.quantity}
                          onChange={(e) => handleUpdateQuantity(idx, Number(e.target.value))}
                          className="w-12 text-center text-xs font-bold bg-white py-1 outline-none text-gray-900"
                        />
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={() => handleUpdateQuantity(idx, line.quantity + 1)}
                          className="px-2 py-1 hover:bg-gray-200 text-gray-700 font-bold transition-colors disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Subtotal */}
                      {!isStockManager && (
                        <div className="w-20 text-right">
                          <span className="font-bold text-gray-900 font-display">
                            ${lineTotal.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Remove button */}
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Icon name="close" size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Embedded MaterialPickerModal */}
      <MaterialPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        mode={mode}
        startDate={startDate}
        expectedReturnDate={expectedReturnDate}
        selectedItems={items}
        onApplySelection={handleApplyMulti}
        singleSelection={singleSelection}
        selectedMaterialId={selectedMaterialId}
        onSelectMaterial={handleSingleSelect}
        title={
          singleSelection
            ? "Choose Equipment for Repair"
            : mode === "sales"
            ? "Add Products to Sales Order"
            : mode === "billing"
            ? "Add Materials to Billing Record"
            : "Add Equipment to Reservation"
        }
      />
    </div>
  );
};

export default MaterialSelectorSection;
