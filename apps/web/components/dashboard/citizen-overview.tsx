"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	RiArrowRightLine,
	RiFileAddLine,
	RiTimer2Line,
	RiCheckboxCircleLine,
} from "@remixicon/react";
import { useRole } from "@/lib/role-context";
import { getComplaintsByRole, getDepartmentById } from "@/lib/mock-data";

export function CitizenOverview() {
	const { user } = useRole();
	const myComplaints = user ? getComplaintsByRole(user.role) : [];
	const active = myComplaints.filter((c) => c.status !== "resolved" && c.status !== "closed");
	const resolved = myComplaints.filter((c) => c.status === "resolved");

	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between">
				<div>
					<p className="text-sm uppercase tracking-wider text-muted-foreground">
						Welcome back, {user?.name?.split(" ")[0]}
					</p>
					<h1 className="font-heading text-3xl tracking-tight">Your grievances</h1>
				</div>
				<Button asChild>
					<Link href="/dashboard/submit">
						<RiFileAddLine />
						New complaint
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<Card className="p-5">
					<RiTimer2Line className="size-5 text-amber-500" />
					<p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">In progress</p>
					<p className="mt-1 text-3xl font-semibold">{active.length}</p>
				</Card>
				<Card className="p-5">
					<RiCheckboxCircleLine className="size-5 text-emerald-500" />
					<p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Resolved</p>
					<p className="mt-1 text-3xl font-semibold">{resolved.length}</p>
				</Card>
				<Card className="p-5">
					<RiFileAddLine className="size-5 text-blue-500" />
					<p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Total submitted</p>
					<p className="mt-1 text-3xl font-semibold">{myComplaints.length}</p>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent complaints</CardTitle>
					<CardDescription>Click any item to view its tracking timeline</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{myComplaints.length === 0 ? (
						<div className="rounded-lg border border-dashed border-border p-8 text-center">
							<p className="text-sm text-muted-foreground">
								You haven&apos;t submitted any complaints yet.
							</p>
							<Button asChild className="mt-3">
								<Link href="/dashboard/submit">Submit your first complaint</Link>
							</Button>
						</div>
					) : (
						myComplaints.slice(0, 5).map((c) => {
							const dept = getDepartmentById(c.departmentId);
							return (
								<Link
									key={c.id}
									href={`/dashboard/track/${c.id}`}
									className="block rounded-lg border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-sm"
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-mono text-xs text-muted-foreground">
													{c.referenceNumber}
												</p>
												<Badge
													variant={
														c.priority === "urgent"
															? "destructive"
															: c.priority === "high"
															? "warning"
															: "secondary"
													}
												>
													{c.priority}
												</Badge>
											</div>
											<p className="mt-1 font-medium">{c.subject}</p>
											<p className="mt-0.5 text-xs text-muted-foreground">
												{dept?.name} · {c.status.replace("-", " ")}
											</p>
										</div>
										<RiArrowRightLine className="size-4 shrink-0 text-muted-foreground" />
									</div>
								</Link>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
