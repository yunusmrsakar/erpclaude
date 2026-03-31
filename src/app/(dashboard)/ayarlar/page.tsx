"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { Building2, FileText, Package, Factory, Settings as SettingsIcon } from "lucide-react";

const GROUPS = [
  { key: "GENEL", label: "Genel", icon: SettingsIcon },
  { key: "FIRMA", label: "Firma Bilgileri", icon: Building2 },
  { key: "FATURA", label: "Fatura Ayarlari", icon: FileText },
  { key: "STOK", label: "Stok Ayarlari", icon: Package },
  { key: "URETIM", label: "Uretim Ayarlari", icon: Factory },
];

interface Setting { id: string; key: string; value: string; group: string; }

export default function AyarlarPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [activeGroup, setActiveGroup] = useState("GENEL");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => { fetch("/api/ayarlar").then(r => r.json()).then(setSettings); }, []);

  const groupSettings = settings.filter(s => s.group === activeGroup);

  const handleSave = async (key: string, value: string) => {
    await fetch("/api/ayarlar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value, group: activeGroup }),
    });
    // refresh
    const updated = await fetch("/api/ayarlar").then(r => r.json());
    setSettings(updated);
  };

  const handleAdd = async () => {
    if (!newKey || !newValue) return;
    await handleSave(newKey, newValue);
    setNewKey("");
    setNewValue("");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Ayarlar" description="Sistem yapilandirma ve tercihler" />
      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-56 flex-shrink-0">
          <div className="card p-2">
            {GROUPS.map(g => {
              const Icon = g.icon;
              return (
                <button key={g.key} onClick={() => setActiveGroup(g.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeGroup === g.key ? "bg-fiori-blue/10 text-fiori-blue font-medium" : "text-fiori-neutral hover:bg-gray-50"}`}>
                  <Icon size={18} />
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Content */}
        <div className="flex-1">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-shell mb-4">{GROUPS.find(g => g.key === activeGroup)?.label}</h2>
            <div className="space-y-4">
              {groupSettings.map(s => (
                <div key={s.id} className="flex items-center gap-4">
                  <label className="w-48 text-sm font-medium text-shell">{s.key}</label>
                  <input className="input-field flex-1" defaultValue={s.value}
                    onBlur={(e) => { if (e.target.value !== s.value) handleSave(s.key, e.target.value); }} />
                </div>
              ))}
              {groupSettings.length === 0 && <p className="text-fiori-neutral text-sm">Bu grupta henuz ayar yok.</p>}
              {/* Add new */}
              <div className="border-t border-fiori-border pt-4 mt-4">
                <h3 className="text-sm font-medium text-shell mb-3">Yeni Ayar Ekle</h3>
                <div className="flex items-center gap-4">
                  <input className="input-field w-48" placeholder="Anahtar" value={newKey} onChange={e => setNewKey(e.target.value)} />
                  <input className="input-field flex-1" placeholder="Deger" value={newValue} onChange={e => setNewValue(e.target.value)} />
                  <button onClick={handleAdd} className="btn-primary">Ekle</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
