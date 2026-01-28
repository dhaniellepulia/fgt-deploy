import React, { useState } from "react";
import { ChevronDown, Gamepad2 } from "lucide-react";

// Reusable Accordion Component
function Accordion({ question, answer, isOpen, onClick }) {
  return (
    <div className="mb-4 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-[#1a1a1a] font-bold text-lg">{question}</span>
        <ChevronDown
          className={`text-yellow-500 w-6 h-6 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`px-8 transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-40 pb-6 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-gray-600 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}
export default Accordion;
