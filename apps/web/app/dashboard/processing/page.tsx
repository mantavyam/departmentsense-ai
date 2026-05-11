"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { CheckCircle2, Loader2 } from "lucide-react";
import { RiArrowRightLine, RiDownloadLine } from "@remixicon/react";
import { AppShell } from "@/components/dashboard/app-shell";
import {
	ChainOfThought,
	ChainOfThoughtContent,
	ChainOfThoughtHeader,
	ChainOfThoughtStep,
} from "@/components/ai/chain-of-thought";
import { LiveLineChart } from "@/components/charts/live-line-chart";
import { LiveLine } from "@/components/charts/live-line";
import { LiveXAxis } from "@/components/charts/live-x-axis";
import { LiveYAxis } from "@/components/charts/live-y-axis";
import { Grid } from "@/components/charts/grid";
import type { ClassificationStep, Complaint } from "@/lib/mock-data";
import type { LiveLinePoint } from "@/components/charts/live-line-chart";
import { api } from "@/lib/api";
import { useDepartments } from "@/lib/use-complaints";

type Payload = {
	name: string;
	email: string;
	subject: string;
	body: string;
	location: string;
	language: string;
};

type Result = {
	referenceNumber: string;
	departmentId: string;
	departmentName: string;
	priority: string;
	confidence: number;
	complaintId: string;
};

function ProcessingInner() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const payloadParam = searchParams?.get("payload");
	const { data: departments } = useDepartments();

	const [payload, setPayload] = useState<Payload | null>(null);
	const [completedSteps, setCompletedSteps] = useState<ClassificationStep[]>([]);
	const [activeStepIndex, setActiveStepIndex] = useState(0);
	const [result, setResult] = useState<Result | null>(null);
	const [liveSeries, setLiveSeries] = useState<LiveLinePoint[]>([]);
	const [currentSeverity, setCurrentSeverity] = useState(0.3);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		if (!payloadParam) {
			router.replace("/dashboard/submit");
			return;
		}
		try {
			const p: Payload = JSON.parse(decodeURIComponent(payloadParam));
			setPayload(p);
		} catch {
			router.replace("/dashboard/submit");
		}
	}, [payloadParam, router]);

	useEffect(() => {
		if (!payload) return;

		const startTime = Date.now() / 1000;
		intervalRef.current = setInterval(() => {
			const elapsed = Date.now() / 1000 - startTime;
			const next = Math.max(
				0,
				Math.min(1, 0.3 + 0.5 * Math.sin(elapsed * 0.7) + (Math.random() - 0.5) * 0.1)
			);
			setCurrentSeverity(next);
			setLiveSeries((prev) => [
				...prev.slice(-60),
				{ time: Date.now() / 1000, value: next },
			]);
		}, 200);

		(async () => {
			// Submit complaint to real API. Server runs classification synchronously
			// and emits WS events on /ws/complaints/{ref}. Open WS before POST so
			// we don't miss the first frames.
			const tempRef = `pending-${Date.now()}`;
			const ws = new WebSocket(api.wsUrl(tempRef));
			wsRef.current = ws;

			const created = await api.createComplaint({
				citizenName: payload.name,
				citizenEmail: payload.email,
				subject: payload.subject,
				body: payload.body,
				language: payload.language,
				location: payload.location,
			});

			// After we know ref, also subscribe to the real ref channel for any future events.
			ws.close();
			const liveWs = new WebSocket(api.wsUrl(created.referenceNumber));
			wsRef.current = liveWs;
			liveWs.onmessage = (e) => {
				try {
					const msg = JSON.parse(e.data);
					if (msg.event === "status_changed") {
						/* future: react to status updates */
					}
				} catch {
					/* ignore */
				}
			};

			// Server response already contains the full reasoning trace + severity.
			// Replay the steps with delays so the UI animates.
			const dept = departments.find((d) => d.id === created.departmentId);
			for (let i = 0; i < created.reasoning.length; i++) {
				const step = created.reasoning[i]!;
				await new Promise((r) => setTimeout(r, Math.min(step.durationMs, 600)));
				setCompletedSteps((prev) => [...prev, step]);
				setActiveStepIndex(i + 1);
			}

			setResult({
				referenceNumber: created.referenceNumber,
				departmentId: created.departmentId ?? "",
				departmentName: dept?.name ?? "—",
				priority: created.priority,
				confidence: created.confidence,
				complaintId: created.id,
			});

			setTimeout(() => {
				if (intervalRef.current) clearInterval(intervalRef.current);
			}, 1500);
		})();

		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
			if (wsRef.current) wsRef.current.close();
		};
	}, [payload, departments]);

	if (!payload) {
		return (
			<AppShell>
				<Skeleton className="h-64 w-full" />
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="mx-auto max-w-5xl space-y-6">
				<div>
					<Badge variant="outline" className="mb-3">
						{result ? "Classification complete" : "Processing your complaint…"}
					</Badge>
					<h1 className="font-heading text-3xl tracking-tight">
						{result ? "Routed successfully" : "AI is analysing your submission"}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Reference: <span className="font-mono">{result?.referenceNumber ?? "generating…"}</span>
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
					<Card>
						<CardHeader>
							<CardTitle>Chain of thought</CardTitle>
							<CardDescription>Real-time AI reasoning trace</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<ChainOfThought defaultOpen open>
								<ChainOfThoughtHeader>Classification reasoning</ChainOfThoughtHeader>
								<ChainOfThoughtContent>
									{completedSteps.map((step) => (
										<ChainOfThoughtStep
											key={step.id}
											label={step.label}
											description={step.description}
											status="complete"
										/>
									))}
									{!result && (
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											className="flex items-center gap-2 text-sm text-muted-foreground"
										>
											<Loader2 className="size-4 animate-spin" />
											Working on step {activeStepIndex + 1}…
										</motion.div>
									)}
								</ChainOfThoughtContent>
							</ChainOfThought>

							{result && (
								<motion.div
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4"
								>
									<div className="flex items-start gap-3">
										<CheckCircle2 className="mt-0.5 size-5 text-emerald-500" />
										<div className="flex-1">
											<p className="font-semibold">Routed to {result.departmentName}</p>
											<p className="mt-0.5 text-sm text-muted-foreground">
												{(result.confidence * 100).toFixed(1)}% confidence ·{" "}
												<span className="font-medium capitalize">{result.priority}</span> priority
											</p>
										</div>
									</div>
								</motion.div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Severity assessment</CardTitle>
							<CardDescription>Real-time severity index</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="mb-2 flex items-end justify-between">
								<div>
									<p className="text-xs uppercase tracking-wider text-muted-foreground">Current</p>
									<p className="text-2xl font-semibold">{currentSeverity.toFixed(2)}</p>
								</div>
								<Badge
									variant={
										currentSeverity > 0.7
											? "destructive"
											: currentSeverity > 0.5
											? "warning"
											: "secondary"
									}
								>
									{currentSeverity > 0.7 ? "High" : currentSeverity > 0.5 ? "Elevated" : "Normal"}
								</Badge>
							</div>
							<div className="h-40">
								<LiveLineChart
									data={liveSeries}
									value={currentSeverity}
									window={20}
									paused={!!result}
								>
									<Grid />
									<LiveYAxis />
									<LiveXAxis />
									<LiveLine dataKey="value" />
								</LiveLineChart>
							</div>
						</CardContent>
					</Card>
				</div>

				{result && (
					<motion.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						className="rounded-xl border border-border bg-card p-6"
					>
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div>
								<p className="text-xs uppercase tracking-wider text-muted-foreground">Complaint receipt</p>
								<h3 className="mt-1 font-heading text-2xl">{result.referenceNumber}</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									Department: {result.departmentName}
								</p>
							</div>
							<div className="flex gap-2">
								<Button asChild variant="outline">
									<a href={api.ticketPdfUrl(result.complaintId)} download>
										<RiDownloadLine />
										Download PDF receipt
									</a>
								</Button>
								<Button asChild>
									<a href="/dashboard/complaints">
										View my complaints
										<RiArrowRightLine />
									</a>
								</Button>
							</div>
						</div>
					</motion.div>
				)}
			</div>
		</AppShell>
	);
}

export default function ProcessingPage() {
	return (
		<Suspense fallback={
			<AppShell>
				<Skeleton className="h-64 w-full" />
			</AppShell>
		}>
			<ProcessingInner />
		</Suspense>
	);
}
