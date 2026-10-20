import React, { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import {
  Material,
  StockMovement,
  Customer,
  Supplier,
  RentalReservation,
  DeliveryTask,
  SalesOrder,
  Invoice,
  SecurityDepositRecord,
  DamageReport,
  RepairWorkOrder,
  AuditLog,
  User,
  UserRole,
  RentalStatus,
  DeliveryStatus,
  MaterialCondition,
} from "../types";
import {
  initialMaterials,
  initialCustomers,
  initialSuppliers,
  initialRentals,
  initialDeliveryTasks,
  initialSalesOrders,
  initialInvoices,
  initialSecurityDeposits,
  initialDamageReports,
  initialWorkOrders,
  initialStockMovements,
  initialAuditLogs,
  initialUsers,
} from "../data/mockData";

export type Permission =
  | "view_all"
  | "manage_users"
  | "manage_inventory"
  | "approve_write_offs"
  | "view_financials"
  | "manage_billing"
  | "record_verbal_agreement"
  | "driver_portal"
  | "courier_portal"
  | "manage_rentals"
  | "manage_sales"
  | "manage_maintenance"
  | "view_executive_dashboard";

interface AppContextType {
  currentUser: User;
  users: User[];
  materials: Material[];
  stockMovements: StockMovement[];
  customers: Customer[];
  suppliers: Supplier[];
  rentals: RentalReservation[];
  deliveryTasks: DeliveryTask[];
  salesOrders: SalesOrder[];
  invoices: Invoice[];
  securityDeposits: SecurityDepositRecord[];
  damageReports: DamageReport[];
  workOrders: RepairWorkOrder[];
  auditLogs: AuditLog[];
  toast: { message: string; type: "success" | "warning" | "error" | "info" } | null;
  
  // Role & Permissions
  switchUserRole: (role: UserRole) => void;
  can: (permission: Permission) => boolean;
  showToast: (message: string, type?: "success" | "warning" | "error" | "info") => void;

  // Inventory & Stock
  addMaterial: (material: Omit<Material, "id" | "createdAt" | "createdBy" | "modifiedAt" | "modifiedBy">) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  archiveMaterial: (id: string) => void;
  recordStockMovement: (
    materialId: string,
    movementType: StockMovement["movementType"],
    quantity: number,
    fromLoc?: string,
    toLoc?: string,
    referenceId?: string,
    notes?: string
  ) => void;

  // Availability Calculator
  checkMaterialAvailability: (
    materialId: string,
    startDate: string,
    endDate: string,
    requestedQty: number,
    excludeRentalId?: string
  ) => { available: boolean; maxAvailable: number; conflictingRentals: RentalReservation[] };

  // Customers & Suppliers
  addCustomer: (customer: Omit<Customer, "id" | "createdAt" | "totalRentalsCount" | "totalSalesCount" | "currentBalance" | "securityDepositHeld" | "openDamageClaims">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addSupplier: (supplier: Omit<Supplier, "id" | "totalPurchasesAmount" | "outstandingBalance">) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;

  // Rentals
  createRentalReservation: (reservation: Omit<RentalReservation, "id" | "reservationNumber">) => boolean;
  updateRentalStatus: (rentalId: string, newStatus: RentalStatus) => void;
  extendRental: (rentalId: string, newReturnDate: string, reason: string, allowOverride?: boolean) => { success: boolean; conflictMessage?: string };
  resolveOverdueRental: (rentalId: string, cause: string, lateFee: number, waived: boolean, notes: string) => void;
  processReturnCheckIn: (
    rentalId: string,
    returnedItems: { materialId: string; returnedQty: number; missingQty: number; damagedQty: number }[],
    condition: MaterialCondition,
    notes: string
  ) => void;

  // Logistics
  createDeliveryTask: (task: Omit<DeliveryTask, "id" | "taskNumber">) => void;
  updateDeliveryTaskStatus: (
    taskId: string,
    status: DeliveryStatus,
    proof?: { recipientName: string; signatureTimestamp: string; notes?: string; photoEvidenceUrl?: string },
    delayReason?: string
  ) => void;

  // Sales
  createSalesOrder: (order: Omit<SalesOrder, "id" | "orderNumber" | "invoiceNumber">) => void;
  fulfillSalesOrder: (orderId: string) => void;

  // Billing & Payments
  recordInvoicePayment: (invoiceId: string, amount: number, method: string, reference: string) => void;
  recordVerbalAgreement: (invoiceId: string, agreedTerms: string, promisedDate: string, notes: string) => void;
  recordDepositDeduction: (depositId: string, deductionAmount: number, explanation: string) => void;
  recordDepositRefund: (depositId: string, refundAmount: number) => void;

  // Maintenance & Damage
  createDamageReport: (report: Omit<DamageReport, "id" | "reportNumber" | "dateReported" | "reportedBy">) => void;
  createWorkOrder: (order: Omit<RepairWorkOrder, "id" | "workOrderNumber">) => void;
  updateWorkOrderStatus: (
    orderId: string,
    status: RepairWorkOrder["status"],
    inspectionPassed?: boolean,
    postCondition?: MaterialCondition,
    notes?: string
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]); // default admin
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [rentals, setRentals] = useState<RentalReservation[]>(initialRentals);
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>(initialDeliveryTasks);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(initialSalesOrders);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [securityDeposits, setSecurityDeposits] = useState<SecurityDepositRecord[]>(initialSecurityDeposits);
  const [damageReports, setDamageReports] = useState<DamageReport[]>(initialDamageReports);
  const [workOrders, setWorkOrders] = useState<RepairWorkOrder[]>(initialWorkOrders);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "warning" | "error" | "info" = "success") => {
    setToast({ message, type });
    window.setTimeout(() => setToast(null), 3200);
  };

  const logAudit = (
    action: string,
    module: AuditLog["module"],
    recordId: string,
    recordDescription: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      user: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      recordId,
      recordDescription,
      previousValue,
      newValue,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchUserRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role) || {
      id: `usr-${role}`,
      name: role.replace("_", " ").toUpperCase(),
      email: `${role}@eventtrail.com`,
      role,
      avatar: role.slice(0, 2).toUpperCase(),
      branch: "Central Warehouse",
    };
    setCurrentUser(found);
    showToast(`Switched active view to role: ${role.replace("_", " ").toUpperCase()}`, "info");
  };

  // Role permissions checker
  const can = (permission: Permission): boolean => {
    const r = currentUser.role;
    if (r === "admin") return true; // full access
    if (r === "general_management") {
      // GM has full view, approvals, verbal agreements, dispute settlements
      if (permission === "manage_users") return false; // admin only
      return true;
    }
    if (r === "stock_manager") {
      return [
        "view_all",
        "manage_inventory",
        "manage_rentals",
        "manage_maintenance",
      ].includes(permission);
    }
    if (r === "accountant") {
      return [
        "view_all",
        "view_financials",
        "manage_billing",
        "manage_sales",
      ].includes(permission);
    }
    if (r === "driver") {
      return permission === "driver_portal";
    }
    if (r === "courier") {
      return permission === "courier_portal";
    }
    return false;
  };

  // Availability engine: checks stock, maintenance holds, and all overlapping rental bookings
  const checkMaterialAvailability = (
    materialId: string,
    startDate: string,
    endDate: string,
    requestedQty: number,
    excludeRentalId?: string
  ) => {
    const mat = materials.find((m) => m.id === materialId);
    if (!mat) return { available: false, maxAvailable: 0, conflictingRentals: [] };

    // Serviceable base: total owned minus under repair, inspection hold, retired
    const serviceableStock = mat.totalOwned - mat.underRepair - mat.awaitingInspection - mat.retiredQuantity;

    const reqStart = new Date(startDate).getTime();
    const reqEnd = new Date(endDate).getTime();

    // Find all rentals active or confirmed that overlap and use this material
    const conflictingRentals: RentalReservation[] = [];
    let peakReservedInWindow = 0;

    rentals.forEach((r) => {
      if (excludeRentalId && r.id === excludeRentalId) return;
      if (r.status === "Cancelled" || r.status === "Returned" || r.status === "Draft") return;

      const rStart = new Date(r.startDate).getTime();
      const rEnd = new Date(r.expectedReturnDate).getTime();

      // Check overlap: (StartA <= EndB) and (EndA >= StartB)
      const hasOverlap = reqStart <= rEnd && reqEnd >= rStart;
      if (hasOverlap) {
        const item = r.items.find((i) => i.materialId === materialId);
        if (item) {
          conflictingRentals.push(r);
          peakReservedInWindow += item.quantity;
        }
      }
    });

    const maxAvailable = Math.max(0, serviceableStock - peakReservedInWindow);
    const isAvail = maxAvailable >= requestedQty;

    return {
      available: isAvail,
      maxAvailable,
      conflictingRentals,
    };
  };

  // Add Material
  const addMaterial = (materialData: Omit<Material, "id" | "createdAt" | "createdBy" | "modifiedAt" | "modifiedBy">) => {
    const newId = `MAT-2025-${(materials.length + 1).toString().padStart(2, "0")}`;
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16);
    const newMaterial: Material = {
      ...materialData,
      id: newId,
      createdAt: timestamp,
      createdBy: currentUser.name,
      modifiedAt: timestamp,
      modifiedBy: currentUser.name,
    };
    setMaterials((prev) => [newMaterial, ...prev]);
    logAudit("CREATE_MATERIAL", "Inventory", newId, `Registered new material: ${newMaterial.name} (${newMaterial.code})`);
    showToast(`Material "${newMaterial.name}" registered successfully.`);
  };

  // Update Material
  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = {
            ...m,
            ...updates,
            modifiedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            modifiedBy: currentUser.name,
          };
          logAudit("UPDATE_MATERIAL", "Inventory", id, `Updated material details for ${m.name}`);
          return updated;
        }
        return m;
      })
    );
    showToast("Material updated successfully.");
  };

  // Archive Material (Soft delete: preserves transactions)
  const archiveMaterial = (id: string) => {
    const mat = materials.find((m) => m.id === id);
    if (!mat) return;
    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isArchived: true, operationalStatus: "Retired" } : m))
    );
    logAudit("ARCHIVE_MATERIAL", "Inventory", id, `Archived material: ${mat.name}. Historical transactions preserved.`);
    showToast(`Material "${mat.name}" archived.`);
  };

  // Stock Movement
  const recordStockMovement = (
    materialId: string,
    movementType: StockMovement["movementType"],
    quantity: number,
    fromLoc?: string,
    toLoc?: string,
    referenceId?: string,
    notes?: string
  ) => {
    const mat = materials.find((m) => m.id === materialId);
    if (!mat) return;

    const previousAvailable = mat.physicallyAvailable;
    let newAvailable = previousAvailable;
    let newTotal = mat.totalOwned;
    let newUnderRepair = mat.underRepair;

    if (movementType === "Purchase Receipt") {
      newTotal += quantity;
      newAvailable += quantity;
    } else if (movementType === "Rental Issue") {
      newAvailable = Math.max(0, newAvailable - quantity);
    } else if (movementType === "Rental Return") {
      newAvailable += quantity;
    } else if (movementType === "Sales Fulfillment") {
      newTotal = Math.max(0, newTotal - quantity);
      newAvailable = Math.max(0, newAvailable - quantity);
    } else if (movementType === "Damage Write-off") {
      newTotal = Math.max(0, newTotal - quantity);
      newAvailable = Math.max(0, newAvailable - quantity);
    } else if (movementType === "Repair Release") {
      newUnderRepair = Math.max(0, newUnderRepair - quantity);
      newAvailable += quantity;
    }

    setMaterials((prev) =>
      prev.map((m) =>
        m.id === materialId
          ? {
              ...m,
              totalOwned: newTotal,
              physicallyAvailable: newAvailable,
              underRepair: newUnderRepair,
              modifiedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
              modifiedBy: currentUser.name,
            }
          : m
      )
    );

    const movement: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      materialId,
      materialName: mat.name,
      materialCode: mat.code,
      movementType,
      quantity,
      fromLocation: fromLoc || mat.storageLocation,
      toLocation: toLoc,
      referenceId: referenceId || "MANUAL",
      performedBy: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 16),
      previousAvailable,
      newAvailable,
      notes: notes || `Recorded ${movementType}`,
    };

    setStockMovements((prev) => [movement, ...prev]);
    logAudit(
      "STOCK_MOVEMENT",
      "Inventory",
      materialId,
      `${movementType}: ${quantity} units of ${mat.name}`,
      `Available: ${previousAvailable}`,
      `Available: ${newAvailable}`
    );
    showToast(`Stock movement (${movementType}) recorded.`);
  };

  // Customers
  const addCustomer = (customerData: Omit<Customer, "id" | "createdAt" | "totalRentalsCount" | "totalSalesCount" | "currentBalance" | "securityDepositHeld" | "openDamageClaims">) => {
    const newId = `CUS-${(customers.length + 1).toString().padStart(4, "0")}`;
    const newCust: Customer = {
      ...customerData,
      id: newId,
      totalRentalsCount: 0,
      totalSalesCount: 0,
      currentBalance: 0,
      securityDepositHeld: 0,
      openDamageClaims: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [newCust, ...prev]);
    logAudit("CREATE_CUSTOMER", "Customers", newId, `Added customer: ${newCust.name}`);
    showToast(`Customer "${newCust.name}" created.`);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    logAudit("UPDATE_CUSTOMER", "Customers", id, "Updated customer details");
    showToast("Customer profile updated.");
  };

  // Suppliers
  const addSupplier = (supplierData: Omit<Supplier, "id" | "totalPurchasesAmount" | "outstandingBalance">) => {
    const newId = `SUP-${(suppliers.length + 1).toString().padStart(2, "0")}`;
    const newSup: Supplier = {
      ...supplierData,
      id: newId,
      totalPurchasesAmount: 0,
      outstandingBalance: 0,
    };
    setSuppliers((prev) => [newSup, ...prev]);
    logAudit("CREATE_SUPPLIER", "Customers", newId, `Added supplier: ${newSup.companyName}`);
    showToast(`Supplier "${newSup.companyName}" added.`);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    logAudit("UPDATE_SUPPLIER", "Customers", id, "Updated supplier details");
    showToast("Supplier updated.");
  };

  // Create Rental Reservation
  const createRentalReservation = (reservationData: Omit<RentalReservation, "id" | "reservationNumber">): boolean => {
    // 1. Availability check for each item
    for (const item of reservationData.items) {
      const check = checkMaterialAvailability(
        item.materialId,
        reservationData.startDate,
        reservationData.expectedReturnDate,
        item.quantity
      );
      if (!check.available) {
        showToast(
          `Cannot reserve ${item.quantity} units of ${item.materialName}. Only ${check.maxAvailable} available for these dates!`,
          "error"
        );
        return false;
      }
    }

    const newId = `RNT-${1050 + rentals.length}`;
    const resNumber = `RES-2025-${(420 + rentals.length).toString()}`;
    const newReservation: RentalReservation = {
      ...reservationData,
      id: newId,
      reservationNumber: resNumber,
    };

    setRentals((prev) => [newReservation, ...prev]);

    // Reserve stock on materials
    setMaterials((prev) =>
      prev.map((m) => {
        const booked = reservationData.items.find((i) => i.materialId === m.id);
        if (booked) {
          return {
            ...m,
            reserved: m.reserved + booked.quantity,
            physicallyAvailable: Math.max(0, m.physicallyAvailable - booked.quantity),
          };
        }
        return m;
      })
    );

    // Create Invoice
    const invoiceNum = `INV-2025-${4100 + invoices.length}`;
    const newInvoice: Invoice = {
      id: `INV-${4100 + invoices.length}`,
      invoiceNumber: invoiceNum,
      relatedType: "Rental",
      relatedReference: newId,
      customerId: reservationData.customerId,
      customerName: reservationData.customerName,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: reservationData.startDate.slice(0, 10),
      subtotal: reservationData.subtotal,
      tax: reservationData.taxAmount,
      lateFees: 0,
      damageCharges: 0,
      transportFees: reservationData.deliveryType.includes("Delivery") ? 150 : 0,
      totalAmount: reservationData.totalCost,
      amountPaid: reservationData.amountPaid,
      outstandingBalance: reservationData.outstandingBalance,
      paymentStatus: reservationData.paymentStatus,
      payments:
        reservationData.amountPaid > 0
          ? [
              {
                paymentId: `PAY-${Date.now().toString().slice(-4)}`,
                amount: reservationData.amountPaid,
                method: "Initial Booking Payment",
                reference: `ADV-${newId}`,
                recordedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
                recordedBy: currentUser.name,
              },
            ]
          : [],
      isVerbalAgreement: false,
    };
    setInvoices((prev) => [newInvoice, ...prev]);

    // Record Security Deposit
    if (reservationData.depositAmount > 0) {
      const newDeposit: SecurityDepositRecord = {
        id: `DEP-${Date.now().toString().slice(-4)}`,
        rentalReference: newId,
        customerId: reservationData.customerId,
        customerName: reservationData.customerName,
        receivedAmount: reservationData.depositAmount,
        deductedAmount: 0,
        refundedAmount: 0,
        remainingLiability: reservationData.depositAmount,
        status: "Held",
        receivedDate: new Date().toISOString().slice(0, 10),
      };
      setSecurityDeposits((prev) => [newDeposit, ...prev]);
    }

    // Create Logistics Delivery task if delivery requested
    if (reservationData.deliveryType.includes("Delivery")) {
      const taskNum = `TASK-2025-${(500 + deliveryTasks.length).toString()}`;
      const newTask: DeliveryTask = {
        id: `DEL-${500 + deliveryTasks.length}`,
        taskNumber: taskNum,
        type: "Delivery",
        rentalReference: newId,
        customerId: reservationData.customerId,
        customerName: reservationData.customerName,
        customerPhone: reservationData.customerPhone,
        deliveryAddress: reservationData.deliveryAddress || "Client Venue",
        scheduledDateTime: reservationData.startDate,
        assignedToType: "Driver",
        assignedPersonId: reservationData.assignedDriverId || "usr-04",
        assignedPersonName: reservationData.assignedDriverName || "Eric James",
        vehicleInfo: "Mercedes Sprinter VAN-04",
        materials: reservationData.items.map((i) => ({
          materialId: i.materialId,
          materialName: i.materialName,
          quantity: i.quantity,
        })),
        status: "Assigned",
        notes: `Delivery for reservation ${resNumber}`,
      };
      setDeliveryTasks((prev) => [newTask, ...prev]);
    }

    logAudit("CREATE_RESERVATION", "Rentals", newId, `Booked reservation ${resNumber} for ${reservationData.customerName}`);
    showToast(`Reservation ${resNumber} confirmed and stock reserved.`);
    return true;
  };

  // Update Rental Status (e.g. Dispatched/Active, Returned, Overdue)
  const updateRentalStatus = (rentalId: string, newStatus: RentalStatus) => {
    const rent = rentals.find((r) => r.id === rentalId);
    if (!rent) return;

    if (newStatus === "Active" && rent.status !== "Active") {
      // Dispatched: move from reserved to rentedOut
      setMaterials((prev) =>
        prev.map((m) => {
          const booked = rent.items.find((i) => i.materialId === m.id);
          if (booked) {
            return {
              ...m,
              reserved: Math.max(0, m.reserved - booked.quantity),
              rentedOut: m.rentedOut + booked.quantity,
            };
          }
          return m;
        })
      );
    }

    setRentals((prev) =>
      prev.map((r) => (r.id === rentalId ? { ...r, status: newStatus } : r))
    );
    logAudit("UPDATE_RENTAL_STATUS", "Rentals", rentalId, `Status changed from ${rent.status} to ${newStatus}`);
    showToast(`Rental ${rentalId} status set to ${newStatus}.`);
  };

  // Extend Rental
  const extendRental = (rentalId: string, newReturnDate: string, reason: string, allowOverride = false) => {
    const rent = rentals.find((r) => r.id === rentalId);
    if (!rent) return { success: false, conflictMessage: "Rental not found." };

    // Collision detection: Check if extension collides with other future rentals
    for (const item of rent.items) {
      const check = checkMaterialAvailability(
        item.materialId,
        rent.expectedReturnDate,
        newReturnDate,
        item.quantity,
        rentalId
      );
      if (!check.available && !allowOverride) {
        return {
          success: false,
          conflictMessage: `Conflict detected: Extension would overlap with existing confirmed booking for ${item.materialName}! Manager authorization required.`,
        };
      }
    }

    const extRecord = {
      originalReturnDate: rent.expectedReturnDate,
      newReturnDate,
      reason,
      approvedBy: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
    };

    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId
          ? {
              ...r,
              expectedReturnDate: newReturnDate,
              extensionHistory: [...(r.extensionHistory || []), extRecord],
            }
          : r
      )
    );

    logAudit("EXTEND_RENTAL", "Rentals", rentalId, `Extended return date to ${newReturnDate}. Reason: ${reason}`);
    showToast(`Rental ${rentalId} extended to ${newReturnDate.slice(0, 10)}.`);
    return { success: true };
  };

  // Resolve Overdue
  const resolveOverdueRental = (rentalId: string, cause: string, lateFee: number, waived: boolean, notes: string) => {
    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId
          ? {
              ...r,
              notes: `${r.notes} | Overdue Resolution: Cause: ${cause}. Fee: $${lateFee} (${waived ? "Waived" : "Billed"}). Notes: ${notes}`,
            }
          : r
      )
    );

    if (!waived && lateFee > 0) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.relatedReference === rentalId
            ? {
                ...inv,
                lateFees: inv.lateFees + lateFee,
                totalAmount: inv.totalAmount + lateFee,
                outstandingBalance: inv.outstandingBalance + lateFee,
              }
            : inv
        )
      );
    }

    logAudit("RESOLVE_OVERDUE", "Rentals", rentalId, `Resolved overdue rental. Cause: ${cause}, Fee: $${lateFee}, Waived: ${waived}`);
    showToast(`Overdue resolution saved for rental ${rentalId}.`);
  };

  // Return Check-In
  const processReturnCheckIn = (
    rentalId: string,
    returnedItems: { materialId: string; returnedQty: number; missingQty: number; damagedQty: number }[],
    condition: MaterialCondition,
    notes: string
  ) => {
    const rent = rentals.find((r) => r.id === rentalId);
    if (!rent) return;

    let hasDamage = false;
    let hasMissing = false;

    // Adjust inventory
    setMaterials((prev) =>
      prev.map((m) => {
        const item = returnedItems.find((ri) => ri.materialId === m.id);
        if (item) {
          const safeReturned = Math.max(0, item.returnedQty - item.damagedQty);
          if (item.damagedQty > 0) hasDamage = true;
          if (item.missingQty > 0) hasMissing = true;

          return {
            ...m,
            rentedOut: Math.max(0, m.rentedOut - item.returnedQty - item.missingQty),
            physicallyAvailable: m.physicallyAvailable + safeReturned,
            underRepair: m.underRepair + item.damagedQty,
            awaitingInspection: m.awaitingInspection,
            retiredQuantity: m.retiredQuantity + item.missingQty, // missing written off
          };
        }
        return m;
      })
    );

    // Update rental status
    const allReturned = returnedItems.every(
      (ri) => ri.returnedQty + ri.missingQty >= (rent.items.find((i) => i.materialId === ri.materialId)?.quantity || 0)
    );

    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId
          ? {
              ...r,
              status: allReturned ? "Returned" : "Active",
              actualReturnDate: new Date().toISOString().replace("T", " ").slice(0, 16),
              isOverdue: false,
              notes: `${r.notes} | Return check-in processed. Condition: ${condition}. ${notes}`,
            }
          : r
      )
    );

    logAudit("RETURN_CHECKIN", "Rentals", rentalId, `Processed gear return. Condition: ${condition}, Damaged: ${hasDamage}, Missing: ${hasMissing}`);
    showToast(`Return check-in completed for rental ${rentalId}.`);
  };

  // Logistics
  const createDeliveryTask = (taskData: Omit<DeliveryTask, "id" | "taskNumber">) => {
    const newId = `TSK-${Date.now().toString().slice(-4)}`;
    const taskNum = `TASK-2025-${newId.slice(-4)}`;
    const newTask: DeliveryTask = {
      ...taskData,
      id: newId,
      taskNumber: taskNum,
    };
    setDeliveryTasks((prev) => [newTask, ...prev]);
    logAudit("CREATE_DELIVERY_TASK", "Logistics", newId, `Scheduled ${newTask.type} for ${newTask.customerName}`);
    showToast(`Task ${taskNum} created.`);
  };

  const updateDeliveryTaskStatus = (
    taskId: string,
    status: DeliveryStatus,
    proof?: { recipientName: string; signatureTimestamp: string; notes?: string; photoEvidenceUrl?: string },
    delayReason?: string
  ) => {
    setDeliveryTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              proofOfDelivery: proof || t.proofOfDelivery,
              delayReason: delayReason || t.delayReason,
              completedDateTime: status === "Completed" ? new Date().toISOString().replace("T", " ").slice(0, 16) : t.completedDateTime,
            }
          : t
      )
    );
    logAudit("UPDATE_DELIVERY_TASK", "Logistics", taskId, `Status updated to ${status}`);
    showToast(`Logistics task updated to ${status}.`);
  };

  // Sales Orders
  const createSalesOrder = (orderData: Omit<SalesOrder, "id" | "orderNumber" | "invoiceNumber">) => {
    const newId = `SO-${2085 + salesOrders.length}`;
    const orderNum = `SO-2025-${(85 + salesOrders.length).toString()}`;
    const invNum = `INV-2025-${(4120 + invoices.length).toString()}`;

    const newOrder: SalesOrder = {
      ...orderData,
      id: newId,
      orderNumber: orderNum,
      invoiceNumber: invNum,
    };
    setSalesOrders((prev) => [newOrder, ...prev]);

    // Create Invoice
    const newInv: Invoice = {
      id: `INV-${4120 + invoices.length}`,
      invoiceNumber: invNum,
      relatedType: "Sales",
      relatedReference: newId,
      customerId: orderData.customerId,
      customerName: orderData.customerName,
      issueDate: orderData.orderDate,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      lateFees: 0,
      damageCharges: 0,
      transportFees: 0,
      totalAmount: orderData.totalAmount,
      amountPaid: orderData.amountPaid,
      outstandingBalance: orderData.totalAmount - orderData.amountPaid,
      paymentStatus: orderData.paymentStatus,
      payments:
        orderData.amountPaid > 0
          ? [
              {
                paymentId: `PAY-${Date.now().toString().slice(-4)}`,
                amount: orderData.amountPaid,
                method: orderData.paymentMethod,
                reference: `SLS-${newId}`,
                recordedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
                recordedBy: currentUser.name,
              },
            ]
          : [],
      isVerbalAgreement: false,
    };
    setInvoices((prev) => [newInv, ...prev]);

    logAudit("CREATE_SALES_ORDER", "Sales", newId, `Created sales order ${orderNum} for ${orderData.customerName}`);
    showToast(`Sales Order ${orderNum} created.`);
  };

  const fulfillSalesOrder = (orderId: string) => {
    const order = salesOrders.find((o) => o.id === orderId);
    if (!order) return;

    // Deduct stock permanently from inventory
    setMaterials((prev) =>
      prev.map((m) => {
        const item = order.items.find((i) => i.materialId === m.id);
        if (item) {
          return {
            ...m,
            totalOwned: Math.max(0, m.totalOwned - item.quantity),
            physicallyAvailable: Math.max(0, m.physicallyAvailable - item.quantity),
          };
        }
        return m;
      })
    );

    setSalesOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: "Fulfilled",
              fulfillmentDate: new Date().toISOString().slice(0, 10),
            }
          : o
      )
    );

    logAudit("FULFILL_SALES_ORDER", "Sales", orderId, `Fulfilled sales order ${order.orderNumber}. Stock deducted permanently.`);
    showToast(`Sales Order ${order.orderNumber} fulfilled.`);
  };

  // Invoices & Payments
  const recordInvoicePayment = (invoiceId: string, amount: number, method: string, reference: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.amountPaid + amount;
          const newBalance = Math.max(0, inv.totalAmount - newPaid);
          const newStatus = newBalance === 0 ? "Paid" : "Partial";
          const newPayment = {
            paymentId: `PAY-${Date.now().toString().slice(-4)}`,
            amount,
            method,
            reference,
            recordedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
            recordedBy: currentUser.name,
          };
          return {
            ...inv,
            amountPaid: newPaid,
            outstandingBalance: newBalance,
            paymentStatus: newStatus,
            payments: [...inv.payments, newPayment],
          };
        }
        return inv;
      })
    );

    logAudit("RECORD_PAYMENT", "Billing", invoiceId, `Recorded payment of $${amount} via ${method}`);
    showToast(`Payment of $${amount} recorded.`);
  };

  const recordVerbalAgreement = (invoiceId: string, agreedTerms: string, promisedDate: string, notes: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              isVerbalAgreement: true,
              verbalAgreementDetails: {
                agreedTerms,
                authorizedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
                agreementDate: new Date().toISOString().slice(0, 10),
                promisedDate,
                notes,
              },
            }
          : inv
      )
    );

    logAudit("VERBAL_AGREEMENT", "Billing", invoiceId, `Recorded verbal agreement: promised by ${promisedDate}`);
    showToast("Verbal agreement recorded with management pending review flag.");
  };

  const recordDepositDeduction = (depositId: string, deductionAmount: number, explanation: string) => {
    setSecurityDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              deductedAmount: d.deductedAmount + deductionAmount,
              remainingLiability: Math.max(0, d.remainingLiability - deductionAmount),
              status: d.remainingLiability - deductionAmount === 0 ? "Deducted" : "Partially Deducted",
              deductionsExplanation: explanation,
            }
          : d
      )
    );
    logAudit("DEPOSIT_DEDUCTION", "Billing", depositId, `Deducted $${deductionAmount} for: ${explanation}`);
    showToast(`Deducted $${deductionAmount} from security deposit.`);
  };

  const recordDepositRefund = (depositId: string, refundAmount: number) => {
    setSecurityDeposits((prev) =>
      prev.map((d) =>
        d.id === depositId
          ? {
              ...d,
              refundedAmount: d.refundedAmount + refundAmount,
              remainingLiability: Math.max(0, d.remainingLiability - refundAmount),
              status: "Refunded",
            }
          : d
      )
    );
    logAudit("DEPOSIT_REFUND", "Billing", depositId, `Refunded deposit of $${refundAmount}`);
    showToast(`Deposit refund of $${refundAmount} recorded.`);
  };

  // Damage & Maintenance
  const createDamageReport = (reportData: Omit<DamageReport, "id" | "reportNumber" | "dateReported" | "reportedBy">) => {
    const newId = `DMG-${(420 + damageReports.length).toString()}`;
    const reportNum = `DMG-2025-${newId.slice(-3)}`;
    const newReport: DamageReport = {
      ...reportData,
      id: newId,
      reportNumber: reportNum,
      dateReported: new Date().toISOString().slice(0, 10),
      reportedBy: currentUser.name,
    };
    setDamageReports((prev) => [newReport, ...prev]);

    // Update material under repair
    setMaterials((prev) =>
      prev.map((m) =>
        m.id === reportData.materialId
          ? {
              ...m,
              underRepair: m.underRepair + 1,
              operationalStatus: "Under Repair",
            }
          : m
      )
    );

    // Update customer open damage claims count
    setCustomers((prev) =>
      prev.map((c) => (c.id === reportData.customerId ? { ...c, openDamageClaims: c.openDamageClaims + 1 } : c))
    );

    logAudit("DAMAGE_REPORT", "Maintenance", newId, `Reported damage on ${reportData.materialName} (${reportData.severity})`);
    showToast(`Damage Report ${reportNum} filed.`);
  };

  const createWorkOrder = (orderData: Omit<RepairWorkOrder, "id" | "workOrderNumber">) => {
    const newId = `WO-${(385 + workOrders.length).toString()}`;
    const orderNum = `WO-2025-${newId.slice(-3)}`;
    const newOrder: RepairWorkOrder = {
      ...orderData,
      id: newId,
      workOrderNumber: orderNum,
    };
    setWorkOrders((prev) => [newOrder, ...prev]);
    logAudit("CREATE_WORK_ORDER", "Maintenance", newId, `Created repair order ${orderNum} for ${orderData.materialName}`);
    showToast(`Work Order ${orderNum} created.`);
  };

  const updateWorkOrderStatus = (
    orderId: string,
    status: RepairWorkOrder["status"],
    inspectionPassed?: boolean,
    postCondition?: MaterialCondition,
    notes?: string
  ) => {
    const wo = workOrders.find((w) => w.id === orderId);
    if (!wo) return;

    setWorkOrders((prev) =>
      prev.map((w) =>
        w.id === orderId
          ? {
              ...w,
              status,
              finalInspectionPassed: inspectionPassed !== undefined ? inspectionPassed : w.finalInspectionPassed,
              postRepairCondition: postCondition || w.postRepairCondition,
              actualCompletionDate: status === "Completed" ? new Date().toISOString().slice(0, 10) : w.actualCompletionDate,
              approvalNotes: notes || w.approvalNotes,
            }
          : w
      )
    );

    // CRITICAL BUSINESS RULE: Only return gear to available stock if final inspection passed and status is Completed!
    if (status === "Completed" && inspectionPassed) {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === wo.materialId
            ? {
                ...m,
                underRepair: Math.max(0, m.underRepair - 1),
                physicallyAvailable: m.physicallyAvailable + 1,
                physicalCondition: postCondition || "Good",
                operationalStatus: "Available",
              }
            : m
        )
      );
      logAudit(
        "WORK_ORDER_COMPLETED",
        "Maintenance",
        orderId,
        `Repair completed and passed inspection. 1 unit of ${wo.materialName} returned to available rental stock.`
      );
      showToast(`Work Order ${wo.workOrderNumber} passed final inspection and returned to available stock!`);
    } else {
      logAudit("UPDATE_WORK_ORDER", "Maintenance", orderId, `Work order status changed to ${status}`);
      showToast(`Work Order ${wo.workOrderNumber} status updated to ${status}.`);
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      users,
      materials,
      stockMovements,
      customers,
      suppliers,
      rentals,
      deliveryTasks,
      salesOrders,
      invoices,
      securityDeposits,
      damageReports,
      workOrders,
      auditLogs,
      toast,
      switchUserRole,
      can,
      showToast,
      addMaterial,
      updateMaterial,
      archiveMaterial,
      recordStockMovement,
      checkMaterialAvailability,
      addCustomer,
      updateCustomer,
      addSupplier,
      updateSupplier,
      createRentalReservation,
      updateRentalStatus,
      extendRental,
      resolveOverdueRental,
      processReturnCheckIn,
      createDeliveryTask,
      updateDeliveryTaskStatus,
      createSalesOrder,
      fulfillSalesOrder,
      recordInvoicePayment,
      recordVerbalAgreement,
      recordDepositDeduction,
      recordDepositRefund,
      createDamageReport,
      createWorkOrder,
      updateWorkOrderStatus,
    }),
    [
      currentUser,
      users,
      materials,
      stockMovements,
      customers,
      suppliers,
      rentals,
      deliveryTasks,
      salesOrders,
      invoices,
      securityDeposits,
      damageReports,
      workOrders,
      auditLogs,
      toast,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export default AppContext;
