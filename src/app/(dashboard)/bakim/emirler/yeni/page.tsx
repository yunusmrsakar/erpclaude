"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

interface Equipment {
  id: string;
  equipmentNo: string;
  name: string;
}

export default function YeniBakimEmriPage() {
  const router = useRouter();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    orderNo: "",
    equipmentId: "",
    type: "",
    priority: "",
    description: "",
    assignedTo: "",
    plannedDate: "",
    cost: 0,
    notes: "",
  });

  useEffect(() => {
    fetch("/api/bakim/ekipmanlar").then((r) => r.json()).then(setEquipments);
  }, []);

  const update = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/bakim/emirler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/bakim/emirler");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Bakım Emri" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Emir No *</label>
            <input
              className="input-field"
              value={form.orderNo}
              onChange={(e) => update("orderNo", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Ekipman *</label>
            <select
              className="input-field"
              value={form.equipmentId}
              onChange={(e) => update("equipmentId", e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              {equipments.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.equipmentNo} - {eq.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tür *</label>
            <select
              className="input-field"
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              <option value="PERIYODIK">Periyodik</option>
              <option value="ARIZA">Arıza</option>
              <option value="ONLEYICI">Önleyici</option>
            </select>
          </div>
          <div>
            <label className="label">Öncelik *</label>
            <select
              className="input-field"
              value={form.priority}
              onChange={(e) => update("priority", e.target.value)}
              required
            >
              <option value="">Seçiniz</option>
              <option value="DUSUK">Düşük</option>
              <option value="NORMAL">Normal</option>
              <option value="YUKSEK">Yüksek</option>
              <option value="ACIL">Acil</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Açıklama *</label>
            <textarea
              className="input-field"
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Atanan Kişi</label>
            <input
              className="input-field"
              value={form.assignedTo}
              onChange={(e) => update("assignedTo", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Planlanan Tarih *</label>
            <input
              type="date"
              className="input-field"
              value={form.plannedDate}
              onChange={(e) => update("plannedDate", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Maliyet</label>
            <input
              type="number"
              className="input-field"
              min={0}
              step={0.01}
              value={form.cost}
              onChange={(e) => update("cost", Number(e.target.value))}
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
            {submitting ? "Kaydediliyor..." : "Bakım Emri Oluştur"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
