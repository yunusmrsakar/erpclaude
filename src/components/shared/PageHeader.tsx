import Link from "next/link";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  description,
  createHref,
  createLabel,
  action,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <h1 className="text-2xl font-bold text-shell">{title}</h1>
        {description && (
          <p className="text-sm text-fiori-neutral mt-1">{description}</p>
        )}
      </div>
      {createHref && (
        <Link href={createHref} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {createLabel || "Yeni Ekle"}
        </Link>
      )}
      {action}
    </div>
  );
}
