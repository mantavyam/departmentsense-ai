"use client";

import { useMemo, useState } from "react";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { AppShell } from "@/components/dashboard/app-shell";
import { useRole } from "@/lib/role-context";
import { getComplaintsByRole, getDepartmentById, type Complaint, type ComplaintStatus } from "@/lib/mock-data";

const COLUMNS: { id: ComplaintStatus; label: string; color: string }[] = [
	{ id: "classified", label: "New", color: "bg-blue-500" },
	{ id: "assigned", label: "Assigned", color: "bg-amber-500" },
	{ id: "in-progress", label: "In progress", color: "bg-purple-500" },
	{ id: "resolved", label: "Resolved", color: "bg-emerald-500" },
];

export default function PipelinePage() {
	const { role, user } = useRole();
	const initial = useMemo(
		() => (role ? getComplaintsByRole(role, user?.departmentId) : []),
		[role, user]
	);
	const [items, setItems] = useState<Complaint[]>(initial);
	const [dragId, setDragId] = useState<string | null>(null);

	const byColumn = COLUMNS.reduce<Record<string, Complaint[]>>((acc, col) => {
		acc[col.id] = items.filter((c) => c.status === col.id);
		return acc;
	}, {});

	const onDrop = (status: ComplaintStatus) => {
		if (!dragId) return;
		setItems((prev) => prev.map((c) => (c.id === dragId ? { ...c, status } : c)));
		setDragId(null);
	};

	return (
		<AppShell>
			<div className="space-y-6">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Resolution pipeline</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						{role === "admin"
							? "Drag complaints across stages — all departments"
							: "Drag complaints across resolution stages"}
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					{COLUMNS.map((col) => (
						<div
							key={col.id}
							onDragOver={(e) => e.preventDefault()}
							onDrop={() => onDrop(col.id)}
							className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/30 p-4 min-h-[24rem]"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<span className={`size-2 rounded-full ${col.color}`} />
									<h3 className="font-semibold">{col.label}</h3>
								</div>
								<Badge variant="outline">{byColumn[col.id]?.length ?? 0}</Badge>
							</div>
							<div className="flex-1 space-y-2 overflow-auto">
								{byColumn[col.id]?.map((c) => {
									const dept = getDepartmentById(c.departmentId);
									return (
										<Card
											key={c.id}
											draggable
											onDragStart={() => setDragId(c.id)}
											className="cursor-grab p-3 active:cursor-grabbing"
										>
											<div className="mb-1 flex items-center justify-between gap-2">
												<span className="font-mono text-xs text-muted-foreground">
													{c.referenceNumber}
												</span>
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
											<p className="text-sm font-medium leading-snug">{c.subject}</p>
											<p className="mt-1 text-xs text-muted-foreground">
												{dept?.name} · {c.citizenName}
											</p>
										</Card>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>
		</AppShell>
	);
}
