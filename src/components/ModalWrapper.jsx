import React from "react";
import TopBar from "./layouts/TopBar.jsx";

function ModalWrapper({
  children,
  title,
  step,
  totalSteps,
  prevStep,
  showFooter = true,
  nextLabel = "Next",
  onNext,
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center p-4">
      <header className="flex items-center justify-between py-15 gap-4">
        <div>
          <h3 className="text-[#F9B71E] font-bold text-2xl">Test</h3>
        </div>
        <TopBar />
      </header>
      <div className="w-full bg-[#1e1e1e] rounded-xl overflow-hidden ">
        <div className="bg-[#323232] py-4 text-center ">
          <h2 className="text-[#F9B71E] font-bold text-lg uppercase tracking-widest">
            Step {step}/{totalSteps}: {title}
          </h2>
        </div>
        <div className="p-10 min-h-[400px] bg-[#252525] flex flex-col justify-between">
          <div className="text-gray-300">{children}</div>

          {showFooter && (
            <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-800/50">
              {/* <button
                onClick={prevStep}
                className="bg-[#2a2a2a] hover:bg-[#333] px-8 py-2 rounded text-gray-400 text-sm"
              >
                Cancel
              </button> */}
              <button
                onClick={onNext}
                className="bg-gradient-to-r from-[#4183E8] to-[#284CC4] text-white px-10 py-2 rounded text-sm font-semibold transition-colors"
              >
                {nextLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalWrapper;
