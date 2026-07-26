const STATUS_STYLE = {
  menunggu: "bg-amber-100 text-amber-700",
  diproses: "bg-blue-100 text-blue-700",
  selesai: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABEL = {
  menunggu: "Menunggu",
  diproses: "Diproses",
  selesai: "Selesai",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[status] || "bg-slate-100 text-slate-600"}`}
    >
      {STATUS_LABEL[status] || status}
    </span>
  );
}
