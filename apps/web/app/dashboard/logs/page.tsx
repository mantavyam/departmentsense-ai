"use client";

import { useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import { RiDownloadLine } from "@remixicon/react";
import { AppShell } from "@/components/dashboard/app-shell";
import {
	InteractiveLogsTable,
	type Log,
	type LogLevel,
} from "@/components/uitripled/interactive-logs-table";
import { useRole } from "@/lib/role-context";
import { useComplaints, useDepartments } from "@/lib/use-complaints";
import { api } from "@/lib/api";
import type { Complaint } from "@/lib/mock-data";

const priorityToLevel = (p: Complaint["priority"]): LogLevel =>
	p === "urgent" ? "error" : p === "high" ? "warning" : "info";

const statusToCode = (s: Complaint["status"]): string => {
	switch (s) {
		case "submitted":
			return "200";
		case "classified":
			return "201";
		case "assigned":
			return "202";
		case "in-progress":
			return "200";
		case "resolved":
			return "200";
		case "closed":
			return "204";
		default:
			return "200";
	}
};

export default function LogsPage() {
	const { role, user } = useRole();
	const { data: complaints } = useComplaints(role, {
		departmentId: role === "dept-head" ? user?.departmentId : undefined,
	});
	const { data: departments } = useDepartments();
	const deptById = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments]);

	const complaintById = useMemo(
		() => new Map(complaints.map((c) => [c.id, c])),
		[complaints]
	);

	const logs: Log[] = useMemo(
		() =>
			complaints.map((c) => {
				const dept = c.departmentId ? deptById.get(c.departmentId) : undefined;
				return {
					id: c.id,
					timestamp: c.submittedAt,
					level: priorityToLevel(c.priority),
					service: dept?.name ?? "Unknown",
					message: `${c.referenceNumber} — ${c.subject}`,
					duration: `${(c.confidence * 100).toFixed(0)}%`,
					status: statusToCode(c.status),
					tags: [c.priority, c.status, c.language, ...c.reasoning.slice(0, 1).map((r) => r.id)],
				};
			}),
		[complaints]
	);

	return (
		<AppShell>
			<InteractiveLogsTable
				logs={logs}
				title={role === "admin" ? "Activity logs · all departments" : "Activity logs · your department"}
				renderRowAction={
					role === "admin"
						? (log) => {
								const c = complaintById.get(log.id);
								if (!c) return null;
								return (
									<Button asChild size="sm" variant="outline">
										<a href={api.classificationPdfUrl(c.id)} download>
											<RiDownloadLine />
											Download classification PDF
										</a>
									</Button>
								);
							}
						: undefined
				}
			/>
		</AppShell>
	);
}
