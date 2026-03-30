"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";

interface Supplier {
  id: string;
  code: string;
  name: string;
  taxNumber: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

const columns: ColumnDef<Supplier, unknown>[] = [
  { accessorKey: "code", header: "Kod" },
  { accessorKey: "name", header: "Firma Adı" },
  { accessorKey: "city", header: "Şehir", cell: ({ row }) => row.original.city || "-" },
  { accessorKey: "phone", header: "Telefon", cell: ({ row }) => row.original.phone || "-" },
  { accessorKey: "email", header: "E-posta", cell: ({ row }) => row.original.email || "-" },
  {
    accessorKey: "isActive",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.original.isActive ? "AKTIF" : "PASIF"} />,
  },
];

export default function TedarikciPage() {
  const [data, setData] = useState<Supplier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", taxNumber: "", taxOffice: "", address: "", city: "", phone: "", email: "", contactPerson: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    fetch("/api/satin-alma/tedarikciler").then((r) => r.json()).then(setData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/satin-alma/tedarikciler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ code: "", name: "", taxNumber: "", taxOffice: "", address: "", city: "", phone: "", email: "", contactPerson: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tedarikçiler"
        description="Tedarikçi yönetimi"
        action={
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            + Yeni Tedarikçi
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tedarikçi Kodu *</label>
            <input className="input-field" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          </div>
          <div>
            <label className="label">Firma Adı *</label>
            <input className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Vergi Numarası</label>
            <input className="input-field" value={form.taxNumber} onChange={(e) => setForm({ ...form, taxNumber: e.target.value })} />
          </div>
          <div>
            <label className="label">Vergi Dairesi</label>
            <input className="input-field" value={form.taxOffice} onChange={(e) => setForm({ ...form, taxOffice: e.target.value })} />
          </div>
          <div>
            <label className="label">Şehir</label>
            <input className="input-field" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">E-posta</label>
            <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">İlgili Kişi</label>
            <input className="input-field" value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Adres</label>
            <input className="input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
          </div>
        </form>
      )}

      <DataTable data={data} columns={columns} searchPlaceholder="Tedarikçi ara..." />
    </div>
  );
}
