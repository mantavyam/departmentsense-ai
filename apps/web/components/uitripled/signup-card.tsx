"use client";

import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { motion, useReducedMotion } from "framer-motion";
import { FormEvent, useState } from "react";

type GlassSignUpCardProps = {
	title?: string;
	subtitle?: string;
	loading?: boolean;
	error?: string | null;
	onSubmit: (values: { name: string; email: string; password: string }) => void | Promise<void>;
	footer?: React.ReactNode;
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function GlassSignUpCard({
	title = "Create your account",
	subtitle = "Sign up with your email to submit and track complaints.",
	loading = false,
	error = null,
	onSubmit,
	footer,
}: GlassSignUpCardProps) {
	const shouldReduceMotion = useReducedMotion();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [acceptedTerms, setAcceptedTerms] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);

	const validate = (): string | null => {
		if (name.trim().length < 2) return "Please enter your full name.";
		if (!EMAIL_RE.test(email)) return "Please enter a valid email address.";
		if (password.length < 8) return "Password must be at least 8 characters.";
		if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
			return "Password must contain at least one letter and one digit.";
		if (password !== confirm) return "Passwords do not match.";
		if (!acceptedTerms) return "Please accept the terms to continue.";
		return null;
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const msg = validate();
		setLocalError(msg);
		if (msg) return;
		await onSubmit({ name: name.trim(), email: email.trim(), password });
	};

	const displayError = localError ?? error;

	return (
		<motion.div
			initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.45,
				ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
			}}
			className="group w-full rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-12 relative"
		>
			<div className="mb-8 text-center">
				<div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
					Sign Up
				</div>
				<h1 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
					{title}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
			</div>

			<form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="signup-name">Full name</Label>
					<Input
						id="signup-name"
						placeholder="Anita Desai"
						autoComplete="name"
						required
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
					/>
				</div>
				<div className="space-y-2 sm:col-span-2">
					<Label htmlFor="signup-email">Email address</Label>
					<Input
						id="signup-email"
						type="email"
						placeholder="you@example.com"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
					/>
				</div>
				<div className="space-y-2 sm:col-span-1">
					<Label htmlFor="signup-password">Password</Label>
					<Input
						id="signup-password"
						type="password"
						placeholder="Min 8 chars"
						autoComplete="new-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
					/>
				</div>
				<div className="space-y-2 sm:col-span-1">
					<Label htmlFor="signup-confirm">Confirm password</Label>
					<Input
						id="signup-confirm"
						type="password"
						placeholder="Repeat password"
						autoComplete="new-password"
						required
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
					/>
				</div>

				<div className="sm:col-span-2">
					<label className="flex items-start gap-3 text-sm text-muted-foreground">
						<Checkbox
							id="signup-terms"
							checked={acceptedTerms}
							onCheckedChange={(checked) => setAcceptedTerms(Boolean(checked))}
						/>
						<span>I agree to the terms of service and privacy policy.</span>
					</label>
				</div>

				{displayError && (
					<p className="sm:col-span-2 text-sm text-destructive" role="alert">
						{displayError}
					</p>
				)}

				<div className="sm:col-span-2">
					<Button
						type="submit"
						disabled={loading}
						className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-transform duration-300 hover:-translate-y-1 disabled:opacity-60"
					>
						{loading ? "Creating account…" : "Create account"}
					</Button>
				</div>
			</form>

			{footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
		</motion.div>
	);
}
