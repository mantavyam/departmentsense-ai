"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { AppBreadcrumbs } from "@/components/dashboard/app-breadcrumb";
import { CustomSidebarTrigger } from "@/components/dashboard/custom-sidebar-trigger";
import { navLinks } from "@/components/dashboard/app-shared";
import { NavUser } from "@/components/dashboard/nav-user";
import { RiNotification3Line } from "@remixicon/react";

export function AppHeader() {
	const pathname = usePathname();
	const activeItem =
		navLinks.find((item) => item.path === pathname) ??
		navLinks.find((item) => item.path && pathname?.startsWith(item.path));

	return (
		<header
			className={cn(
				"pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem ?? { title: "Dashboard" }} />
			</div>
			<div className="flex items-center gap-3">
				<Button aria-label="Notifications" size="icon" variant="ghost">
					<RiNotification3Line />
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser />
			</div>
		</header>
	);
}
