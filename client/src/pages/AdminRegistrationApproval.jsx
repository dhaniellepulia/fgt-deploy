//Changes get saved only in state
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import TopBar from "../components/layouts/TopBar";
import OverlayModal from "../components/OverlayModal";
import { countries } from "../data/countries";
import ConfirmDialog from "../components/ConfirmDialog";

// Mockup users
const initialUsers = [
  {
    userID: 1,
    email: "sample1@gmail.com",
    passwordHash: "$2b$10$mockhash123",
    isEmailVerified: true,
    emailVerifiedAt: null,

    roleID: 1,
    userStatusID: 1,
    communitySettingID: 0,

    firstName: "John",
    lastName: "Cruz",
    phoneNumber: "+639171234567",
    discordID: "john#1234",
    platformLanguageID: 1,
    birthdate: new Date("1998-06-12"),
    countryOriginCode: "PH",
    countryResidenceCode: "PH",
    gender: "Male",
    spokenLanguages: ["English", "Filipino"],
    experienceLevel: "Intermediate",
    recentGameID: null,

    lastLoginAt: null,
    onboardingProfileCompleted: true,
    onboardingQuestionnaireCompleted: true,
    onboardingClientCompleted: true,

    createdAt: new Date("2026-01-10T08:00:00Z"),
    updatedAt: null,
    deletedAt: null,
  },

  {
    userID: 2,
    email: "sample2@gmail.com",
    passwordHash: "$2b$10$mockhash456",
    isEmailVerified: true,
    emailVerifiedAt: null,

    roleID: 2,
    userStatusID: 1,
    communitySettingID: 1,

    firstName: "Sara",
    lastName: "Lee",
    phoneNumber: "+639189876543",
    discordID: null,
    platformLanguageID: 1,
    birthdate: new Date("1993-04-02"),
    countryOriginCode: "KR",
    countryResidenceCode: "KR",
    gender: "Female",
    spokenLanguages: ["English", "Korean"],
    experienceLevel: "Advanced",
    recentGameID: null,

    lastLoginAt: null,
    onboardingProfileCompleted: true,
    onboardingQuestionnaireCompleted: true,
    onboardingClientCompleted: true,

    createdAt: new Date("2026-02-01T11:00:00Z"),
    updatedAt: null,
    deletedAt: null,
  },

  {
    userID: 3,
    email: "sample3@gmail.com",
    passwordHash: "$2b$10$mockhash789",
    isEmailVerified: false,
    emailVerifiedAt: null,

    roleID: 1,
    userStatusID: 2,
    communitySettingID: 0,

    firstName: "Hajime",
    lastName: "Isayama",
    phoneNumber: null,
    discordID: null,
    platformLanguageID: 2,
    birthdate: new Date("2002-10-25"),
    countryOriginCode: "JP",
    countryResidenceCode: "JP",
    gender: "Male",
    spokenLanguages: ["English", "Japanese"],
    experienceLevel: "Beginner",
    recentGameID: null,

    lastLoginAt: null,
    onboardingProfileCompleted: false,
    onboardingQuestionnaireCompleted: false,
    onboardingClientCompleted: false,

    createdAt: new Date("2026-01-25T06:10:00Z"),
    updatedAt: null,
    deletedAt: null,
  },

  {
    userID: 4,
    email: "sample4@gmail.com",
    passwordHash: "$2b$10$mockhash321",
    isEmailVerified: true,
    emailVerifiedAt: null,

    roleID: 1,
    userStatusID: 1,
    communitySettingID: 0,

    firstName: "Alex",
    lastName: "Tan",
    phoneNumber: "+639199112233",
    discordID: "alexdev#5678",
    platformLanguageID: 3,
    birthdate: new Date("1996-01-18"),
    countryOriginCode: "SG",
    countryResidenceCode: "KR",
    gender: "Non-binary",
    spokenLanguages: ["English", "Mandarin"],
    experienceLevel: "Expert",
    recentGameID: null,

    lastLoginAt: null,
    onboardingProfileCompleted: true,
    onboardingQuestionnaireCompleted: false,
    onboardingClientCompleted: true,

    createdAt: new Date("2025-12-01T14:00:00Z"),
    updatedAt: null,
    deletedAt: null,
  },

  {
    userID: 5,
    email: "sample5@gmail.com",
    passwordHash: "$2b$10$mockhash654",
    isEmailVerified: true,
    emailVerifiedAt: null,

    roleID: 1,
    userStatusID: 3,
    communitySettingID: 0,

    firstName: "Jamie",
    lastName: "Santos",
    phoneNumber: null,
    discordID: null,
    platformLanguageID: 1,
    birthdate: null,
    countryOriginCode: "PH",
    countryResidenceCode: "PH",
    gender: null,
    spokenLanguages: ["Filipino"],
    experienceLevel: "Intermediate",
    recentGameID: null,

    lastLoginAt: null,
    onboardingProfileCompleted: true,
    onboardingQuestionnaireCompleted: true,
    onboardingClientCompleted: true,

    createdAt: new Date("2026-01-20T06:50:00Z"),
    updatedAt: null,
    deletedAt: null,
  },
];

const getCountryName = (code) => {
  if (!code) return "";
  const found = countries.find((c) => c.code === String(code).toUpperCase());
  return found ? found.name : code;
};

const fmt = (v) => {
  if (!v) return "";
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
};

function AdminRegistrationApproval() {
  const [users, setUsers] = useState(initialUsers);
  const [sortBy, setSortBy] = useState("userID");
  const [direction, setDirection] = useState("asc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const sortedUsers = useMemo(() => {
    const arr = [...users];
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
  }, [users, sortBy, direction]);

  const openUser = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  const requestApproveUser = (userID, email) => {
    setConfirmPayload({ type: "approve", userID, email });
    setConfirmOpen(true);
  };

  const requestDisapproveUser = (userID, email) => {
    setConfirmPayload({ type: "disapprove", userID, email });
    setConfirmOpen(true);
  };

  const approveUser = (userID) => {
    setUsers((prev) =>
      prev.map((u) => (u.userID === userID ? { ...u, userStatusID: 1 } : u)),
    );
    setConfirmOpen(false);
    setConfirmPayload(null);
    closeModal();
  };

  const disapproveUser = (userID) => {
    setUsers((prev) =>
      prev.map((u) => (u.userID === userID ? { ...u, userStatusID: 3 } : u)),
    );
    setConfirmOpen(false);
    setConfirmPayload(null);
    closeModal();
  };

  return (
    <div className="min-h-screen">
      <header className="flex w-full item-start justify-start lg:items-center lg:justify-between flex-col-reverse lg:flex-row py-5 lg:py-15 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[#F9B71E] font-bold text-2xl">
            Registration Approval
          </h2>
        </div>
        <TopBar />
      </header>

      <div className="rounded-xl bg-[#252525] p-8">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-10 gap-3">
          <h4 className="text-white text-xl font-bold lg:mb-8">Accounts</h4>

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
                <option value="createdAt">Created At</option>
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
          <div className="col-span-4">Created At</div>
        </div>

        <div className="space-y-2 overflow-x-scroll lg:overflow-hidden">
          <div className="space-y-2 w-max lg:w-full">
            {sortedUsers.map((user) => (
              <div
                key={user.userID}
                role="button"
                tabIndex={0}
                onClick={() => openUser(user)}
                onKeyDown={(e) => e.key === "Enter" && openUser(user)}
                className="grid grid-cols-12 items-center rounded-lg border border-[#ffffff49] text-sm bg-[#1F1F1F] cursor-pointer hover:shadow-lg hover:bg-gray-800"
              >
                <div className="col-span-1 p-4 border-r border-[#ffffff49] bg-[#323232] text-neutral-300 font-medium whitespace-nowrap rounded-bl-lg rounded-tl-lg ">
                  {user.userID}
                </div>

                <div className="col-span-4 p-4 border-neutral-700/50 text-neutral-300">
                  {user.email}
                </div>

                <div className="col-span-3 text-gray-300 text-sm">
                  {getCountryName(user.countryResidenceCode)}
                </div>

                <div className="col-span-4 text-gray-300 text-[12px]">
                  {fmt(user.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedUser && (
        <OverlayModal
          isOpen={!!selectedUser}
          onClose={closeModal}
          title="User Details"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-gray-300">
              <div>
                <div className="text-xs text-neutral-400">Name</div>
                <div className="font-semibold text-white">{`${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`}</div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Email</div>
                <div className="font-semibold text-white">
                  {selectedUser.email}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Phone</div>
                <div className="font-semibold text-white">
                  {selectedUser.phoneNumber || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Discord</div>
                <div className="font-semibold text-white">
                  {selectedUser.discordID || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Country</div>
                <div className="font-semibold text-white">
                  {getCountryName(selectedUser.countryResidenceCode)}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Experience Level</div>
                <div className="font-semibold text-white">
                  {selectedUser.experienceLevel || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Spoken Language</div>
                <div className="font-semibold text-white">
                  <span>{selectedUser.spokenLanguages?.join(", ")}</span>
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Onboarding</div>
                <div className="font-semibold text-white">
                  Profile:{" "}
                  {selectedUser.onboardingProfileCompleted ? "Yes" : "No"},
                  Questionnaire:{" "}
                  {selectedUser.onboardingQuestionnaireCompleted ? "Yes" : "No"}
                  , Client:{" "}
                  {selectedUser.onboardingClientCompleted ? "Yes" : "No"}
                </div>
              </div>

              <div>
                <div className="text-xs text-neutral-400">Created At</div>
                <div className="font-semibold text-white">
                  {fmt(selectedUser.createdAt)}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-3 mt-6">
              <div>
                <button
                  onClick={() =>
                    requestDisapproveUser(
                      selectedUser.userID,
                      selectedUser.email,
                    )
                  }
                  className="px-4 py-2 bg-transparent border border-gray-700 text-red-400 rounded hover:bg-[#2a2a2a]"
                >
                  Disapprove
                </button>
              </div>

              <div className=" flex gap-3">
                <button
                  onClick={closeModal}
                  className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={() =>
                    requestApproveUser(selectedUser.userID, selectedUser.email)
                  }
                  className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
                >
                  Approve User
                </button>
              </div>
            </div>
          </div>
        </OverlayModal>
      )}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={
          confirmPayload?.type === "disapprove"
            ? "Disapprove User"
            : confirmPayload?.type === "approve"
              ? "Approve User"
              : "Confirm"
        }
        message={
          confirmPayload?.type === "disapprove"
            ? `Disapprove account ${confirmPayload.email}?`
            : confirmPayload?.type === "approve"
              ? `Approve account ${confirmPayload.email}?`
              : ""
        }
        confirmLabel={
          confirmPayload?.type === "disapprove" ? "Disapprove" : "Approve"
        }
        danger={confirmPayload?.type === "disapprove"}
        onConfirm={() => {
          if (confirmPayload?.type === "disapprove") {
            disapproveUser(confirmPayload.userID);
          } else if (confirmPayload?.type === "approve") {
            approveUser(confirmPayload.userID);
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

export default AdminRegistrationApproval;
