import AppSidebar from "@/components/app-sidebar";

export default function AppShell({ children, role, email }) {
  return (
    <main
      style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}
      className="min-h-screen bg-[#F7F6F2]"
    >
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <AppSidebar role={role} email={email} />
        <section className="min-w-0 flex-1 px-5 py-7 md:px-10 md:py-10">
          {children}
        </section>
      </div>
    </main>
  );
}