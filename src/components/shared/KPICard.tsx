import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "blue" | "green" | "orange" | "red" | "neutral";
}

const colorMap = {
  blue: "bg-blue-50 text-fiori-blue",
  green: "bg-green-50 text-fiori-green",
  orange: "bg-orange-50 text-fiori-orange",
  red: "bg-red-50 text-fiori-red",
  neutral: "bg-gray-50 text-fiori-neutral",
};

export default function KPICard({ title, value, icon: Icon, trend, color = "blue" }: KPICardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-fiori-neutral mb-1">{title}</p>
          <p className="text-2xl font-bold text-shell">{value}</p>
          {trend && (
            <p className={cn("text-xs mt-2", trend.value >= 0 ? "text-fiori-green" : "text-fiori-red")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", colorMap[color])}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
