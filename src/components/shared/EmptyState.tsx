import { Inbox } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description?: string;
  createHref?: string;
  createLabel?: string;
}

export default function EmptyState({ title, description, createHref, createLabel }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center py-16 px-4">
      <Inbox size={48} className="text-fiori-neutral/40 mb-4" />
      <h3 className="text-lg font-medium text-shell mb-1">{title}</h3>
      {description && <p className="text-sm text-fiori-neutral mb-4">{description}</p>}
      {createHref && (
        <Link href={createHref} className="btn-primary">
          {createLabel || "Yeni Ekle"}
        </Link>
      )}
    </div>
  );
}
