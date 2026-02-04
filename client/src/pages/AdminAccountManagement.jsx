import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "../components/layouts/TopBar";
import OverlayModal from "../components/OverlayModal";
import { countries } from "../data/countries";

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

// Mock data (shaped like User model fields)
const initialPlaytesters = [
  {
    userID: 1,
    email: "tester1@example.com",
    roleID: 2,
    userStatusID: 1,
    firstName: "Ana",
    lastName: "Reyes",
    phoneNumber: "+639171234567",
    countryResidenceCode: "PH",
    spokenLanguages: ["English", "Filipino"],
    experienceLevel: "Intermediate",
    createdAt: new Date("2026-02-02T10:25:00Z"),
  },
  {
    userID: 2,
    email: "tester2@example.com",
    roleID: 2,
    userStatusID: 1,
    firstName: "Min",
    lastName: "Park",
    phoneNumber: "+821012345678",
    countryResidenceCode: "KR",
    spokenLanguages: ["Korean", "English"],
    experienceLevel: "Advanced",
    createdAt: new Date("2026-02-02T08:25:00Z"),
  },
  {
    userID: 3,
    email: "tester3@example.com",
    roleID: 2,
    userStatusID: 1,
    firstName: "Hiro",
    lastName: "Sato",
    phoneNumber: null,
    countryResidenceCode: "JP",
    spokenLanguages: ["Japanese"],
    experienceLevel: "Beginner",
    createdAt: new Date("2026-01-24T13:25:00Z"),
  },
  {
    userID: 4,
    email: "tester4@example.com",
    roleID: 2,
    userStatusID: 1,
    firstName: "Li",
    lastName: "Wang",
    phoneNumber: null,
    countryResidenceCode: "CN",
    spokenLanguages: ["Mandarin"],
    experienceLevel: "Intermediate",
    createdAt: new Date("2026-01-15T07:25:00Z"),
  },
];

const initialClients = [
  {
    userID: 101,
    email: "client1@example.com",
    roleID: 3,
    userStatusID: 1,
    firstName: "Studio",
    lastName: "Aurora",
    phoneNumber: "+442071234567",
    countryResidenceCode: "GB",
    spokenLanguages: ["English"],
    experienceLevel: "N/A",
    createdAt: new Date("2026-01-10T09:00:00Z"),
  },
  {
    userID: 102,
    email: "client2@example.com",
    roleID: 3,
    userStatusID: 1,
    firstName: "Nebula",
    lastName: "Games",
    phoneNumber: null,
    countryResidenceCode: "US",
    spokenLanguages: ["English"],
    experienceLevel: "N/A",
    createdAt: new Date("2026-01-20T11:10:00Z"),
  },
];

export default function AdminAccountManagement() {
  const [tab, setTab] = useState("playtester"); // playtester | client
  const [playtesters, setPlaytesters] = useState(initialPlaytesters);
  const [clients, setClients] = useState(initialClients);

  const [sortBy, setSortBy] = useState("userID");
  const [direction, setDirection] = useState("asc");

  const [selectedUser, setSelectedUser] = useState(null); // user object for edit
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    countryResidenceCode: "",
  });

  // For edit modal we keep an editable copy
  const [editCopy, setEditCopy] = useState(null);

  const activeList = tab === "playtester" ? playtesters : clients;

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

  const saveEdit = () => {
    if (!editCopy) return;
    const updater = tab === "playtester" ? setPlaytesters : setClients;
    updater((prev) =>
      prev.map((u) => (u.userID === editCopy.userID ? { ...editCopy } : u)),
    );
    setSelectedUser(editCopy);
    setEditCopy({ ...editCopy });
  };

  const openAdd = () => {
    setAddForm({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      countryResidenceCode: "",
    });
    setIsAddOpen(true);
  };

  const createAccount = () => {
    const list = tab === "playtester" ? playtesters : clients;
    const nextID = Math.max(...list.map((u) => Number(u.userID)), 0) + 1;
    const newUser = {
      userID: nextID,
      email: addForm.email || `user${nextID}@example.com`,
      roleID: tab === "playtester" ? 2 : 3,
      userStatusID: 1,
      firstName: addForm.firstName || "",
      lastName: addForm.lastName || "",
      phoneNumber: addForm.phoneNumber || "",
      countryResidenceCode: addForm.countryResidenceCode || "",
      spokenLanguages: [],
      experienceLevel: "",
      createdAt: new Date(),
    };
    if (tab === "playtester") setPlaytesters((p) => [newUser, ...p]);
    else setClients((c) => [newUser, ...c]);
    setIsAddOpen(false);
  };

  const removeAccount = (userID) => {
    if (!confirm("Remove this account from list?")) return;
    if (tab === "playtester")
      setPlaytesters((p) => p.filter((u) => u.userID !== userID));
    else setClients((c) => c.filter((u) => u.userID !== userID));
    closeEdit();
  };

  return (
    <div className="min-h-screen">
      <header className="flex w-full items-center justify-between py-6 gap-4">
        <div>
          <h2 className="text-[#F9B71E] font-bold text-2xl">
            Account Management
          </h2>
        </div>
        <TopBar />
      </header>

      <div className="rounded-xl bg-[#252525] p-6">
        <div className="flex items-center justify-start gap-6 mb-6">
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
          <div className="flex-1" />
          <button
            onClick={openAdd}
            className="ml-2 bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded text-sm"
          >
            + Add a new {tab === "playtester" ? "Playtester" : "Client"}
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white text-xl font-bold">Accounts</h4>

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

        <div className="space-y-2">
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

      {/* Add Account Modal */}
      <OverlayModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={`Add ${tab === "playtester" ? "Playtester" : "Client"}`}
      >
        <div className="space-y-4">
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
              <label className="text-xs text-neutral-400">Country Code</label>
              <input
                value={addForm.countryResidenceCode}
                onChange={(e) =>
                  setAddForm((s) => ({
                    ...s,
                    countryResidenceCode: e.target.value,
                  }))
                }
                placeholder="e.g. PH, US"
                className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
              />
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
              onClick={createAccount}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
            >
              Create
            </button>
          </div>
        </div>
      </OverlayModal>

      {/* Edit / Details Modal */}
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
                <div className="text-xs text-neutral-400">Country</div>
                <input
                  value={editCopy.countryResidenceCode || ""}
                  onChange={(e) =>
                    setEditCopy((p) => ({
                      ...p,
                      countryResidenceCode: e.target.value,
                    }))
                  }
                  placeholder="Country code"
                  className="w-full mt-1 p-2 bg-[#1e1e1e] border border-gray-700 rounded text-gray-300"
                />
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
                <div className="text-xs text-neutral-400">Registered</div>
                <div className="font-semibold text-white">
                  {fmt(editCopy.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-3 mt-4">
              <div>
                <button
                  onClick={() => removeAccount(editCopy.userID)}
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
                  onClick={saveEdit}
                  className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </OverlayModal>
      )}
    </div>
  );
}
