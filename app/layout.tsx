"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

import "@/app/globals.css";

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-2 text-sm font-medium transition text-slate-700 hover:bg-slate-100"
    >
      {label}
    </Link>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const nav = useMemo(
    () => (
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-slate-900">
          check-word
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-2 sm:flex">
          <NavLink href="/" label="홈" />
          <NavLink href="/sets" label="세트 목록" />
          <NavLink href="/review" label="복습" />
        </div>

        {/* Mobile */}
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
    <html lang="ko">
      <head>
        <title>check-word-app</title>
        <meta name="description" content="단어 입력 → 오늘 학습 → 복습" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
          {nav}
          {open && (
            <div className="border-t border-slate-200 bg-white sm:hidden">
              <div className="mx-auto flex max-w-3xl flex-col gap-1 px-4 py-3">
                <NavLink href="/" label="홈" onClick={() => setOpen(false)} />
                <NavLink href="/sets" label="세트 목록" onClick={() => setOpen(false)} />
                <NavLink href="/review" label="복습" onClick={() => setOpen(false)} />
              </div>
            </div>
          )}
        </header>

        <div>{children}</div>
      </body>
    </html>
  );
}
