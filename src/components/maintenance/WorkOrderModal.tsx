import React, { useState } from "react";
import { RepairWorkOrder, MaterialCondition } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToUpdate?: RepairWorkOrder | null;
}

export const WorkOrderModal: React.FC<WorkOrderModalProps> = ({
  isOpen,
  onClose,
  orderToUpdate,
}) => {
  const { materials, createWorkOrder, updateWorkOrderStatus } = useApp();

  const [materialId, setMaterialId] = useState<string>(materials[2]?.id || materials[0]?.id || "");
  const [assignedTechnician, setAssignedTechnician] = useState<string>("BrightFix Electronics Ltd");
  const [priority, setPriority] = useState<RepairWorkOrder["priority"]>("High");
  const [status, setStatus] = useState<RepairWorkOrder["status"]>("In Progress");
  const [workPerformed, setWorkPerformed] = useState<string>("Diagnostic overhaul and PCB soldering repair.");
  const [sparePartsCost, setSparePartsCost] = useState<number>(45);
  const [laborCost, setLaborCost] = useState<number>(60);
  const [finalInspectionPassed, setFinalInspectionPassed] = useState<boolean>(false);
  const [postCondition, setPostCondition] = useState<MaterialCondition>("Good");

  React.useEffect(() => {
    if (orderToUpdate) {
      setMaterialId(orderToUpdate.materialId);
      setAssignedTechnician(orderToUpdate.assignedTechnician);
      setPriority(orderToUpdate.priority);
      setStatus(orderToUpdate.status);
      setWorkPerformed(orderToUpdate.workPerformed);
      setSparePartsCost(orderToUpdate.sparePartsCost);
      setLaborCost(orderToUpdate.laborCost);
      setFinalInspectionPassed(orderToUpdate.finalInspectionPassed);
      setPostCondition(orderToUpdate.postRepairCondition);
    } else {
      setStatus("In Progress");
      setFinalInspectionPassed(false);
      setPostCondition("Good");
    }
  }, [orderToUpdate, isOpen]);

  const activeMat = materials.find((m) => m.id === materialId) || materials[0];
  const totalCost = Number(sparePartsCost) + Number(laborCost);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (orderToUpdate) {
      updateWorkOrderStatus(orderToUpdate.id, status, finalInspectionPassed, postCondition, workPerformed);
    } else {
      createWorkOrder({
        materialId: activeMat.id,
        materialName: activeMat.name,
        repairability: "Repairable",
        assignedTechnician,
        priority,
        status,
        startDate: new Date().toISOString().slice(0, 10),
        expectedCompletionDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        workPerformed,
        sparePartsCost: Number(sparePartsCost),
        laborCost: Number(laborCost),
        totalCost,
        finalInspectionPassed,
        postRepairCondition: postCondition,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={orderToUpdate ? `Update Work Order: ${orderToUpdate.workOrderNumber}` : "Create Maintenance Work Order"}
      subtitle="Assign technicians, track repair expenses, and complete final safety inspections"
      badge="REPAIR & OVERHAUL"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Equipment under repair *</label>
            <select
              value={materialId}
              disabled={!!orderToUpdate}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.underRepair} currently in repair)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Technician / Shop *</label>
            <input
              type="text"
              required
              value={assignedTechnician}
              onChange={(e) => setAssignedTechnician(e.target.value)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
            >
              <option value="Low">Low Priority (Scheduled Routine)</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
              <option value="Urgent">Urgent Priority (Required for Upcoming Event)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none font-bold"
            >
              <option value="Draft">Draft</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
              <option value="Ready for Inspection">Ready for Inspection</option>
              <option value="Completed">Completed & Certified</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Work Performed / Diagnostic Scope</label>
          <textarea
            rows={2}
            required
            value={workPerformed}
            onChange={(e) => setWorkPerformed(e.target.value)}
            className="w-full text-xs font-medium border border-gray-300 rounded-lg p-2.5 bg-white text-gray-900 outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Spare Parts Cost ($)</label>
            <input
              type="number"
              min="0"
              value={sparePartsCost}
              onChange={(e) => setSparePartsCost(Number(e.target.value))}
              className="w-full text-xs font-bold border border-gray-300 rounded p-1.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Labor Cost ($)</label>
            <input
              type="number"
              min="0"
              value={laborCost}
              onChange={(e) => setLaborCost(Number(e.target.value))}
              className="w-full text-xs font-bold border border-gray-300 rounded p-1.5 bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Total Repair Cost</label>
            <strong className="text-base font-extrabold text-gray-900 font-display block mt-1">
              ${totalCost}
            </strong>
          </div>
        </div>

        {/* Final Inspection & Release to Rentable Stock */}
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="finalPass"
              checked={finalInspectionPassed}
              onChange={(e) => {
                setFinalInspectionPassed(e.target.checked);
                if (e.target.checked) setStatus("Completed");
              }}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300"
            />
            <label htmlFor="finalPass" className="text-xs font-bold text-emerald-950 cursor-pointer">
              Final Inspection Passed — Release Equipment Back to Rentable Stock
            </label>
          </div>
          <p className="text-[11px] text-emerald-800">
            <strong>Strict Compliance Rule:</strong> Equipment will remain restricted in maintenance hold and unavailable for bookings until this final inspection certification is signed off.
          </p>

          {finalInspectionPassed && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-950">Post-Repair Condition:</span>
              <select
                value={postCondition}
                onChange={(e) => setPostCondition(e.target.value as any)}
                className="text-xs font-medium border border-emerald-300 rounded p-1 bg-white"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
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
            {orderToUpdate ? "Save Work Order Updates" : "Issue Work Order"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default WorkOrderModal;
