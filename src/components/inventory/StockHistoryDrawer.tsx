import React from "react";
import { Material } from "../../types";
import { useApp } from "../../context/AppContext";
import Drawer from "../common/Drawer";
import Badge from "../common/Badge";
import Icon from "../common/Icons";

interface StockHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export const StockHistoryDrawer: React.FC<StockHistoryDrawerProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const { stockMovements } = useApp();

  if (!material) return null;

  const movements = stockMovements.filter((m) => m.materialId === material.id);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={material.name}
      subtitle={`Code: ${material.code} · ${material.category}`}
      badge="STOCK MOVEMENT AUDIT TRAIL"
      width="xl"
    >
      <div className="space-y-6">
        {/* Material Summary Card */}
        <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
          <img
            src={material.imageUrl}
            alt=""
            className="w-16 h-16 rounded-xl object-cover border border-emerald-200/80 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold text-gray-900">{material.name}</strong>
              <Badge tone={material.operationalStatus === "Available" ? "green" : "yellow"} size="sm">
                {material.operationalStatus}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Location: {material.warehouse} · {material.storageLocation}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
              <span className="text-gray-900">Total: {material.totalOwned}</span>
              <span className="text-emerald-700">Available: {material.physicallyAvailable}</span>
              <span className="text-amber-700">Rented: {material.rentedOut}</span>
              <span className="text-rose-700">Repair: {material.underRepair}</span>
            </div>
          </div>
        </div>

        {/* Movements Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Historical Transactions</h3>
            <span className="text-xs text-gray-400 font-medium">{movements.length} logged events</span>
          </div>

          <div className="relative border-l-2 border-emerald-200 ml-3 space-y-6 pl-5">
            {movements.map((mov) => (
              <div key={mov.id} className="relative group">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <Icon name="refresh" size={13} className="text-emerald-700" />
                      {mov.movementType} ({mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity} {material.unitOfMeasure})
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                      Ref: {mov.referenceId}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-600 mt-2">
                    <span>
                      From: <strong className="text-gray-800">{mov.fromLocation || "Standard"}</strong>
                    </span>
                    <span>
                      To: <strong className="text-gray-800">{mov.toLocation || material.warehouse}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1.5 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                    "{mov.notes}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-100">
                    <span>
                      By {mov.performedBy} ({mov.userRole.replace("_", " ").toUpperCase()})
                    </span>
                    <span>{mov.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {!movements.length && (
              <p className="text-xs text-gray-400 italic">No manual movements logged yet for this material.</p>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default StockHistoryDrawer;
