"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { RiArrowRightLine, RiArrowUpLine, RiArrowDownLine } from "@remixicon/react";
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
import { CandlestickChart } from "@/components/charts/candlestick-chart";
import { Candlestick } from "@/components/charts/candlestick";
import { SankeyChart } from "@/components/charts/sankey/sankey-chart";
import { SankeyNode } from "@/components/charts/sankey/sankey-node";
import { SankeyLink } from "@/components/charts/sankey/sankey-link";
import { chartMockData, complaints, departments } from "@/lib/mock-data";

const totalComplaints = complaints.length + 1187;
const resolved = complaints.filter((c) => c.status === "resolved").length + 812;
const inProgress = complaints.filter((c) => c.status === "in-progress").length + 220;
const pending = totalComplaints - resolved - inProgress;

function StatCard({
	label,
	value,
	delta,
	trend,
}: {
	label: string;
	value: string;
	delta: string;
	trend: "up" | "down";
}) {
	return (
		<Card className="p-5">
			<p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
			<div className="mt-2 flex items-end justify-between">
				<p className="text-3xl font-semibold">{value}</p>
				<Badge variant={trend === "up" ? "success" : "destructive"} className="gap-0.5">
					{trend === "up" ? <RiArrowUpLine /> : <RiArrowDownLine />}
					{delta}
				</Badge>
			</div>
		</Card>
	);
}

const radarMetrics = departments.map((d) => ({ key: d.slug, label: d.name }));
const radarData = chartMockData.radar.map((series) => ({
	label: series.label,
	values: Object.fromEntries(series.data.map((d, i) => [departments[i]!.slug, d.value])),
}));

export function AdminOverview() {
	return (
		<div className="space-y-6">
			<div className="flex items-end justify-between">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Admin Overview</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						System-wide grievance analytics · all 9 chart visualisations active.
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
				<StatCard label="Total complaints" value={totalComplaints.toLocaleString()} delta="+12.4%" trend="up" />
				<StatCard label="Resolved" value={resolved.toLocaleString()} delta="+8.1%" trend="up" />
				<StatCard label="In progress" value={inProgress.toLocaleString()} delta="-2.3%" trend="down" />
				<StatCard label="Pending" value={pending.toLocaleString()} delta="+1.0%" trend="up" />
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Submission volume — last 30 days</CardTitle>
						<CardDescription>Daily complaint intake across all departments</CardDescription>
					</CardHeader>
					<CardContent>
						<AreaChart data={chartMockData.area} xDataKey="date" aspectRatio="2 / 1">
							<Area dataKey="value" fill="#3b82f6" stroke="#3b82f6" />
						</AreaChart>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Complaints per department</CardTitle>
						<CardDescription>Current month, by department</CardDescription>
					</CardHeader>
					<CardContent>
						<BarChart data={chartMockData.bar} xDataKey="label" aspectRatio="2 / 1">
							<Bar dataKey="value" fill="#8b5cf6" />
						</BarChart>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Submitted vs resolved trend</CardTitle>
						<CardDescription>Multi-series time comparison</CardDescription>
					</CardHeader>
					<CardContent>
						<LineChart data={chartMockData.line} xDataKey="date" aspectRatio="2 / 1">
							<Line dataKey="submitted" stroke="#3b82f6" />
							<Line dataKey="resolved" stroke="#10b981" />
						</LineChart>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Department share</CardTitle>
						<CardDescription>Proportional complaint distribution</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						<div className="relative size-72">
							<PieChart data={chartMockData.pie} innerRadius={60}>
								{chartMockData.pie.map((slice, i) => (
									<PieSlice key={slice.label} index={i} />
								))}
								<PieCenter defaultLabel="Total" />
							</PieChart>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Resolution status</CardTitle>
						<CardDescription>Multi-ring progress (resolved · in progress · pending)</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						<div className="relative size-72">
							<RingChart
								data={chartMockData.ring.map((r) => ({ ...r, maxValue: 100 }))}
							>
								{chartMockData.ring.map((r, i) => (
									<Ring key={r.label} index={i} />
								))}
								<RingCenter defaultLabel="Resolved" />
							</RingChart>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Submission funnel</CardTitle>
						<CardDescription>Complaint progression through resolution stages</CardDescription>
					</CardHeader>
					<CardContent>
						<FunnelChart data={chartMockData.funnel} orientation="horizontal" color="#3b82f6" />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Department performance radar</CardTitle>
						<CardDescription>Resolution rate by department, MoM comparison</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						<div className="relative size-80">
							<RadarChart data={radarData} metrics={radarMetrics}>
								<RadarGrid />
								<RadarAxis />
								<RadarLabels />
								{radarData.map((_, i) => (
									<RadarArea key={i} index={i} />
								))}
							</RadarChart>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Severity range (last 20 days)</CardTitle>
						<CardDescription>Daily severity index — open/high/low/close</CardDescription>
					</CardHeader>
					<CardContent>
						<CandlestickChart
							data={chartMockData.candlestick.map((p) => ({ ...p, date: new Date(p.date) }))}
							xDataKey="date"
							aspectRatio="2 / 1"
						>
							<Candlestick />
						</CandlestickChart>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Routing flow — submissions to outcomes</CardTitle>
					<CardDescription>Sankey diagram showing complaint paths through departments to resolution states</CardDescription>
				</CardHeader>
				<CardContent>
					<SankeyChart data={chartMockData.sankey} aspectRatio="3 / 1">
						<SankeyNode />
						<SankeyLink />
					</SankeyChart>
				</CardContent>
			</Card>

			<Separator />
			<p className="text-xs text-muted-foreground">
				All chart components are pre-installed in <code>apps/web/components/charts/</code> · live-line chart appears during complaint processing for severity assessment.
			</p>
		</div>
	);
}
