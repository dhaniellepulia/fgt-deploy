import React from "react";
import { useNavigate } from "react-router-dom";

export default function Pending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl bg-[#252525] p-8 rounded">
        <h2 className="text-xl text-white font-bold mb-4">Account pending</h2>
        <p className="text-gray-300">
          Your account is pending approval. Please wait for the administrator to
          review your registration.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
