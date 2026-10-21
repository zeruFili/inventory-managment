import React, { useState, useMemo } from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import MaterialModal from "./MaterialModal";
import CategoryBrowser from "./CategoryBrowser";
import ModelGroupOverviewModal from "./ModelGroupOverviewModal";
import IndividualUnitsView from "./IndividualUnitsView";

export const InventoryView: React.FC = () => {
  const { materials, archiveMaterial, can } = useApp();

  // Navigation hierarchy state: Level 1 (categories) -> Level 2 (models) -> Level 3 (units)
  const [viewLevel, setViewLevel] = useState<"categories" | "models" | "units">("categories");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedModel, setSelectedModel] = useState<Material | null>(null);
  const [overviewModel, setOverviewModel] = useState<Material | null>(null);

  // Filters and search for models view
  const [search, setSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("All");
  const [activeTab, setActiveTab] = useState<"All" | "Available" | "Low Stock" | "Under Repair" | "Archived">("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [materialToEdit, setMaterialToEdit] = useState<Material | null>(null);

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
  const warehouses = ["All", "Central Warehouse", "East Branch Depot", "North Hub"];

  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      // Tab filter
      if (activeTab === "Available" && item.physicallyAvailable <= 0) return false;
      if (activeTab === "Low Stock" && item.physicallyAvailable > item.lowStockThreshold) return false;
      if (activeTab === "Under Repair" && item.underRepair <= 0) return false;
      if (activeTab === "Archived" && !item.isArchived) return false;
      if (activeTab !== "Archived" && item.isArchived) return false;

      // Dropdown filters
      if (selectedCategory !== "All" && item.category !== selectedCategory) return false;
      if (selectedWarehouse !== "All" && item.warehouse !== selectedWarehouse) return false;

      // Search
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q)
      );
    });
  }, [materials, activeTab, selectedCategory, selectedWarehouse, search]);

  const handleEdit = (mat: Material) => {
    setMaterialToEdit(mat);
    setIsAddEditOpen(true);
  };

  const handleAdd = () => {
    setMaterialToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleArchive = (mat: Material) => {
    if (confirm(`Archive material "${mat.name}"? Transactions and historical audit logs will be preserved.`)) {
      archiveMaterial(mat.id);
    }
  };

  const handleSelectCategoryFromBrowser = (category: string) => {
    setSelectedCategory(category);
    setViewLevel("models");
  };

  const handleOpenUnitsView = (mat: Material) => {
    setSelectedModel(mat);
    setViewLevel("units");
  };

  // If in individual units view (Level 3), render IndividualUnitsView
  if (viewLevel === "units" && selectedModel) {
    return (
      <div className="space-y-6">
        <IndividualUnitsView
          material={selectedModel}
          onBack={() => {
            setViewLevel("models");
          }}
          onOpenGroupOverview={() => {
            setOverviewModel(selectedModel);
          }}
        />

        {/* Global Group Overview Modal */}
        <ModelGroupOverviewModal
          isOpen={!!overviewModel}
          onClose={() => setOverviewModel(null)}
          material={overviewModel}
          onViewIndividualItems={() => {
            if (overviewModel) {
              setSelectedModel(overviewModel);
              setViewLevel("units");
            }
            setOverviewModel(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              STOCK CONTROL & MATERIAL REGISTRY
            </span>
            {viewLevel === "models" && selectedCategory !== "All" && (
              <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                Category: {selectedCategory}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            Materials & Equipment Inventory
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Browse by event category, inspect specific equipment models, view group metrics, and manage physical individual units.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Level Switcher buttons */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setViewLevel("categories");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewLevel === "categories"
                  ? "bg-white text-emerald-950 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon name="grid" size={13} />
              <span>Browse Categories</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setViewLevel("models");
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewLevel === "models"
                  ? "bg-white text-emerald-950 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon name="box" size={13} />
              <span>All Models Catalog</span>
            </button>
          </div>

          {can("manage_inventory") && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              Add Material
            </button>
          )}
        </div>
      </div>

      {/* LEVEL 1: Category Browser */}
      {viewLevel === "categories" ? (
        <div className="space-y-6">
          <CategoryBrowser
            categories={categories}
            materials={materials}
            onSelectCategory={handleSelectCategoryFromBrowser}
          />
        </div>
      ) : (
        /* LEVEL 2: Models List for Selected Category (or All) */
        <div className="space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-2xs text-xs gap-2">
            <div className="flex items-center gap-2 text-gray-500 flex-wrap">
              <button
                onClick={() => setViewLevel("categories")}
                className="text-gray-600 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                <Icon name="grid" size={13} />
                <span>Categories</span>
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {selectedCategory === "All" ? "All Categories" : selectedCategory}
              </span>
              <span className="text-gray-400">
                ({filteredMaterials.length} model types)
              </span>
            </div>

            <button
              onClick={() => setViewLevel("categories")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline self-start sm:self-auto"
            >
              <span>Switch Category</span>
              <Icon name="chevron" size={12} />
            </button>
          </div>

          {/* Tabs & Controls */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b md:border-b-0 border-gray-100">
                {(["All", "Available", "Low Stock", "Under Repair", "Archived"] as const).map((tab) => (
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
                    {tab === "Low Stock" && (
                      <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-emerald-950 rounded-full text-[10px]">
                        {materials.filter((m) => m.physicallyAvailable <= m.lowStockThreshold && !m.isArchived).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md ${
                      viewMode === "table" ? "bg-white text-emerald-900 shadow-2xs" : "text-gray-400 hover:text-gray-700"
                    }`}
                    title="Table view"
                  >
                    <Icon name="grid" size={14} />
                  </button>
                  <button
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

            {/* Search & Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-gray-100">
              <div className="sm:col-span-6 relative">
                <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search model by name, SKU code, brand, or storage rack..."
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

            {/* Quick Category Selection Chips with Live Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-gray-100">
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

          {/* Main Content: Table or Grid of Models */}
          {viewMode === "table" ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[980px]">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Model & SKU</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Location</th>
                      <th className="py-3 px-3 text-center">Total Inventory</th>
                      <th className="py-3 px-3 text-center">Available</th>
                      <th className="py-3 px-3 text-center">Reserved</th>
                      <th className="py-3 px-3 text-center">Rented</th>
                      <th className="py-3 px-3 text-center">In Repair</th>
                      <th className="py-3 px-3">Daily Rate</th>
                      <th className="py-3 px-3">Condition</th>
                      <th className="py-3 px-4 text-right">Model Group & Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredMaterials.map((mat) => (
                      <tr key={mat.id} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <img
                            src={mat.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => handleOpenUnitsView(mat)}
                            title="Click to view all individual units"
                          />
                          <div>
                            <button
                              type="button"
                              onClick={() => handleOpenUnitsView(mat)}
                              className="text-xs font-bold text-gray-900 block text-left hover:text-emerald-800 hover:underline cursor-pointer"
                              title="Click to view all individual units"
                            >
                              {mat.name}
                            </button>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-500 font-mono">{mat.code}</span>
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

                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenUnitsView(mat)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 hover:bg-emerald-100 text-gray-900 hover:text-emerald-950 font-bold font-mono transition-colors"
                            title="Click to browse all individual units"
                          >
                            <span>{mat.totalOwned} units</span>
                            <Icon name="chevron" size={10} className="text-gray-400" />
                          </button>
                        </td>

                        <td className="py-3 px-3 text-center font-extrabold text-emerald-700 bg-emerald-50/40">
                          {mat.physicallyAvailable}
                        </td>

                        <td className="py-3 px-3 text-center text-amber-700 font-semibold">{mat.reserved}</td>

                        <td className="py-3 px-3 text-center text-gray-600">{mat.rentedOut}</td>

                        <td className="py-3 px-3 text-center">
                          {mat.underRepair > 0 ? (
                            <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                              {mat.underRepair}
                            </span>
                          ) : (
                            <span className="text-gray-300">0</span>
                          )}
                        </td>

                        <td className="py-3 px-3 font-bold text-gray-900">${mat.rentalPriceDaily}</td>

                        <td className="py-3 px-3">
                          <Badge
                            tone={
                              mat.physicalCondition === "Excellent"
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
                          <div className="inline-flex items-center gap-1.5">
                            {/* Prominent Information Button for Model Group Overview */}
                            <button
                              type="button"
                              onClick={() => setOverviewModel(mat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors"
                              title="Information: View Model Group Overview, Condition Breakdown, Rental History & Financials"
                            >
                              <Icon name="info" size={13} />
                              <span>Info</span>
                            </button>

                            {/* View Individual Units Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenUnitsView(mat)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors"
                              title={`View all ${mat.totalOwned} individual units of this model`}
                            >
                              <Icon name="box" size={13} />
                              <span>Units</span>
                            </button>

                            {can("manage_inventory") && (
                              <>
                                <button
                                  onClick={() => handleEdit(mat)}
                                  className="p-1.5 text-gray-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                                  title="Edit Material"
                                >
                                  <Icon name="wrench" size={14} />
                                </button>
                                {!mat.isArchived && (
                                  <button
                                    onClick={() => handleArchive(mat)}
                                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                    title="Archive"
                                  >
                                    <Icon name="close" size={14} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!filteredMaterials.length && (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-gray-400">
                          <Icon name="box" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
                          <strong className="block text-gray-700">No materials match your filters</strong>
                          <span className="text-xs">Try selecting another category or clearing search terms.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Visual Card Grid View of Models */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                      <img
                        src={mat.imageUrl}
                        alt={mat.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 cursor-pointer"
                        onClick={() => handleOpenUnitsView(mat)}
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <Badge
                          tone={
                            mat.physicallyAvailable <= mat.lowStockThreshold
                              ? "yellow"
                              : mat.underRepair > 0
                              ? "amber"
                              : "green"
                          }
                          size="sm"
                        >
                          {mat.physicallyAvailable} Avail
                        </Badge>
                      </div>
                      <span className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        {mat.code}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          {mat.category}
                        </span>
                        <span className="text-xs font-bold text-gray-900 font-display">${mat.rentalPriceDaily}/day</span>
                      </div>

                      <h3
                        onClick={() => handleOpenUnitsView(mat)}
                        className="text-sm font-bold text-gray-900 line-clamp-1 hover:text-emerald-800 cursor-pointer"
                      >
                        {mat.name}
                      </h3>

                      <p className="text-xs text-gray-500 line-clamp-2">{mat.description}</p>

                      <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-1 text-center text-xs">
                        <button
                          type="button"
                          onClick={() => handleOpenUnitsView(mat)}
                          className="p-1 bg-gray-50 hover:bg-emerald-50 rounded transition-colors text-left sm:text-center"
                          title="Click to view individual units"
                        >
                          <span className="text-[10px] text-gray-400 block">Total</span>
                          <strong className="text-gray-900">{mat.totalOwned}</strong>
                        </button>
                        <div className="p-1 bg-emerald-50 rounded">
                          <span className="text-[10px] text-emerald-700 block">Avail</span>
                          <strong className="text-emerald-900">{mat.physicallyAvailable}</strong>
                        </div>
                        <div className="p-1 bg-amber-50 rounded">
                          <span className="text-[10px] text-amber-700 block">Rented</span>
                          <strong className="text-amber-900">{mat.rentedOut}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {/* Prominent Information Button */}
                      <button
                        type="button"
                        onClick={() => setOverviewModel(mat)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-950 bg-amber-300 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors"
                        title="Model Group Information"
                      >
                        <Icon name="info" size={13} />
                        <span>Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenUnitsView(mat)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-900 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Individual Units"
                      >
                        <Icon name="box" size={12} />
                        <span>Units</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {can("manage_inventory") && (
                        <button
                          onClick={() => handleEdit(mat)}
                          className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-white rounded transition-colors"
                          title="Edit"
                        >
                          <Icon name="wrench" size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals & Drawers */}
      <MaterialModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        materialToEdit={materialToEdit}
      />

      {/* Model Group Information & Analytics Modal */}
      <ModelGroupOverviewModal
        isOpen={!!overviewModel}
        onClose={() => setOverviewModel(null)}
        material={overviewModel}
        onViewIndividualItems={() => {
          if (overviewModel) {
            setSelectedModel(overviewModel);
            setViewLevel("units");
          }
          setOverviewModel(null);
        }}
      />
    </div>
  );
};

export default InventoryView;
