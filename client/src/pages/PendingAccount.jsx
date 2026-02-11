import React from "react";

export default function Pending() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl bg-[#252525] p-8 rounded">
        <h2 className="text-xl text-white font-bold mb-4">Account pending</h2>
        <p className="text-gray-300">
          Your account is pending approval. Please wait for the administrator to
          review your registration.
        </p>
      </div>
    </div>
  );
}
