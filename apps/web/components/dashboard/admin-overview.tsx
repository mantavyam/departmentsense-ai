"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { RiArrowRightLine } from "@remixicon/react";
import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { PieCenter } from "@/components/charts/pie-center";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RadarChart } from "@/components/charts/radar-chart";
import { RadarArea } from "@/components/charts/radar-area";
import { RadarGrid } from "@/components/charts/radar-grid";
import { RadarAxis } from "@/components/charts/radar-axis";
import { RadarLabels } from "@/components/charts/radar-labels";
import { LineChart } from "@/components/charts/line-chart";
import { Line } from "@/components/charts/line";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { SankeyChart } from "@/components/charts/sankey/sankey-chart";
import { SankeyNode } from "@/components/charts/sankey/sankey-node";
import { SankeyLink } from "@/components/charts/sankey/sankey-link";
import { useComplaints, useDepartments } from "@/lib/use-complaints";
import { useRole } from "@/lib/role-context";
import type { Complaint, Department } from "@/lib/mock-data";

const DAY_MS = 86_400_000;

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
	return (
		<Card className="p-5">
			<p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
			<p className="mt-2 text-3xl font-semibold">{value}</p>
			{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
		</Card>
	);
}

function buildAreaSeries(complaints: Complaint[]): { date: number; value: number }[] {
	if (complaints.length === 0) return [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const buckets = new Map<number, number>();
	for (let i = 29; i >= 0; i--) {
		buckets.set(today.getTime() - i * DAY_MS, 0);
	}
	for (const c of complaints) {
		const d = new Date(c.submittedAt);
		d.setHours(0, 0, 0, 0);
		const key = d.getTime();
		if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
	}
	return Array.from(buckets.entries())
		.sort((a, b) => a[0] - b[0])
		.map(([date, value]) => ({ date, value }));
}

function buildLineSeries(complaints: Complaint[]): { date: number; submitted: number; resolved: number }[] {
	if (complaints.length === 0) return [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const submitted = new Map<number, number>();
	const resolved = new Map<number, number>();
	for (let i = 29; i >= 0; i--) {
		const k = today.getTime() - i * DAY_MS;
		submitted.set(k, 0);
		resolved.set(k, 0);
	}
	for (const c of complaints) {
		const d = new Date(c.submittedAt);
		d.setHours(0, 0, 0, 0);
		const k = d.getTime();
		if (submitted.has(k)) submitted.set(k, (submitted.get(k) ?? 0) + 1);
		if (c.status === "resolved" && resolved.has(k)) {
			resolved.set(k, (resolved.get(k) ?? 0) + 1);
		}
	}
	return Array.from(submitted.keys())
		.sort((a, b) => a - b)
		.map((k) => ({ date: k, submitted: submitted.get(k) ?? 0, resolved: resolved.get(k) ?? 0 }));
}

function countsByDept(complaints: Complaint[], departments: Department[]) {
	const map = new Map<string, number>();
	for (const c of complaints) {
		if (!c.departmentId) continue;
		map.set(c.departmentId, (map.get(c.departmentId) ?? 0) + 1);
	}
	return departments
		.map((d) => ({ id: d.id, label: d.name, value: map.get(d.id) ?? 0, color: d.color, slug: d.slug }))
		.sort((a, b) => b.value - a.value);
}

export function AdminOverview() {
	const { role } = useRole();
	const { data: complaints } = useComplaints(role);
	const { data: departments } = useDepartments();

	const total = complaints.length;
	const resolved = complaints.filter((c) => c.status === "resolved").length;
	const inProgress = complaints.filter((c) => c.status === "in-progress").length;
	const pending = total - resolved - inProgress;

	const areaSeries = useMemo(() => buildAreaSeries(complaints), [complaints]);
	const lineSeries = useMemo(() => buildLineSeries(complaints), [complaints]);
	const deptCounts = useMemo(() => countsByDept(complaints, departments), [complaints, departments]);
	const topBar = useMemo(() => deptCounts.filter((d) => d.value > 0).slice(0, 12), [deptCounts]);
	const topPie = useMemo(() => deptCounts.filter((d) => d.value > 0).slice(0, 8), [deptCounts]);

	const ringData = useMemo(() => {
		const denom = Math.max(total, 1);
		return [
			{ label: "Resolved", value: Math.round((resolved / denom) * 100), color: "#10b981", maxValue: 100 },
			{ label: "In Progress", value: Math.round((inProgress / denom) * 100), color: "#3b82f6", maxValue: 100 },
			{ label: "Pending", value: Math.round((pending / denom) * 100), color: "#f59e0b", maxValue: 100 },
		];
	}, [total, resolved, inProgress, pending]);

	const funnelData = useMemo(() => {
		const submitted = total;
		const classified = complaints.filter((c) =>
			["classified", "assigned", "in-progress", "resolved", "closed"].includes(c.status)
		).length;
		const assigned = complaints.filter((c) =>
			["assigned", "in-progress", "resolved", "closed"].includes(c.status)
		).length;
		const inProg = complaints.filter((c) =>
			["in-progress", "resolved", "closed"].includes(c.status)
		).length;
		return [
			{ label: "Submitted", value: submitted },
			{ label: "Classified", value: classified },
			{ label: "Assigned", value: assigned },
			{ label: "In Progress", value: inProg },
			{ label: "Resolved", value: resolved },
		];
	}, [complaints, total, resolved]);

	const radarMetrics = useMemo(
		() => departments.map((d) => ({ key: d.slug, label: d.name })),
		[departments]
	);
	const radarData = useMemo(() => {
		const byDept = new Map<string, Complaint[]>();
		for (const c of complaints) {
			if (!c.departmentId) continue;
			const arr = byDept.get(c.departmentId) ?? [];
			arr.push(c);
			byDept.set(c.departmentId, arr);
		}
		const resolvedPct: Record<string, number> = {};
		const loadPct: Record<string, number> = {};
		const maxLoad = Math.max(1, ...Array.from(byDept.values()).map((a) => a.length));
		for (const d of departments) {
			const items = byDept.get(d.id) ?? [];
			const r = items.filter((c) => c.status === "resolved").length;
			resolvedPct[d.slug] = items.length === 0 ? 0 : Math.round((r / items.length) * 100);
			loadPct[d.slug] = Math.round((items.length / maxLoad) * 100);
		}
		return [
			{ label: "Resolution rate", values: resolvedPct },
			{ label: "Inbound load", values: loadPct },
		];
	}, [complaints, departments]);

	const sankeyData = useMemo(() => {
		const top = deptCounts.filter((d) => d.value > 0).slice(0, 6);
		const nodes = [{ name: "Submitted" }, ...top.map((d) => ({ name: d.label })), { name: "Resolved" }, { name: "Pending" }];
		const idx = (n: string) => nodes.findIndex((x) => x.name === n);
		const links: { source: number; target: number; value: number }[] = [];
		for (const d of top) {
			links.push({ source: idx("Submitted"), target: idx(d.label), value: d.value });
			const items = complaints.filter((c) => c.departmentId === d.id);
			const r = items.filter((c) => c.status === "resolved").length;
			const p = items.length - r;
			if (r > 0) links.push({ source: idx(d.label), target: idx("Resolved"), value: r });
			if (p > 0) links.push({ source: idx(d.label), target: idx("Pending"), value: p });
		}
		return { nodes, links };
	}, [deptCounts, complaints]);

	const hasData = total > 0;

	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Admin Overview</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Live grievance analytics across {departments.length} departments.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/dashboard/logs">
						View activity logs
						<RiArrowRightLine />
					</Link>
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
				<StatCard label="Total complaints" value={total.toLocaleString()} hint="all-time" />
				<StatCard label="Resolved" value={resolved.toLocaleString()} hint={total > 0 ? `${Math.round((resolved / total) * 100)}% of total` : "—"} />
				<StatCard label="In progress" value={inProgress.toLocaleString()} />
				<StatCard label="Pending" value={Math.max(0, pending).toLocaleString()} />
			</div>

			{!hasData && (
				<Card className="border-dashed">
					<CardContent className="p-8 text-center text-sm text-muted-foreground">
						No complaints have been submitted yet. Charts will populate as citizens file
						real grievances.
					</CardContent>
				</Card>
			)}

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Submission volume — last 30 days</CardTitle>
						<CardDescription>Daily complaint intake across all departments</CardDescription>
					</CardHeader>
					<CardContent>
						{areaSeries.length > 0 ? (
							<AreaChart data={areaSeries} xDataKey="date" aspectRatio="2 / 1">
								<Area dataKey="value" fill="#3b82f6" stroke="#3b82f6" />
							</AreaChart>
						) : (
							<EmptyState />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Complaints per department</CardTitle>
						<CardDescription>Top 12 departments by inbound volume</CardDescription>
					</CardHeader>
					<CardContent>
						{topBar.length > 0 ? (
							<BarChart data={topBar} xDataKey="label" aspectRatio="2 / 1">
								<Bar dataKey="value" fill="#8b5cf6" />
							</BarChart>
						) : (
							<EmptyState />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Submitted vs resolved trend</CardTitle>
						<CardDescription>Multi-series time comparison</CardDescription>
					</CardHeader>
					<CardContent>
						{lineSeries.length > 0 ? (
							<LineChart data={lineSeries} xDataKey="date" aspectRatio="2 / 1">
								<Line dataKey="submitted" stroke="#3b82f6" />
								<Line dataKey="resolved" stroke="#10b981" />
							</LineChart>
						) : (
							<EmptyState />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Department share</CardTitle>
						<CardDescription>Proportional complaint distribution (top 8)</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						{topPie.length > 0 ? (
							<div className="relative size-72">
								<PieChart data={topPie} innerRadius={60}>
									{topPie.map((slice, i) => (
										<PieSlice key={slice.label} index={i} />
									))}
									<PieCenter defaultLabel="Total" />
								</PieChart>
							</div>
						) : (
							<EmptyState />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Resolution status</CardTitle>
						<CardDescription>Resolved · in progress · pending</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						{hasData ? (
							<div className="relative size-72">
								<RingChart data={ringData}>
									{ringData.map((r, i) => (
										<Ring key={r.label} index={i} />
									))}
									<RingCenter defaultLabel="Resolved" />
								</RingChart>
							</div>
						) : (
							<EmptyState />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Submission funnel</CardTitle>
						<CardDescription>Complaint progression through resolution stages</CardDescription>
					</CardHeader>
					<CardContent>
						{hasData ? (
							<FunnelChart data={funnelData} orientation="horizontal" color="#3b82f6" />
						) : (
							<EmptyState />
						)}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Routing flow — submissions to outcomes</CardTitle>
					<CardDescription>
						Sankey diagram showing real complaint paths through departments to resolution states
					</CardDescription>
				</CardHeader>
				<CardContent>
					{sankeyData.links.length > 0 ? (
						<SankeyChart data={sankeyData} aspectRatio="3 / 1">
							<SankeyNode />
							<SankeyLink />
						</SankeyChart>
					) : (
						<EmptyState />
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Department performance radar</CardTitle>
					<CardDescription>
						Resolution rate (%) and inbound load across all {departments.length} departments
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center">
					{departments.length > 0 ? (
						<div className="relative aspect-square w-full max-w-[1100px]">
							<RadarChart data={radarData} metrics={radarMetrics}>
								<RadarGrid />
								<RadarAxis />
								<RadarLabels />
								{radarData.map((_, i) => (
									<RadarArea key={i} index={i} />
								))}
							</RadarChart>
						</div>
					) : (
						<EmptyState />
					)}
				</CardContent>
			</Card>

			<Separator />
			<p className="text-xs text-muted-foreground">
				All charts derive from live backend data. Live severity chart appears during complaint processing.
			</p>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
			No data yet
		</div>
	);
}
