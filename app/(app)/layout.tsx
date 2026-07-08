import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import NotificationsMenu from "@/components/NotificationsMenu";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[1600px]">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="mt-16 flex items-center justify-end gap-3 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur sm:px-6 md:sticky md:top-0 md:z-20 md:mt-0">
          <NotificationsMenu />
          <UserMenu />
          <ThemeToggle />
        </div>
        <main className="px-4 pb-6 pt-4 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
