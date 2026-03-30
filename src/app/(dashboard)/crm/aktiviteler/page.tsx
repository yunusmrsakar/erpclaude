"use client";

import { useEffect, useState } from "react";
import { Phone, Users, Mail, FileText, CheckCircle, Circle } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { formatTarihSaat } from "@/lib/format";
import { DURUM_ETIKETLERI } from "@/lib/constants";

interface Activity {
  id: string;
  type: string;
  subject: string;
  date: string;
  notes: string | null;
  isCompleted: boolean;
  contact: { firstName: string; lastName: string } | null;
  opportunity: { title: string } | null;
}

const TYPE_ICONS: Record<string, typeof Phone> = {
  ARAMA: Phone,
  TOPLANTI: Users,
  EMAIL: Mail,
  NOT: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  ARAMA: "bg-blue-100 text-fiori-blue",
  TOPLANTI: "bg-purple-100 text-purple-700",
  EMAIL: "bg-green-100 text-fiori-green",
  NOT: "bg-gray-100 text-fiori-neutral",
};

export default function AktivitelerPage() {
  const [data, setData] = useState<Activity[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "ARAMA", subject: "", date: new Date().toISOString().slice(0, 16), notes: "" });

  useEffect(() => { fetchData(); }, []);
  const fetchData = () => fetch("/api/crm/aktiviteler").then((r) => r.json()).then(setData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/crm/aktiviteler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ type: "ARAMA", subject: "", date: new Date().toISOString().slice(0, 16), notes: "" });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Aktiviteler"
        description="CRM aktivite takibi"
        action={<button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Yeni Aktivite</button>}
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Tür *</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="ARAMA">Arama</option>
              <option value="TOPLANTI">Toplantı</option>
              <option value="EMAIL">E-posta</option>
              <option value="NOT">Not</option>
            </select>
          </div>
          <div>
            <label className="label">Tarih *</label>
            <input type="datetime-local" className="input-field" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Konu *</label>
            <input className="input-field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notlar</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" className="btn-primary">Kaydet</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
          </div>
        </form>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="card p-12 text-center text-fiori-neutral">Henüz aktivite yok</div>
        ) : (
          data.map((a) => {
            const Icon = TYPE_ICONS[a.type] || FileText;
            return (
              <div key={a.id} className="card p-4 flex items-start gap-4">
                <div className={`p-2.5 rounded-lg ${TYPE_COLORS[a.type] || TYPE_COLORS.NOT}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-shell">{a.subject}</h3>
                    {a.isCompleted ? (
                      <CheckCircle size={16} className="text-fiori-green" />
                    ) : (
                      <Circle size={16} className="text-fiori-neutral" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-fiori-neutral">
                    <span>{DURUM_ETIKETLERI[a.type] || a.type}</span>
                    <span>{formatTarihSaat(a.date)}</span>
                    {a.contact && <span>{a.contact.firstName} {a.contact.lastName}</span>}
                    {a.opportunity && <span>→ {a.opportunity.title}</span>}
                  </div>
                  {a.notes && <p className="text-sm text-gray-600 mt-2">{a.notes}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
