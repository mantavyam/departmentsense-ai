import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="p-4 md:p-6">
				<AppHeader />
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}