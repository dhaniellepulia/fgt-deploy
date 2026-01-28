function DownloadCard({ item }) {
  return (
    <div className="bg-[#252525] border border-neutral-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 hover:border-yellow-500/50 transition-all group">
      {/* Platform Icon */}
      <div className="mb-2 group-hover:scale-110 transition-transform duration-300">
        {item.icon}
      </div>

      {/* Text Info */}
      <div className="space-y-1">
        <h3 className="text-white font-bold text-lg">
          FGT for {item.platform}
        </h3>
        <p className="text-neutral-500 text-xs leading-tight px-4">
          {item.description}
        </p>
      </div>

      {/* Download Action */}
      <div className="pt-2">
        <button className="text-yellow-500 font-bold text-sm hover:underline uppercase tracking-wide">
          Download
        </button>
        <p className="text-neutral-500 text-[10px] mt-1 italic">
          ({item.version}, {item.size})
        </p>
      </div>
    </div>
  );
}

export default DownloadCard;
