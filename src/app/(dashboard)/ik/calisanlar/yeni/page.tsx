"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

interface Department {
  id: string;
  name: string;
}

export default function YeniCalisanPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    employeeNo: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tcKimlikNo: "",
    birthDate: "",
    hireDate: "",
    departmentId: "",
    position: "",
    salary: "",
  });

  useEffect(() => {
    fetch("/api/ik/departmanlar")
      .then((r) => r.json())
      .then(setDepartments);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ik/calisanlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu.");
        return;
      }

      router.push("/ik/calisanlar");
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni Çalışan"
        description="Yeni çalışan kaydı oluşturun"
      />

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Sicil No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="employeeNo"
              value={form.employeeNo}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="Örn: EMP001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Ad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              E-posta <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Telefon
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="05XX XXX XX XX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              TC Kimlik No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tcKimlikNo"
              value={form.tcKimlikNo}
              onChange={handleChange}
              required
              maxLength={11}
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Doğum Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={form.birthDate}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              İşe Giriş Tarihi <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="hireDate"
              value={form.hireDate}
              onChange={handleChange}
              required
              className="input-field w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Departman <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              required
              className="input-field w-full"
            >
              <option value="">Departman seçiniz</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Pozisyon <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="Örn: Yazılım Geliştirici"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Brüt Maaş (TL) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="input-field w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-fiori-border">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-fiori-border rounded-lg hover:bg-gray-50"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}
