"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPara, formatTarih } from "@/lib/format";

interface JournalLine {
  id: string;
  debit: number;
  credit: number;
  account: { code: string; name: string };
}

interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  description: string;
  status: string;
  lines: JournalLine[];
}

const columns: ColumnDef<JournalEntry, unknown>[] = [
  {
    accessorKey: "entryNo",
    header: "Fis No",
    cell: ({ row }) => (
      <Link
        href={`/finans/yevmiye/${row.original.id}`}
        className="text-fiori-blue hover:underline font-medium"
      >
        {row.original.entryNo}
      </Link>
    ),
  },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ getValue }) => formatTarih(getValue() as string),
  },
  {
    accessorKey: "description",
    header: "Aciklama",
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-700 max-w-xs truncate block">
        {getValue() as string}
      </span>
    ),
  },
  {
    id: "totalDebit",
    header: "Toplam Borc",
    cell: ({ row }) => {
      const total = row.original.lines.reduce(
        (sum, line) => sum + line.debit,
        0
      );
      return (
        <span className="font-medium">{formatPara(total)}</span>
      );
    },
  },
  {
    id: "lineCount",
    header: "Satir",
    cell: ({ row }) => (
      <span className="text-sm text-fiori-neutral">
        {row.original.lines.length} satir
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function YevmiyePage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finans/yevmiye")
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Yevmiye Kayitlari"
          description="Muhasebe yevmiye fisleri"
        />
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="animate-spin text-fiori-blue" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yevmiye Kayitlari"
        description="Muhasebe yevmiye fisleri"
      />
      <DataTable
        data={entries}
        columns={columns}
        searchPlaceholder="Fis no veya aciklama ara..."
      />
    </div>
  );
}
