"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { api } from "@/lib/api";
import {
	RiArrowLeftSLine,
	RiUserLine,
	RiUserSettingsLine,
	RiShieldUserLine,
} from "@remixicon/react";
import { FloatingPaths } from "@/components/auth/floating-paths";
import { Logo } from "@/components/auth/logo";
import { useRole } from "@/lib/role-context";
import { GlassSignInCard } from "@/components/uitripled/signin-card";
import { GlassSignUpCard } from "@/components/uitripled/signup-card";
import { GlassVerificationCodeCard } from "@/components/uitripled/verification-code";
import type { Role } from "@/lib/mock-data";

type RoleOption = {
	role: Role;
	title: string;
	description: string;
	icon: React.ReactNode;
};

const options: RoleOption[] = [
	{
		role: "citizen",
		title: "Citizen",
		description: "Submit and track your grievances",
		icon: <RiUserLine className="size-6" />,
	},
	{
		role: "dept-head",
		title: "Department Head",
		description: "Sign in with email and the 6-digit code from your admin",
		icon: <RiUserSettingsLine className="size-6" />,
	},
	{
		role: "admin",
		title: "Administrator",
		description: "Full system oversight and analytics",
		icon: <RiShieldUserLine className="size-6" />,
	},
];

type CitizenMode = "signin" | "signup";
type DeptStage = "email" | "code";

export default function AuthPage() {
	const router = useRouter();
	const { signIn, signUp } = useRole();
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [citizenMode, setCitizenMode] = useState<CitizenMode>("signin");
	const [deptStage, setDeptStage] = useState<DeptStage>("email");
	const [deptEmail, setDeptEmail] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const reset = () => {
		setSelectedRole(null);
		setError(null);
		setCitizenMode("signin");
		setDeptStage("email");
		setDeptEmail("");
	};

	const handleCitizenSignIn = async ({ email, password }: { email: string; password: string }) => {
		setSubmitting(true);
		setError(null);
		try {
			await signIn({ role: "citizen", email, password });
			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign in failed");
		} finally {
			setSubmitting(false);
		}
	};

	const handleCitizenSignUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
		setSubmitting(true);
		setError(null);
		try {
			await signUp({ name, email, password });
			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign up failed");
		} finally {
			setSubmitting(false);
		}
	};

	const handleAdminSignIn = async ({ email, password }: { email: string; password: string }) => {
		setSubmitting(true);
		setError(null);
		try {
			await signIn({ role: "admin", email, password });
			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign in failed");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeptEmail = async (email: string) => {
		const trimmed = email.trim().toLowerCase();
		if (!trimmed) {
			setError("Enter your registered email to continue.");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			await api.checkDeptHeadEmail(trimmed);
			setDeptEmail(trimmed);
			setDeptStage("code");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Email not recognised");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeptCode = async (code: string) => {
		setSubmitting(true);
		setError(null);
		try {
			await signIn({ role: "dept-head", email: deptEmail, verificationCode: code });
			router.push("/dashboard");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Invalid code or email");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<main className="relative min-h-screen overflow-hidden lg:grid lg:grid-cols-2">
			<div className="relative hidden h-screen flex-col border-r bg-secondary p-10 lg:flex dark:bg-secondary/20">
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
				<Logo className="z-10 mr-auto h-4.5" />
				<div className="z-10 mt-auto">
					<blockquote className="space-y-2">
						<p className="text-xl">
							&ldquo;Every voice deserves to be heard — and routed to the right place, fast.&rdquo;
						</p>
						<footer className="font-mono font-semibold text-sm">— DepartmentSense AI</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>

			<div className="relative flex min-h-screen flex-col justify-center px-6 py-16 sm:px-8">
				<Button asChild className="absolute top-7 left-5" variant="ghost">
					<Link href="/">
						<RiArrowLeftSLine />
						Home
					</Link>
				</Button>

				<div className="mx-auto w-full max-w-xl space-y-6">
					<Logo className="h-4.5 lg:hidden" />

					<AnimatePresence mode="wait">
						{!selectedRole && (
							<motion.div
								key="role-select"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<div className="space-y-1">
									<h1 className="font-bold text-2xl tracking-wide">Welcome to DepartmentSense AI</h1>
									<p className="text-base text-muted-foreground">Choose how you want to sign in.</p>
								</div>
								<div className="space-y-3">
									{options.map((option) => (
										<button
											key={option.role}
											type="button"
											onClick={() => setSelectedRole(option.role)}
											className="group w-full text-left"
										>
											<Card className="flex items-center gap-4 p-4 transition-all hover:border-primary hover:shadow-md">
												<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground">
													{option.icon}
												</div>
												<div className="flex-1">
													<h3 className="font-semibold">{option.title}</h3>
													<p className="text-sm text-muted-foreground">{option.description}</p>
												</div>
											</Card>
										</button>
									))}
								</div>
							</motion.div>
						)}

						{selectedRole === "citizen" && (
							<motion.div
								key="citizen"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<button
									type="button"
									onClick={reset}
									className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									<RiArrowLeftSLine className="size-4" />
									Back
								</button>
								{citizenMode === "signin" ? (
									<GlassSignInCard
										title="Sign in to your account"
										subtitle="Track your complaints and submit new ones."
										loading={submitting}
										error={error}
										onSubmit={handleCitizenSignIn}
										footer={
											<>
												No account?{" "}
												<button
													type="button"
													onClick={() => {
														setError(null);
														setCitizenMode("signup");
													}}
													className="text-primary underline-offset-4 hover:underline"
												>
													Create one
												</button>
											</>
										}
									/>
								) : (
									<GlassSignUpCard
										title="Create your citizen account"
										subtitle="Submit grievances and track resolution in real time."
										loading={submitting}
										error={error}
										onSubmit={handleCitizenSignUp}
										footer={
											<>
												Already registered?{" "}
												<button
													type="button"
													onClick={() => {
														setError(null);
														setCitizenMode("signin");
													}}
													className="text-primary underline-offset-4 hover:underline"
												>
													Sign in
												</button>
											</>
										}
									/>
								)}
							</motion.div>
						)}

						{selectedRole === "admin" && (
							<motion.div
								key="admin"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<button
									type="button"
									onClick={reset}
									className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									<RiArrowLeftSLine className="size-4" />
									Back
								</button>
								<GlassSignInCard
									title="Administrator sign in"
									subtitle="Restricted access. Credentials are issued by the system owner."
									loading={submitting}
									error={error}
									onSubmit={handleAdminSignIn}
								/>
							</motion.div>
						)}

						{selectedRole === "dept-head" && (
							<motion.div
								key="dept-head"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<button
									type="button"
									onClick={() => (deptStage === "code" ? setDeptStage("email") : reset())}
									className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									<RiArrowLeftSLine className="size-4" />
									Back
								</button>
								{deptStage === "email" ? (
									<DeptHeadEmailCard
										loading={submitting}
										error={error}
										onSubmit={handleDeptEmail}
									/>
								) : (
									<GlassVerificationCodeCard
										title="Enter your department code"
										subtitle={`We'll match this code to ${deptEmail || "your account"}.`}
										loading={submitting}
										error={error}
										onSubmit={handleDeptCode}
									/>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</main>
	);
}

function DeptHeadEmailCard({
	loading,
	error,
	onSubmit,
}: {
	loading: boolean;
	error: string | null;
	onSubmit: (email: string) => void | Promise<void>;
}) {
	const shouldReduceMotion = useReducedMotion();
	const [email, setEmail] = useState("");
	return (
		<motion.div
			initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.45,
				ease: shouldReduceMotion ? "linear" : [0.16, 1, 0.3, 1],
			}}
			className="w-full max-w-lg rounded-3xl overflow-hidden border border-border/60 bg-card/85 p-8 backdrop-blur-xl sm:p-10"
			role="form"
		>
			<div className="mb-8 space-y-2 text-center">
				<div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs uppercase tracking-[0.28em] text-muted-foreground">
					Department Head
				</div>
				<h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
					Sign in with your email
				</h1>
				<p className="text-sm text-muted-foreground">
					Enter the email address registered with your department. We&apos;ll then ask for the 6-digit code given to you by the administrator.
				</p>
			</div>

			<form
				className="space-y-5"
				onSubmit={(event) => {
					event.preventDefault();
					void onSubmit(email);
				}}
			>
				<div className="space-y-2">
					<Label htmlFor="dept-head-email">Email address</Label>
					<Input
						id="dept-head-email"
						type="email"
						placeholder="head@gov.in"
						autoComplete="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
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
					disabled={loading || !email.trim()}
					className="w-full rounded-full bg-primary px-6 py-3 text-primary-foreground transition-transform duration-300 hover:-translate-y-1 disabled:opacity-60"
				>
					{loading ? "Verifying email…" : "Continue"}
				</Button>
			</form>

			<p className="mt-6 text-center text-xs text-muted-foreground">
				Department heads do not have passwords. Only the admin-issued code unlocks the dashboard.
			</p>
		</motion.div>
	);
}
