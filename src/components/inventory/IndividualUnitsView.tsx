import React, { useState, useMemo } from "react";
import {
  Material,
  IndividuallyTrackedItem,
  MaterialCondition,
  MaterialOperationalStatus,
} from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import Modal from "../common/Modal";
import { getIndividualItemsForModel } from "../../utils/inventoryUtils";

interface IndividualUnitsViewProps {
  material: Material;
  onBack: () => void;
  onOpenGroupOverview: () => void;
}

export const IndividualUnitsView: React.FC<IndividualUnitsViewProps> = ({
  material,
  onBack,
  onOpenGroupOverview,
}) => {
  const { rentals, updateIndividualItem, can, showToast } = useApp();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [conditionFilter, setConditionFilter] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Edit Unit Modal state
  const [editingItem, setEditingItem] = useState<IndividuallyTrackedItem | null>(null);
  const [editCondition, setEditCondition] = useState<MaterialCondition>("Good");
  const [editStatus, setEditStatus] = useState<MaterialOperationalStatus>("Available");
  const [editLocation, setEditLocation] = useState("");
  const [editNotes, setEditNotes] = useState("");

  // Retrieve or generate the exact list of individual units
  const items = useMemo(() => {
    return getIndividualItemsForModel(material, rentals);
  }, [material, rentals]);

  // Filtered individual items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (statusFilter !== "All" && item.operationalStatus !== statusFilter) return false;
      if (conditionFilter !== "All" && item.condition !== conditionFilter) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        item.serialNumber.toLowerCase().includes(q) ||
        (item.unitTag && item.unitTag.toLowerCase().includes(q)) ||
        item.barcode.toLowerCase().includes(q) ||
        (item.currentLocation && item.currentLocation.toLowerCase().includes(q)) ||
        (item.currentCustomerName && item.currentCustomerName.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    });
  }, [items, statusFilter, conditionFilter, search]);

  const handleOpenEdit = (item: IndividuallyTrackedItem) => {
    setEditingItem(item);
    setEditCondition(item.condition);
    setEditStatus(item.operationalStatus);
    setEditLocation(item.currentLocation || "");
    setEditNotes(item.notes || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateIndividualItem(material.id, editingItem.serialNumber, {
      condition: editCondition,
      operationalStatus: editStatus,
      currentLocation: editLocation,
      notes: editNotes,
      lastInspectionDate: new Date().toISOString().slice(0, 10),
    });

    setEditingItem(null);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${label} (${text}) to clipboard.`);
  };

  const getConditionTone = (cond: MaterialCondition): "green" | "lime" | "yellow" | "amber" | "red" => {
    switch (cond) {
      case "New":
        return "green";
      case "Excellent":
        return "green";
      case "Good":
        return "lime";
      case "Fair":
        return "yellow";
      case "Damaged":
        return "amber";
      case "Beyond Repair":
        return "red";
      default:
        return "lime";
    }
  };

  const getStatusBadge = (status: MaterialOperationalStatus) => {
    switch (status) {
      case "Available":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Available
          </span>
        );
      case "Rented":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Rented Out
          </span>
        );
      case "Under Repair":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            In Repair
          </span>
        );
      case "Inspection Hold":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Inspection
          </span>
        );
      case "Reserved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Reserved
          </span>
        );
      case "Retired":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Retired
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-emerald-800 font-medium transition-colors flex items-center gap-1"
        >
          <Icon name="box" size={13} />
          <span>Categories</span>
        </button>
        <span className="text-gray-300">/</span>
        <button
          type="button"
          onClick={onBack}
          className="text-gray-600 hover:text-emerald-800 font-medium transition-colors"
        >
          {material.category}
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
          {material.name} (All Units)
        </span>
      </div>

      {/* Model Overview Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 shadow-2xs">
              <img
                src={material.imageUrl}
                alt={material.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black/70 text-white font-mono text-[9px] rounded">
                {items.length} units
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  {material.category}
                </span>
                <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  SKU: {material.code}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  Brand: {material.brand}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
                {material.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 max-w-2xl line-clamp-1">
                {material.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs"
            >
              <Icon name="arrowLeft" size={14} />
              Back to Models
            </button>
            <button
              type="button"
              onClick={onOpenGroupOverview}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors shadow-xs"
              title="Open Group Information & Analytics"
            >
              <Icon name="info" size={14} />
              <span>Group Information & Analytics</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-gray-100">
          <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
              Total Inventory
            </span>
            <span className="text-xl font-bold text-gray-900 mt-0.5 block">
              {material.totalOwned} <span className="text-xs font-normal text-gray-500">units</span>
            </span>
          </div>

          <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Physically Available
            </span>
            <span className="text-xl font-bold text-emerald-800 mt-0.5 block">
              {material.physicallyAvailable} <span className="text-xs font-normal text-emerald-700">ready</span>
            </span>
          </div>

          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              Currently Rented
            </span>
            <span className="text-xl font-bold text-amber-900 mt-0.5 block">
              {material.rentedOut} <span className="text-xs font-normal text-amber-700">deployed</span>
            </span>
          </div>

          <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
              Under Repair
            </span>
            <span className="text-xl font-bold text-rose-700 mt-0.5 block">
              {material.underRepair} <span className="text-xs font-normal text-rose-600">in shop</span>
            </span>
          </div>

          <div className="bg-emerald-950 p-3 rounded-xl text-center text-white col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
              Daily Rental Rate
            </span>
            <span className="text-xl font-bold text-white mt-0.5 block font-display">
              ${material.rentalPriceDaily} <span className="text-xs font-normal text-emerald-300">/ day</span>
            </span>
          </div>
        </div>
      </div>

      {/* Units Filter & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 font-display flex items-center gap-2">
              <span>All Tracked Physical Units</span>
              <span className="text-xs font-normal text-gray-500">
                ({filteredItems.length} of {items.length} units listed)
              </span>
            </h2>
            <p className="text-xs text-gray-500">
              Each individual physical unit possesses its own serial number, barcode, location, inspection date, and lifetime rental history.
            </p>
          </div>

          {/* View Mode Toggle */}
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
                title="Card grid view"
              >
                <Icon name="box" size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
          <div className="sm:col-span-6 relative">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by serial #, barcode, location, client, or notes..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 outline-none"
            >
              <option value="All">All Operational Statuses</option>
              <option value="Available">Available</option>
              <option value="Rented">Rented Out</option>
              <option value="Under Repair">Under Repair</option>
              <option value="Inspection Hold">Inspection Hold</option>
              <option value="Reserved">Reserved</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 outline-none"
            >
              <option value="All">All Physical Conditions</option>
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
              <option value="Beyond Repair">Beyond Repair</option>
            </select>
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
                  <th className="py-3 px-4">Unit Tag & Serial #</th>
                  <th className="py-3 px-3">Barcode</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Current Location</th>
                  <th className="py-3 px-3 text-center">Rental History</th>
                  <th className="py-3 px-3">Last Inspected</th>
                  <th className="py-3 px-3">Notes</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                  <tr key={item.serialNumber} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0 border border-emerald-200">
                          #{item.unitTag?.split("#")[1] || item.serialNumber.slice(-3)}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-gray-900 block font-mono">
                            {item.unitTag || item.serialNumber}
                          </strong>
                          <span className="text-[10px] text-gray-400 font-mono">
                            SN: {item.serialNumber}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.barcode, "Barcode")}
                        className="inline-flex items-center gap-1 font-mono text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-0.5 rounded transition-colors"
                        title="Click to copy barcode"
                      >
                        <span>{item.barcode}</span>
                        <Icon name="copy" size={11} className="text-gray-400" />
                      </button>
                    </td>

                    <td className="py-3 px-3">{getStatusBadge(item.operationalStatus)}</td>

                    <td className="py-3 px-3">
                      <Badge tone={getConditionTone(item.condition)} size="sm">
                        {item.condition}
                      </Badge>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-gray-900 font-medium">
                        {item.currentLocation}
                      </div>
                      {item.operationalStatus === "Rented" && item.currentCustomerName && (
                        <span className="text-[10px] text-amber-800 font-semibold block mt-0.5">
                          Client: {item.currentCustomerName}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="font-bold text-gray-800">
                        {item.rentalCount || 0} <span className="text-[10px] font-normal text-gray-400">times</span>
                      </div>
                      {item.lastRentedDate && (
                        <span className="text-[10px] text-gray-400 block font-mono">
                          Last: {item.lastRentedDate}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-gray-500 text-[11px]">
                      {item.lastInspectionDate || "—"}
                    </td>

                    <td className="py-3 px-3 text-gray-600 max-w-[180px] truncate" title={item.notes}>
                      {item.notes || "—"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {can("manage_inventory") ? (
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                          title="Update Condition & Details"
                        >
                          <Icon name="wrench" size={12} />
                          <span>Update</span>
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}

                {!filteredItems.length && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-gray-400">
                      <Icon name="box" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                      <strong className="block text-gray-700">No physical units match your filters</strong>
                      <span className="text-xs">
                        Try resetting the status or condition filters to see all units.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Visual Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.serialNumber}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                      #{item.unitTag?.split("#")[1] || item.serialNumber.slice(-3)}
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-gray-900 block font-mono">
                        {item.unitTag || item.serialNumber}
                      </strong>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {item.serialNumber}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(item.operationalStatus)}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                  <span className="text-gray-400 text-[11px]">Condition:</span>
                  <Badge tone={getConditionTone(item.condition)} size="sm">
                    {item.condition}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">Barcode:</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.barcode, "Barcode")}
                    className="font-mono text-[11px] bg-gray-50 hover:bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 flex items-center gap-1"
                  >
                    <span>{item.barcode}</span>
                    <Icon name="copy" size={10} className="text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">Location:</span>
                  <span className="font-semibold text-gray-800 text-[11px] text-right truncate max-w-[140px]">
                    {item.currentLocation}
                  </span>
                </div>

                {item.operationalStatus === "Rented" && item.currentCustomerName && (
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-200/60 text-xs">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Active Rental Client</span>
                    <span className="font-semibold text-amber-950 text-xs block truncate">
                      {item.currentCustomerName}
                    </span>
                  </div>
                )}

                {item.notes && (
                  <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-gray-400 font-mono">
                  Rented {item.rentalCount || 0} times
                </span>
                {can("manage_inventory") && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                  >
                    <Icon name="wrench" size={11} />
                    <span>Update</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Edit Unit Modal */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title={`Update Unit: ${editingItem.unitTag || editingItem.serialNumber}`}
          subtitle={`Model: ${material.name} (SKU: ${material.code})`}
          badge="Physical Unit Management"
          maxWidth="lg"
        >
          <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  disabled
                  value={editingItem.serialNumber}
                  className="w-full text-xs font-mono px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Barcode
                </label>
                <input
                  type="text"
                  disabled
                  value={editingItem.barcode}
                  className="w-full text-xs font-mono px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Physical Condition
                </label>
                <select
                  value={editCondition}
                  onChange={(e) => setEditCondition(e.target.value as MaterialCondition)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Beyond Repair">Beyond Repair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Operational Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as MaterialOperationalStatus)}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Rented">Rented Out</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Inspection Hold">Inspection Hold</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Warehouse / Rack Location
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="e.g. Central Warehouse - Bay A-12, Shelf 3"
                className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Inspection & Maintenance Notes
              </label>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notes on recent inspections, hardware scratches, leg tightness, or client feedback..."
                className="w-full text-xs font-medium px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg shadow-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default IndividualUnitsView;
