import type { ReactNode } from "react";
import { RiDashboardLine, RiBarChartLine, RiShoppingCartLine, RiFileTextLine, RiGroupLine, RiMegaphoneLine, RiSettings3Line, RiQuestionLine, RiPulseLine } from "@remixicon/react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "#/dashboard",
				icon: (
					<RiDashboardLine
					/>
				),
				isActive: true,
			},
			{
				title: "Sales",
				path: "#/sales",
				icon: (
					<RiBarChartLine
					/>
				),
			},
		],
	},
	{
		label: "Store",
		items: [
			{
				title: "Orders",
				path: "#/orders",
				icon: (
					<RiShoppingCartLine
					/>
				),
				subItems: [
					{ title: "All orders", path: "#/orders/all" },
					{ title: "Unfulfilled", path: "#/orders/unfulfilled" },
					{ title: "Returns", path: "#/orders/returns" },
				],
			},
			{
				title: "Products",
				path: "#/products",
				icon: (
					<RiFileTextLine
					/>
				),
				subItems: [
					{ title: "Catalog", path: "#/products/catalog" },
					{ title: "Inventory", path: "#/products/inventory" },
					{ title: "Collections", path: "#/products/collections" },
				],
			},
			{
				title: "Customers",
				path: "#/customers",
				icon: (
					<RiGroupLine
					/>
				),
			},
			{
				title: "Marketing",
				path: "#/marketing",
				icon: (
					<RiMegaphoneLine
					/>
				),
			},
		],
	},
	{
		label: "Settings",
		items: [
			{
				title: "Store settings",
				path: "#/store-settings",
				icon: (
					<RiSettings3Line
					/>
				),
				subItems: [
					{ title: "Store profile", path: "#/store-settings/profile" },
					{ title: "Shipping & delivery", path: "#/store-settings/shipping" },
					{ title: "Payments", path: "#/store-settings/payments" },
					{ title: "Staff", path: "#/store-settings/staff" },
					{ title: "Apps", path: "#/store-settings/apps" },
				],
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Seller help",
		path: "#/seller-help",
		icon: (
			<RiQuestionLine
			/>
		),
	},
	{
		title: "Platform status",
		path: "#/status",
		icon: (
			<RiPulseLine
			/>
		),
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];