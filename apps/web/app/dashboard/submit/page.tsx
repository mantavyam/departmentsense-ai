"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Label } from "@workspace/ui/components/label";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
	RiArrowLeftLine,
	RiArrowRightLine,
	RiCheckLine,
	RiMapPin2Line,
	RiUserLine,
	RiFileTextLine,
	RiShieldCheckLine,
} from "@remixicon/react";
import { AppShell } from "@/components/dashboard/app-shell";
import { useRole } from "@/lib/role-context";

const STEPS = [
	{ id: 1, name: "Identity", description: "Confirm your details", icon: RiUserLine },
	{ id: 2, name: "Location", description: "Where is this happening?", icon: RiMapPin2Line },
	{ id: 3, name: "Complaint", description: "Describe the issue", icon: RiFileTextLine },
	{ id: 4, name: "Review", description: "Verify and submit", icon: RiShieldCheckLine },
];

type FormState = {
	name: string;
	email: string;
	phone: string;
	location: string;
	pincode: string;
	subject: string;
	body: string;
	language: string;
};

export default function SubmitPage() {
	const router = useRouter();
	const { user } = useRole();
	const [step, setStep] = useState(1);
	const [form, setForm] = useState<FormState>({
		name: user?.name ?? "",
		email: user?.email ?? "",
		phone: "",
		location: "",
		pincode: "",
		subject: "",
		body: "",
		language: "en",
	});

	const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const canProceed = () => {
		if (step === 1) return form.name.trim() && form.email.trim();
		if (step === 2) return form.location.trim();
		if (step === 3) return form.subject.trim() && form.body.trim().length >= 20;
		return true;
	};

	const handleSubmit = () => {
		const payload = encodeURIComponent(
			JSON.stringify({
				name: form.name,
				email: form.email,
				subject: form.subject,
				body: form.body,
				location: form.location,
				language: form.language,
			})
		);
		router.push(`/dashboard/processing?payload=${payload}`);
	};

	return (
		<AppShell>
			<div className="mx-auto max-w-5xl">
				<div className="mb-8">
					<h1 className="font-heading text-3xl tracking-tight">Submit a complaint</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						We&apos;ll classify and route your complaint to the right department in seconds.
					</p>
				</div>

				<Card className="overflow-hidden">
					<div className="grid lg:grid-cols-[260px_1fr]">
						<div className="border-b border-border bg-muted/30 p-6 lg:border-b-0 lg:border-r">
							<ol className="space-y-1">
								{STEPS.map((s) => {
									const Icon = s.icon;
									const isActive = step === s.id;
									const isComplete = step > s.id;
									return (
										<li
											key={s.id}
											className={`flex gap-3 rounded-lg p-3 transition-all ${
												isActive ? "bg-background shadow-sm" : ""
											}`}
										>
											<div
												className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
													isComplete
														? "bg-emerald-500 text-white"
														: isActive
														? "bg-primary text-primary-foreground"
														: "bg-muted text-muted-foreground"
												}`}
											>
												{isComplete ? <RiCheckLine className="size-4" /> : <Icon className="size-4" />}
											</div>
											<div>
												<p className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
													{s.name}
												</p>
												<p className="text-xs text-muted-foreground">{s.description}</p>
											</div>
										</li>
									);
								})}
							</ol>
						</div>

						<div className="p-6 lg:p-10">
							<AnimatePresence mode="wait">
								<motion.div
									key={step}
									initial={{ opacity: 0, x: 12 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -12 }}
									transition={{ duration: 0.25 }}
									className="min-h-[320px] space-y-6"
								>
									<div>
										<h2 className="text-xl font-semibold">{STEPS[step - 1]!.name}</h2>
										<p className="text-sm text-muted-foreground">{STEPS[step - 1]!.description}</p>
									</div>

									{step === 1 && (
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor="name">Full name</Label>
												<Input
													id="name"
													value={form.name}
													onChange={(e) => update("name", e.target.value)}
													placeholder="Anita Desai"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="email">Email</Label>
												<Input
													id="email"
													type="email"
													value={form.email}
													onChange={(e) => update("email", e.target.value)}
													placeholder="you@example.com"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="phone">Phone (optional)</Label>
												<Input
													id="phone"
													type="tel"
													value={form.phone}
													onChange={(e) => update("phone", e.target.value)}
													placeholder="+91 98765 43210"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="language">Preferred language</Label>
												<select
													id="language"
													value={form.language}
													onChange={(e) => update("language", e.target.value)}
													className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
												>
													<option value="en">English</option>
													<option value="hi">हिन्दी (Hindi)</option>
													<option value="bn">বাংলা (Bengali)</option>
													<option value="ta">தமிழ் (Tamil)</option>
													<option value="te">తెలుగు (Telugu)</option>
												</select>
											</div>
										</div>
									)}

									{step === 2 && (
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2 md:col-span-2">
												<Label htmlFor="location">Address / Locality</Label>
												<Input
													id="location"
													value={form.location}
													onChange={(e) => update("location", e.target.value)}
													placeholder="Sector 21, Block C"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="pincode">Pincode</Label>
												<Input
													id="pincode"
													value={form.pincode}
													onChange={(e) => update("pincode", e.target.value)}
													placeholder="110001"
												/>
											</div>
										</div>
									)}

									{step === 3 && (
										<div className="space-y-4">
											<div className="space-y-2">
												<Label htmlFor="subject">Subject</Label>
												<Input
													id="subject"
													value={form.subject}
													onChange={(e) => update("subject", e.target.value)}
													placeholder="No power for 18 hours in Block C"
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="body">Describe the issue</Label>
												<Textarea
													id="body"
													value={form.body}
													onChange={(e) => update("body", e.target.value)}
													placeholder="Provide details — when it started, who is affected, any prior attempts to resolve…"
													className="min-h-40"
												/>
												<p className="text-xs text-muted-foreground">
													{form.body.length} characters · minimum 20
												</p>
											</div>
										</div>
									)}

									{step === 4 && (
										<div className="space-y-4">
											<div className="rounded-lg border border-border bg-muted/30 p-5 text-sm">
												<dl className="space-y-3">
													<div>
														<dt className="text-xs uppercase tracking-wider text-muted-foreground">Identity</dt>
														<dd className="font-medium">{form.name} · {form.email}</dd>
													</div>
													<div>
														<dt className="text-xs uppercase tracking-wider text-muted-foreground">Location</dt>
														<dd>{form.location} {form.pincode && `(${form.pincode})`}</dd>
													</div>
													<div>
														<dt className="text-xs uppercase tracking-wider text-muted-foreground">Subject</dt>
														<dd className="font-medium">{form.subject}</dd>
													</div>
													<div>
														<dt className="text-xs uppercase tracking-wider text-muted-foreground">Details</dt>
														<dd className="whitespace-pre-wrap">{form.body}</dd>
													</div>
												</dl>
											</div>
											<Badge variant="outline" className="gap-1.5">
												<RiShieldCheckLine className="size-3" />
												Your data is encrypted in transit
											</Badge>
										</div>
									)}
								</motion.div>
							</AnimatePresence>

							<div className="mt-8 flex items-center justify-between">
								<Button
									variant="ghost"
									onClick={() => setStep((s) => Math.max(1, s - 1))}
									disabled={step === 1}
								>
									<RiArrowLeftLine />
									Back
								</Button>
								{step < STEPS.length ? (
									<Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
										Continue
										<RiArrowRightLine />
									</Button>
								) : (
									<Button onClick={handleSubmit}>
										Submit complaint
										<RiArrowRightLine />
									</Button>
								)}
							</div>
						</div>
					</div>
				</Card>
			</div>
		</AppShell>
	);
}
