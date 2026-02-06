import React from "react";
import OverlayModal from "./OverlayModal";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm",
  message = "",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  return (
    <OverlayModal isOpen={!!isOpen} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <div className="text-sm text-gray-300">{message}</div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="bg-[#2a2a2a] px-4 py-2 rounded text-gray-300"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            className={
              danger
                ? "px-4 py-2 rounded text-white bg-transparent border border-red-500 text-red-400 hover:bg-[#3a1a1a]"
                : "bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-4 py-2 rounded font-semibold"
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
}
