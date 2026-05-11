"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { motion } from "framer-motion";
import { RiCheckLine, RiStarFill, RiEmotionSadLine, RiEmotionLine, RiEmotionHappyLine } from "@remixicon/react";
import { AppShell } from "@/components/dashboard/app-shell";
import { useRole } from "@/lib/role-context";
import { useComplaints, useDepartments } from "@/lib/use-complaints";
import { api } from "@/lib/api";

type Rating = "UNSATISFIED" | "AVERAGE" | "SATISFIED";

const options: { id: Rating; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
	{ id: "UNSATISFIED", label: "Unsatisfied", icon: RiEmotionSadLine, color: "text-red-500" },
	{ id: "AVERAGE", label: "Average", icon: RiEmotionLine, color: "text-amber-500" },
	{ id: "SATISFIED", label: "Satisfied", icon: RiEmotionHappyLine, color: "text-emerald-500" },
];

export default function FeedbackPage() {
	const { user, role } = useRole();
	const { data: allMine } = useComplaints(role, { citizenEmail: user?.email });
	const { data: departments } = useDepartments();
	const myResolved = useMemo(
		() => allMine.filter((c) => c.status === "resolved" && !c.resolutionFeedback),
		[allMine]
	);
	const [selected, setSelected] = useState<string | null>(null);
	const [rating, setRating] = useState<Rating | null>(null);
	const [comment, setComment] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useMemo(() => {
		if (!selected && myResolved[0]) setSelected(myResolved[0].id);
	}, [myResolved, selected]);

	const complaint = myResolved.find((c) => c.id === selected) ?? null;
	const dept = complaint ? departments.find((d) => d.id === complaint.departmentId) : null;

	const handleSubmit = async () => {
		if (!complaint || !rating) return;
		try {
			await api.updateFeedback(complaint.id, rating);
			setSubmitted(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to submit feedback");
		}
	};

	if (myResolved.length === 0 && !submitted) {
		return (
			<AppShell>
				<div className="mx-auto max-w-2xl">
					<Card className="p-10 text-center">
						<RiStarFill className="mx-auto size-10 text-muted-foreground/30" />
						<h2 className="mt-4 text-xl font-semibold">No resolved complaints awaiting feedback</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							When your complaints are resolved, you can rate the service here.
						</p>
					</Card>
				</div>
			</AppShell>
		);
	}

	return (
		<AppShell>
			<div className="mx-auto max-w-3xl space-y-6">
				<div>
					<h1 className="font-heading text-3xl tracking-tight">Rate your experience</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Your feedback helps us improve grievance resolution.
					</p>
				</div>

				{submitted ? (
					<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
						<Card className="p-8 text-center">
							<div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white">
								<RiCheckLine className="size-6" />
							</div>
							<h2 className="mt-4 text-xl font-semibold">Thank you for your feedback</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Your response has been recorded and shared with the department.
							</p>
						</Card>
					</motion.div>
				) : (
					<Card>
						<CardHeader>
							<CardTitle>{complaint?.subject}</CardTitle>
							<CardDescription>
								{dept?.name} · resolved on{" "}
								{complaint && new Date(complaint.submittedAt).toLocaleDateString("en-IN")}
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							{myResolved.length > 1 && (
								<div className="space-y-2">
									<label className="text-sm font-medium">Select a complaint to rate</label>
									<select
										value={selected ?? ""}
										onChange={(e) => setSelected(e.target.value)}
										className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
									>
										{myResolved.map((c) => (
											<option key={c.id} value={c.id}>
												{c.referenceNumber} — {c.subject}
											</option>
										))}
									</select>
								</div>
							)}

							<div>
								<p className="mb-3 text-sm font-medium">How was your experience?</p>
								<div className="grid grid-cols-3 gap-3">
									{options.map((opt) => {
										const Icon = opt.icon;
										const active = rating === opt.id;
										return (
											<button
												key={opt.id}
												type="button"
												onClick={() => setRating(opt.id)}
												className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
													active
														? "border-primary bg-primary/5"
														: "border-border hover:border-primary/40"
												}`}
											>
												<Icon className={`size-8 ${opt.color}`} />
												<span className="text-sm font-medium">{opt.label}</span>
												{active && <Badge variant="success">Selected</Badge>}
											</button>
										);
									})}
								</div>
							</div>

							<div className="space-y-2">
								<label className="text-sm font-medium" htmlFor="fb-comment">
									Additional comments (optional)
								</label>
								<Textarea
									id="fb-comment"
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									placeholder="What worked well or could be improved?"
									className="min-h-32"
								/>
							</div>

							<Button onClick={handleSubmit} disabled={!rating} className="w-full">
								Submit feedback
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</AppShell>
	);
}
