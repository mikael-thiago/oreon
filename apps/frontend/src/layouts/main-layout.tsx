import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";

export function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="p-3">
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
