"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { AppShell } from "@/components/dashboard/app-shell";
import { useRole } from "@/lib/role-context";
import { RiLogoutBoxRLine, RiUserSettingsLine, RiSettings4Line } from "@remixicon/react";
import Link from "next/link";

export default function SettingsPage() {
	const { user, role, signOut } = useRole();
	const router = useRouter();

	const handleSignOut = () => {
		signOut();
		router.push("/");
	};

	return (
		<AppShell>
			<div className="mx-auto max-w-3xl space-y-6">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Settings</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage your profile and preferences.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Account</CardTitle>
						<CardDescription>Your current session</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
								<p className="mt-1 font-medium">{user?.name ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
								<p className="mt-1 font-medium">{user?.email ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wider text-muted-foreground">Role</p>
								<Badge variant="outline" className="mt-1 capitalize">{role}</Badge>
							</div>
							<div>
								<p className="text-xs uppercase tracking-wider text-muted-foreground">Session</p>
								<Badge variant="success" className="mt-1">Active</Badge>
							</div>
						</div>
						<div className="flex gap-2 border-t border-border pt-4">
							<Button variant="outline" asChild>
								<Link href="/dashboard/settings/profile">
									<RiUserSettingsLine />
									Edit profile
								</Link>
							</Button>
							<Button variant="outline" asChild>
								<Link href="/dashboard/settings/account">
									<RiSettings4Line />
									Preferences
								</Link>
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Switch role (demo)</CardTitle>
						<CardDescription>This is a demo — sign out and back in to switch roles</CardDescription>
					</CardHeader>
					<CardContent>
						<Button onClick={handleSignOut} variant="destructive">
							<RiLogoutBoxRLine />
							Sign out
						</Button>
					</CardContent>
				</Card>
			</div>
		</AppShell>
	);
}
