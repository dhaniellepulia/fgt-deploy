//page for Profile > Account & Security
import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import * as authApi from "../../api/auth";
import OverlayModal from "../OverlayModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function AccountSecurity() {
  const { user, token, updateUser } = useAuth();
  const [loginHistory, setLoginHistory] = useState([]);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [emailSaving, setEmailSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: "", password: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    async function loadLoginActivity() {
      try {
        const res = await fetch(`${API_BASE}/users/me/login-activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const items = Array.isArray(data.items)
          ? data.items
          : data.items
            ? [data.items]
            : [];
        if (mounted) setLoginHistory(items);
      } catch {
        if (mounted) setLoginHistory([]);
      }
    }
    loadLoginActivity();
    return () => {
      mounted = false;
    };
  }, [token]);

  const displayEmail = user?.email || "Not set";
  const formatLoginTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  const submitEmailChange = async () => {
    if (!token) return;
    setEmailError("");
    setEmailMessage("");
    try {
      setEmailSaving(true);
      const payload = {
        newEmail: emailForm.newEmail.trim(),
        password: emailForm.password,
      };
      const res = await authApi.changeEmail(token, payload);
      if (res?.user) updateUser(res.user);
      setEmailMessage("Email updated successfully.");
      setEmailForm({ newEmail: "", password: "" });
      setShowEmailForm(false);
    } catch (err) {
      setEmailError(err.message || "Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  };

  const submitPasswordChange = async () => {
    if (!token) return;
    setPasswordError("");
    setPasswordMessage("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation do not match");
      return;
    }
    try {
      setPasswordSaving(true);
      await authApi.changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMessage("Password updated successfully.");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto">
      <div className="space-y-6">
        {/* Top Section: Email, Password, 2FA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Email Card */}
            <div className="bg-[#252525] p-8 rounded-2xl shadow-xl space-y-6">
              <h2 className="text-white text-xl font-bold mb-2">Email</h2>
              <p className="text-sm text-neutral-400 mb-6">
                Change the email for your account. Your current email is{" "}
                <span className="text-white">{displayEmail}</span>.
              </p>
              <button
                onClick={() => setShowEmailForm(true)}
                className="bg-[#eab308] hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Change Email
              </button>
              {emailMessage ? (
                <p className="text-sm text-green-400">{emailMessage}</p>
              ) : null}
              <div>
                <h2 className="text-white text-xl font-bold mb-2">Password</h2>
                <p className="text-sm text-neutral-400 mb-6">
                  Change the password for your account.
                </p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="bg-[#eab308] hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Change Password
                </button>
                {passwordMessage ? (
                  <p className="text-sm text-green-400 mt-2">
                    {passwordMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {/* 2FA Card */}
          <div className="bg-[#252525] p-8 rounded-2xl shadow-xl">
            <h2 className="text-white text-xl font-bold mb-2 leading-tight">
              Two-Factor Authentication (2FA)
            </h2>
            <p className="text-sm text-neutral-400 mb-8">
              Require an authentication code when you log in with an email and
              password.
            </p>
            <div className="border border-neutral-700 p-6 bg-[#1a1a1a]/50">
              <p className="text-xs text-neutral-500 mb-4">
                Receive a verification code to your email (enabled by default)
              </p>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center">
                  <Check size={14} className="text-black stroke-[3]" />
                </div>
                <span className="text-sm text-neutral-400">
                  Enable 2FA via Email
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Removal Section */}
        <div className="bg-[#252525] p-8 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-white text-xl font-bold mb-2">
              Account Removal
            </h2>
            <p className="text-sm text-[#B84F3D]">
              Please, keep in mind that this action can not be reverted and you
              will lose any existing progress.
            </p>
          </div>
          <button className="bg-[#c3503d] hover:bg-red-600 text-white font-bold py-2.5 px-8 rounded-lg transition-colors whitespace-nowrap">
            Remove My Account
          </button>
        </div>

        {/* Login Activity Section */}
        <div className="bg-[#252525] p-8 rounded-2xl shadow-xl overflow-x-scroll lg:overflow-hidden">
          <h2 className="text-white text-xl font-bold mb-8">Login Activity</h2>

          <div className="w-max lg:w-full">
            {/* Table Headers */}
            <div className="grid grid-cols-12 px-4 mb-4 text-sm font-bold text-neutral-500 uppercase tracking-wider">
              <div className="col-span-2">Logged In</div>
              <div className="col-span-2">IP Address</div>
              <div className="col-span-2">Current</div>
              <div className="col-span-6">Browser or App</div>
            </div>

            {/* Activity List */}
            <div className="space-y-2 ">
              {loginHistory.map((log) => (
                <div
                  key={log.id}
                  className={`grid grid-cols-12 items-center rounded-lg border border-[#ffffff49]  text-sm bg-[#1F1F1F]
                "bg-[#1a1a1a]"}`}
                >
                  <div className="col-span-2 p-4 border-r border-[#ffffff49] bg-[#323232] text-neutral-300 font-medium whitespace-nowrap">
                    {formatLoginTime(log.loggedInAt)}
                  </div>
                  <div className="col-span-2 p-4  border-neutral-700/50 text-neutral-300">
                    {log.ipAddress || "-"}
                  </div>
                  <div className="col-span-2 p-4 border-neutral-700/50 text-neutral-300">
                    {log.isCurrent ? "Current" : ""}
                  </div>
                  <div
                    className={`col-span-6 p-4 truncate italic 
text-neutral-500
                  `}
                  >
                    {log.userAgent || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <OverlayModal
        isOpen={showEmailForm}
        onClose={() => setShowEmailForm(false)}
        title="Change Email"
      >
        <div className="space-y-3">
          <input
            type="email"
            value={emailForm.newEmail}
            onChange={(e) =>
              setEmailForm((prev) => ({
                ...prev,
                newEmail: e.target.value,
              }))
            }
            placeholder="New email"
            className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
          />
          <input
            type="password"
            value={emailForm.password}
            onChange={(e) =>
              setEmailForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            placeholder="Current password"
            className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
          />
          {emailError ? (
            <p className="text-sm text-red-400">{emailError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowEmailForm(false)}
              className="rounded-md bg-neutral-700 px-4 py-2 text-sm text-white"
            >
              Cancel
            </button>
            <button
              onClick={submitEmailChange}
              disabled={emailSaving}
              className="bg-[#eab308] hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-60 text-white"
            >
              {emailSaving ? "Saving..." : "Update Email"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        isOpen={showPasswordForm}
        onClose={() => setShowPasswordForm(false)}
        title="Change Password"
      >
        <div className="space-y-3">
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="Current password"
            className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
          />
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="New password (min 8 chars)"
            className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
          />
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) =>
              setPasswordForm((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="Confirm new password"
            className="w-full bg-white text-black border border-neutral-700 rounded p-2.5 text-sm"
          />
          {passwordError ? (
            <p className="text-sm text-red-400">{passwordError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowPasswordForm(false)}
              className="rounded-md bg-neutral-700 px-4 py-2 text-sm text-white"
            >
              Cancel
            </button>
            <button
              onClick={submitPasswordChange}
              disabled={passwordSaving}
              className="bg-[#eab308] hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-60 text-white"
            >
              {passwordSaving ? "Saving..." : "Update Password"}
            </button>
          </div>
        </div>
      </OverlayModal>
    </div>
  );
}

export default AccountSecurity;
