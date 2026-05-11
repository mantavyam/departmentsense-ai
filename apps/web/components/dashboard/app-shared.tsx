import type { ReactNode } from "react";
import {
	RiDashboardLine,
	RiFileAddLine,
	RiFileList3Line,
	RiKanbanView,
	RiBuilding2Line,
	RiHistoryLine,
	RiQuestionLine,
	RiPulseLine,
	RiUserSmileLine,
} from "@remixicon/react";
import type { Role } from "@/lib/mock-data";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
	roles?: Role[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const allNavGroups: SidebarNavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: <RiDashboardLine />,
				roles: ["admin", "dept-head", "citizen"],
			},
		],
	},
	{
		label: "Grievance",
		items: [
			{
				title: "Submit Complaint",
				path: "/dashboard/submit",
				icon: <RiFileAddLine />,
				roles: ["citizen"],
			},
			{
				title: "My Complaints",
				path: "/dashboard/complaints",
				icon: <RiFileList3Line />,
				roles: ["citizen"],
			},
			{
				title: "All Complaints",
				path: "/dashboard/complaints",
				icon: <RiFileList3Line />,
				roles: ["admin", "dept-head"],
			},
			{
				title: "Pipeline",
				path: "/dashboard/pipeline",
				icon: <RiKanbanView />,
				roles: ["admin", "dept-head"],
			},
			{
				title: "Departments",
				path: "/dashboard/departments",
				icon: <RiBuilding2Line />,
				roles: ["admin"],
			},
			{
				title: "Activity Logs",
				path: "/dashboard/logs",
				icon: <RiHistoryLine />,
				roles: ["admin", "dept-head"],
			},
			{
				title: "Give Feedback",
				path: "/dashboard/feedback",
				icon: <RiUserSmileLine />,
				roles: ["citizen"],
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Help",
		path: "/dashboard/help",
		icon: <RiQuestionLine />,
	},
	{
		title: "System Status",
		path: "/dashboard/status",
		icon: <RiPulseLine />,
	},
];

export function filterNavForRole(role: Role | null): SidebarNavGroup[] {
	if (!role) return [];
	return allNavGroups
		.map((group) => ({
			...group,
			items: group.items.filter((item) => !item.roles || item.roles.includes(role)),
		}))
		.filter((group) => group.items.length > 0);
}

export const navGroups: SidebarNavGroup[] = allNavGroups;

export const navLinks: SidebarNavItem[] = [
	...allNavGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
