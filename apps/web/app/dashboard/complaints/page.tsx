"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
	RiArrowRightLine,
	RiDownloadLine,
	RiFilter3Line,
} from "@remixicon/react";
import { FileText, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/dashboard/app-shell";
import { CommandPalette, type Command } from "@/components/uitripled/command-palette";
import { useRole } from "@/lib/role-context";
import { useComplaints, useDepartments } from "@/lib/use-complaints";
import { api } from "@/lib/api";

const STATUS_COLORS: Record<string, "default" | "secondary" | "warning" | "success" | "destructive" | "outline"> = {
	submitted: "outline",
	classified: "secondary",
	assigned: "warning",
	"in-progress": "warning",
	resolved: "success",
	closed: "outline",
};

export default function ComplaintsPage() {
	const router = useRouter();
	const { role, user } = useRole();
	const [filterStatus, setFilterStatus] = useState<string>("all");
	const { data: complaints, loading } = useComplaints(role, {
		departmentId: role === "dept-head" ? user?.departmentId : undefined,
		citizenEmail: role === "citizen" ? user?.email : undefined,
	});
	const { data: departments } = useDepartments();
	const deptById = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments]);

	const list = useMemo(
		() => complaints.filter((c) => filterStatus === "all" || c.status === filterStatus),
		[complaints, filterStatus]
	);

	const commands: Command[] = useMemo(
		() =>
			list.map((c) => {
				const dept = c.departmentId ? deptById.get(c.departmentId) : undefined;
				const icon =
					c.priority === "urgent"
						? AlertCircle
						: c.status === "resolved"
						? CheckCircle2
						: c.status === "in-progress"
						? Clock
						: FileText;
				return {
					id: c.id,
					icon,
					label: `${c.referenceNumber} — ${c.subject}`,
					description: `${dept?.name ?? "—"} · ${c.citizenName} · ${c.priority}`,
				};
			}),
		[list]
	);

	const handleSelect = (cmd: Command) => {
		if (cmd.id) router.push(`/dashboard/track/${cmd.id}`);
	};

	return (
		<AppShell>
			<div className="space-y-6">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<div>
						<h1 className="font-heading text-3xl tracking-tight">
							{role === "citizen" ? "My complaints" : "All complaints"}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">
							{role === "dept-head"
								? `Showing complaints for ${deptById.get(user?.departmentId ?? "")?.name ?? ""}`
								: role === "admin"
								? "System-wide complaint listing"
								: "Track every complaint you have submitted"}
						</p>
					</div>
					<div className="flex items-center gap-3">
						<CommandPalette
							commands={commands}
							onSelect={handleSelect}
							triggerLabel="Search complaints…"
							placeholder="Type a reference, subject or citizen name…"
						/>
					</div>
				</div>

				<Card>
					<CardHeader className="flex flex-row items-center gap-3 space-y-0">
						<RiFilter3Line className="size-4 text-muted-foreground" />
						<select
							value={filterStatus}
							onChange={(e) => setFilterStatus(e.target.value)}
							className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
						>
							<option value="all">All status</option>
							<option value="submitted">Submitted</option>
							<option value="classified">Classified</option>
							<option value="assigned">Assigned</option>
							<option value="in-progress">In progress</option>
							<option value="resolved">Resolved</option>
						</select>
						<span className="text-xs text-muted-foreground">
							{list.length} result{list.length === 1 ? "" : "s"}
						</span>
					</CardHeader>
					<CardContent className="space-y-2 pt-0">
						{loading ? (
							<p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
						) : list.length === 0 ? (
							<p className="py-12 text-center text-sm text-muted-foreground">
								No complaints match your filter.
							</p>
						) : (
							list.map((c) => {
								const dept = c.departmentId ? deptById.get(c.departmentId) : undefined;
								return (
									<div
										key={c.id}
										className="flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
									>
										<div className="flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-mono text-xs text-muted-foreground">{c.referenceNumber}</span>
												<Badge variant={STATUS_COLORS[c.status]}>{c.status.replace("-", " ")}</Badge>
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
												{c.citizenName} · {dept?.name} ·{" "}
												{new Date(c.submittedAt).toLocaleDateString("en-IN")}
											</p>
										</div>
										<div className="flex items-center gap-2">
											{role === "admin" && (
												<Button
													asChild
													variant="ghost"
													size="sm"
													title="Download classification reasoning PDF"
												>
													<a href={api.classificationPdfUrl(c.id)} download>
														<RiDownloadLine />
														Report
													</a>
												</Button>
											)}
											<Button asChild variant="ghost" size="sm">
												<Link href={`/dashboard/track/${c.id}`}>
													View
													<RiArrowRightLine />
												</Link>
											</Button>
										</div>
									</div>
								);
							})
						)}
					</CardContent>
				</Card>
			</div>
		</AppShell>
	);
}
