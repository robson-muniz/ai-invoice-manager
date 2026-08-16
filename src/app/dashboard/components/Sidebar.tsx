"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Building2, ChevronDown, CreditCard, FileText, LayoutDashboard, LogOut, Package, Sparkles, Users } from "lucide-react";
import { useOrganization } from "@/lib/hooks";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { label: "Customers", href: "/dashboard/customers", icon: Users },
  { label: "Catalog", href: "/dashboard/products", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { organizationRole } = useOrganization();
  const organizationName = session?.user?.email ? `${session.user.email.split("@")[0]}'s workspace` : "My workspace";

  return (
    <aside className="dashboard-sidebar flex w-full shrink-0 flex-col border-b border-white/8 bg-[#111827] text-white md:min-h-screen md:w-[272px] md:border-r md:border-b-0">
      <div className="flex items-center justify-between px-5 py-4 md:px-6 md:py-6">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-400 via-indigo-500 to-violet-600 font-bold tracking-tight shadow-lg shadow-indigo-950/40 transition-transform duration-300 group-hover:scale-105"><span className="relative z-10">I</span><span className="absolute -right-2 -top-3 h-7 w-7 rounded-full bg-white/20" /></div>
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">InvoiceOS</p><p className="mt-0.5 text-sm font-semibold tracking-tight text-white">Financial clarity</p></div>
        </Link>
        <button className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white" aria-label="Workspace options"><ChevronDown className="h-4 w-4" /></button>
      </div>

      <div className="hidden px-4 md:block"><div className="rounded-xl border border-white/8 bg-white/[0.045] p-3.5"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-400/15 text-indigo-300"><Building2 className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-100">{organizationName}</p><p className="mt-0.5 text-[11px] text-slate-400">{organizationRole || "Member"} access</p></div></div></div></div>

      <nav className="flex flex-1 gap-1 overflow-x-auto px-4 py-3 md:flex-col md:overflow-visible md:px-4 md:py-7" aria-label="Main navigation">
        <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.17em] text-slate-500 md:block">Workspace</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? "bg-white/[0.12] text-white shadow-sm" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"}`}><Icon className={`h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"}`} /><span>{item.label}</span>{isActive && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-indigo-300 shadow-[0_0_10px_rgba(165,180,252,0.9)] md:block" />}</Link>;
        })}
        <Link href="/pricing" className={`group flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${pathname === "/pricing" ? "bg-white/[0.12] text-white" : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"}`}><CreditCard className="h-[18px] w-[18px] text-slate-500 transition group-hover:text-slate-300" /><span>Plans & billing</span></Link>
      </nav>

      <div className="hidden p-4 md:block"><div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 p-3.5 ring-1 ring-inset ring-indigo-300/10"><Sparkles className="h-4 w-4 text-indigo-300" /><p className="mt-2 text-xs font-semibold text-white">Make every payment count.</p><p className="mt-1 text-[11px] leading-relaxed text-slate-400">A clearer view of your cash flow, every day.</p></div></div>
      <div className="hidden border-t border-white/8 p-4 md:block"><div className="flex items-center gap-3 px-2"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-xs font-semibold text-slate-200">{session?.user?.email?.slice(0, 1).toUpperCase() || "U"}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-slate-200">{session?.user?.email ?? "User account"}</p><p className="mt-0.5 text-[10px] text-slate-500">Signed in</p></div><button onClick={() => signOut({ callbackUrl: "/login" })} title="Sign out" className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-rose-300"><LogOut className="h-4 w-4" /></button></div></div>
    </aside>
  );
}
