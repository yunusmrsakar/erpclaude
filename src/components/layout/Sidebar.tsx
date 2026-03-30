"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

function SidebarItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(
    item.children?.some((c) => pathname.startsWith(c.href)) ?? false
  );
  const isActive = pathname === item.href || item.children?.some((c) => pathname.startsWith(c.href));
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors",
            isActive
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          )}
        >
          {Icon && <Icon size={20} />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.title}</span>
              {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-9 mt-1 space-y-0.5">
            {item.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "block px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname.startsWith(child.href)
                    ? "bg-fiori-blue text-white"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
              >
                {child.title}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors",
        isActive
          ? "bg-fiori-blue text-white"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      {Icon && <Icon size={20} />}
      {!collapsed && <span>{item.title}</span>}
    </Link>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 bg-shell text-white rounded-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-shell z-50 flex flex-col transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-tight">
              ERP Sistem
            </span>
          )}
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="text-white/70 hover:text-white p-1"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/10">
          {!collapsed && (
            <p className="text-white/40 text-xs">v1.0.0 — ERP Sistem</p>
          )}
        </div>
      </aside>
    </>
  );
}
