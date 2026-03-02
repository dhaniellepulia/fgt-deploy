import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
} from "lucide-react";
import TopBar from "../components/layouts/TopBar.jsx";
import OverlayModal from "../components/OverlayModal.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import { useAuth } from "../auth/AuthContext";
import { request, authHeaders } from "../api/http";

const toInputDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

function ClientCommunity() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editCodeOpen, setEditCodeOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communityToDelete, setCommunityToDelete] = useState(null);
  const [selectedCode, setSelectedCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState("");
  const [membersMap, setMembersMap] = useState({});
  const [membersLoadingId, setMembersLoadingId] = useState(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersCommunity, setMembersCommunity] = useState(null);
  const [openActionMenuCommunityId, setOpenActionMenuCommunityId] =
    useState(null);
  const actionMenuRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    withInviteCode: true,
    codeMode: "random",
    inviteCode: "",
    maxUses: "",
    expiresAt: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });

  const [inviteForm, setInviteForm] = useState({
    codeMode: "random",
    inviteCode: "",
    maxUses: "",
    expiresAt: "",
  });
  const [editCodeForm, setEditCodeForm] = useState({
    isActive: true,
    maxUses: "",
    expiresAt: "",
  });

  async function loadCommunities() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await request("/communities/client/me", {
        headers: authHeaders(token),
      });
      const rows = Array.isArray(res.items)
        ? res.items
        : res.items
          ? [res.items]
          : [];
      setItems(rows);
    } catch (err) {
      setError(err.message || "Failed to load communities");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCommunities();
  }, [token]);

  useEffect(() => {
    if (!openActionMenuCommunityId) return;
    const onMouseDown = (e) => {
      if (!actionMenuRef.current?.contains(e.target)) {
        setOpenActionMenuCommunityId(null);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [openActionMenuCommunityId]);

  const sortedCommunities = useMemo(() => {
    const filtered = [...items].filter((item) => {
      if (filterStatus === "active") return Boolean(item.isActive);
      if (filterStatus === "inactive") return !item.isActive;
      return true;
    });

    const cmp = (a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "membersCount") {
        return Number(a.membersCount || 0) - Number(b.membersCount || 0);
      }
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return da - db;
    };

    filtered.sort((a, b) => (direction === "asc" ? cmp(a, b) : -cmp(a, b)));
    return filtered;
  }, [items, filterStatus, sortBy, direction]);

  const openEdit = (community) => {
    setOpenActionMenuCommunityId(null);
    setSelectedCommunity(community);
    setEditForm({
      name: community.name || "",
      description: community.description || "",
      isActive: Boolean(community.isActive),
    });
    setEditOpen(true);
  };

  const openInviteGenerator = (community) => {
    setOpenActionMenuCommunityId(null);
    setSelectedCommunity(community);
    setInviteForm({
      codeMode: "random",
      inviteCode: "",
      maxUses: "",
      expiresAt: "",
    });
    setInviteOpen(true);
  };

  const openEditInviteCode = (community, code) => {
    setSelectedCommunity(community);
    setSelectedCode(code);
    setEditCodeForm({
      isActive: Boolean(code.isActive),
      maxUses:
        code.maxUses === null || code.maxUses === undefined
          ? ""
          : String(code.maxUses),
      expiresAt: toInputDateTime(code.expiresAt),
    });
    setEditCodeOpen(true);
  };

  const toggleMembersPanel = async (community) => {
    const id = String(community.id);
    setMembersCommunity(community);
    setMembersOpen(true);
    setOpenActionMenuCommunityId(null);
    if (membersMap[id]) return;
    setMembersLoadingId(id);
    try {
      const res = await request(`/communities/client/${id}/members`, {
        headers: authHeaders(token),
      });
      const rows = Array.isArray(res.items)
        ? res.items
        : res.items
          ? [res.items]
          : [];
      setMembersMap((prev) => ({ ...prev, [id]: rows }));
    } catch (err) {
      setError(err.message || "Failed to load members");
      setMembersMap((prev) => ({ ...prev, [id]: [] }));
    } finally {
      setMembersLoadingId(null);
    }
  };

  const handleCreateCommunity = async () => {
    if (!token) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        generateRandomCode:
          createForm.withInviteCode && createForm.codeMode === "random",
        inviteCode:
          createForm.withInviteCode && createForm.codeMode === "custom"
            ? createForm.inviteCode.trim()
            : "",
        maxUses: createForm.withInviteCode
          ? createForm.maxUses === ""
            ? null
            : Number(createForm.maxUses)
          : null,
        expiresAt:
          createForm.withInviteCode && createForm.expiresAt
            ? new Date(createForm.expiresAt).toISOString()
            : null,
      };
      await request("/communities/client", {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
      setCreateOpen(false);
      setCreateForm({
        name: "",
        description: "",
        withInviteCode: true,
        codeMode: "random",
        inviteCode: "",
        maxUses: "",
        expiresAt: "",
      });
      setMessage("Community created successfully.");
      await loadCommunities();
    } catch (err) {
      setError(err.message || "Failed to create community");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCommunity = async () => {
    if (!token || !selectedCommunity) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await request(`/communities/client/${selectedCommunity.id}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          name: editForm.name.trim(),
          description: editForm.description.trim(),
          isActive: editForm.isActive,
        }),
      });
      setEditOpen(false);
      setSelectedCommunity(null);
      setMessage("Community updated.");
      await loadCommunities();
    } catch (err) {
      setError(err.message || "Failed to update community");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCommunity = async (community) => {
    if (!token) return;
    setOpenActionMenuCommunityId(null);
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await request(`/communities/client/${community.id}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      setMessage("Community deleted.");
      await loadCommunities();
    } catch (err) {
      setError(err.message || "Failed to delete community");
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteCommunity = (community) => {
    setOpenActionMenuCommunityId(null);
    setCommunityToDelete(community);
    setConfirmDeleteOpen(true);
  };

  const handleGenerateInviteCode = async () => {
    if (!token || !selectedCommunity) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        code:
          inviteForm.codeMode === "custom" ? inviteForm.inviteCode.trim() : "",
        maxUses: inviteForm.maxUses === "" ? null : Number(inviteForm.maxUses),
        expiresAt: inviteForm.expiresAt
          ? new Date(inviteForm.expiresAt).toISOString()
          : null,
      };
      await request(
        `/communities/client/${selectedCommunity.id}/invite-codes`,
        {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify(payload),
        },
      );
      setInviteOpen(false);
      setSelectedCommunity(null);
      setMessage("Invite code generated.");
      await loadCommunities();
    } catch (err) {
      setError(err.message || "Failed to create invite code");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateInviteCode = async () => {
    if (!token || !selectedCommunity || !selectedCode) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await request(
        `/communities/client/${selectedCommunity.id}/invite-codes/${selectedCode.id}`,
        {
          method: "PATCH",
          headers: authHeaders(token),
          body: JSON.stringify({
            isActive: editCodeForm.isActive,
            maxUses:
              editCodeForm.maxUses === "" ? null : Number(editCodeForm.maxUses),
            expiresAt: editCodeForm.expiresAt
              ? new Date(editCodeForm.expiresAt).toISOString()
              : null,
          }),
        },
      );
      setEditCodeOpen(false);
      setSelectedCode(null);
      setSelectedCommunity(null);
      setMessage("Invite code updated.");
      await loadCommunities();
    } catch (err) {
      setError(err.message || "Failed to update invite code");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyCode = async (codeValue) => {
    try {
      await navigator.clipboard.writeText(codeValue);
      setCopiedCode(codeValue);
      setTimeout(() => {
        setCopiedCode((prev) => (prev === codeValue ? "" : prev));
      }, 1200);
    } catch {
      setError("Failed to copy invite code");
    }
  };

  return (
    <div className="min-h-screen text-white">
      <header className="flex w-full item-start justify-start lg:items-center lg:justify-between flex-col-reverse lg:flex-row py-5 lg:py-15 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[#F9B71E] font-bold text-2xl">Community</h2>
        </div>
        <TopBar />
      </header>

      <section className="rounded-xl bg-[#252525] p-8 border border-[#ffffff22] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Manage Communities</h3>
            <p className="text-sm text-neutral-400 mt-1">
              Create communities and generate invite codes for playtesters.
            </p>
          </div>
          <button
            onClick={() => setCreateOpen(true)}
            className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
            disabled={saving}
          >
            New Community
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="text-sm text-gray-300 mr-1">Filter</label>
          <div className="relative inline-block">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 pr-8 focus:border-gray-600 focus:outline-0"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F9B71E] pointer-events-none"
            />
          </div>

          <label className="text-sm text-gray-300 ml-3 mr-1">Sort by</label>
          <div className="relative inline-block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-[#2a2a2a] border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-300 pr-8 focus:border-gray-600 focus:outline-0"
            >
              <option value="createdAt">Created</option>
              <option value="name">Name</option>
              <option value="membersCount">Members</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#F9B71E] pointer-events-none"
            />
          </div>
          <button
            onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))}
            className="ml-1 p-2 bg-[#2a2a2a] rounded-md border border-gray-700 text-gray-300"
            title="Toggle sort direction"
          >
            {direction === "asc" ? (
              <ChevronUp size={16} className="text-[#F9B71E]" />
            ) : (
              <ChevronDown size={16} className="text-[#F9B71E]" />
            )}
          </button>
        </div>

        {message ? <p className="text-sm text-green-400">{message}</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {loading ? (
          <p className="text-neutral-400">Loading communities...</p>
        ) : sortedCommunities.length === 0 ? (
          <p className="text-neutral-400">No communities created yet.</p>
        ) : (
          <div className="space-y-4">
            {sortedCommunities.map((community) => (
              <div
                key={community.id}
                className="rounded-lg border border-[#ffffff33] bg-[#1F1F1F] p-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white">
                        {community.name}
                      </h4>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          community.isActive
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400"
                        }`}
                      >
                        {community.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">
                      {community.description || "No description"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Members: {community.membersCount || 0}
                    </p>
                  </div>
                  <div className="relative" ref={actionMenuRef}>
                    <button
                      onClick={() =>
                        setOpenActionMenuCommunityId((prev) =>
                          prev === String(community.id)
                            ? null
                            : String(community.id),
                        )
                      }
                      className="p-2 rounded bg-[#2a2a2a] border border-gray-700 text-gray-300 hover:bg-[#333]"
                      title="Actions"
                      aria-label="Community actions"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openActionMenuCommunityId === String(community.id) ? (
                      <div className="absolute right-0 mt-2 w-44 bg-[#2a2a2a] border border-gray-700 rounded-md shadow-lg z-10 overflow-hidden">
                        <button
                          onClick={() => toggleMembersPanel(community)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#333]"
                        >
                          View Members
                        </button>
                        <button
                          onClick={() => openInviteGenerator(community)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#333]"
                        >
                          Generate Code
                        </button>
                        <button
                          onClick={() => openEdit(community)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-[#333]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requestDeleteCommunity(community)}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-600/10"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-neutral-400 mb-2">Invite Codes</p>
                  {(community.inviteCodes || []).length === 0 ? (
                    <p className="text-sm text-neutral-500">
                      No invite codes yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center px-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        <div className="md:col-span-2">Code</div>
                        <div>Used</div>
                        <div>Expires</div>
                        <div>Status</div>
                        <div className="md:text-right">Action</div>
                      </div>
                      {(community.inviteCodes || []).map((code) => {
                        const isExpired =
                          code.expiresAt &&
                          new Date(code.expiresAt).getTime() <= Date.now();
                        const statusLabel = isExpired
                          ? "Expired"
                          : code.isActive
                            ? "Active"
                            : "Disabled";
                        const statusClass = isExpired
                          ? "bg-yellow-600/20 text-yellow-400"
                          : code.isActive
                            ? "bg-green-600/20 text-green-400"
                            : "bg-red-600/20 text-red-400";
                        return (
                          <div
                            key={code.id}
                            className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center rounded border border-[#ffffff22] p-2"
                          >
                            <div className="font-mono text-sm text-[#F9B71E] md:col-span-2 flex items-center gap-2">
                              <span>{code.code}</span>
                              <button
                                onClick={() => handleCopyCode(code.code)}
                                className="p-1.5 rounded border border-gray-600 text-gray-300 hover:bg-[#2d2d2d]"
                                title="Copy code"
                                aria-label="Copy invite code"
                              >
                                {copiedCode === code.code ? (
                                  <Check size={12} />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                            <div className="text-xs text-neutral-400">
                              {code.usedCount}
                              {code.maxUses != null ? ` / ${code.maxUses}` : ""}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {code.expiresAt
                                ? new Date(code.expiresAt).toLocaleDateString()
                                : "No expiry"}
                            </div>
                            <div className="text-xs">
                              <span
                                className={`px-2 py-1 rounded ${statusClass}`}
                              >
                                {statusLabel}
                              </span>
                            </div>
                            <div className="md:text-right">
                              <button
                                onClick={() =>
                                  openEditInviteCode(community, code)
                                }
                                className="text-xs px-2 py-1 rounded bg-[#2a2a2a] border border-gray-700 text-gray-300 hover:bg-[#333]"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <OverlayModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Community"
      >
        <div className="space-y-4">
          <input
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Community name"
            className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <textarea
            value={createForm.description}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Description"
            className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={createForm.withInviteCode}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  withInviteCode: e.target.checked,
                }))
              }
            />
            Generate invite code now
          </label>

          {createForm.withInviteCode ? (
            <div className="space-y-3 border border-[#ffffff22] rounded-lg p-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={createForm.codeMode === "random"}
                    onChange={() =>
                      setCreateForm((prev) => ({ ...prev, codeMode: "random" }))
                    }
                  />
                  Random
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    checked={createForm.codeMode === "custom"}
                    onChange={() =>
                      setCreateForm((prev) => ({ ...prev, codeMode: "custom" }))
                    }
                  />
                  Custom
                </label>
              </div>
              {createForm.codeMode === "custom" ? (
                <input
                  value={createForm.inviteCode}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      inviteCode: e.target.value,
                    }))
                  }
                  placeholder="Custom code (A-Z 0-9 _ -)"
                  className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
                />
              ) : null}
              <input
                type="number"
                min="1"
                value={createForm.maxUses}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    maxUses: e.target.value,
                  }))
                }
                placeholder="Max uses (optional)"
                className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
              />
              <label className="block text-xs text-neutral-400">
                Expiration Date (optional)
              </label>
              <input
                type="datetime-local"
                value={createForm.expiresAt}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    expiresAt: e.target.value,
                  }))
                }
                className="bg-gray border border-gray-500 text-gray-200 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
              />
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setCreateOpen(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCommunity}
              disabled={saving}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Community"
      >
        <div className="space-y-4">
          <input
            value={editForm.name}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Community name"
            className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <textarea
            value={editForm.description}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Description"
            className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editForm.isActive}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active community
          </label>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditOpen(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateCommunity}
              disabled={saving}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Generate Invite Code"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={inviteForm.codeMode === "random"}
                onChange={() =>
                  setInviteForm((prev) => ({ ...prev, codeMode: "random" }))
                }
              />
              Random
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={inviteForm.codeMode === "custom"}
                onChange={() =>
                  setInviteForm((prev) => ({ ...prev, codeMode: "custom" }))
                }
              />
              Custom
            </label>
          </div>

          {inviteForm.codeMode === "custom" ? (
            <input
              value={inviteForm.inviteCode}
              onChange={(e) =>
                setInviteForm((prev) => ({
                  ...prev,
                  inviteCode: e.target.value,
                }))
              }
              placeholder="Custom code (A-Z 0-9 _ -)"
              className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
            />
          ) : null}

          <input
            type="number"
            min="1"
            value={inviteForm.maxUses}
            onChange={(e) =>
              setInviteForm((prev) => ({ ...prev, maxUses: e.target.value }))
            }
            placeholder="Max uses (optional)"
            className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <label className="block text-xs text-neutral-400">
            Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            value={inviteForm.expiresAt}
            onChange={(e) =>
              setInviteForm((prev) => ({ ...prev, expiresAt: e.target.value }))
            }
            className="bg-gray border border-gray-500 text-gray-200 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setInviteOpen(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateInviteCode}
              disabled={saving}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Generate"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        isOpen={editCodeOpen}
        onClose={() => setEditCodeOpen(false)}
        title={`Edit Invite Code${selectedCode?.code ? `: ${selectedCode.code}` : ""}`}
      >
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={editCodeForm.isActive}
              onChange={(e) =>
                setEditCodeForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
            />
            Active code
          </label>
          <input
            type="number"
            min="1"
            value={editCodeForm.maxUses}
            onChange={(e) =>
              setEditCodeForm((prev) => ({ ...prev, maxUses: e.target.value }))
            }
            placeholder="Max uses (optional)"
            className="bg-gray border border-gray-500 text-gray-200 placeholder-gray-400 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <label className="block text-xs text-neutral-400">
            Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            value={editCodeForm.expiresAt}
            onChange={(e) =>
              setEditCodeForm((prev) => ({
                ...prev,
                expiresAt: e.target.value,
              }))
            }
            className="bg-gray border border-gray-500 text-gray-200 focus:border-blue-400 transition-colors py-3 px-5 outline-none rounded-lg w-full"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setEditCodeOpen(false)}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateInviteCode}
              disabled={saving}
              className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </OverlayModal>

      <OverlayModal
        isOpen={membersOpen}
        onClose={() => {
          setMembersOpen(false);
          setMembersCommunity(null);
        }}
        title={`Members${membersCommunity?.name ? `: ${membersCommunity.name}` : ""}`}
      >
        <div className="space-y-3">
          {membersCommunity ? (
            membersLoadingId === String(membersCommunity.id) ? (
              <p className="text-sm text-neutral-500">Loading members...</p>
            ) : (membersMap[String(membersCommunity.id)] || []).length === 0 ? (
              <p className="text-sm text-neutral-500">No members yet.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 px-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-4">Email</div>
                  <div className="col-span-2">Code</div>
                  <div className="col-span-2">Joined</div>
                </div>
                {(membersMap[String(membersCommunity.id)] || []).map(
                  (member) => (
                    <div
                      key={member.id}
                      className="grid grid-cols-12 px-2 py-2 border border-[#ffffff1f] rounded text-sm"
                    >
                      <div className="col-span-4 text-neutral-200">
                        {member.name}
                      </div>
                      <div className="col-span-4 text-neutral-400">
                        {member.email || "-"}
                      </div>
                      <div className="col-span-2 text-neutral-400 font-mono text-xs">
                        {member.joinedByCode || "-"}
                      </div>
                      <div className="col-span-2 text-neutral-400 text-xs">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : "-"}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )
          ) : null}
          <div className="flex justify-end">
            <button
              onClick={() => {
                setMembersOpen(false);
                setMembersCommunity(null);
              }}
              className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </OverlayModal>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete Community"
        message={`Delete "${communityToDelete?.name || "this community"}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setCommunityToDelete(null);
        }}
        onConfirm={async () => {
          if (!communityToDelete) return;
          await handleDeleteCommunity(communityToDelete);
          setConfirmDeleteOpen(false);
          setCommunityToDelete(null);
        }}
      />
    </div>
  );
}

export default ClientCommunity;
