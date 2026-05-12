"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { Badge } from "@workspace/ui/components/badge";
import { RiLogoutBoxRLine } from "@remixicon/react";
import { AppShell } from "@/components/dashboard/app-shell";
import { useRole } from "@/lib/role-context";

export default function PreferencesPage() {
	const router = useRouter();
	const { user, role, signOut } = useRole();
	const { resolvedTheme, setTheme } = useTheme();

	const isDark = resolvedTheme === "dark";

	const handleSignOut = () => {
		signOut();
		router.push("/");
	};

	if (!user) {
		return (
			<AppShell>
				<div className="mx-auto max-w-3xl py-10 text-sm text-muted-foreground">
					Loading preferences…
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="mx-auto max-w-3xl space-y-6">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Preferences</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Configure how DepartmentSense looks and behaves for your session.
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
						<CardDescription>
							Switch between light and dark themes. Persists across sessions on this device.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-4">
							<div>
								<Label className="text-sm font-medium">Dark mode</Label>
								<p className="text-xs text-muted-foreground">
									Shortcut: press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono">D</kbd> outside text fields to toggle.
								</p>
							</div>
							<Switch
								checked={isDark}
								onCheckedChange={(next) => setTheme(next ? "dark" : "light")}
								aria-label="Toggle dark mode"
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Session</CardTitle>
						<CardDescription>You are currently signed in.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card p-4">
							<div className="min-w-0 flex-1">
								<p className="font-medium">{user.name}</p>
								<p className="text-xs text-muted-foreground">{user.email}</p>
							</div>
							<Badge variant="outline" className="uppercase tracking-wider">
								{role}
							</Badge>
						</div>
						<Button onClick={handleSignOut} variant="destructive" className="gap-2">
							<RiLogoutBoxRLine />
							Sign out
						</Button>
					</CardContent>
				</Card>

				{role === "citizen" && (
					<Card>
						<CardHeader>
							<CardTitle>Submitting complaints</CardTitle>
							<CardDescription>How your submissions are handled.</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>Complaints are auto-classified to a department by an AI model.</li>
								<li>You can track resolution in real time on the dashboard.</li>
								<li>A reference number and downloadable PDF receipt are issued on submission.</li>
							</ul>
						</CardContent>
					</Card>
				)}

				{role === "dept-head" && (
					<Card>
						<CardHeader>
							<CardTitle>Department head workflow</CardTitle>
							<CardDescription>What this account is authorised to do.</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>View complaints routed to your department.</li>
								<li>Move complaints across the kanban pipeline as you act on them.</li>
								<li>Sign-in code is rotated by the administrator on request.</li>
							</ul>
						</CardContent>
					</Card>
				)}

				{role === "admin" && (
					<Card>
						<CardHeader>
							<CardTitle>Administrator controls</CardTitle>
							<CardDescription>Capabilities scoped to this role.</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>Create, edit, and delete departments.</li>
								<li>Generate / rotate the 6-digit verification code for each department head.</li>
								<li>View live analytics across all departments and download per-complaint classification PDFs.</li>
							</ul>
						</CardContent>
					</Card>
				)}
			</div>
		</AppShell>
	);
}
