"use client";

import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { NavGroup } from "@/components/dashboard/nav-group";
import { footerNavLinks, filterNavForRole } from "@/components/dashboard/app-shared";
import { LatestChange } from "@/components/dashboard/latest-change";
import { RiAddLine, RiSearchLine } from "@remixicon/react";
import { useRole } from "@/lib/role-context";

export function AppSidebar() {
	const { role } = useRole();
	const groups = filterNavForRole(role);

	return (
		<Sidebar collapsible="icon" variant="floating">
			<SidebarHeader className="h-14 justify-center">
				<SidebarMenuButton render={<Link href="/dashboard" />}>
					<span className="font-medium">DepartmentSense</span>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				{role === "citizen" && (
					<SidebarGroup>
						<SidebarMenuItem className="flex items-center gap-2">
							<SidebarMenuButton
								render={<Link href="/dashboard/submit" />}
												className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
								tooltip="New complaint"
							>
								<RiAddLine />
								<span>New complaint</span>
							</SidebarMenuButton>
							<Button
								aria-label="Search complaints"
								className="size-8 group-data-[collapsible=icon]:opacity-0"
								size="icon"
								variant="outline"
							>
								<RiSearchLine />
								<span className="sr-only">Search</span>
							</Button>
						</SidebarMenuItem>
					</SidebarGroup>
				)}
				{groups.map((group, index) => (
					<NavGroup key={`sidebar-group-${index}`} {...group} />
				))}
			</SidebarContent>
			<SidebarFooter>
				<LatestChange />
				<SidebarMenu className="mt-2">
					{footerNavLinks.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								render={<Link href={item.path ?? "#"} />}
												className="text-muted-foreground"
								isActive={item.isActive}
								size="sm"
							>
								{item.icon}
								<span>{item.title}</span>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
