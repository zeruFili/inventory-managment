import React, { useState, useMemo } from "react";
import { DeliveryTask, DeliveryStatus } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import DeliveryTaskModal from "./DeliveryTaskModal";
import ProofOfDeliveryModal from "./ProofOfDeliveryModal";

export const LogisticsView: React.FC = () => {
  const { deliveryTasks, updateDeliveryTaskStatus, currentUser, can } = useApp();

  const [activeTab, setActiveTab] = useState<string>("All");
  const [search, setSearch] = useState("");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForPOD, setTaskForPOD] = useState<DeliveryTask | null>(null);

  const isDriverOrCourier = currentUser.role === "driver" || currentUser.role === "courier";

  const filteredTasks = useMemo(() => {
    return deliveryTasks.filter((t) => {
      // If driver/courier, only show tasks assigned to them!
      if (isDriverOrCourier && t.assignedPersonId !== currentUser.id) {
        return false;
      }

      if (activeTab === "In Transit" && t.status !== "In Transit") return false;
      if (activeTab === "Assigned" && t.status !== "Assigned") return false;
      if (activeTab === "Completed" && t.status !== "Completed") return false;
      if (activeTab === "Failed / Disputed" && t.status !== "Delivery Failed") return false;

      const q = search.toLowerCase();
      return (
        t.taskNumber.toLowerCase().includes(q) ||
        t.customerName.toLowerCase().includes(q) ||
        t.deliveryAddress.toLowerCase().includes(q) ||
        t.rentalReference.toLowerCase().includes(q) ||
        t.assignedPersonName.toLowerCase().includes(q)
      );
    });
  }, [deliveryTasks, activeTab, search, isDriverOrCourier, currentUser]);

  const handleUpdateStatus = (taskId: string, newStatus: DeliveryStatus) => {
    if (newStatus === "Completed") {
      const task = deliveryTasks.find((t) => t.id === taskId);
      setTaskForPOD(task || null);
    } else {
      updateDeliveryTaskStatus(taskId, newStatus);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            {isDriverOrCourier ? "DRIVER & COURIER ACTIVE ROUTE PORTAL" : "TRANSPORTATION & FLEET MANAGEMENT"}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            {isDriverOrCourier ? `My Assigned Routes: ${currentUser.name}` : "Delivery, Collection & Logistics"}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isDriverOrCourier
              ? "Driver route portal: view customer location, transport manifests, and submit proof of delivery."
              : "Coordinate dispatches, delivery drivers, couriers, vehicle tracking, and proof of collection."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isDriverOrCourier && can("manage_rentals") && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-950 rounded-lg hover:bg-emerald-900 transition-colors shadow-xs"
            >
              <Icon name="plus" size={14} />
              Schedule Transport Task
            </button>
          )}
        </div>
      </div>

      {/* Role Protection Banner for Driver/Courier */}
      {isDriverOrCourier && (
        <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2.5">
            <Icon name="truck" size={16} className="text-emerald-700" />
            <span>
              <strong>Driver Access Mode:</strong> Financial details, costs, and inventory values are hidden for your security clearance.
            </span>
          </div>
          <span className="text-[10px] font-bold bg-emerald-200/60 text-emerald-950 px-2 py-0.5 rounded">
            Vehicle: VAN-04
          </span>
        </div>
      )}

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {["All", "Assigned", "In Transit", "Completed", "Failed / Disputed"].map((tab) => (
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
              </button>
            ))}
          </div>

          <div className="relative sm:w-80">
            <Icon name="search" size={15} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, address, or task number..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Task Cards & Manifests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className={`bg-white rounded-2xl border p-5 shadow-2xs space-y-4 flex flex-col justify-between transition-all ${
              task.status === "Delivery Failed" ? "border-rose-300 bg-rose-50/20" : "border-gray-200"
            }`}
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      task.type === "Delivery"
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                        : "bg-amber-50 text-amber-800 border border-amber-200/60"
                    }`}
                  >
                    <Icon name={task.type === "Delivery" ? "truck" : "package"} size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-gray-900">{task.taskNumber}</strong>
                      <Badge
                        tone={
                          task.status === "Completed"
                            ? "green"
                            : task.status === "In Transit"
                            ? "yellow"
                            : task.status === "Delivery Failed"
                            ? "red"
                            : "gray"
                        }
                        size="sm"
                      >
                        {task.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">Ref: {task.rentalReference}</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-gray-800 bg-gray-50 px-2 py-1 rounded-md border border-gray-200/80">
                  {task.scheduledDateTime.replace("T", " ")}
                </span>
              </div>

              {/* Customer & Location */}
              <div className="pt-3 space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Customer / Destination</span>
                  <strong className="text-gray-900 font-bold">{task.customerName}</strong>
                  <p className="text-gray-600 mt-0.5">{task.deliveryAddress}</p>
                  <span className="text-[11px] text-gray-500 font-mono">{task.customerPhone}</span>
                </div>

                {/* Assigned Vehicle & Driver */}
                <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Vehicle</span>
                    <strong className="text-gray-900">{task.vehicleInfo}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Assigned Carrier</span>
                    <strong className="text-emerald-950 font-bold">{task.assignedPersonName}</strong>
                  </div>
                </div>

                {/* Equipment Cargo Manifest */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Cargo Manifest ({task.materials.reduce((acc, m) => acc + m.quantity, 0)} Items)
                  </span>
                  <div className="space-y-1 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100">
                    {task.materials.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-700">
                        <span>{m.materialName}</span>
                        <strong className="font-bold text-gray-900">{m.quantity} units</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof of Delivery record if completed */}
                {task.proofOfDelivery && (
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1">
                        <Icon name="check" size={13} className="text-emerald-700" /> Proof of Handover
                      </span>
                      <span className="text-[10px] text-emerald-700">{task.proofOfDelivery.signatureTimestamp}</span>
                    </div>
                    <p className="text-[11px]">Recipient: <strong>{task.proofOfDelivery.recipientName}</strong></p>
                    <p className="text-[11px] text-emerald-800 italic">"{task.proofOfDelivery.notes}"</p>
                  </div>
                )}

                {task.delayReason && (
                  <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-950">
                    <strong className="block text-[11px] text-rose-800 font-bold">Delay / Discrepancy:</strong>
                    <p className="text-[11px] text-rose-700 mt-0.5">{task.delayReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status Update Actions */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-gray-400">Task ID: {task.id}</span>
              <div className="flex items-center gap-2">
                {task.status === "Assigned" && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, "In Transit")}
                    className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                  >
                    Mark In Transit
                  </button>
                )}

                {task.status === "In Transit" && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, "Completed")}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-950 hover:bg-emerald-900 rounded-lg transition-colors shadow-xs"
                  >
                    Complete & Sign POD
                  </button>
                )}

                {task.status !== "Completed" && task.status !== "Delivery Failed" && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, "Delivery Failed")}
                    className="px-2.5 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    Report Failed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {!filteredTasks.length && (
          <div className="col-span-2 py-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Icon name="truck" size={32} className="mx-auto mb-2 opacity-40 text-gray-400" />
            <strong className="block text-gray-700">No transport tasks found</strong>
            <span className="text-xs">All assigned routes are clear or completed.</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <DeliveryTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
      />

      <ProofOfDeliveryModal
        isOpen={!!taskForPOD}
        onClose={() => setTaskForPOD(null)}
        task={taskForPOD}
      />
    </div>
  );
};

export default LogisticsView;
