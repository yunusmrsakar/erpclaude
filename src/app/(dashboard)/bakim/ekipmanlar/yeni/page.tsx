"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

export default function YeniEkipmanPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    equipmentNo: "",
    name: "",
    location: "",
    manufacturer: "",
    model: "",
    serialNo: "",
    installDate: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/bakim/ekipmanlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/bakim/ekipmanlar");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Ekipman" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Ekipman No *</label>
            <input
              className="input-field"
              value={form.equipmentNo}
              onChange={(e) => update("equipmentNo", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Ekipman Adı *</label>
            <input
              className="input-field"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Konum</label>
            <input
              className="input-field"
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Üretici</label>
            <input
              className="input-field"
              value={form.manufacturer}
              onChange={(e) => update("manufacturer", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Model</label>
            <input
              className="input-field"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Seri No</label>
            <input
              className="input-field"
              value={form.serialNo}
              onChange={(e) => update("serialNo", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Kurulum Tarihi</label>
            <input
              type="date"
              className="input-field"
              value={form.installDate}
              onChange={(e) => update("installDate", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notlar</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Kaydediliyor..." : "Ekipman Oluştur"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
