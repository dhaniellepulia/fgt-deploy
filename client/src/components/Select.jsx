import { useState, useRef, useEffect } from "react";

export default function Select({
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  const triggerChange = (val) => {
    onChange({
      target: {
        name,
        value: val,
      },
    });
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      <div
        onClick={() => setOpen(!open)}
        tabIndex={0}
        className="
          cursor-pointer
          transition

          flex items-center justify-between

                  bg-gray border border-gray-500 text-gray-200 placeholder-gray-300 focus:placeholder-gray-300 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg max-h-[46px] 
        "
      >
        <span>{selected?.label || placeholder}</span>
        <span className="text-xs opacity-60">▼</span>
      </div>

      {open && (
        <div className="absolute z-20 mt-0 w-full bg-[#353535] border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          {options.map((opt) => {
            const active = String(opt.value) === String(value);

            return (
              <div
                key={opt.value}
                onClick={() => triggerChange(opt.value)}
                className={`
                  px-4 py-2 cursor-pointer text-sm
                  transition
                  hover:bg-gray-800
                  ${active ? "bg-blue-500/20 text-blue-400" : "text-gray-200"}
                `}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
