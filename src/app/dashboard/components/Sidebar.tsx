"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  CreditCard,
  LogOut,
  Building,
} from "lucide-react";
import { useOrganization } from "@/lib/hooks";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Billing & Subscription", href: "/pricing", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white">
            AI
          </div>
          <div>
            <h2 className="font-bold text-base leading-none">Invoice Manager</h2>
            <span className="text-xs text-slate-400 font-medium">SaaS Platform</span>
          </div>
        </Link>
      </div>

      {/* Organization Badge */}
      <div className="mx-4 mt-4 p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center gap-3">
        <Building className="h-5 w-5 text-blue-400 shrink-0" />
        <div className="truncate">
          <p className="text-xs text-slate-400 font-medium">Active Org</p>
          <p className="text-sm font-semibold truncate text-slate-200">
            {session?.user?.email ? session.user.email.split("@")[0] + "'s Org" : "My Organization"}
          </p>
        </div>
        {organizationRole && (
          <span className="ml-auto text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
            {organizationRole}
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm font-medium text-slate-200 truncate">
              {session?.user?.email ?? "User"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
