"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { motion, useReducedMotion } from "framer-motion";
import { FormEvent, useMemo, useRef, useState } from "react";

const CODE_LENGTH = 6;

type GlassVerificationCodeCardProps = {
	title?: string;
	subtitle?: string;
	loading?: boolean;
	error?: string | null;
	onSubmit: (code: string) => void | Promise<void>;
	onResend?: () => void;
	footer?: React.ReactNode;
};

export function GlassVerificationCodeCard({
	title = "Enter verification code",
	subtitle = "Enter the 6-digit code provided to you.",
	loading = false,
	error = null,
	onSubmit,
	onResend,
	footer,
}: GlassVerificationCodeCardProps) {
	const shouldReduceMotion = useReducedMotion();
	const [code, setCode] = useState<string[]>(() => Array<string>(CODE_LENGTH).fill(""));
	const [localError, setLocalError] = useState<string | null>(null);
	const inputs = useRef<Array<HTMLInputElement | null>>([]);

	const combinedCode = useMemo(() => code.join(""), [code]);

	const handleChange = (value: string, index: number) => {
		const sanitized = value.replace(/\D/g, "").slice(-1);
		setCode((prev) => {
			const updated = [...prev];
			updated[index] = sanitized;
			return updated;
		});
		if (sanitized && index < CODE_LENGTH - 1) {
			inputs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
		if (!pasted) return;
		e.preventDefault();
		const next = Array<string>(CODE_LENGTH).fill("");
		for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]!;
		setCode(next);
		inputs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (combinedCode.length < CODE_LENGTH) {
			setLocalError("Please enter all 6 digits.");
			return;
		}
		setLocalError(null);
		await onSubmit(combinedCode);
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
			className="group w-full max-w-md rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-10 relative"
		>
			<div className="mb-8 text-center">
				<div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
					Verification
				</div>
				<h1 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
					{title}
				</h1>
				<p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
			</div>

			<form className="space-y-6" onSubmit={handleSubmit}>
				<div className="flex justify-between gap-2">
					{code.map((digit, index) => (
						<Input
							key={index}
							ref={(el) => {
								inputs.current[index] = el;
							}}
							type="text"
							inputMode="numeric"
							pattern="[0-9]*"
							maxLength={1}
							value={digit}
							onChange={(event) => handleChange(event.target.value, index)}
							onKeyDown={(e) => handleKeyDown(e, index)}
							onPaste={handlePaste}
							className="h-14 w-full rounded-2xl border-border/60 bg-background/60 text-center text-lg font-semibold"
							aria-label={`Verification digit ${index + 1}`}
						/>
					))}
				</div>

				{displayError && (
					<p className="text-sm text-destructive text-center" role="alert">
						{displayError}
					</p>
				)}

				<Button
					type="submit"
					disabled={loading}
					className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-transform duration-300 hover:-translate-y-1 disabled:opacity-60"
				>
					{loading ? "Verifying…" : "Verify and continue"}
				</Button>
			</form>

			{onResend && (
				<div className="mt-6 text-center text-xs text-muted-foreground">
					<button
						type="button"
						className="text-primary underline-offset-4 hover:underline"
						onClick={onResend}
					>
						Need a new code?
					</button>
				</div>
			)}

			{footer && <div className="mt-4 text-center text-xs text-muted-foreground">{footer}</div>}
		</motion.div>
	);
}
