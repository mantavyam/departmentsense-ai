"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { RiArrowRightLine } from "@remixicon/react";
import { useMemo } from "react";
import { useRole } from "@/lib/role-context";
import { useComplaints, useDepartments } from "@/lib/use-complaints";

export function DeptHeadOverview() {
	const { user, role } = useRole();
	const { data: departments } = useDepartments();
	const dept = useMemo(
		() => departments.find((d) => d.id === user?.departmentId),
		[departments, user]
	);
	const { data: complaints } = useComplaints(role, { departmentId: user?.departmentId });

	const counts = {
		urgent: complaints.filter((c) => c.priority === "urgent").length,
		high: complaints.filter((c) => c.priority === "high").length,
		medium: complaints.filter((c) => c.priority === "medium").length,
		low: complaints.filter((c) => c.priority === "low").length,
	};
	const inProgress = complaints.filter((c) => c.status === "in-progress").length;
	const resolved = complaints.filter((c) => c.status === "resolved").length;
	const newAssigned = complaints.filter((c) => c.status === "assigned" || c.status === "classified").length;

	return (
		<div className="space-y-6">
			<div>
				<p className="text-sm uppercase tracking-wider text-muted-foreground">Department</p>
				<h1 className="font-heading text-3xl tracking-tight">{dept?.name ?? "—"}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{dept?.description}</p>
			</div>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<Card className="p-5">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">New / Assigned</p>
					<p className="mt-2 text-3xl font-semibold">{newAssigned}</p>
					<p className="mt-1 text-xs text-muted-foreground">awaiting your action</p>
				</Card>
				<Card className="p-5">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">In progress</p>
					<p className="mt-2 text-3xl font-semibold">{inProgress}</p>
					<p className="mt-1 text-xs text-muted-foreground">actively being resolved</p>
				</Card>
				<Card className="p-5">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved</p>
					<p className="mt-2 text-3xl font-semibold">{resolved}</p>
					<p className="mt-1 text-xs text-muted-foreground">this period</p>
				</Card>
				<Card className="p-5">
					<p className="text-xs uppercase tracking-wider text-muted-foreground">Total</p>
					<p className="mt-2 text-3xl font-semibold">{complaints.length}</p>
					<p className="mt-1 text-xs text-muted-foreground">all-time complaints</p>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Priority breakdown</CardTitle>
					<CardDescription>Complaints currently under your department</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-3">
					<Badge variant="destructive" className="gap-2 px-3 py-1.5 text-sm">
						<span className="size-2 rounded-full bg-current" />
						Urgent · {counts.urgent}
					</Badge>
					<Badge variant="warning" className="gap-2 px-3 py-1.5 text-sm">
						<span className="size-2 rounded-full bg-current" />
						High · {counts.high}
					</Badge>
					<Badge variant="secondary" className="gap-2 px-3 py-1.5 text-sm">
						<span className="size-2 rounded-full bg-current" />
						Medium · {counts.medium}
					</Badge>
					<Badge variant="outline" className="gap-2 px-3 py-1.5 text-sm">
						<span className="size-2 rounded-full bg-current" />
						Low · {counts.low}
					</Badge>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<Card className="p-6">
					<h3 className="font-semibold">Manage pipeline</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Drag complaints across resolution stages on the kanban board.
					</p>
					<Button asChild className="mt-4">
						<Link href="/dashboard/pipeline">
							Open kanban
							<RiArrowRightLine />
						</Link>
					</Button>
				</Card>
				<Card className="p-6">
					<h3 className="font-semibold">Review activity logs</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						See every action taken on complaints assigned to your department.
					</p>
					<Button asChild variant="outline" className="mt-4">
						<Link href="/dashboard/logs">
							View logs
							<RiArrowRightLine />
						</Link>
					</Button>
				</Card>
			</div>
		</div>
	);
}
