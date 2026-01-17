"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "rounded-xl px-3 py-2 text-sm font-medium transition",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function NavBar() {
  const [open, setOpen] = useState(false);

  const nav = useMemo(
    () => (
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-slate-900">
          check-word
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
          <NavLink href="/" label="홈" />
          <NavLink href="/sets" label="세트 목록" />
          <NavLink href="/review" label="복습" />
        </div>

        <button
          type="button"
          className="sm:hidden rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴 열기"
        >
          ☰
        </button>
      </nav>
    ),
    []
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      {nav}
      {open && (
        <div className="border-t border-slate-200 bg-white sm:hidden">
          <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-3">
            <NavLink href="/" label="홈" />
            <NavLink href="/sets" label="세트 목록" />
            <NavLink href="/review" label="복습" />
          </div>
        </div>
      )}
    </header>
  );
}
