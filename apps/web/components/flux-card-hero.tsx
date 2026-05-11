"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
	RiSparkling2Line,
	RiArrowRightLine,
	RiShieldCheckLine,
	RiTimer2Line,
	RiBuilding2Line,
} from "@remixicon/react";

const cardConfigs = [
	{
		title: "Smart classification",
		description: "Multilingual NLP routes complaints to the right department in seconds.",
		gradient: "from-blue-100 via-blue-50 to-white",
		accent: "text-blue-600",
		icon: <RiSparkling2Line className="size-5" />,
	},
	{
		title: "Real-time tracking",
		description: "Live status updates from submission through resolution.",
		gradient: "from-emerald-100 via-emerald-50 to-white",
		accent: "text-emerald-600",
		icon: <RiTimer2Line className="size-5" />,
	},
	{
		title: "Department-aware routing",
		description: "Six departments, priority detection, automated escalation.",
		gradient: "from-purple-100 via-purple-50 to-white",
		accent: "text-purple-600",
		icon: <RiBuilding2Line className="size-5" />,
	},
	{
		title: "Secure & accountable",
		description: "Role-based access, audit logs, citizen privacy by design.",
		gradient: "from-amber-100 via-amber-50 to-white",
		accent: "text-amber-600",
		icon: <RiShieldCheckLine className="size-5" />,
	},
];

function MinimalHero() {
	const [currentCard, setCurrentCard] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentCard((prev) => (prev + 1) % cardConfigs.length);
		}, 3500);
		return () => clearInterval(interval);
	}, []);

	const config = cardConfigs[currentCard]!;

	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
			<nav className="absolute top-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/40 bg-white/70 px-6 py-3 shadow-lg backdrop-blur-md">
				<div className="flex items-center gap-12">
					<div className="flex items-center">
						<span className="text-lg font-medium text-foreground">DepartmentSense</span>
					</div>
					<div className="hidden items-center gap-6 md:flex">
						<a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
						<a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
						<a href="#departments" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Departments</a>
					</div>
					<Button asChild size="sm">
						<Link href="/auth">
							Sign in
							<RiArrowRightLine />
						</Link>
					</Button>
				</div>
			</nav>

			<div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-24">
				<Badge variant="outline" className="mb-6 gap-1.5">
					<RiSparkling2Line className="size-3" />
					AI-powered grievance classification
				</Badge>

				<h1 className="max-w-3xl text-center font-heading text-5xl leading-tight tracking-tight md:text-6xl">
					Citizen complaints, routed to the right department in seconds.
				</h1>
				<p className="mt-6 max-w-xl text-center text-base text-muted-foreground md:text-lg">
					DepartmentSense uses multilingual NLP to classify, prioritise, and route public grievances —
					so the right team gets the right issue, fast.
				</p>

				<div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
					<Button asChild size="lg" className="px-6">
						<Link href="/auth">
							Get started
							<RiArrowRightLine />
						</Link>
					</Button>
					<Button asChild size="lg" variant="ghost">
						<a href="#how-it-works">See how it works</a>
					</Button>
				</div>

				<div className="mt-16 w-full max-w-2xl">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentCard}
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -12 }}
							transition={{ duration: 0.45 }}
							className={`relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${config.gradient} p-8 shadow-xl`}
						>
							<div className={`mb-4 inline-flex items-center gap-2 ${config.accent}`}>
								{config.icon}
								<span className="text-xs font-medium uppercase tracking-wider">
									Feature {currentCard + 1} of {cardConfigs.length}
								</span>
							</div>
							<h3 className="text-2xl font-semibold text-foreground">{config.title}</h3>
							<p className="mt-2 text-muted-foreground">{config.description}</p>
						</motion.div>
					</AnimatePresence>

					<div className="mt-6 flex justify-center gap-2">
						{cardConfigs.map((_, index) => (
							<button
								key={index}
								type="button"
								onClick={() => setCurrentCard(index)}
								aria-label={`View slide ${index + 1}`}
								className={`h-2 rounded-full transition-all ${
									currentCard === index ? "w-8 bg-foreground" : "w-2 bg-muted-foreground/40"
								}`}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default MinimalHero;
export { MinimalHero };
