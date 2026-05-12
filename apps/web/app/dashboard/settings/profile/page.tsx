"use client";

import { useMemo } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@workspace/ui/components/avatar";
import { AppShell } from "@/components/dashboard/app-shell";
import { useRole } from "@/lib/role-context";
import { useComplaints, useDepartments } from "@/lib/use-complaints";

const ROLE_LABEL: Record<string, string> = {
	admin: "Administrator",
	"dept-head": "Department Head",
	citizen: "Citizen",
};

export default function ProfileSettingsPage() {
	const { user, role } = useRole();

	const { data: myComplaints } = useComplaints(role, {
		citizenEmail: role === "citizen" ? user?.email : undefined,
		departmentId: role === "dept-head" ? user?.departmentId : undefined,
	});
	const { data: departments } = useDepartments();
	const myDept = useMemo(
		() => departments.find((d) => d.id === user?.departmentId),
		[departments, user?.departmentId]
	);

	const initial = user?.name?.charAt(0) ?? "?";
	const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
		user?.name ?? "User"
	)}`;

	if (!user) {
		return (
			<AppShell>
				<div className="mx-auto max-w-3xl py-10 text-sm text-muted-foreground">
					Loading profile…
				</div>
			</AppShell>
		);
	}

	const resolved = myComplaints.filter((c) => c.status === "resolved").length;
	const active = myComplaints.filter(
		(c) => c.status !== "resolved" && c.status !== "closed"
	).length;

	return (
		<AppShell>
			<div className="mx-auto max-w-3xl space-y-6">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Profile</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Your account, as it appears to the system.
					</p>
				</div>

				<Card>
					<CardContent className="flex items-center gap-5 p-6">
						<Avatar className="size-16">
							<AvatarImage src={avatarUrl} alt={user.name} />
							<AvatarFallback>{initial}</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<h2 className="text-xl font-semibold">{user.name}</h2>
								<Badge variant="outline" className="uppercase tracking-wider">
									{ROLE_LABEL[role ?? ""] ?? role}
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground">{user.email}</p>
							{role === "dept-head" && myDept && (
								<p className="mt-1 text-xs text-muted-foreground">
									Heading <span className="font-medium">{myDept.name}</span>
								</p>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Account details</CardTitle>
						<CardDescription>
							Read-only — issued by the platform. Contact the administrator to update.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<dl className="grid gap-3 text-sm">
							<Row label="User ID" value={user.id} mono />
							<Row label="Email" value={user.email} />
							<Row label="Role" value={ROLE_LABEL[role ?? ""] ?? role ?? "—"} />
							{role === "dept-head" && (
								<>
									<Row label="Department" value={myDept?.name ?? "—"} />
									<Row label="Department slug" value={myDept?.slug ?? "—"} mono />
								</>
							)}
						</dl>
					</CardContent>
				</Card>

				{(role === "citizen" || role === "dept-head") && (
					<Card>
						<CardHeader>
							<CardTitle>Activity</CardTitle>
							<CardDescription>
								{role === "citizen"
									? "Complaints you have submitted."
									: "Complaints routed to your department."}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-3 text-center">
								<Stat label="Total" value={myComplaints.length} />
								<Stat label="Active" value={active} />
								<Stat label="Resolved" value={resolved} />
							</div>
						</CardContent>
					</Card>
				)}

				{role === "admin" && (
					<Card>
						<CardHeader>
							<CardTitle>System scope</CardTitle>
							<CardDescription>What this account currently oversees.</CardDescription>
						</CardHeader>
						<CardContent>
							<dl className="grid gap-3 text-sm">
								<Row label="Departments" value={departments.length.toString()} />
								<Row label="Complaints (all-time)" value={myComplaints.length.toString()} />
							</dl>
						</CardContent>
					</Card>
				)}

				<Separator />
				<p className="text-xs text-muted-foreground">
					Avatars are generated deterministically from your name. No personal images are stored.
				</p>
			</div>
		</AppShell>
	);
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
	return (
		<div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
			<dt className="text-muted-foreground">{label}</dt>
			<dd className={mono ? "font-mono text-xs" : "font-medium"}>{value}</dd>
		</div>
	);
}

function Stat({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-lg border border-border/60 bg-card p-4">
			<p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
			<p className="mt-1 text-2xl font-semibold">{value}</p>
		</div>
	);
}
