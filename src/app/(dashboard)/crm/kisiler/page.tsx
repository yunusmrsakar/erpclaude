"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  type: string;
}

const columns: ColumnDef<Contact, unknown>[] = [
  { accessorKey: "name", header: "Ad Soyad", cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}` },
  { accessorKey: "company", header: "Firma", cell: ({ row }) => row.original.company || "-" },
  { accessorKey: "type", header: "Tür", cell: ({ row }) => <StatusBadge status={row.original.type} /> },
  { accessorKey: "email", header: "E-posta", cell: ({ row }) => row.original.email || "-" },
  { accessorKey: "phone", header: "Telefon", cell: ({ row }) => row.original.phone || "-" },
];

export default function KisilerPage() {
  const [data, setData] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", company: "", email: "", phone: "", type: "DIGER", notes: "" });

  useEffect(() => { fetchData(); }, []);
  const fetchData = () => fetch("/api/crm/kisiler").then((r) => r.json()).then(setData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/crm/kisiler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ firstName: "", lastName: "", company: "", email: "", phone: "", type: "DIGER", notes: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kişiler"
        description="CRM kişi yönetimi"
        action={<button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Yeni Kişi</button>}
      />
      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Ad *</label>
            <input className="input-field" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Soyad *</label>
            <input className="input-field" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </div>
          <div>
            <label className="label">Firma</label>
            <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
          </div>
          <div>
            <label className="label">Tür</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="MUSTERI">Müşteri</option>
              <option value="TEDARIKCI">Tedarikçi</option>
              <option value="DIGER">Diğer</option>
            </select>
          </div>
          <div>
            <label className="label">E-posta</label>
            <input className="input-field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Telefon</label>
            <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
          </div>
        </form>
      )}
      <DataTable data={data} columns={columns} searchPlaceholder="Kişi ara..." />
    </div>
  );
}
