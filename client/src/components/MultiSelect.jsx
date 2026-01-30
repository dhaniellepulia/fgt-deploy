import { useState, useRef, useEffect } from "react";

export default function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options",
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

  const toggle = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const remove = (val) => {
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div ref={ref} className="relative w-full max-w-sm">
      <div
        onClick={() => setOpen(!open)}
        tabIndex={0}
        className="
          min-h-[44px]
          flex flex-wrap gap-2
          items-center
          cursor-pointer
          bg-gray border border-gray-500 text-gray-200 placeholder-gray-300 focus:placeholder-gray-300 focus:border-blue-400  focus:text-gray-200 transition-colors py-3 px-5 outline-none rounded-lg
        "
      >
        {value.length === 0 && (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}

        {value.map((val) => {
          const label = options.find((o) => o.value === val)?.label;

          return (
            <span
              key={val}
              className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                remove(val);
              }}
            >
              {label} ✕
            </span>
          );
        })}
      </div>

      {open && (
        <div
          className="
            absolute z-20 mt-0
            bg-[#353535] border border-gray-700
            rounded-lg shadow-lg
            max-h-56 overflow-auto 
          "
        >
          {options.map((opt) => {
            const selected = value.includes(opt.value);

            return (
              <div
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`
                  px-3 py-2 cursor-pointer
                  flex items-center gap-2 font-normal
                  hover:text-gray-100
                  hover:bg-gray-800
                  ${selected ? "bg-blue-500/10 text-blue-400" : "text-gray-200"}
                `}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={selected}
                  className="accent-blue-500"
                />
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
