"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/dashboard/app-shell";
import { AdminOverview } from "@/components/dashboard/admin-overview";
import { DeptHeadOverview } from "@/components/dashboard/dept-head-overview";
import { CitizenOverview } from "@/components/dashboard/citizen-overview";
import { useRole } from "@/lib/role-context";

export default function DashboardPage() {
	const { role } = useRole();
	const router = useRouter();

	useEffect(() => {
		if (role === null && typeof window !== "undefined") {
			const stored = localStorage.getItem("departmentsense.role");
			if (!stored) router.replace("/auth");
		}
	}, [role, router]);

	if (!role) {
		return (
			<AppShell>
				<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
					Loading session…
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			{role === "admin" && <AdminOverview />}
			{role === "dept-head" && <DeptHeadOverview />}
			{role === "citizen" && <CitizenOverview />}
		</AppShell>
	);
}
