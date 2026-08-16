import { Sidebar } from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-shell flex min-h-screen flex-col bg-[#f6f7fb] text-slate-900 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 sm:px-8 sm:py-10 lg:px-12">{children}</div>
      </main>
    </div>
  );
}
