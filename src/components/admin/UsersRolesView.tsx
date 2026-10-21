import React, { useState, useMemo } from "react";
import { User, UserRole } from "../../types";
import { useApp } from "../../context/AppContext";
import Icon from "../common/Icons";
import Badge from "../common/Badge";
import Modal from "../common/Modal";
import UserModal from "./UserModal";

export const UsersRolesView: React.FC = () => {
  const { users, currentUser, switchUserRole, assumeUser, deleteUser } = useApp();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const roleDefinitions: Array<{
    role: UserRole;
    title: string;
    description: string;
    accessScope: string[];
    restrictions: string[];
    tone: "green" | "lime" | "yellow" | "blue" | "purple" | "gray";
  }> = [
    {
      role: "admin",
      title: "Administrator",
      description: "Full system configuration, security rules, inventory write-offs, user management, and global audit trails.",
      accessScope: ["Full System Configuration", "Manage Users & Permissions", "Approve Inventory Write-Offs", "View All Financials & Audits"],
      restrictions: ["High-impact administrative actions remain permanently auditable"],
      tone: "green",
    },
    {
      role: "general_management",
      title: "General Management (CEO / GM)",
      description: "Executive dashboards, financial reconciliation, P&L reports, write-off approvals, dispute settlements, and verbal agreements.",
      accessScope: ["CEO Executive Dashboard", "P&L by Category & Utilization", "Authorize Verbal Payment Agreements", "Settle Damage Claims"],
      restrictions: ["Operational stock counts cannot be directly overwritten without workflow"],
      tone: "yellow",
    },
    {
      role: "stock_manager",
      title: "Stock Manager",
      description: "Material catalog, warehouse locations, stock movements (receipts & transfers), return inspections, and repair queue.",
      accessScope: ["Create & Edit Materials", "Record Receipts & Transfers", "Conduct Check-in Inspections", "Manage Maintenance Queue"],
      restrictions: ["Restricted from modifying selling prices, invoices, or customer credit terms"],
      tone: "lime",
    },
    {
      role: "accountant",
      title: "Accountant / Finance",
      description: "Invoicing, partial payments, security deposit vault liability, customer balances, revenue reports, and tax calculations.",
      accessScope: ["Manage Invoices & Billing", "Record Partial Payments", "Security Deposit Liability Vault", "Financial P&L Statements"],
      restrictions: ["Restricted from modifying physical stock counts or warehouse bins directly"],
      tone: "purple",
    },
    {
      role: "driver",
      title: "Field Driver (Logistics)",
      description: "Mobile dispatch interface, route stops, electronic Proof of Delivery (e-POD), signature capture, and check-in return verification.",
      accessScope: ["Driver Dispatch Portal", "Electronic Proof of Delivery (e-POD)", "Signature & Photo Capture", "Vehicle Routing"],
      restrictions: ["No access to pricing, billing invoices, or catalog alterations"],
      tone: "blue",
    },
    {
      role: "courier",
      title: "Third-Party Courier",
      description: "External courier dispatch portal, parcel tracking milestones, recipient sign-off, and package delivery confirmations.",
      accessScope: ["Courier Parcel Manifests", "Delivery Status Handoffs", "Recipient Sign-off Confirmation"],
      restrictions: ["Strictly restricted to assigned package manifests only"],
      tone: "gray",
    },
  ];

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const searchTarget = `${u.name} ${u.email} ${u.branch} ${u.id} ${u.phone || ""} ${u.jobTitle || ""} ${u.department || ""}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove user account "${userName}"?`)) {
      deleteUser(userId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-emerald-800 uppercase bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
            ACCESS CONTROL & SECURITY ARCHITECTURE
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display mt-1">
            User Accounts, Roles & Permissions
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Role-based access control (RBAC) enforced at the system core. Test any persona via the interactive role switcher or register new users with full contact and security details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs">
            <span className="text-emerald-800 font-medium">Currently viewing as:</span>
            <strong className="text-emerald-950 font-bold uppercase tracking-wider">
              {currentUser.role.replace("_", " ")} ({currentUser.name})
            </strong>
          </div>

          {/* Primary Add User Button in Header */}
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
          >
            <Icon name="plus" size={15} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Configured System Roles & Permissions ({roleDefinitions.length})
          </h2>
          <span className="text-xs text-gray-500">
            Click "Switch Role" on any card to test permissions in real-time
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleDefinitions.map((def) => {
            const isCurrent = currentUser.role === def.role;
            const roleCount = users.filter((u) => u.role === def.role).length;

            return (
              <div
                key={def.role}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col justify-between transition-all ${
                  isCurrent ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/10" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{def.title}</h3>
                      <span className="text-[10px] text-gray-400 font-mono">role: {def.role}</span>
                    </div>
                    {isCurrent ? (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                        Active Role
                      </span>
                    ) : (
                      <button
                        onClick={() => switchUserRole(def.role)}
                        className="text-[10px] font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200 transition-colors cursor-pointer"
                      >
                        Switch Role →
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 mt-3">{def.description}</p>

                  {/* Authorized Scope */}
                  <div className="mt-4 space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Authorized Permissions:
                    </span>
                    {def.accessScope.map((scope, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700">
                        <Icon name="check" size={13} className="text-emerald-600 shrink-0" />
                        <span>{scope}</span>
                      </div>
                    ))}
                  </div>

                  {/* Protected Restrictions */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                      Security Safeguards:
                    </span>
                    {def.restrictions.map((res, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                  <span className="text-gray-400">Team members: <strong className="text-gray-700">{roleCount}</strong></span>
                  {!isCurrent && (
                    <button
                      onClick={() => switchUserRole(def.role)}
                      className="font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                    >
                      Test this persona
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Team User Accounts Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Top Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-gray-50/60 via-white to-emerald-50/20">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <span>Active Team User Accounts</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {users.length} Total
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Provisioned system accounts with active branch assignments, contact numbers, and security credentials
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                <Icon name="search" size={13} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, branch, ID..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 w-56"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>

            {/* Role Filter Dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-gray-700 font-medium"
            >
              <option value="all">All Roles ({users.length})</option>
              <option value="admin">Admin ({users.filter((u) => u.role === "admin").length})</option>
              <option value="general_management">General Management ({users.filter((u) => u.role === "general_management").length})</option>
              <option value="stock_manager">Stock Manager ({users.filter((u) => u.role === "stock_manager").length})</option>
              <option value="accountant">Accountant ({users.filter((u) => u.role === "accountant").length})</option>
              <option value="driver">Field Driver ({users.filter((u) => u.role === "driver").length})</option>
              <option value="courier">Courier ({users.filter((u) => u.role === "courier").length})</option>
            </select>

            {/* Table Add User Button */}
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Icon name="plus" size={14} />
              <span>Add User</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500 space-y-2">
              <Icon name="users" size={32} className="mx-auto text-gray-300" />
              <p className="text-sm font-semibold text-gray-700">No user accounts found matching criteria</p>
              <p className="text-xs text-gray-400">Try adjusting your search query or role filter.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setRoleFilter("all");
                }}
                className="text-xs text-emerald-700 font-bold hover:underline mt-2 inline-block cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-200 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                <tr>
                  <th className="py-3 px-4">User & Role Profile</th>
                  <th className="py-3 px-3">Role Tier</th>
                  <th className="py-3 px-3">Contact (Email & Phone)</th>
                  <th className="py-3 px-3">Branch Location</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isCurrent = currentUser.id === u.id;
                  let tone: "green" | "lime" | "yellow" | "purple" | "blue" | "gray" = "green";
                  if (u.role === "general_management") tone = "yellow";
                  if (u.role === "stock_manager") tone = "lime";
                  if (u.role === "accountant") tone = "purple";
                  if (u.role === "driver") tone = "blue";
                  if (u.role === "courier") tone = "gray";

                  return (
                    <tr key={u.id} className="hover:bg-emerald-50/20 transition-colors">
                      {/* User Profile */}
                      <td className="py-3 px-4 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-emerald-900 text-white font-extrabold flex items-center justify-center text-xs shadow-2xs shrink-0">
                          {u.avatar}
                        </span>
                        <div className="min-w-0">
                          <button
                            onClick={() => setSelectedUserDetails(u)}
                            className="text-xs font-bold text-gray-900 hover:text-emerald-800 transition-colors block text-left truncate cursor-pointer hover:underline"
                          >
                            {u.name}
                          </button>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                            <span>ID: {u.id}</span>
                            {u.jobTitle && (
                              <>
                                <span>•</span>
                                <span className="text-gray-500 font-sans truncate max-w-[140px]">
                                  {u.jobTitle}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-3">
                        <Badge tone={tone} size="sm">
                          {u.role.replace("_", " ").toUpperCase()}
                        </Badge>
                        {u.department && (
                          <span className="block text-[10px] text-gray-400 mt-0.5 truncate max-w-[130px]">
                            {u.department}
                          </span>
                        )}
                      </td>

                      {/* Contact Details (Email + Phone) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <Icon name="mail" size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{u.email}</span>
                        </div>
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px] mt-0.5">
                            <Icon name="phone" size={11} className="text-emerald-600 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic block mt-0.5">
                            No phone registered
                          </span>
                        )}
                      </td>

                      {/* Branch Facility */}
                      <td className="py-3 px-3 font-semibold text-gray-800">
                        <div className="flex items-center gap-1">
                          <Icon name="mapPin" size={12} className="text-gray-400 shrink-0" />
                          <span>{u.branch}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {u.status === "Pending" ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View details button */}
                          <button
                            onClick={() => setSelectedUserDetails(u)}
                            title="View Full Profile Details"
                            className="p-1 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Icon name="eye" size={14} />
                          </button>

                          {/* Assume User Persona button */}
                          <button
                            onClick={() => assumeUser(u.id)}
                            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                              isCurrent
                                ? "bg-emerald-950 text-white cursor-default"
                                : "bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-900"
                            }`}
                          >
                            {isCurrent ? "Current User" : "Assume User"}
                          </button>

                          {/* Delete user button */}
                          {!isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title="Delete user account"
                              className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Icon name="close" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Register User Modal */}
      <UserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      />

      {/* View User Details Modal */}
      {selectedUserDetails && (
        <Modal
          isOpen={!!selectedUserDetails}
          onClose={() => setSelectedUserDetails(null)}
          title={`User Account: ${selectedUserDetails.name}`}
          subtitle={`Detailed credential and profile specification for ID ${selectedUserDetails.id}`}
          badge="User Dossier"
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
              <span className="w-14 h-14 rounded-full bg-emerald-900 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                {selectedUserDetails.avatar}
              </span>
              <div>
                <h3 className="text-base font-bold text-gray-900">{selectedUserDetails.name}</h3>
                <p className="text-xs text-gray-500">
                  {selectedUserDetails.jobTitle || selectedUserDetails.role.replace("_", " ").toUpperCase()} • {selectedUserDetails.department || "General Operations"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge tone="green" size="sm">
                    {selectedUserDetails.role.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {selectedUserDetails.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Email Address
                </span>
                <span className="font-semibold text-gray-800 break-all">{selectedUserDetails.email}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Phone Number
                </span>
                <span className="font-semibold text-gray-800">
                  {selectedUserDetails.phone || "Not provided"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Facility Branch
                </span>
                <span className="font-semibold text-gray-800">{selectedUserDetails.branch}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Status
                </span>
                <span className={`inline-block font-bold text-[11px] px-2 py-0.5 rounded-full ${
                  selectedUserDetails.status === "Pending" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {selectedUserDetails.status || "Active"}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Password Credential
                </span>
                <span className="font-mono font-bold text-emerald-800">•••••••• (Secured)</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Account Created
                </span>
                <span className="font-semibold text-gray-800">
                  {selectedUserDetails.createdAt || "Active since deployment"}
                </span>
              </div>
            </div>

            {selectedUserDetails.notes && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Administrative & Equipment Notes
                </span>
                <p className="text-gray-700 italic">{selectedUserDetails.notes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  assumeUser(selectedUserDetails.id);
                  setSelectedUserDetails(null);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Assume This User Persona
              </button>
              <button
                onClick={() => setSelectedUserDetails(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersRolesView;
