"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
	RiArrowLeftSLine,
	RiUserLine,
	RiUserSettingsLine,
	RiShieldUserLine,
	RiLockLine,
} from "@remixicon/react";
import { FloatingPaths } from "@/components/auth/floating-paths";
import { Logo } from "@/components/auth/logo";
import { useRole } from "@/lib/role-context";
import { departments, type Role } from "@/lib/mock-data";

type RoleOption = {
	role: Role;
	title: string;
	description: string;
	icon: React.ReactNode;
	needsCode: boolean;
};

const options: RoleOption[] = [
	{
		role: "citizen",
		title: "Citizen",
		description: "Submit and track your grievances",
		icon: <RiUserLine className="size-6" />,
		needsCode: false,
	},
	{
		role: "dept-head",
		title: "Department Head",
		description: "Manage complaints assigned to your department",
		icon: <RiUserSettingsLine className="size-6" />,
		needsCode: true,
	},
	{
		role: "admin",
		title: "Administrator",
		description: "Full system oversight and analytics",
		icon: <RiShieldUserLine className="size-6" />,
		needsCode: false,
	},
];

export default function AuthPage() {
	const router = useRouter();
	const { signIn } = useRole();
	const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
	const [code, setCode] = useState("");
	const [codeError, setCodeError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const handleSelect = async (option: RoleOption) => {
		if (option.needsCode) {
			setSelectedRole(option);
			return;
		}
		setSubmitting(true);
		try {
			await signIn(option.role);
			router.push("/dashboard");
		} catch (err) {
			setCodeError(err instanceof Error ? err.message : "Sign in failed");
		} finally {
			setSubmitting(false);
		}
	};

	const verifyCode = async () => {
		if (!selectedRole) return;
		setSubmitting(true);
		try {
			await signIn(selectedRole.role, code.trim().toUpperCase());
			router.push("/dashboard");
		} catch {
			setCodeError("Invalid verification code. Try ELEC-2026, WATER-2026, SANIT-2026, ROADS-2026, PUBLIC-2026, HEALTH-2026.");
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
							&ldquo;Every voice deserves to be heard — and routed to the right place,
							fast.&rdquo;
						</p>
						<footer className="font-mono font-semibold text-sm">
							— DepartmentSense AI
						</footer>
					</blockquote>
				</div>
				<div className="absolute inset-0">
					<FloatingPaths position={1} />
					<FloatingPaths position={-1} />
				</div>
			</div>

			<div className="relative flex min-h-screen flex-col justify-center px-6 sm:px-8">
				<Button asChild className="absolute top-7 left-5" variant="ghost">
					<Link href="/">
						<RiArrowLeftSLine />
						Home
					</Link>
				</Button>

				<div className="mx-auto w-full max-w-md space-y-6">
					<Logo className="h-4.5 lg:hidden" />

					<AnimatePresence mode="wait">
						{!selectedRole ? (
							<motion.div
								key="role-select"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<div className="space-y-1">
									<h1 className="font-bold text-2xl tracking-wide">Welcome back</h1>
									<p className="text-base text-muted-foreground">
										Choose how you want to sign in.
									</p>
								</div>

								<div className="space-y-3">
									{options.map((option) => (
										<button
											key={option.role}
											type="button"
											disabled={submitting}
											onClick={() => handleSelect(option)}
											className="group w-full text-left disabled:cursor-wait disabled:opacity-60"
										>
											<Card className="flex items-center gap-4 p-4 transition-all hover:border-primary hover:shadow-md">
												<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground">
													{option.icon}
												</div>
												<div className="flex-1">
													<div className="flex items-center gap-2">
														<h3 className="font-semibold">{option.title}</h3>
														{option.needsCode && (
															<Badge variant="outline" className="gap-1">
																<RiLockLine className="size-3" />
																Code required
															</Badge>
														)}
													</div>
													<p className="text-sm text-muted-foreground">
														{option.description}
													</p>
												</div>
											</Card>
										</button>
									))}
								</div>

								<p className="pt-4 text-center text-xs text-muted-foreground">
									Demo mode — no credentials required. Role persists in localStorage.
								</p>
							</motion.div>
						) : (
							<motion.div
								key="code-entry"
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -12 }}
								transition={{ duration: 0.3 }}
								className="space-y-4"
							>
								<button
									type="button"
									onClick={() => {
										setSelectedRole(null);
										setCode("");
										setCodeError(null);
									}}
									className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									<RiArrowLeftSLine className="size-4" />
									Back
								</button>

								<div className="space-y-1">
									<h1 className="font-bold text-2xl tracking-wide">
										Department verification
									</h1>
									<p className="text-base text-muted-foreground">
										Enter the verification code provided by the admin for your
										department.
									</p>
								</div>

								<Card className="space-y-3 p-5">
									<label
										htmlFor="dept-code"
										className="text-sm font-medium text-foreground"
									>
										Verification code
									</label>
									<input
										id="dept-code"
										type="text"
										value={code}
										onChange={(e) => {
											setCode(e.target.value);
											setCodeError(null);
										}}
										onKeyDown={(e) => e.key === "Enter" && verifyCode()}
										placeholder="ELEC-2026"
										className="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm uppercase tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
									/>
									{codeError && (
										<p className="text-xs text-destructive">{codeError}</p>
									)}
									<Button onClick={verifyCode} disabled={submitting} className="w-full">
										Verify and continue
									</Button>
									<details className="text-xs text-muted-foreground">
										<summary className="cursor-pointer">Demo codes</summary>
										<ul className="mt-2 space-y-1 font-mono">
											{departments.map((d) => (
												<li key={d.id}>
													{d.verificationCode} → {d.name}
												</li>
											))}
										</ul>
									</details>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</main>
	);
}
