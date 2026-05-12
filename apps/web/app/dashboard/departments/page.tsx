"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/dashboard/app-shell";
import { ServicesGridBlock } from "@/components/uitripled/services-grid-block";
import {
	DepartmentWizard,
	type DepartmentFormValues,
} from "@/components/uitripled/department-wizard";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Dialog, DialogContent } from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { api } from "@/lib/api";
import { useRole } from "@/lib/role-context";
import type { Department } from "@/lib/mock-data";

export default function DepartmentsPage() {
	const { role } = useRole();
	const [departments, setDepartments] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);
	const [wizardOpen, setWizardOpen] = useState(false);
	const [filter, setFilter] = useState("");

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const data = await api.listDepartments();
			setDepartments(data);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const handleGenerateCode = async (dept: Department) => {
		const res = await api.generateDepartmentCode(dept.id);
		setDepartments((prev) =>
			prev.map((d) =>
				d.id === dept.id ? { ...d, verificationCode: res.verificationCode } : d
			)
		);
	};

	const handleDelete = async (dept: Department) => {
		if (!confirm(`Delete department "${dept.name}"? Officer accounts will be detached, not deleted.`)) {
			return;
		}
		await api.deleteDepartment(dept.id);
		setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
	};

	const handleSave = async (values: DepartmentFormValues) => {
		const created = await api.createDepartment(values);
		setDepartments((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
		return { id: created.id };
	};

	const visible = filter
		? departments.filter((d) =>
				`${d.name} ${d.headName} ${d.officerEmail}`.toLowerCase().includes(filter.toLowerCase())
		  )
		: departments;

	const isAdmin = role === "admin";

	return (
		<AppShell>
			<div className="space-y-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Input
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						placeholder="Search departments, officers, emails…"
						className="max-w-md"
					/>
					<span className="text-sm text-muted-foreground">
						{visible.length} of {departments.length}
					</span>
				</div>

				{loading ? (
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-56 w-full" />
						))}
					</div>
				) : (
					<ServicesGridBlock
						departments={visible}
						mode={isAdmin ? "admin" : "view"}
						heading="Government Departments"
						subheading={
							isAdmin
								? "Create new departments, assign officers, and generate the 6-digit codes they use to sign in."
								: "Browse departments and the codes that grant their officers dashboard access."
						}
						onGenerateCode={isAdmin ? handleGenerateCode : undefined}
						onDelete={isAdmin ? handleDelete : undefined}
						onCreate={isAdmin ? () => setWizardOpen(true) : undefined}
					/>
				)}
			</div>

			<Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
				<DialogContent className="max-w-5xl p-0 border-none bg-transparent shadow-none">
					<DepartmentWizard
						onClose={() => setWizardOpen(false)}
						onSave={handleSave}
						onGenerateCode={async (id) => {
							const res = await api.generateDepartmentCode(id);
							setDepartments((prev) =>
								prev.map((d) =>
									d.id === id ? { ...d, verificationCode: res.verificationCode } : d
								)
							);
							return { verificationCode: res.verificationCode };
						}}
					/>
				</DialogContent>
			</Dialog>
		</AppShell>
	);
}
