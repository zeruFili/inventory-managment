import React, { useState, useEffect } from "react";
import { Material, MaterialCondition, MaterialOperationalStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialToEdit?: Material | null;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({
  isOpen,
  onClose,
  materialToEdit,
}) => {
  const { addMaterial, updateMaterial, suppliers } = useApp();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Material["category"]>("Seating");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState<Material["unitOfMeasure"]>("pcs");
  const [isIndividuallyTracked, setIsIndividuallyTracked] = useState(false);
  const [warehouse, setWarehouse] = useState("Central Warehouse");
  const [storageLocation, setStorageLocation] = useState("Bay A-01");
  const [purchaseDate, setPurchaseDate] = useState("2024-03-01");
  const [purchaseCost, setPurchaseCost] = useState(45);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || "SUP-01");
  const [warrantyInfo, setWarrantyInfo] = useState("2-year manufacturer structural warranty");
  const [sellingPrice, setSellingPrice] = useState(75);
  const [rentalPriceDaily, setRentalPriceDaily] = useState(8.5);
  const [rentalPriceWeekly, setRentalPriceWeekly] = useState(34);
  const [replacementValue, setReplacementValue] = useState(60);
  const [minimumStock, setMinimumStock] = useState(20);
  const [lowStockThreshold, setLowStockThreshold] = useState(15);
  const [totalOwned, setTotalOwned] = useState(100);
  const [physicallyAvailable, setPhysicallyAvailable] = useState(80);
  const [physicalCondition, setPhysicalCondition] = useState<MaterialCondition>("Excellent");
  const [operationalStatus, setOperationalStatus] = useState<MaterialOperationalStatus>("Available");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1549497538-303791108f95?auto=format&fit=crop&w=500&q=80");

  useEffect(() => {
    if (materialToEdit) {
      setCode(materialToEdit.code);
      setName(materialToEdit.name);
      setDescription(materialToEdit.description);
      setCategory(materialToEdit.category);
      setBrand(materialToEdit.brand);
      setModel(materialToEdit.model);
      setUnitOfMeasure(materialToEdit.unitOfMeasure);
      setIsIndividuallyTracked(materialToEdit.isIndividuallyTracked);
      setWarehouse(materialToEdit.warehouse);
      setStorageLocation(materialToEdit.storageLocation);
      setPurchaseDate(materialToEdit.purchaseDate);
      setPurchaseCost(materialToEdit.purchaseCost);
      setSupplierId(materialToEdit.supplierId);
      setWarrantyInfo(materialToEdit.warrantyInfo);
      setSellingPrice(materialToEdit.sellingPrice);
      setRentalPriceDaily(materialToEdit.rentalPriceDaily);
      setRentalPriceWeekly(materialToEdit.rentalPriceWeekly);
      setReplacementValue(materialToEdit.replacementValue);
      setMinimumStock(materialToEdit.minimumStock);
      setLowStockThreshold(materialToEdit.lowStockThreshold);
      setTotalOwned(materialToEdit.totalOwned);
      setPhysicallyAvailable(materialToEdit.physicallyAvailable);
      setPhysicalCondition(materialToEdit.physicalCondition);
      setOperationalStatus(materialToEdit.operationalStatus);
      setImageUrl(materialToEdit.imageUrl);
    } else {
      setCode(`SKU-${Date.now().toString().slice(-4)}`);
      setName("");
      setDescription("");
      setBrand("ProStage");
      setModel("Standard");
    }
  }, [materialToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === supplierId);

    const payload = {
      code,
      name,
      description,
      category,
      brand,
      model,
      unitOfMeasure,
      isIndividuallyTracked,
      warehouse,
      storageLocation,
      purchaseDate,
      purchaseCost: Number(purchaseCost),
      supplierId,
      supplierName: sup ? sup.companyName : "Supplier",
      warrantyInfo,
      sellingPrice: Number(sellingPrice),
      rentalPriceDaily: Number(rentalPriceDaily),
      rentalPriceWeekly: Number(rentalPriceWeekly),
      replacementValue: Number(replacementValue),
      minimumStock: Number(minimumStock),
      lowStockThreshold: Number(lowStockThreshold),
      totalOwned: Number(totalOwned),
      physicallyAvailable: Number(physicallyAvailable),
      reserved: materialToEdit ? materialToEdit.reserved : 0,
      rentedOut: materialToEdit ? materialToEdit.rentedOut : 0,
      awaitingInspection: materialToEdit ? materialToEdit.awaitingInspection : 0,
      underRepair: materialToEdit ? materialToEdit.underRepair : 0,
      retiredQuantity: materialToEdit ? materialToEdit.retiredQuantity : 0,
      physicalCondition,
      operationalStatus,
      imageUrl,
      isArchived: false,
    };

    if (materialToEdit) {
      updateMaterial(materialToEdit.id, payload);
    } else {
      addMaterial(payload);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={materialToEdit ? `Edit Material: ${materialToEdit.name}` : "Register New Material & Equipment"}
      subtitle="Complete material specifications, storage coordinates, inventory threshold, and rental rates"
      badge="INVENTORY CATALOG"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Core Identifiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Material Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Vintage Banquet Cross Back Chair"
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">SKU / Material Code *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Material["category"])}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Seating">Seating</option>
              <option value="Tables">Tables</option>
              <option value="Lighting">Lighting</option>
              <option value="Audio & Sound">Audio & Sound</option>
              <option value="Visual & Displays">Visual & Displays</option>
              <option value="Structures & Tents">Structures & Tents</option>
              <option value="Staging & Truss">Staging & Truss</option>
              <option value="Power & Climate">Power & Climate</option>
              <option value="Tableware">Tableware</option>
              <option value="Decor & Drapery">Decor & Drapery</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unit of Measure</label>
            <select
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value as Material["unitOfMeasure"])}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="pcs">Pieces (pcs)</option>
              <option value="sets">Sets (sets)</option>
              <option value="meters">Meters (m)</option>
              <option value="pairs">Pairs</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description & Specs</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Material composition, dimensions, load ratings, or event styling notes..."
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        {/* Quantities & Locations */}
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
          <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block mb-3">
            Warehouse Coordinates & Quantities
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Warehouse Branch</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              >
                <option value="Central Warehouse">Central Warehouse</option>
                <option value="East Branch Depot">East Branch Depot</option>
                <option value="North Hub">North Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Storage Location (Bay/Rack)</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Total Owned Quantity</label>
              <input
                type="number"
                min="0"
                value={totalOwned}
                onChange={(e) => setTotalOwned(Number(e.target.value))}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Physically Available</label>
              <input
                type="number"
                min="0"
                value={physicallyAvailable}
                onChange={(e) => setPhysicallyAvailable(Number(e.target.value))}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none font-bold text-emerald-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Low-Stock Alert Level</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Minimum Safety Stock</label>
              <input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Physical Condition</label>
              <select
                value={physicalCondition}
                onChange={(e) => setPhysicalCondition(e.target.value as MaterialCondition)}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none"
              >
                <option value="New">New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Operational Status</label>
              <select
                value={operationalStatus}
                onChange={(e) => setOperationalStatus(e.target.value as MaterialOperationalStatus)}
                className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2 bg-white text-gray-900 outline-none font-semibold text-emerald-800"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Rented">Rented</option>
                <option value="Inspection Hold">Inspection Hold</option>
                <option value="Under Repair">Under Repair</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing, Supplier & Rates */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Daily Rental ($)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={rentalPriceDaily}
              onChange={(e) => setRentalPriceDaily(Number(e.target.value))}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Weekly Rental ($)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={rentalPriceWeekly}
              onChange={(e) => setRentalPriceWeekly(Number(e.target.value))}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Selling Price ($)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-amber-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Replacement Value ($)</label>
            <input
              type="number"
              step="1"
              min="0"
              value={replacementValue}
              onChange={(e) => setReplacementValue(Number(e.target.value))}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
            />
          </div>
        </div>

        {/* Purchase & Supplier */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purchase Unit Cost ($)</label>
            <input
              type="number"
              min="0"
              value={purchaseCost}
              onChange={(e) => setPurchaseCost(Number(e.target.value))}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Image URL & Tracking */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="trackSerial"
              checked={isIndividuallyTracked}
              onChange={(e) => setIsIndividuallyTracked(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm border-gray-300 focus:ring-emerald-500"
            />
            <label htmlFor="trackSerial" className="text-xs font-semibold text-gray-700 cursor-pointer">
              Individually Tracked Items (Serial/Barcode)
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
          >
            {materialToEdit ? "Update Material" : "Save & Register Material"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MaterialModal;
