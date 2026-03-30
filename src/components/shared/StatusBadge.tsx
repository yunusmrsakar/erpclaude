import { DURUM_RENKLERI, DURUM_ETIKETLERI } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        DURUM_RENKLERI[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {DURUM_ETIKETLERI[status] || status}
    </span>
  );
}
