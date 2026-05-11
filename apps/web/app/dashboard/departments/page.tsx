"use client";

import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { AppShell } from "@/components/dashboard/app-shell";
import { departments, complaints } from "@/lib/mock-data";
import {
	RiFlashlightLine,
	RiDropLine,
	RiDeleteBin2Line,
	RiRoadMapLine,
	RiBuildingLine,
	RiHeartPulseLine,
} from "@remixicon/react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
	Zap: RiFlashlightLine,
	Droplet: RiDropLine,
	Trash2: RiDeleteBin2Line,
	Construction: RiRoadMapLine,
	Building2: RiBuildingLine,
	Heart: RiHeartPulseLine,
};

export default function DepartmentsPage() {
	return (
		<AppShell>
			<div className="space-y-6">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Departments</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						All registered departments and their assigned verification codes.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{departments.map((d) => {
						const Icon = iconMap[d.icon] ?? RiBuildingLine;
						const count = complaints.filter((c) => c.departmentId === d.id).length;
						const active = complaints.filter(
							(c) => c.departmentId === d.id && c.status !== "resolved"
						).length;
						return (
							<Card key={d.id} className="overflow-hidden">
								<div
									className="h-2 w-full"
									style={{ backgroundColor: d.color }}
								/>
								<div className="p-5">
									<div className="flex items-start gap-3">
										<div
											className="flex size-11 items-center justify-center rounded-lg"
											style={{ backgroundColor: `${d.color}20`, color: d.color }}
										>
											<Icon className="size-5" />
										</div>
										<div className="flex-1">
											<h3 className="font-semibold">{d.name}</h3>
											<p className="mt-0.5 text-xs text-muted-foreground">{d.description}</p>
										</div>
									</div>

									<dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
										<div>
											<dt className="text-xs text-muted-foreground">Total</dt>
											<dd className="text-lg font-semibold">{count}</dd>
										</div>
										<div>
											<dt className="text-xs text-muted-foreground">Active</dt>
											<dd className="text-lg font-semibold">{active}</dd>
										</div>
										<div>
											<dt className="text-xs text-muted-foreground">Head</dt>
											<dd className="truncate text-xs font-medium">{d.headName}</dd>
										</div>
									</dl>

									<div className="mt-4 flex items-center justify-between border-t border-border pt-4">
										<span className="text-xs text-muted-foreground">Verification code</span>
										<Badge variant="outline" className="font-mono">
											{d.verificationCode}
										</Badge>
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</AppShell>
	);
}
