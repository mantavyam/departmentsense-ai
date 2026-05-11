"use client";

import { useRef, useState } from "react";
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar";
import { AppHeader } from "@/components/dashboard/app-header";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

const HOVER_EXPAND_MS = 2000;

export function AppShell({ children }: { children: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	const handleEnter = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setOpen(true), HOVER_EXPAND_MS);
	};

	const handleLeave = () => {
		if (timerRef.current) clearTimeout(timerRef.current);
		setOpen(false);
	};

	return (
		<SidebarProvider defaultOpen={false} open={open} onOpenChange={setOpen}>
			<div
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
				className="contents"
			>
				<AppSidebar />
			</div>
			<SidebarInset className="flex h-svh flex-col">
				<div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
					<div className="p-4 md:px-6 md:py-3">
						<AppHeader />
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-4 md:p-6">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
