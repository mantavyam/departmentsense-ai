"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { motion, useReducedMotion } from "framer-motion";
import { FormEvent, useState } from "react";

type GlassSignInCardProps = {
	title?: string;
	subtitle?: string;
	submitLabel?: string;
	loading?: boolean;
	error?: string | null;
	onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
	footer?: React.ReactNode;
};

export function GlassSignInCard({
	title = "Sign in",
	subtitle = "Enter your email and password.",
	submitLabel = "Continue",
	loading = false,
	error = null,
	onSubmit,
	footer,
}: GlassSignInCardProps) {
	const shouldReduceMotion = useReducedMotion();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await onSubmit({ email: email.trim(), password });
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.45,
				ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
			}}
			className="group w-full max-w-lg rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-10 relative"
			role="form"
		>
			<div className="mb-8 space-y-2 text-center">
				<div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
					Sign In
				</div>
				<h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
					{title}
				</h1>
				<p className="text-sm text-muted-foreground">{subtitle}</p>
			</div>

			<form className="space-y-5" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<Label htmlFor="signin-email">Email address</Label>
					<Input
						id="signin-email"
						type="email"
						placeholder="you@example.com"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="signin-password">Password</Label>
					<Input
						id="signin-password"
						type="password"
						placeholder="Enter your password"
						autoComplete="current-password"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="h-11 rounded-2xl border-border/60 bg-background/60 px-4"
					/>
				</div>

				{error && (
					<p className="text-sm text-destructive" role="alert">
						{error}
					</p>
				)}

				<Button
					type="submit"
					disabled={loading}
					className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-transform duration-300 hover:-translate-y-1 disabled:opacity-60"
				>
					{loading ? "Signing in…" : submitLabel}
				</Button>
			</form>

			{footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
		</motion.div>
	);
}
