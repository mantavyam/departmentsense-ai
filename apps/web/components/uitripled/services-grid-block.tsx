"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card } from "@workspace/ui/components/card";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { Copy, Check, Edit3, Trash, RefreshCw } from "lucide-react";
import type { Department } from "@/lib/mock-data";

const DEPT_LOGO = "/goi-logo.png";

type Mode = "view" | "admin";

type Props = {
	departments: Department[];
	mode?: Mode;
	heading?: string;
	subheading?: string;
	onGenerateCode?: (dept: Department) => Promise<void> | void;
	onEdit?: (dept: Department) => void;
	onDelete?: (dept: Department) => Promise<void> | void;
	onCreate?: () => void;
};

export function ServicesGridBlock({
	departments,
	mode = "view",
	heading = "Government Departments",
	subheading = "Browse departments and their verification codes.",
	onGenerateCode,
	onEdit,
	onDelete,
	onCreate,
}: Props) {
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const handleCopy = async (dept: Department) => {
		if (!dept.verificationCode) return;
		try {
			await navigator.clipboard.writeText(dept.verificationCode);
			setCopiedId(dept.id);
			setTimeout(() => setCopiedId((id) => (id === dept.id ? null : id)), 1600);
		} catch {
			/* clipboard denied */
		}
	};

	const handleGenerate = async (dept: Department) => {
		if (!onGenerateCode) return;
		setBusyId(dept.id);
		try {
			await onGenerateCode(dept);
		} finally {
			setBusyId(null);
		}
	};

	return (
		<section className="w-full">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="mb-8 flex flex-wrap items-end justify-between gap-4"
			>
				<div>
					<Badge className="mb-2" variant="secondary">
						{mode === "admin" ? "Admin · Manage" : "Directory"}
					</Badge>
					<h2 className="mb-1 text-2xl font-bold tracking-tight md:text-3xl">{heading}</h2>
					<p className="max-w-2xl text-sm text-muted-foreground md:text-base">{subheading}</p>
				</div>
				{mode === "admin" && onCreate && (
					<Button onClick={onCreate}>+ New department</Button>
				)}
			</motion.div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-5">
				{departments.map((d, index) => {
					const codeAssigned = !!d.verificationCode;
					return (
						<motion.div
							key={d.id}
							initial={{ opacity: 0, y: 16 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.4 }}
						>
							<Card className="group relative h-full overflow-hidden border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:shadow-xl md:p-5">
								<div
									className="absolute inset-x-0 top-0 h-1"
									style={{ backgroundColor: d.color }}
								/>
								<div className="relative z-10">
									<div className="mb-3 flex items-start gap-3">
										<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 ring-1 ring-border/60">
											<Image
												src={DEPT_LOGO}
												alt={`${d.name} logo`}
												width={36}
												height={36}
												className="h-9 w-9 object-contain"
											/>
										</div>
										<div className="min-w-0 flex-1">
											<h3 className="truncate text-base font-semibold md:text-lg" title={d.name}>
												{d.name}
											</h3>
											{d.headName && (
												<p className="truncate text-xs text-muted-foreground" title={d.headName}>
													{d.headName}
												</p>
											)}
										</div>
									</div>

									<dl className="mb-3 space-y-1 border-t border-border/60 pt-3 text-xs text-muted-foreground">
										{d.officerEmail && (
											<div className="flex gap-1.5">
												<dt className="font-medium text-foreground/80">Email:</dt>
												<dd className="truncate" title={d.officerEmail}>
													{d.officerEmail}
												</dd>
											</div>
										)}
										{d.officerContact && (
											<div className="flex gap-1.5">
												<dt className="font-medium text-foreground/80">Contact:</dt>
												<dd>{d.officerContact}</dd>
											</div>
										)}
										{d.officerAddress && (
											<div className="flex gap-1.5">
												<dt className="font-medium text-foreground/80">Addr:</dt>
												<dd className="line-clamp-2" title={d.officerAddress}>
													{d.officerAddress}
												</dd>
											</div>
										)}
									</dl>

									<div className="mb-3 flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
										<span className="text-xs text-muted-foreground">Code</span>
										<div className="flex items-center gap-2">
											{codeAssigned ? (
												<>
													<Badge variant="outline" className="font-mono">
														{d.verificationCode}
													</Badge>
													<button
														type="button"
														onClick={() => handleCopy(d)}
														className="text-muted-foreground hover:text-foreground"
														aria-label="Copy verification code"
													>
														{copiedId === d.id ? (
															<Check className="h-3.5 w-3.5 text-emerald-500" />
														) : (
															<Copy className="h-3.5 w-3.5" />
														)}
													</button>
												</>
											) : (
												<Badge variant="secondary" className="text-xs">
													Not assigned
												</Badge>
											)}
										</div>
									</div>

									{mode === "admin" && (
										<div className="flex flex-wrap gap-2">
											<Button
												size="sm"
												variant={codeAssigned ? "outline" : "default"}
												onClick={() => handleGenerate(d)}
												disabled={busyId === d.id}
												className="flex-1 text-xs"
											>
												<RefreshCw className="mr-1 h-3 w-3" />
												{busyId === d.id
													? "Generating…"
													: codeAssigned
													? "Regenerate"
													: "Generate code"}
											</Button>
											{onEdit && (
												<Button
													size="sm"
													variant="ghost"
													onClick={() => onEdit(d)}
													className="text-xs"
												>
													<Edit3 className="h-3 w-3" />
												</Button>
											)}
											{onDelete && (
												<Button
													size="sm"
													variant="ghost"
													onClick={() => onDelete(d)}
													className="text-xs text-destructive hover:text-destructive"
												>
													<Trash className="h-3 w-3" />
												</Button>
											)}
										</div>
									)}
								</div>
							</Card>
						</motion.div>
					);
				})}
			</div>
		</section>
	);
}
