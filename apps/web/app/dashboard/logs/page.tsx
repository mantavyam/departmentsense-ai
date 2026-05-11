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
import { getComplaintsByRole, getDepartmentById, type Complaint } from "@/lib/mock-data";
import { downloadAdminClassificationPDF } from "@/lib/pdf";

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

	const complaints = useMemo(
		() => (role ? getComplaintsByRole(role, user?.departmentId) : []),
		[role, user]
	);

	const complaintById = useMemo(
		() => new Map(complaints.map((c) => [c.id, c])),
		[complaints]
	);

	const logs: Log[] = useMemo(
		() =>
			complaints.map((c) => {
				const dept = getDepartmentById(c.departmentId);
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
									<Button
										size="sm"
										variant="outline"
										onClick={() => downloadAdminClassificationPDF(c)}
									>
										<RiDownloadLine />
										Download classification PDF
									</Button>
								);
							}
						: undefined
				}
			/>
		</AppShell>
	);
}
