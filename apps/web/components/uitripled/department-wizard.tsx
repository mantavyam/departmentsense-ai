"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { motion, type Variants } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	Copy,
	FileCheck,
	MapPin,
	Settings,
	ShieldCheck,
	User,
} from "lucide-react";
import { useState } from "react";

const containerVariants: Variants = {
	hidden: { opacity: 0, scale: 0.96 },
	visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

type Step = {
	id: number;
	name: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
	{ id: 1, name: "Department", description: "Name & description", icon: FileCheck },
	{ id: 2, name: "Officer", description: "Assigned officer", icon: User },
	{ id: 3, name: "Contact", description: "Office details", icon: MapPin },
	{ id: 4, name: "Style", description: "Icon & color", icon: Settings },
	{ id: 5, name: "Verification", description: "Generate code", icon: ShieldCheck },
];

const ICON_OPTIONS = [
	"Building2", "Zap", "Droplet", "Trash2", "Construction", "Heart", "Stethoscope",
	"Train", "Plane", "Ship", "Wheat", "GraduationCap", "ShieldCheck", "Scale",
	"Globe", "Factory", "TreePine", "Flame", "Radio", "Cpu",
];

const COLOR_OPTIONS = [
	"#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899",
	"#06b6d4", "#84cc16", "#f97316", "#a855f7", "#14b8a6", "#64748b",
];

export type DepartmentFormValues = {
	name: string;
	description: string;
	headName: string;
	officerEmail: string;
	officerContact: string;
	officerAddress: string;
	icon: string;
	color: string;
};

const EMPTY: DepartmentFormValues = {
	name: "",
	description: "",
	headName: "",
	officerEmail: "",
	officerContact: "",
	officerAddress: "",
	icon: "Building2",
	color: "#3b82f6",
};

type Props = {
	onClose: () => void;
	onSave: (values: DepartmentFormValues) => Promise<{ id: string }>;
	onGenerateCode: (departmentId: string) => Promise<{ verificationCode: string }>;
	initialValues?: Partial<DepartmentFormValues>;
};

export function DepartmentWizard({ onClose, onSave, onGenerateCode, initialValues }: Props) {
	const [step, setStep] = useState(1);
	const [values, setValues] = useState<DepartmentFormValues>({ ...EMPTY, ...initialValues });
	const [savedId, setSavedId] = useState<string | null>(null);
	const [code, setCode] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const update = <K extends keyof DepartmentFormValues>(key: K, val: DepartmentFormValues[K]) => {
		setValues((prev) => ({ ...prev, [key]: val }));
	};

	const canAdvance = () => {
		if (step === 1) return values.name.trim().length >= 2;
		return true;
	};

	const handleSaveAndGenerate = async () => {
		setError(null);
		setBusy(true);
		try {
			let id = savedId;
			if (!id) {
				const saved = await onSave(values);
				id = saved.id;
				setSavedId(id);
			}
			const res = await onGenerateCode(id);
			setCode(res.verificationCode);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to create department");
		} finally {
			setBusy(false);
		}
	};

	const handleCopy = async () => {
		if (!code) return;
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1600);
	};

	return (
		<div className="relative w-full">
			<motion.div
				variants={containerVariants}
				initial="hidden"
				animate="visible"
				className="relative overflow-hidden rounded-3xl border border-border/40 bg-background/40 backdrop-blur-xl"
			>
				<div className="grid lg:grid-cols-[280px_1fr]">
					<div className="border-b border-border/40 bg-background/30 p-6 lg:border-b-0 lg:border-r">
						<div className="mb-4 flex items-center justify-between">
							<Badge variant="outline">Create department</Badge>
						</div>
						<div className="space-y-1">
							{STEPS.map((s) => {
								const Icon = s.icon;
								const isCompleted = step > s.id;
								const isCurrent = step === s.id;
								return (
									<div key={s.id} className="relative flex items-center gap-3 py-3">
										{s.id !== STEPS.length && (
											<div className="absolute left-5 top-9 h-full w-[2px] bg-border/30" />
										)}
										<div
											className={cn(
												"relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
												isCompleted
													? "border-primary bg-primary text-primary-foreground"
													: isCurrent
													? "border-primary bg-background text-primary"
													: "border-border/50 bg-background/50 text-muted-foreground"
											)}
										>
											{isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
										</div>
										<div className="flex flex-col">
											<span
												className={cn(
													"text-sm font-semibold",
													isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
												)}
											>
												{s.name}
											</span>
											<span className="text-xs text-muted-foreground/80">{s.description}</span>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="flex flex-col p-6 lg:p-10">
						<div className="flex-1 space-y-6">
							<div>
								<h2 className="text-xl font-semibold">{STEPS[step - 1]!.name}</h2>
								<p className="text-sm text-muted-foreground">{STEPS[step - 1]!.description}</p>
							</div>

							{step === 1 && (
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="dept-name">Department name *</Label>
										<Input
											id="dept-name"
											value={values.name}
											onChange={(e) => update("name", e.target.value)}
											placeholder="e.g. Urban Sanitation"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="dept-description">Description</Label>
										<Textarea
											id="dept-description"
											value={values.description}
											onChange={(e) => update("description", e.target.value)}
											placeholder="What does this department handle?"
											className="min-h-24"
										/>
									</div>
								</div>
							)}

							{step === 2 && (
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="head-name">Officer name</Label>
										<Input
											id="head-name"
											value={values.headName}
											onChange={(e) => update("headName", e.target.value)}
											placeholder="Full name of assigned officer"
										/>
									</div>
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="officer-email">Officer email</Label>
										<Input
											id="officer-email"
											type="email"
											value={values.officerEmail}
											onChange={(e) => update("officerEmail", e.target.value)}
											placeholder="officer@gov.in"
										/>
										<p className="text-xs text-muted-foreground">
											Used to map them to the department on sign-in.
										</p>
									</div>
								</div>
							)}

							{step === 3 && (
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2 md:col-span-2">
										<Label htmlFor="officer-address">Office address</Label>
										<Textarea
											id="officer-address"
											value={values.officerAddress}
											onChange={(e) => update("officerAddress", e.target.value)}
											className="min-h-20"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="officer-contact">Contact number</Label>
										<Input
											id="officer-contact"
											value={values.officerContact}
											onChange={(e) => update("officerContact", e.target.value)}
											placeholder="+91 11 0000 0000"
										/>
									</div>
								</div>
							)}

							{step === 4 && (
								<div className="space-y-6">
									<div className="space-y-3">
										<Label>Icon</Label>
										<div className="grid grid-cols-6 gap-2 md:grid-cols-10">
											{ICON_OPTIONS.map((name) => (
												<button
													key={name}
													type="button"
													onClick={() => update("icon", name)}
													className={cn(
														"rounded-lg border px-2 py-1.5 text-xs",
														values.icon === name
															? "border-primary bg-primary/10 text-primary"
															: "border-border/50 hover:border-primary/40"
													)}
												>
													{name}
												</button>
											))}
										</div>
									</div>
									<div className="space-y-3">
										<Label>Accent color</Label>
										<div className="flex flex-wrap gap-2">
											{COLOR_OPTIONS.map((c) => (
												<button
													key={c}
													type="button"
													onClick={() => update("color", c)}
													style={{ backgroundColor: c }}
													className={cn(
														"h-8 w-8 rounded-full border-2 transition-transform",
														values.color === c ? "scale-110 border-foreground" : "border-transparent"
													)}
													aria-label={`Color ${c}`}
												/>
											))}
										</div>
									</div>
								</div>
							)}

							{step === 5 && (
								<div className="space-y-5">
									<div className="rounded-xl border border-border/40 bg-background/30 p-5">
										<dl className="grid gap-2 text-sm md:grid-cols-2">
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">Name</dt>
												<dd className="font-medium">{values.name || "—"}</dd>
											</div>
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">Officer</dt>
												<dd>{values.headName || "—"}</dd>
											</div>
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
												<dd>{values.officerEmail || "—"}</dd>
											</div>
											<div>
												<dt className="text-xs uppercase tracking-wider text-muted-foreground">Contact</dt>
												<dd>{values.officerContact || "—"}</dd>
											</div>
										</dl>
									</div>

									{!code ? (
										<>
											<Button onClick={handleSaveAndGenerate} disabled={busy} className="w-full">
												{busy
													? savedId
														? "Generating code…"
														: "Saving department…"
													: savedId
													? "Generate 6-digit code"
													: "Save department and generate code"}
											</Button>
											{error && <p className="text-sm text-destructive">{error}</p>}
										</>
									) : (
										<div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
											<p className="text-xs uppercase tracking-widest text-muted-foreground">
												Verification code
											</p>
											<p className="font-mono text-4xl font-bold tracking-[0.4em]">{code}</p>
											<div className="flex justify-center gap-2">
												<Button onClick={handleCopy} variant="outline" size="sm">
													{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
													{copied ? "Copied" : "Copy to clipboard"}
												</Button>
												<Button onClick={handleSaveAndGenerate} disabled={busy} variant="ghost" size="sm">
													Regenerate
												</Button>
											</div>
											<p className="text-xs text-muted-foreground">
												Share this code with the department head out-of-band. They will use it with their email to sign in.
											</p>
										</div>
									)}
								</div>
							)}
						</div>

						<div className="mt-8 flex items-center justify-between border-t border-border/40 pt-6">
							<Button
								variant="ghost"
								onClick={() => setStep((s) => Math.max(1, s - 1))}
								disabled={step === 1}
							>
								<ArrowLeft className="h-4 w-4" />
								Back
							</Button>
							{step < STEPS.length ? (
								<Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
									Next
									<ArrowRight className="h-4 w-4" />
								</Button>
							) : (
								<Button onClick={onClose} variant={code ? "default" : "ghost"}>
									{code ? "Done" : "Cancel"}
								</Button>
							)}
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
}
