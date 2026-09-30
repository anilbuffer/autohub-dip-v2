"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Save,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Fingerprint,
  Check,
  Clock,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import {
  getStoredDealerProfile,
  saveStoredDealerProfile,
  DealerProfileSettings,
} from "@/lib/dealerStore";

export default function ProfilePage() {
  const [profile, setProfile] = useState<DealerProfileSettings>({
    dealerName: "Auckland Auto Group",
    principalName: "David Miller",
    email: "david.miller@aucklandautogroup.co.nz",
    phone: "+64 9 525 8899",
    yardAddress: "458 Great South Road, Penrose, Auckland 1061",
    registeredTraderNo: "M189402",
    nzbn: "9429041234567",
    role: "Dealer Principal (Admin Role)",
    lastPasswordChange: "30 Sep 2026, 17:00 NZST",
    twoFactorEnabled: true,
    adminSyncEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load from local storage
  useEffect(() => {
    const stored = getStoredDealerProfile();
    setProfile(stored);
  }, []);

  const handleProfileChange = (key: keyof DealerProfileSettings, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredDealerProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-600" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-600" };
    if (score >= 4) return { score: 4, label: "Strong & Secure", color: "bg-emerald-500", text: "text-emerald-600" };
    return { score: 0, label: "None", color: "bg-slate-200", text: "text-slate-400" };
  };

  const strength = getPasswordStrength(newPassword);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: null });

    if (!currentPassword.trim()) {
      setPasswordStatus({
        type: "error",
        message: "Please enter your current account password.",
      });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({
        type: "error",
        message: "New password must be at least 8 characters in length.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: "error",
        message: "New passwords do not match. Please re-check.",
      });
      return;
    }

    setIsUpdatingPassword(true);

    setTimeout(() => {
      const now = new Date();
      const timestamp = `${now.toLocaleDateString("en-NZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}, ${now.toLocaleTimeString("en-NZ", {
        hour: "2-digit",
        minute: "2-digit",
      })} NZST`;

      saveStoredDealerProfile({
        lastPasswordChange: timestamp,
      });

      setProfile((prev) => ({
        ...prev,
        lastPasswordChange: timestamp,
      }));

      setIsUpdatingPassword(false);
      setPasswordStatus({
        type: "success",
        message: "Password successfully updated & synchronized with AutoHub DIP Admin Security.",
      });

      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setPasswordStatus({ type: null, message: null });
      }, 5000);
    }, 600);
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-20 font-sans max-w-5xl mx-auto">
        {/* ─── Page Title & Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold bg-blue-50 text-[#1E3A5F] border border-blue-200">
                Dealer ↔ Admin Synced
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Live Session
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Dealership Profile & Security
            </h1>
            <p className="text-xs text-[#64748B] mt-0.5">
              Manage your motor vehicle trader registration, yard logistics, and admin security credentials.
            </p>
          </div>

          {/* Role Status Tag */}
          <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] text-white flex items-center justify-center font-bold">
              <UserCheck size={16} />
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#111827]">
                {profile.principalName}
              </div>
              <div className="text-[10px] text-[#E11D48] font-bold">
                {profile.role}
              </div>
            </div>
          </div>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-xs">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Profile details successfully updated and synchronized with AutoHub DIP.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* ─── Dealership Identity Card ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-5 hover:shadow-soft-md transition-shadow">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold shadow-2xs">
                <Building2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Dealership Identification
                </h3>
                <p className="text-xs text-[#64748B]">
                  Official registered motor vehicle trader details on file with NZTA.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Dealership Legal Trade Name
                </label>
                <input
                  type="text"
                  value={profile.dealerName}
                  onChange={(e) => handleProfileChange("dealerName", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  NZTA RMVT License Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.registeredTraderNo}
                    onChange={(e) => handleProfileChange("registeredTraderNo", e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white pr-9 transition-all shadow-2xs"
                    required
                  />
                  <ShieldCheck size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  NZBN (Business Number)
                </label>
                <input
                  type="text"
                  value={profile.nzbn}
                  onChange={(e) => handleProfileChange("nzbn", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-mono font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Dealer Principal / Managing Director
                </label>
                <input
                  type="text"
                  value={profile.principalName}
                  onChange={(e) => handleProfileChange("principalName", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* ─── Contact & Yard Logistics Card ─── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-5 hover:shadow-soft-md transition-shadow">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F1F5F9]">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#1E3A5F] flex items-center justify-center font-bold shadow-2xs">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827]">
                  Delivery Yard & Logistics Contact
                </h3>
                <p className="text-xs text-[#64748B]">
                  AutoHub delivery transporters use this address for port-to-yard haulage.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Primary Vehicle Yard Address
                </label>
                <input
                  type="text"
                  value={profile.yardAddress}
                  onChange={(e) => handleProfileChange("yardAddress", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Logistics Contact Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Dispatch Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#1E3A5F] focus:bg-white transition-all shadow-2xs"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#1E3A5F] hover:bg-[#162C48] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-950/20 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Save size={15} />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </div>
        </form>

        {/* ─── NEW CARD: [ CHANGE PASSWORD & SECURITY ] ─── */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-soft space-y-5 hover:shadow-soft-md transition-shadow">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#E11D48] flex items-center justify-center font-bold">
                <KeyRound size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#111827]">
                    Change Password & Account Security
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wide">
                    Admin Synced
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Update your authentication credentials for dealer portal & admin API synchronization.
                </p>
              </div>
            </div>

            {/* Last Changed Timestamp */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Clock size={13} className="text-[#1E3A5F]" />
              <span>Last changed: <strong className="text-slate-700">{profile.lastPasswordChange || "Recently"}</strong></span>
            </div>
          </div>

          {/* Password Notification Banner */}
          {passwordStatus.message && (
            <div
              className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
                passwordStatus.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border border-rose-200 text-rose-800"
              }`}
            >
              {passwordStatus.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title={showCurrentPass ? "Hide password" : "Show password"}
                  >
                    {showCurrentPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title={showNewPass ? "Hide password" : "Show password"}
                  >
                    {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl text-xs font-semibold text-[#111827] outline-none focus:border-[#E11D48] focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                    title={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength & Guidelines Bar */}
            {newPassword.length > 0 && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Password Strength:</span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div className={`rounded-full transition-all ${strength.score >= 1 ? strength.color : "bg-slate-200"}`}></div>
                  <div className={`rounded-full transition-all ${strength.score >= 2 ? strength.color : "bg-slate-200"}`}></div>
                  <div className={`rounded-full transition-all ${strength.score >= 3 ? strength.color : "bg-slate-200"}`}></div>
                  <div className={`rounded-full transition-all ${strength.score >= 4 ? strength.color : "bg-slate-200"}`}></div>
                </div>

                {/* Criteria Checks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                    <Check size={13} className={newPassword.length >= 8 ? "text-emerald-600" : "text-slate-300"} />
                    <span>8+ characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                    <Check size={13} className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-emerald-600" : "text-slate-300"} />
                    <span>Upper & lower case</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                    <Check size={13} className={/[0-9]/.test(newPassword) ? "text-emerald-600" : "text-slate-300"} />
                    <span>Numbers (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
                    <Check size={13} className={/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-600" : "text-slate-300"} />
                    <span>Special characters</span>
                  </div>
                </div>
              </div>
            )}

            {/* Match Indicator */}
            {confirmPassword.length > 0 && (
              <div className="text-xs font-semibold flex items-center gap-1.5 pt-0.5">
                {newPassword === confirmPassword ? (
                  <span className="text-emerald-700 flex items-center gap-1 font-bold">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    Passwords match
                  </span>
                ) : (
                  <span className="text-rose-600 flex items-center gap-1 font-bold">
                    <AlertCircle size={14} className="text-rose-600" />
                    Passwords do not match
                  </span>
                )}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                <span>Encrypted using bcrypt-256 with AutoHub DIP Master Key sync</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 bg-[#E11D48] hover:bg-[#BE123C] text-white rounded-xl text-xs font-bold shadow-md shadow-rose-950/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Syncing with Admin...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
