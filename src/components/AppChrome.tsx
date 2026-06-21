"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Library, PenLine, Settings, Users } from "lucide-react";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";

const navItems = [
  { href: "/", label: "Home", icon: BookOpenText },
  { href: "/practice/", label: "Practice", icon: PenLine },
  { href: "/teach/", label: "Teach", icon: Users },
  { href: "/library/", label: "Library", icon: Library }
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <BookOpenText />
          </span>
          <span>
            <strong>ReaderLab</strong>
            <small>Writing Studio</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link aria-current={isActive ? "page" : undefined} href={item.href} key={item.href}>
                <Icon aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-tools">
          <span className="save-state">
            <Settings aria-hidden="true" />
            Local progress
          </span>
          <AccessibilityPanel />
        </div>
      </header>
      {children}
    </div>
  );
}
