"use client";

import { useEffect, useState } from "react";
import { formatPara } from "@/lib/format";
import { DURUM_ETIKETLERI } from "@/lib/constants";
import PageHeader from "@/components/shared/PageHeader";

interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  expectedCloseDate: string | null;
  contact: { firstName: string; lastName: string } | null;
}

const STAGES = ["ADAY", "NITELENDIRME", "TEKLIF", "MUZAKERE", "KAZANILDI", "KAYBEDILDI"];
const STAGE_COLORS: Record<string, string> = {
  ADAY: "border-t-gray-400",
  NITELENDIRME: "border-t-blue-400",
  TEKLIF: "border-t-indigo-400",
  MUZAKERE: "border-t-yellow-400",
  KAZANILDI: "border-t-green-500",
  KAYBEDILDI: "border-t-red-500",
};

export default function FirsatlarPage() {
  const [data, setData] = useState<Opportunity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", value: 0, stage: "ADAY", probability: 10, notes: "" });

  useEffect(() => { fetchData(); }, []);
  const fetchData = () => fetch("/api/crm/firsatlar").then((r) => r.json()).then(setData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/crm/firsatlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ title: "", value: 0, stage: "ADAY", probability: 10, notes: "" });
    fetchData();
  };

  const grouped = STAGES.reduce((acc, stage) => {
    acc[stage] = data.filter((o) => o.stage === stage);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fırsatlar"
        description="Satış fırsatları kanban görünümü"
        action={<button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Yeni Fırsat</button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Başlık *</label>
            <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Değer (TL)</label>
            <input type="number" className="input-field" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          </div>
          <div>
            <label className="label">Aşama</label>
            <select className="input-field" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{DURUM_ETIKETLERI[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Olasılık %</label>
            <input type="number" className="input-field" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })} />
          </div>
          <div className="md:col-span-2 flex items-end gap-3">
            <button type="submit" className="btn-primary">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div key={stage} className="min-w-[280px] flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-shell">{DURUM_ETIKETLERI[stage]}</h3>
              <span className="text-xs bg-gray-100 text-fiori-neutral px-2 py-0.5 rounded-full">
                {grouped[stage]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {grouped[stage]?.length === 0 ? (
                <div className="card p-4 text-center text-sm text-fiori-neutral border-dashed">
                  Fırsat yok
                </div>
              ) : (
                grouped[stage]?.map((opp) => (
                  <div key={opp.id} className={`card p-4 border-t-4 ${STAGE_COLORS[stage]}`}>
                    <h4 className="text-sm font-medium text-shell mb-2">{opp.title}</h4>
                    {opp.contact && (
                      <p className="text-xs text-fiori-neutral mb-2">
                        {opp.contact.firstName} {opp.contact.lastName}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-fiori-blue">{formatPara(opp.value)}</span>
                      <span className="text-xs text-fiori-neutral">{opp.probability}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
