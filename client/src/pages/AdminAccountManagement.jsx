import React, { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "../components/layouts/TopBar";
import OverlayModal from "../components/OverlayModal";
import { countries } from "../data/countries";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../auth/AuthContext";
import { request, authHeaders } from "../api/http";

const fmt = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

const getCountryName = (code) => {
  if (!code) return "";
  const found = countries.find((c) => c.code === String(code).toUpperCase());
  return found ? found.name : code;
};

export default function AdminAccountManagement() {
  const [tab, setTab] = useState("playtester");
  const [playtesters, setPlaytesters] = useState([]);
  const [clients, setClients] = useState([]);

  const [sortBy, setSortBy] = useState("userID");
  const [direction, setDirection] = useState("asc");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    countryResidenceCode: "",
    password: "",
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);

  const [editCopy, setEditCopy] = useState(null);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const activeList = tab === "playtester" ? playtesters : clients;

  const { token } = useAuth();

  const loadUsers = async (role) => {
    try {
      const q = role === "client" ? "client" : "playtester";
      const json = await request(`/admin/users?role=${q}`, {
        headers: authHeaders(token),
      });
      const items = (json.items || []).map((u) => ({
        ...u,
        userID: u.userID,
      }));
      if (q === "client") setClients(items);
      else setPlaytesters(items);
    } catch (err) {
      console.error("loadUsers error", err.message || err);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadUsers(tab);
  }, [tab, token]);

  const sortedList = useMemo(() => {
    const arr = [...activeList];
    const cmp = (a, b) => {
      if (sortBy === "userID") return Number(a.userID) - Number(b.userID);
      if (sortBy === "country") {
        const A = getCountryName(a.countryResidenceCode).toLowerCase();
        const B = getCountryName(b.countryResidenceCode).toLowerCase();
        return A.localeCompare(B);
      }
      if (sortBy === "createdAt") {
        const da = (
          a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
        ).getTime();
        const db = (
          b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
        ).getTime();
        return da - db;
      }
      return 0;
    };
    arr.sort((a, b) => (direction === "asc" ? cmp(a, b) : -cmp(a, b)));
    return arr;
  }, [activeList, sortBy, direction]);

  const openRow = (user) => {
    setSelectedUser(user);
    setEditCopy({ ...user });
  };
  const closeEdit = () => {
    setSelectedUser(null);
    setEditCopy(null);
  };

  const saveEdit = async () => {
    if (!editCopy) return;
    try {
      const body = {
        email: editCopy.email,
        firstName: editCopy.firstName,
        lastName: editCopy.lastName,
        phoneNumber: editCopy.phoneNumber,
        countryResidenceCode: editCopy.countryResidenceCode,
        userStatusID: editCopy.userStatusID,
      };
      if (editCopy.password) body.password = editCopy.password;
      await request(`/admin/users/${editCopy.userID}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(body),
      });
      await loadUsers(tab);
      setSelectedUser(null);
      setEditCopy(null);
      setConfirmOpen(false);
      setConfirmPayload(null);
    } catch (err) {
      console.error("saveEdit error", err.message || err);
    }
  };

  const openAdd = () => {
    setAddForm({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      countryResidenceCode: "",
      password: "",
    });
    setIsAddOpen(true);
  };

  const createAccount = async () => {
    try {
      const payload = {
        role: tab === "client" ? "client" : "playtester",
        email: addForm.email,
        password: addForm.password,
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        phoneNumber: addForm.phoneNumber,
        countryResidenceCode: addForm.countryResidenceCode,
      };
      await request("/admin/users", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
      setIsAddOpen(false);
      await loadUsers(tab);
    } catch (err) {
      const msg = err?.message || "Failed to create account";
      setErrorMessage(msg);
      setErrorOpen(true);

      console.error("createAccount error", msg);
    }
  };

  const requestRemoveAccount = (userID, email) => {
    setConfirmPayload({ type: "remove", userID, email });
    setConfirmOpen(true);
  };

  const removeAccount = async (userID) => {
    try {
      await request(`/admin/users/${userID}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      await loadUsers(tab);
      closeEdit();
      setConfirmOpen(false);
      setConfirmPayload(null);
    } catch (err) {
      console.error("removeAccount error", err.message || err);
    }
  };

  const requestSaveEdit = () => {
    setConfirmPayload({ type: "save" });
    setConfirmOpen(true);
  };

  const requestCreateAccount = () => {
    setConfirmPayload({ type: "create", email: addForm.email || "" });
    setConfirmOpen(true);
  };
  return (
    <div className="min-h-screen">
      <header className="flex w-full item-start justify-start lg:items-center lg:justify-between flex-col-reverse lg:flex-row py-5 lg:py-15 py-15 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[#F9B71E] font-bold text-2xl">
            Account Management
          </h2>
        </div>
        <TopBar />
      </header>

      <div className="mb-5 flex gap-3">
        <button
          onClick={() => setTab("playtester")}
          className={`px-3 pb-2 text-sm ${tab === "playtester" ? "text-[#F9B71E] border-b-2 border-[#F9B71E]" : "text-gray-300"}`}
        >
          Playtester
        </button>
        <button
          onClick={() => setTab("client")}
          className={`px-3 pb-2 text-sm ${tab === "client" ? "text-[#F9B71E] border-b-2 border-[#F9B71E]" : "text-gray-300"}`}
        >
          Client
        </button>
      </div>
      <div className="rounded-xl bg-[#252525] p-8">
        <div className="flex items-center justify-start gap-6 mb-6">
          <h4 className="text-white text-xl font-bold">Accounts</h4>
        </div>

        <div className="flex flex-col-reverse lg:flex-row item-start justify-start lg:items-center lg:justify-between gap-3 mb-10">
          <div>
            <button
              onClick={openAdd}
              className=" bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded text-sm"
            >
              + Add a new {tab === "playtester" ? "Playtester" : "Client"}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-300">Sort by</label>
            <div className="relative inline-block">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 pr-8 focus:border-gray-600 focus:outline-0"
              >
                <option value="userID">User ID</option>
                <option value="country">Country (A → Z)</option>
                <option value="createdAt">Registered At</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F9B71E] pointer-events-none"
              />
            </div>

            <button
              onClick={() =>
                setDirection((d) => (d === "asc" ? "desc" : "asc"))
              }
              className="ml-2 p-2 bg-[#2a2a2a] rounded-md border border-gray-700 text-gray-300"
              title="Toggle sort direction"
            >
              {direction === "asc" ? (
                <ChevronUp size={16} className="text-[#F9B71E]" />
              ) : (
                <ChevronDown size={16} className="text-[#F9B71E]" />
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 px-4 mb-4 text-sm font-bold text-neutral-500 uppercase tracking-wide">
          <div className="col-span-1">User ID</div>
          <div className="col-span-4 px-4">Email Address</div>
          <div className="col-span-3">Country</div>
          <div className="col-span-4">Registered At</div>
        </div>

        <div className="space-y-2 overflow-x-scroll lg:overflow-hidden">
          <div className="space-y-2 w-max lg:w-full">
            {sortedList.map((u) => (
              <div
                key={u.userID}
                role="button"
                tabIndex={0}
                onClick={() => openRow(u)}
                onKeyDown={(e) => e.key === "Enter" && openRow(u)}
                className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F] cursor-pointer hover:shadow-lg hover:bg-gray-800"
              >
                <div className="col-span-1 p-4 border-r border-[#ffffff49] bg-[#323232] text-neutral-300 font-medium whitespace-nowrap rounded-bl-lg rounded-tl-lg ">
                  {u.userID}
                </div>

                <div className="col-span-4 p-4 border-neutral-700/50 text-neutral-300">
                  {u.email}
                </div>

                <div className="col-span-3 text-gray-300 text-sm">
                  {getCountryName(u.countryResidenceCode)}
                </div>

                <div className="col-span-4 text-gray-300 text-[12px]">
                  {fmt(u.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OverlayModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add ${tab === "playtester" ? "Playtester" : "Client"}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">Email</label>
              <input
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((s) => ({ ...s, email: e.target.value }))
                }
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Password</label>
              <input
                value={addForm.password}
                onChange={(e) =>
                  setAddForm((s) => ({ ...s, password: e.target.value }))
                }
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400">First name</label>
              <input
                value={addForm.firstName}
                onChange={(e) =>
                  setAddForm((s) => ({ ...s, firstName: e.target.value }))
                }
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Last name</label>
              <input
                value={addForm.lastName}
                onChange={(e) =>
                  setAddForm((s) => ({ ...s, lastName: e.target.value }))
                }
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Phone</label>
              <input
                value={addForm.phoneNumber}
                onChange={(e) =>
                  setAddForm((s) => ({ ...s, phoneNumber: e.target.value }))
                }
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400">Country</label>
              <select
                value={addForm.countryResidenceCode}
                onChange={(e) =>
                  setAddForm((s) => ({
                    ...s,
                    countryResidenceCode: e.target.value,
                  }))
                }
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              >
                <option value="">Select a country</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setIsAddOpen(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={requestCreateAccount}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
            >
              Create
            </button>
          </div>
        </div>
      </OverlayModal>

      {selectedUser && editCopy && (
        <OverlayModal
          isOpen={!!selectedUser}
          onClose={closeEdit}
          title="Account Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <div className="text-xs text-neutral-400">Email</div>
                <input
                  value={editCopy.email || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({ ...p, email: e.target.value }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>

              <div>
                {" "}
                <div className="text-xs text-neutral-400">Password</div>{" "}
                <input
                  value={editCopy.password || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Set new password"
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />{" "}
              </div>

              <div>
                <div className="text-xs text-neutral-400">First name</div>
                <input
                  value={editCopy.firstName || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>

              <div>
                <div className="text-xs text-neutral-400">Last name</div>
                <input
                  value={editCopy.lastName || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Phone</div>
                <input
                  value={editCopy.phoneNumber || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({ ...p, phoneNumber: e.target.value }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>
              <div>
                <div className="text-xs text-neutral-400">Country</div>
                <select
                  value={editCopy.countryResidenceCode || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({
                      ...p,
                      countryResidenceCode: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                >
                  <option value="">Select a country</option>
                  {countries.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Spoken Languages</div>
                <input
                  value={(editCopy.spokenLanguages || []).join(", ")}
                  onChange={(e) =>
                    setEditCopy((p) => ({
                      ...p,
                      spokenLanguages: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>

              <div>
                <div className="text-xs text-neutral-400">Experience Level</div>
                <input
                  value={editCopy.experienceLevel || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({
                      ...p,
                      experienceLevel: e.target.value,
                    }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>

              <div>
                <div className="text-xs text-neutral-400">Status ID</div>
                <input
                  type="number"
                  value={editCopy.userStatusID ?? 1}
                  onChange={(e) =>
                    setEditCopy((p) => ({
                      ...p,
                      userStatusID: Number(e.target.value),
                    }))
                  }
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
              </div>

              <div>
                <div className="text-xs text-neutral-400 mb-2">Registered</div>
                <div className="font-semibold text-white">
                  {fmt(editCopy.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-3 mt-4">
              <div>
                <button
                  onClick={() =>
                    requestRemoveAccount(editCopy.userID, editCopy.email)
                  }
                  className="px-3 py-2 bg-transparent border border-gray-700 text-red-400 rounded text-sm hover:bg-[#2a2a2a]"
                >
                  Remove
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeEdit}
                  className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={requestSaveEdit}
                  className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </OverlayModal>
      )}

      <OverlayModal
        isOpen={errorOpen}
        onClose={() => setErrorOpen(false)}
        title="Error"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-300">{errorMessage}</div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setErrorOpen(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </OverlayModal>

      <ConfirmDialog
        isOpen={confirmOpen}
        title={
          confirmPayload?.type === "remove"
            ? "Remove Account"
            : confirmPayload?.type === "save"
              ? "Save Changes"
              : confirmPayload?.type === "create"
                ? "Create Account"
                : "Confirm"
        }
        message={
          confirmPayload?.type === "remove"
            ? `Remove account ${confirmPayload.email}? This cannot be undone.`
            : confirmPayload?.type === "save"
              ? "Apply changes to this account?"
              : confirmPayload?.type === "create"
                ? `Create account ${confirmPayload.email || ""}?`
                : ""
        }
        confirmLabel={
          confirmPayload?.type === "remove"
            ? "Remove"
            : confirmPayload?.type === "create"
              ? "Create"
              : "Confirm"
        }
        danger={confirmPayload?.type === "remove"}
        onConfirm={() => {
          if (confirmPayload?.type === "remove") {
            removeAccount(confirmPayload.userID);
          } else if (confirmPayload?.type === "save") {
            saveEdit();
            setConfirmOpen(false);
            setConfirmPayload(null);
          } else if (confirmPayload?.type === "create") {
            createAccount();
            setConfirmOpen(false);
            setConfirmPayload(null);
          }
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmPayload(null);
        }}
      />
    </div>
  );
}
