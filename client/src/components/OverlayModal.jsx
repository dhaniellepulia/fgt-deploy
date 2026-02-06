import React, { useEffect } from "react";

export default function OverlayModal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative bg-[#1e1e1e] rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="bg-[#323232] py-3 px-4">
          <h3 className="text-[#F9B71E] font-bold text-lg">{title}</h3>
        </div>

        <div className="p-5 lg:p-10 text-gray-300">{children}</div>
      </div>
    </div>
  );
}
