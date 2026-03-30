"use client";

import { useEffect, useState } from "react";
import { ChevronRight, ChevronDown, Plus, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { formatPara } from "@/lib/format";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  isActive: boolean;
  balance: number;
  children: Account[];
}

const HESAP_TURLERI: Record<string, string> = {
  VARLIK: "Varlık",
  KAYNAK: "Kaynak",
  GELIR: "Gelir",
  GIDER: "Gider",
  OZKAYNAK: "Özkaynak",
};

const HESAP_TUR_RENKLERI: Record<string, string> = {
  VARLIK: "bg-blue-100 text-blue-800",
  KAYNAK: "bg-purple-100 text-purple-800",
  GELIR: "bg-green-100 text-green-800",
  GIDER: "bg-red-100 text-red-800",
  OZKAYNAK: "bg-indigo-100 text-indigo-800",
};

function AccountRow({
  account,
  level,
}: {
  account: Account;
  level: number;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = account.children && account.children.length > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div
            className="flex items-center gap-1"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-0.5 rounded hover:bg-gray-200 transition-colors"
              >
                {expanded ? (
                  <ChevronDown size={16} className="text-fiori-neutral" />
                ) : (
                  <ChevronRight size={16} className="text-fiori-neutral" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className="font-mono text-sm font-medium text-shell">
              {account.code}
            </span>
          </div>
        </td>
        <td className="px-4 py-3">
          <span
            className={`text-sm ${hasChildren ? "font-semibold text-shell" : "text-gray-700"}`}
          >
            {account.name}
          </span>
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${HESAP_TUR_RENKLERI[account.type] || "bg-gray-100 text-gray-800"}`}
          >
            {HESAP_TURLERI[account.type] || account.type}
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <span className="text-sm font-medium text-shell">
            {formatPara(account.balance)}
          </span>
        </td>
      </tr>
      {expanded &&
        hasChildren &&
        account.children.map((child) => (
          <AccountRow key={child.id} account={child} level={level + 1} />
        ))}
    </>
  );
}

export default function HesapPlaniPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "VARLIK",
    parentId: "",
  });
  const [allAccounts, setAllAccounts] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAccounts = () => {
    setLoading(true);
    fetch("/api/finans/hesaplar")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data);
        // Tum hesaplari duz liste olarak cikar (parent secimi icin)
        const flat: { id: string; code: string; name: string }[] = [];
        const flatten = (items: Account[]) => {
          items.forEach((item) => {
            flat.push({ id: item.id, code: item.code, name: item.name });
            if (item.children) flatten(item.children);
          });
        };
        flatten(data);
        setAllAccounts(flat);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/finans/hesaplar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parentId: formData.parentId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu");
        return;
      }

      setFormData({ code: "", name: "", type: "VARLIK", parentId: "" });
      setShowForm(false);
      loadAccounts();
    } catch {
      setError("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Hesap Planı"
          description="Muhasebe hesap planı ağaç yapısı"
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
        title="Hesap Planı"
        description="Muhasebe hesap planı ağaç yapısı"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Yeni Hesap
          </button>
        }
      />

      {/* Yeni Hesap Formu */}
      {showForm && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-shell mb-4">
            Yeni Hesap Ekle
          </h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="label">Hesap Kodu</label>
              <input
                type="text"
                className="input-field"
                placeholder="100"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Hesap Adı</label>
              <input
                type="text"
                className="input-field"
                placeholder="Kasa"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="label">Hesap Türü</label>
              <select
                className="input-field"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                {Object.entries(HESAP_TURLERI).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Ust Hesap</label>
              <select
                className="input-field"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
              >
                <option value="">Ana Hesap (Ust hesap yok)</option>
                {allAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Kaydet
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary"
              >
                Iptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Hesap Plani Tablosu */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">Hesap Kodu</th>
                <th className="px-4 py-3 text-left">Hesap Adı</th>
                <th className="px-4 py-3 text-left">Turu</th>
                <th className="px-4 py-3 text-right">Bakiye</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-12 text-fiori-neutral"
                  >
                    Henuz hesap tanımlanmamış
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <AccountRow
                    key={account.id}
                    account={account}
                    level={0}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
