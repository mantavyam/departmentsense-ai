"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import {
	RiArrowLeftLine,
	RiDownloadLine,
	RiMapPin2Line,
	RiCalendarLine,
	RiUser3Line,
	RiCheckLine,
	RiTimer2Line,
} from "@remixicon/react";
import { AppShell } from "@/components/dashboard/app-shell";
import { useComplaint, useDepartments } from "@/lib/use-complaints";
import { api } from "@/lib/api";
import { useRole } from "@/lib/role-context";

const TIMELINE_STAGES = [
	{ id: "submitted", label: "Submitted", description: "Complaint received" },
	{ id: "classified", label: "Classified", description: "AI assigned department + priority" },
	{ id: "assigned", label: "Assigned", description: "Routed to department head" },
	{ id: "in-progress", label: "In Progress", description: "Action being taken" },
	{ id: "resolved", label: "Resolved", description: "Issue addressed" },
];

export default function TrackPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const router = useRouter();
	const { role } = useRole();
	const { data: complaint, loading } = useComplaint(id);
	const { data: departments } = useDepartments();

	if (loading) {
		return (
			<AppShell>
				<div className="rounded-xl border border-border p-10 text-center">
					<p className="text-sm text-muted-foreground">Loading…</p>
				</div>
			</AppShell>
		);
	}

	if (!complaint) {
		return (
			<AppShell>
				<div className="rounded-xl border border-border p-10 text-center">
					<p className="text-sm text-muted-foreground">Complaint not found.</p>
					<Button onClick={() => router.back()} variant="outline" className="mt-4">
						Go back
					</Button>
				</div>
			</AppShell>
		);
	}

	const dept = departments.find((d) => d.id === complaint.departmentId);
	const currentStageIdx = TIMELINE_STAGES.findIndex((s) => s.id === complaint.status);

	return (
		<AppShell>
			<div className="mx-auto max-w-4xl space-y-6">
				<Button variant="ghost" onClick={() => router.back()}>
					<RiArrowLeftLine />
					Back
				</Button>

				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p className="font-mono text-xs text-muted-foreground">{complaint.referenceNumber}</p>
						<h1 className="mt-1 font-heading text-2xl tracking-tight md:text-3xl">
							{complaint.subject}
						</h1>
						<div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
							<span className="inline-flex items-center gap-1.5">
								<RiUser3Line className="size-3.5" />
								{complaint.citizenName}
							</span>
							<span>·</span>
							<span className="inline-flex items-center gap-1.5">
								<RiMapPin2Line className="size-3.5" />
								{complaint.location}
							</span>
							<span>·</span>
							<span className="inline-flex items-center gap-1.5">
								<RiCalendarLine className="size-3.5" />
								{new Date(complaint.submittedAt).toLocaleDateString("en-IN")}
							</span>
						</div>
					</div>
					<div className="flex gap-2">
						<Button asChild variant="outline">
							<a href={api.ticketPdfUrl(complaint.id)} download>
								<RiDownloadLine />
								Receipt PDF
							</a>
						</Button>
						{role === "admin" && (
							<Button asChild variant="outline">
								<a href={api.classificationPdfUrl(complaint.id)} download>
									<RiDownloadLine />
									Reasoning PDF
								</a>
							</Button>
						)}
					</div>
				</div>

				<div className="flex flex-wrap gap-2">
					<Badge variant="outline">{dept?.name}</Badge>
					<Badge
						variant={
							complaint.priority === "urgent"
								? "destructive"
								: complaint.priority === "high"
								? "warning"
								: "secondary"
						}
					>
						{complaint.priority} priority
					</Badge>
					<Badge variant="outline">{(complaint.confidence * 100).toFixed(0)}% confidence</Badge>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Resolution timeline</CardTitle>
						<CardDescription>Real-time status of your grievance</CardDescription>
					</CardHeader>
					<CardContent>
						<ol className="space-y-4">
							{TIMELINE_STAGES.map((stage, i) => {
								const isComplete = i <= currentStageIdx;
								const isCurrent = i === currentStageIdx;
								return (
									<li key={stage.id} className="flex gap-4">
										<div className="flex flex-col items-center">
											<div
												className={`flex size-8 shrink-0 items-center justify-center rounded-full transition-colors ${
													isComplete
														? "bg-emerald-500 text-white"
														: "bg-muted text-muted-foreground"
												}`}
											>
												{isComplete ? (
													isCurrent ? <RiTimer2Line className="size-4" /> : <RiCheckLine className="size-4" />
												) : (
													<span className="text-xs">{i + 1}</span>
												)}
											</div>
											{i < TIMELINE_STAGES.length - 1 && (
												<div
													className={`mt-1 h-12 w-0.5 ${
														i < currentStageIdx ? "bg-emerald-500" : "bg-border"
													}`}
												/>
											)}
										</div>
										<div className="flex-1 pb-6">
											<p className={`font-medium ${isComplete ? "text-foreground" : "text-muted-foreground"}`}>
												{stage.label}
											</p>
											<p className="text-sm text-muted-foreground">{stage.description}</p>
										</div>
									</li>
								);
							})}
						</ol>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Complaint details</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm leading-relaxed">{complaint.body}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>AI reasoning trace</CardTitle>
						<CardDescription>How your complaint was classified and routed</CardDescription>
					</CardHeader>
					<CardContent>
						<ol className="space-y-3">
							{complaint.reasoning.map((step, i) => (
								<li key={step.id} className="flex gap-3 rounded-lg border border-border bg-muted/30 p-3">
									<span className="font-mono text-xs text-muted-foreground">{i + 1}.</span>
									<div className="flex-1">
										<p className="text-sm font-medium">{step.label}</p>
										<p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
										<p className="mt-1 text-xs text-muted-foreground/70">{step.durationMs}ms</p>
									</div>
								</li>
							))}
						</ol>
					</CardContent>
				</Card>

				<Separator />
				{complaint.resolutionFeedback && (
					<Card>
						<CardHeader>
							<CardTitle>Citizen feedback</CardTitle>
						</CardHeader>
						<CardContent>
							<Badge
								variant={
									complaint.resolutionFeedback === "SATISFIED"
										? "success"
										: complaint.resolutionFeedback === "AVERAGE"
										? "warning"
										: "destructive"
								}
								className="text-sm"
							>
								{complaint.resolutionFeedback}
							</Badge>
						</CardContent>
					</Card>
				)}
			</div>
		</AppShell>
	);
}
