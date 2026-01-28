export default function Card({ title, children, action }) {
  return (
    <div className="rounded-2xl bg-[#252525] p-8 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-2xl">{title}</h3>
        {action && action}
      </div>
      {children}
    </div>
  );
}
