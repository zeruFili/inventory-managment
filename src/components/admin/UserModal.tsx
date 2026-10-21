import React, { useState } from "react";
import { UserRole } from "../../types";
import { useApp } from "../../context/AppContext";
import Modal from "../common/Modal";
import Icon from "../common/Icons";
import Badge from "../common/Badge";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_ROLES: Array<{
  role: UserRole;
  title: string;
  scopeSummary: string;
  tone: "green" | "lime" | "yellow" | "purple" | "blue" | "gray";
}> = [
  {
    role: "admin",
    title: "Administrator",
    scopeSummary: "Full system configuration, security rules, user management & audit logs",
    tone: "green",
  },
  {
    role: "general_management",
    title: "General Management",
    scopeSummary: "Executive overview, P&L reports, write-off approvals & financial settlements",
    tone: "yellow",
  },
  {
    role: "stock_manager",
    title: "Stock Manager",
    scopeSummary: "Material catalog, warehouse locations, stock transfers & check-in inspections",
    tone: "lime",
  },
  {
    role: "accountant",
    title: "Accountant / Finance",
    scopeSummary: "Invoicing, partial payments, security deposit vault & financial reports",
    tone: "purple",
  },
  {
    role: "driver",
    title: "Field Driver (Logistics)",
    scopeSummary: "Mobile dispatch console, electronic Proof of Delivery & signature capture",
    tone: "blue",
  },
  {
    role: "courier",
    title: "Third-Party Courier",
    scopeSummary: "Localized package manifests, handoff confirmation & delivery updates",
    tone: "gray",
  },
];

const PRESET_BRANCHES = [
  "Central Warehouse",
  "Head Office",
  "East Branch Depot",
  "West Logistics Hub",
  "North Regional Store",
];

const PRESET_DEPARTMENTS = [
  "Warehouse & Fleet Operations",
  "IT & Systems Architecture",
  "Finance & Accounts",
  "Logistics & Route Dispatch",
  "Executive Management",
  "Rental & Client Relations",
];

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose }) => {
  const { addUser, assumeUser } = useApp();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("Warehouse & Fleet Operations");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>("stock_manager");
  const [branch, setBranch] = useState("Central Warehouse");
  const [customBranch, setCustomBranch] = useState("");
  const [isCustomBranch, setIsCustomBranch] = useState(false);
  const [status, setStatus] = useState<"Active" | "Pending" | "Suspended">("Active");
  const [notes, setNotes] = useState("");
  const [customAvatar, setCustomAvatar] = useState("");
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live initials
  const computedInitials =
    customAvatar.trim().toUpperCase() ||
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    "??";

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: "None", color: "bg-gray-200" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (score === 2 || score === 3) return { score: 2, label: "Moderate", color: "bg-amber-500", text: "text-amber-600" };
    return { score: 3, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" };
  };

  const pwdStrength = getPasswordStrength(password);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let gen = "";
    for (let i = 0; i < 12; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(gen);
    setConfirmPassword(gen);
    setShowPassword(true);
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setPhone("");
    setJobTitle("");
    setDepartment("Warehouse & Fleet Operations");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setRole("stock_manager");
    setBranch("Central Warehouse");
    setCustomBranch("");
    setIsCustomBranch(false);
    setStatus("Active");
    setNotes("");
    setCustomAvatar("");
    setAutoSwitch(false);
    setError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the user's full name.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password && password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const finalBranch = isCustomBranch
      ? customBranch.trim() || "Central Warehouse"
      : branch;

    const createdUser = addUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      password: password || undefined,
      jobTitle: jobTitle.trim() || undefined,
      department: department.trim() || undefined,
      role,
      branch: finalBranch,
      status,
      notes: notes.trim() || undefined,
      avatar: computedInitials !== "??" ? computedInitials : "U",
    });

    if (autoSwitch) {
      assumeUser(createdUser.id);
    }

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Register New User Account"
      subtitle="Provision system credentials, security clearance, contact details, and branch assignments."
      badge="Identity & Access Management"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 animate-fade-in">
            <Icon name="alert" size={16} className="text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Live Identity Badge Preview */}
        <div className="bg-gradient-to-r from-emerald-50/80 via-emerald-50/30 to-amber-50/40 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative group shrink-0">
            <div className="w-16 h-16 rounded-full bg-emerald-900 text-white font-extrabold flex items-center justify-center text-xl shadow-md ring-4 ring-white border border-emerald-700/30">
              {computedInitials}
            </div>
            <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold ${
              status === "Active" ? "bg-emerald-500" : "bg-amber-500"
            }`}>
              {status === "Active" ? "✓" : "•"}
            </span>
          </div>

          <div className="flex-1 w-full space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <strong className="text-base font-bold text-gray-900">
                {name.trim() || "New User Profile"}
              </strong>
              <Badge tone="green" size="sm">
                {role.replace("_", " ").toUpperCase()}
              </Badge>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {status}
              </span>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              {jobTitle.trim() ? `${jobTitle.trim()} • ` : ""}{department}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 pt-0.5">
              <span>{email.trim() || "name@eventtrail.com"}</span>
              {phone.trim() && <span>• 📞 {phone.trim()}</span>}
              <span>• 📍 {isCustomBranch ? (customBranch || "Custom Branch") : branch}</span>
            </div>
          </div>

          <div className="w-full sm:w-auto text-left shrink-0">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Custom Initials
            </label>
            <input
              type="text"
              maxLength={3}
              value={customAvatar}
              onChange={(e) => setCustomAvatar(e.target.value.toUpperCase())}
              placeholder={computedInitials !== "??" ? computedInitials : "AB"}
              className="w-20 px-2.5 py-1 text-center font-bold text-xs uppercase bg-white border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Section 1: Contact & Personal Information */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <Icon name="users" size={15} className="text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Personal & Contact Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icon name="users" size={15} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Vance"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Work Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icon name="mail" size={15} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. david.v@eventtrail.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icon name="phone" size={15} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Job Title / Designation
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Lead Logistics Dispatcher"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Department / Business Unit
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-gray-800 font-medium"
              >
                {PRESET_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Account Password & Security */}
        <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70">
          <div className="flex items-center justify-between pb-1 border-b border-gray-200/60">
            <div className="flex items-center gap-2">
              <Icon name="shield" size={15} className="text-emerald-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                Authentication & Password
              </h3>
            </div>
            <button
              type="button"
              onClick={generateRandomPassword}
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <Icon name="refresh" size={12} />
              <span>Generate Secure Password</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Initial Password
                </label>
                {password && (
                  <span className={`text-[10px] font-bold uppercase ${pwdStrength.text}`}>
                    Strength: {pwdStrength.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="w-full px-3 pr-10 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <Icon name="eye" size={15} />
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="w-full bg-gray-200 h-1 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full ${pwdStrength.color} transition-all duration-300`}
                    style={{
                      width:
                        pwdStrength.score === 1 ? "33%" : pwdStrength.score === 2 ? "66%" : "100%",
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password to verify"
                  className={`w-full px-3 pr-10 py-2 text-xs bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition-all font-mono ${
                    confirmPassword && password !== confirmPassword
                      ? "border-rose-300 focus:ring-rose-500 bg-rose-50/20"
                      : "border-gray-200 focus:ring-emerald-600"
                  }`}
                />
                {confirmPassword && password === confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-600">
                    <Icon name="check" size={15} />
                  </div>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Role & Permissions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
            <Icon name="shield" size={15} className="text-emerald-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800">
              Role Assignment & System Scope <span className="text-rose-500">*</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {AVAILABLE_ROLES.map((r) => {
              const isSelected = role === r.role;
              return (
                <div
                  key={r.role}
                  onClick={() => setRole(r.role)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between text-left ${
                    isSelected
                      ? "border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/20"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900">{r.title}</span>
                    <Badge tone={r.tone} size="sm">
                      {r.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">
                    {r.scopeSummary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4: Facility Branch & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Assigned Branch / Depot
              </label>
              <button
                type="button"
                onClick={() => setIsCustomBranch(!isCustomBranch)}
                className="text-[11px] font-semibold text-emerald-800 hover:underline cursor-pointer"
              >
                {isCustomBranch ? "Preset branches" : "+ Custom location"}
              </button>
            </div>

            {!isCustomBranch ? (
              <div className="flex flex-wrap gap-1.5">
                {PRESET_BRANCHES.map((b) => {
                  const isSelected = branch === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBranch(b)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors font-medium cursor-pointer ${
                        isSelected
                          ? "bg-emerald-950 text-white border-emerald-950 font-bold"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {b}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Icon name="mapPin" size={15} />
                </div>
                <input
                  type="text"
                  value={customBranch}
                  onChange={(e) => setCustomBranch(e.target.value)}
                  placeholder="Enter facility or warehouse name"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 transition-all font-medium"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Initial Account Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus("Active")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  status === "Active"
                    ? "bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500/20"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("Pending")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  status === "Pending"
                    ? "bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-500/20"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Pending Setup
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Active accounts can log in immediately. Pending accounts require verification.
            </p>
          </div>
        </div>

       

       

        {/* Actions */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
          >
            <Icon name="plus" size={14} />
            <span>Register User Account</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
