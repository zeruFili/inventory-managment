export type UserRole =
  | "admin"
  | "general_management"
  | "stock_manager"
  | "driver"
  | "courier"
  | "accountant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  branch: string;
  phone?: string;
  department?: string;
  jobTitle?: string;
  status?: "Active" | "Pending" | "Suspended";
  password?: string;
  notes?: string;
  createdAt?: string;
}

export type MaterialCondition = "New" | "Excellent" | "Good" | "Fair" | "Damaged" | "Beyond Repair" | "Decommissioned";
export type MaterialOperationalStatus = "Available" | "Rented" | "Reserved" | "Inspection Hold" | "Under Repair" | "Retired";

export interface IndividuallyTrackedItem {
  id?: string;
  serialNumber: string;
  barcode: string;
  unitTag?: string;
  condition: MaterialCondition;
  operationalStatus: MaterialOperationalStatus;
  currentLocation: string;
  currentRentalId?: string;
  currentCustomerName?: string;
  rentalCount?: number;
  lastRentedDate?: string;
  lastInspectionDate?: string;
  acquisitionDate?: string;
  notes?: string;
}

export interface PriceHistoryRecord {
  id?: string;
  effectiveDate: string;
  oldPriceDaily: number;
  newPriceDaily: number;
  oldPriceWeekly: number;
  newPriceWeekly: number;
  changedBy: string;
  reason?: string;
}

export interface Material {
  id: string;
  code: string; // SKU or Barcode
  name: string;
  description: string;
  category:
    | "Seating"
    | "Tables"
    | "Lighting"
    | "Audio & Sound"
    | "Visual & Displays"
    | "Structures & Tents"
    | "Staging & Truss"
    | "Power & Climate"
    | "Tableware"
    | "Decor & Drapery";
  brand: string;
  model: string;
  unitOfMeasure: "pcs" | "sets" | "meters" | "pairs";
  isIndividuallyTracked: boolean;
  trackedItems?: IndividuallyTrackedItem[];
  warehouse: string;
  storageLocation: string; // Bay/Shelf
  purchaseDate: string;
  purchaseCost: number;
  supplierId: string;
  supplierName: string;
  warrantyInfo: string;
  sellingPrice: number;
  rentalPriceDaily: number;
  rentalPriceWeekly: number;
  priceHistory?: PriceHistoryRecord[];
  replacementValue: number;
  minimumStock: number;
  lowStockThreshold: number;
  totalOwned: number;
  physicallyAvailable: number;
  reserved: number;
  rentedOut: number;
  awaitingInspection: number;
  underRepair: number;
  retiredQuantity: number;
  physicalCondition: MaterialCondition;
  operationalStatus: MaterialOperationalStatus;
  imageUrl: string;
  supportingDocuments?: string[];
  isArchived: boolean;
  createdBy: string;
  createdAt: string;
  modifiedBy: string;
  modifiedAt: string;
}

export type StockMovementType =
  | "Purchase Receipt"
  | "Rental Issue"
  | "Rental Return"
  | "Sales Fulfillment"
  | "Warehouse Transfer"
  | "Damage Write-off"
  | "Repair Release"
  | "Audit Adjustment";

export interface StockMovement {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  movementType: StockMovementType;
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  referenceId: string; // Order #, Rental #, PO #
  performedBy: string;
  userRole: UserRole;
  timestamp: string;
  previousAvailable: number;
  newAvailable: number;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  type: "Individual" | "Company";
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  vatTaxId?: string;
  idDocumentUrl?: string;
  contractSigned: boolean;
  status: "Active" | "Restricted" | "VIP" | "Under Review";
  totalRentalsCount: number;
  totalSalesCount: number;
  currentBalance: number; // outstanding amount
  securityDepositHeld: number;
  openDamageClaims: number;
  notes: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  suppliedCategories: string[];
  totalPurchasesAmount: number;
  outstandingBalance: number;
  warrantyTerms: string;
  isArchived: boolean;
  notes: string;
}

export type RentalStatus =
  | "Draft"
  | "Confirmed"
  | "Active"
  | "Returned"
  | "Overdue"
  | "Cancelled";

export type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Refunded";
export type DepositStatus = "Held" | "Partially Deducted" | "Deducted" | "Refunded";

export interface RentalItemLine {
  materialId: string;
  materialCode: string;
  materialName: string;
  category: string;
  quantity: number;
  dailyRate: number;
  totalDays: number;
  lineTotal: number;
  returnedQuantity: number;
  missingQuantity: number;
  damagedQuantity: number;
}

export interface RentalReservation {
  id: string;
  reservationNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: string; // ISO string e.g. 2025-06-18T09:00
  expectedReturnDate: string;
  actualReturnDate?: string;
  rentalDurationDays: number;
  items: RentalItemLine[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalCost: number;
  depositAmount: number;
  depositStatus: DepositStatus;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  outstandingBalance: number;
  status: RentalStatus;
  deliveryType: "Delivery & Collection" | "Customer Pickup";
  deliveryAddress?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  responsibleEmployee: string;
  warehouse: string;
  contractNumber?: string;
  notes: string;
  isOverdue: boolean;
  overdueDays?: number;
  extensionHistory?: {
    originalReturnDate: string;
    newReturnDate: string;
    reason: string;
    approvedBy: string;
    date: string;
  }[];
}

export type DeliveryStatus =
  | "Pending Assignment"
  | "Assigned"
  | "Ready for Dispatch"
  | "In Transit"
  | "Delivered"
  | "Collection Scheduled"
  | "Collected"
  | "Delivery Failed"
  | "Completed";

export interface DeliveryTask {
  id: string;
  taskNumber: string;
  type: "Delivery" | "Collection";
  rentalReference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  scheduledDateTime: string;
  dispatchedDateTime?: string;
  completedDateTime?: string;
  assignedToType: "Driver" | "Courier";
  assignedPersonId: string;
  assignedPersonName: string;
  vehicleInfo: string;
  materials: {
    materialId: string;
    materialName: string;
    quantity: number;
  }[];
  status: DeliveryStatus;
  proofOfDelivery?: {
    recipientName: string;
    signatureTimestamp: string;
    notes?: string;
    photoEvidenceUrl?: string;
  };
  delayReason?: string;
  transitDamageReported?: boolean;
  notes: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  items: {
    materialId: string;
    materialName: string;
    materialCode: string;
    quantity: number;
    unitPrice: number;
    purchaseCost: number; // For Gross Profit calculation
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  grossProfit: number;
  paymentStatus: PaymentStatus;
  paymentMethod: "Cash" | "Bank Transfer" | "Credit Card" | "Mobile Payment";
  amountPaid: number;
  orderStatus: "Quotation" | "Confirmed" | "Fulfilled" | "Cancelled" | "Returned";
  orderDate: string;
  fulfillmentDate?: string;
  notes: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  relatedType: "Rental" | "Sales" | "Billing" | "Maintenance" | "Damage Assessment" | string;
  relatedReference: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  lateFees: number;
  damageCharges: number;
  transportFees: number;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  paymentStatus: PaymentStatus;
  items?: {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  notes?: string;
  payments: {
    paymentId: string;
    amount: number;
    method: string;
    reference: string;
    recordedAt: string;
    recordedBy: string;
  }[];
  isVerbalAgreement: boolean;
  verbalAgreementDetails?: {
    agreedTerms: string;
    authorizedBy: string;
    agreementDate: string;
    promisedDate: string;
    notes: string;
  };
}

export interface SecurityDepositRecord {
  id: string;
  rentalReference: string;
  customerId: string;
  customerName: string;
  receivedAmount: number;
  deductedAmount: number;
  refundedAmount: number;
  remainingLiability: number;
  status: DepositStatus;
  receivedDate: string;
  deductionsExplanation?: string;
  deductedItems?: {
    materialId: string;
    materialName: string;
    quantity: number;
    amount: number;
  }[];
}

export interface DamageReport {
  id: string;
  reportNumber: string;
  rentalReference: string;
  materialId: string;
  materialName: string;
  serialNumber?: string;
  customerId: string;
  customerName: string;
  dateReported: string;
  reportedBy: string;
  handlerName?: string; // Driver or Courier involved
  severity: "Minor" | "Moderate" | "Severe";
  description: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  suspectedCause: "Customer Misuse" | "Accidental Handling" | "Transport Transit" | "Normal Wear & Tear";
  responsibilityAssessment: "Customer Fault" | "Company Transport" | "Courier Partner" | "Under Investigation" | "Exempt/Wear";
  estimatedRepairCost: number;
  proposedCustomerCharge: number;
  disputeStatus: "Agreed" | "Disputed" | "Settled" | "Waived by Management";
  resolutionNotes?: string;
  closedDate?: string;
}

export interface RepairWorkOrder {
  id: string;
  workOrderNumber: string;
  damageReportId?: string;
  materialId: string;
  materialName: string;
  repairability: "Repairable" | "Non-Repairable (Write-off)";
  assignedTechnician: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Draft" | "In Progress" | "Awaiting Parts" | "Ready for Inspection" | "Completed" | "Cancelled";
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  workPerformed: string;
  sparePartsCost: number;
  laborCost: number;
  totalCost: number;
  finalInspectionPassed: boolean;
  postRepairCondition: MaterialCondition;
  approvalNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  module: "Inventory" | "Rentals" | "Customers" | "Logistics" | "Sales" | "Billing" | "Maintenance" | "Security";
  recordId: string;
  recordDescription: string;
  previousValue?: string;
  newValue?: string;
}
