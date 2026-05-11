"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
	RiUserLine,
	RiSettings4Line,
	RiNotification3Line,
	RiLifebuoyLine,
	RiLogoutBoxRLine,
	RiShieldUserLine,
} from "@remixicon/react";
import { useRole } from "@/lib/role-context";

export function NavUser() {
	const router = useRouter();
	const { user, role, signOut } = useRole();

	const initial = user?.name?.charAt(0) ?? "?";
	const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name ?? "User")}`;

	const handleSignOut = () => {
		signOut();
		router.push("/");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				nativeButton={false}
				render={
					<button
						type="button"
						aria-label="Open account menu"
						className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
					>
						<Avatar className="size-8">
							<AvatarImage src={avatarUrl} alt={user?.name ?? "Account"} />
							<AvatarFallback>{initial}</AvatarFallback>
						</Avatar>
					</button>
				}
			/>
			<DropdownMenuContent align="end" className="w-64">
				<DropdownMenuLabel className="flex items-center gap-3 px-3 py-2">
					<Avatar className="size-10">
						<AvatarImage src={avatarUrl} alt={user?.name ?? "Account"} />
						<AvatarFallback>{initial}</AvatarFallback>
					</Avatar>
					<div className="min-w-0 flex-1">
						<p className="truncate font-medium text-foreground">{user?.name ?? "Guest"}</p>
						<p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
						{role && (
							<p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
								{role.replace("-", " ")}
							</p>
						)}
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem render={<Link href="/dashboard/settings/profile" />}>
						<RiUserLine />
						Profile
					</DropdownMenuItem>
					<DropdownMenuItem render={<Link href="/dashboard/settings/account" />}>
						<RiSettings4Line />
						Preferences
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<RiNotification3Line />
						Notifications
					</DropdownMenuItem>
					<DropdownMenuItem>
						<RiLifebuoyLine />
						Help & support
					</DropdownMenuItem>
				</DropdownMenuGroup>
				{role === "admin" && (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem render={<Link href="/dashboard/departments" />}>
								<RiShieldUserLine />
								Admin · Departments
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</>
				)}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleSignOut} variant="destructive">
					<RiLogoutBoxRLine />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
