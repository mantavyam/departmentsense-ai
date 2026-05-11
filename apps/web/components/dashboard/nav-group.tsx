"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";
import type { SidebarNavGroup } from "@/components/dashboard/app-shared";
import { RiArrowRightSLine } from "@remixicon/react";

export function NavGroup({ label, items }: SidebarNavGroup) {
	const pathname = usePathname();
	const isActive = (path?: string) => !!path && (pathname === path || pathname?.startsWith(path + "/"));

	return (
		<SidebarGroup>
			{label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
			<SidebarMenu>
				{items.map((item) => {
					const itemActive = isActive(item.path);
					const subActive = item.subItems?.some((i) => isActive(i.path));
					return (
						<Collapsible
							className="group/collapsible"
							defaultOpen={itemActive || subActive}
							key={item.title}
						>
							<SidebarMenuItem>
								{item.subItems?.length ? (
									<>
										<CollapsibleTrigger
											render={
												<SidebarMenuButton isActive={itemActive}>
													{item.icon}
													<span>{item.title}</span>
													<RiArrowRightSLine className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
												</SidebarMenuButton>
											}
										/>
										<CollapsibleContent>
											<SidebarMenuSub>
												{item.subItems?.map((subItem) => (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton
															render={<Link href={subItem.path ?? "#"} />}
																							isActive={isActive(subItem.path)}
														>
															{subItem.icon}
															<span>{subItem.title}</span>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</>
								) : (
									<SidebarMenuButton
										render={<Link href={item.path ?? "#"} />}
													isActive={itemActive}
									>
										{item.icon}
										<span>{item.title}</span>
									</SidebarMenuButton>
								)}
							</SidebarMenuItem>
						</Collapsible>
					);
				})}
			</SidebarMenu>
		</SidebarGroup>
	);
}
