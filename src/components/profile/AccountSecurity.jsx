//page for Profile > Account & Security
import React from "react";
import { Check } from "lucide-react";

const loginHistory = [
  {
    id: 1,
    loggedIn: "1/1/26 11:39 AM",
    ipAddress: "103.129.125.139",
    browser:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.8.0 Safari/537.36",
  },
  {
    id: 2,
    loggedIn: "1/1/26 11:39 AM",
    ipAddress: "103.129.125.139",
    browser:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  },
  {
    id: 3,
    loggedIn: "1/1/26 11:39 AM",
    ipAddress: "103.129.125.139",
    browser:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.8.0 Safari/537.36",
  },
  {
    id: 4,
    loggedIn: "1/1/26 11:39 AM",
    ipAddress: "103.129.125.139",
    browser:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.8.0 Safari/537.36",
  },
];

function AccountSecurity() {
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
                <span className="text-white">dhaniellepulla@gmail.com</span>.
              </p>
              <button className="bg-[#eab308] hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors">
                Change Email
              </button>
              <div>
                <h2 className="text-white text-xl font-bold mb-2">Password</h2>
                <p className="text-sm text-neutral-400 mb-6">
                  Change the password for your account.
                </p>
                <button className="bg-[#eab308] hover:bg-yellow-500 font-bold py-2 px-6 rounded-lg transition-colors">
                  Change Password
                </button>
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
                    {log.loggedIn}
                  </div>
                  <div className="col-span-2 p-4  border-neutral-700/50 text-neutral-300">
                    {log.ipAddress}
                  </div>
                  <div className="col-span-2 p-4 border-neutral-700/50"></div>
                  <div
                    className={`col-span-6 p-4 truncate italic 
text-neutral-500
                  `}
                  >
                    {log.browser}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSecurity;
