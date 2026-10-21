import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/common/Sidebar";
import Topbar from "./components/common/Topbar";
import Toast from "./components/common/Toast";
import DashboardView from "./components/dashboard/DashboardView";
import InventoryView from "./components/inventory/InventoryView";
import RentalsView from "./components/rentals/RentalsView";
import CustomersView from "./components/customers/CustomersView";
import SuppliersView from "./components/customers/SuppliersView";
import SalesView from "./components/sales/SalesView";
import BillingView from "./components/billing/BillingView";
import MaintenanceView from "./components/maintenance/MaintenanceView";
import ReportsView from "./components/dashboard/ReportsView";
import UsersRolesView from "./components/admin/UsersRolesView";
import MaterialModal from "./components/inventory/MaterialModal";
import RentalReservationModal from "./components/rentals/RentalReservationModal";

function AppContent() {
  const { toast, currentUser } = useApp();
  const [activeModule, setActiveModule] = useState<string>("Dashboard");
  const [globalSearch, setGlobalSearch] = useState<string>("");

  const isStockManager = currentUser.role === "stock_manager";

  // Prevent stock manager from accessing restricted modules
  useEffect(() => {
    if (isStockManager) {
      const restrictedModules = [
        "Customers",
        "Suppliers",
        "Sales",
        "Billing",
        "Maintenance",
        "Reports",
        "Users",
      ];
      if (restrictedModules.includes(activeModule)) {
        setActiveModule("Dashboard");
      }
    }
  }, [isStockManager, activeModule]);

  // Global Quick Modals
  const [isAddMaterialOpen, setIsAddMaterialOpen] = useState<boolean>(false);
  const [isNewRentalOpen, setIsNewRentalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#f8faf7] text-[#18352b] flex font-sans antialiased">
      {/* Fixed Left Sidebar */}
      <Sidebar activeModule={activeModule} onNavigate={setActiveModule} />

      {/* Main Workspace Area (Offset by sidebar width: 256px) */}
      <div className="ml-64 flex-1 flex flex-col min-w-0">
        <Topbar
          onSearch={setGlobalSearch}
          onOpenNewRental={() => setIsNewRentalOpen(true)}
        />

        <main className="p-6 md:p-8 max-w-[1600px] w-full mx-auto flex-1">
          {activeModule === "Dashboard" && (
            <DashboardView
              onNavigate={setActiveModule}
              onOpenAddMaterial={() => setIsAddMaterialOpen(true)}
              onOpenNewRental={() => setIsNewRentalOpen(true)}
            />
          )}

          {activeModule === "Inventory" && <InventoryView />}

          {activeModule === "Rentals" && <RentalsView />}

          {activeModule === "Customers" && !isStockManager && <CustomersView />}

          {activeModule === "Suppliers" && !isStockManager && <SuppliersView />}

          {activeModule === "Sales" && !isStockManager && <SalesView />}

          {activeModule === "Billing" && !isStockManager && <BillingView />}

          {activeModule === "Maintenance" && !isStockManager && <MaintenanceView />}

          {activeModule === "Reports" && !isStockManager && <ReportsView />}

          {activeModule === "Users" && !isStockManager && <UsersRolesView />}
        </main>
      </div>

      {/* Global Quick Modals */}
      <MaterialModal
        isOpen={isAddMaterialOpen}
        onClose={() => setIsAddMaterialOpen(false)}
      />

      <RentalReservationModal
        isOpen={isNewRentalOpen}
        onClose={() => setIsNewRentalOpen(false)}
      />

      {/* Real-time Toast Feedback */}
      <Toast toast={toast} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
