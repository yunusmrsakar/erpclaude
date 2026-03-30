"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Calculator } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import { formatPara } from "@/lib/format";

interface Payroll {
  id: string;
  period: string;
  grossSalary: number;
  sgkEmployee: number;
  sgkEmployer: number;
  incomeTax: number;
  stampTax: number;
  netSalary: number;
  status: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNo: string;
  };
}

const columns: ColumnDef<Payroll, unknown>[] = [
  {
    id: "employee",
    header: "Çalışan",
    accessorFn: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-shell">
          {row.original.employee.firstName} {row.original.employee.lastName}
        </p>
        <p className="text-xs text-fiori-neutral">{row.original.employee.employeeNo}</p>
      </div>
    ),
  },
  {
    accessorKey: "grossSalary",
    header: "Brüt Maaş",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "sgkEmployee",
    header: "SGK (İşçi)",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "sgkEmployer",
    header: "SGK (İşveren)",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "incomeTax",
    header: "Gelir Vergisi",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "stampTax",
    header: "Damga Vergisi",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "netSalary",
    header: "Net Maaş",
    cell: ({ getValue }) => (
      <span className="font-semibold text-fiori-green">
        {formatPara(getValue() as number)}
      </span>
    ),
  },
];

const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

export default function BordroPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const period = `${year}-${String(month).padStart(2, "0")}`;

  const fetchPayrolls = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/ik/bordro?period=${period}`);
      const data = await res.json();
      setPayrolls(data);
      setFetched(true);
    } catch {
      setError("Bordro verileri yüklenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const generatePayrolls = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/ik/bordro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Bordro oluşturulurken hata oluştu.");
        return;
      }

      const data = await res.json();
      setPayrolls(data);
      setFetched(true);
    } catch {
      setError("Bordro oluşturulurken hata oluştu.");
    } finally {
      setGenerating(false);
    }
  };

  const totalGross = payrolls.reduce((sum, p) => sum + p.grossSalary, 0);
  const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalSgk = payrolls.reduce((sum, p) => sum + p.sgkEmployee + p.sgkEmployer, 0);
  const totalTax = payrolls.reduce((sum, p) => sum + p.incomeTax + p.stampTax, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bordro"
        description="Aylık bordro hesaplama ve yönetimi"
      />

      {/* Period Selection */}
      <div className="card p-5">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-shell mb-1">Yıl</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="input-field"
            >
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-shell mb-1">Ay</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="input-field"
            >
              {MONTHS.map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchPayrolls}
            disabled={loading}
            className="px-4 py-2 text-sm border border-fiori-border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Yükleniyor..." : "Görüntüle"}
          </button>
          <button
            onClick={generatePayrolls}
            disabled={generating}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            <Calculator size={16} />
            {generating ? "Hesaplanıyor..." : "Bordro Hesapla"}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {payrolls.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-fiori-neutral">Toplam Brüt</p>
            <p className="text-lg font-bold text-shell">{formatPara(totalGross)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-fiori-neutral">Toplam Net</p>
            <p className="text-lg font-bold text-fiori-green">{formatPara(totalNet)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-fiori-neutral">Toplam SGK</p>
            <p className="text-lg font-bold text-fiori-orange">{formatPara(totalSgk)}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-fiori-neutral">Toplam Vergi</p>
            <p className="text-lg font-bold text-fiori-red">{formatPara(totalTax)}</p>
          </div>
        </div>
      )}

      {/* Payroll Table */}
      {fetched && payrolls.length === 0 ? (
        <EmptyState
          title="Bu dönem için bordro bulunamadı"
          description="Seçili dönem için bordro oluşturmak üzere 'Bordro Hesapla' butonunu kullanın."
        />
      ) : payrolls.length > 0 ? (
        <DataTable
          data={payrolls}
          columns={columns}
          searchPlaceholder="Çalışan ara..."
        />
      ) : null}
    </div>
  );
}
