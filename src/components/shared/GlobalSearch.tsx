"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Package, Users, Truck, FileText, Wrench, User } from "lucide-react";

const TYPE_ICONS: Record<string, any> = {
  "Urun": Package,
  "Musteri": Users,
  "Tedarikci": Truck,
  "Calisan": User,
  "Fatura": FileText,
  "Ekipman": Wrench,
};

interface SearchResult { type: string; label: string; href: string; }

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Cmd+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => { if (open) { inputRef.current?.focus(); setQuery(""); setResults([]); } }, [open]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/arama?q=${encodeURIComponent(query)}`).then(r => r.json()).then(data => {
        setResults(data);
        setSelectedIndex(0);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = useCallback((result: SearchResult) => {
    setOpen(false);
    router.push(result.href);
  }, [router]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIndex]) { handleSelect(results[selectedIndex]); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      {/* Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-fiori-border overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-fiori-border">
          <Search size={20} className="text-fiori-neutral flex-shrink-0" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Urun, musteri, fatura ara..." className="flex-1 text-sm outline-none bg-transparent" />
          <button onClick={() => setOpen(false)} className="text-fiori-neutral hover:text-shell">
            <X size={18} />
          </button>
        </div>
        {results.length > 0 && (
          <div className="max-h-80 overflow-y-auto py-2">
            {results.map((r, i) => {
              const Icon = TYPE_ICONS[r.type] || Package;
              return (
                <button key={`${r.type}-${r.label}-${i}`} onClick={() => handleSelect(r)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${i === selectedIndex ? "bg-fiori-blue/10 text-fiori-blue" : "text-shell hover:bg-gray-50"}`}>
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="flex-1 text-left">{r.label}</span>
                  <span className="text-xs text-fiori-neutral">{r.type}</span>
                </button>
              );
            })}
          </div>
        )}
        {query.length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-fiori-neutral">Sonuc bulunamadi</div>
        )}
        <div className="px-4 py-2 border-t border-fiori-border flex items-center gap-4 text-xs text-fiori-neutral">
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">&#8593;&#8595;</kbd> gezin</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">&#8629;</kbd> ac</span>
          <span><kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px]">esc</kbd> kapat</span>
        </div>
      </div>
    </div>
  );
}
