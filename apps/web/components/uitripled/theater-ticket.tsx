"use client";

import { Badge } from "@workspace/ui/components/badge";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ShieldCheck, Ticket } from "lucide-react";

type TheaterTicketProps = {
	referenceNumber: string;
	departmentName: string;
	subject: string;
	location: string;
	priority: string;
	submittedAt: string | Date;
};

function fmtDate(value: string | Date): { date: string; time: string } {
	const d = typeof value === "string" ? new Date(value) : value;
	return {
		date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
		time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
	};
}

export function TheaterTicket({
	referenceNumber,
	departmentName,
	subject,
	location,
	priority,
	submittedAt,
}: TheaterTicketProps) {
	const stamp = fmtDate(submittedAt);
	return (
		<div className="flex w-full items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
				whileHover={{ scale: 1.01 }}
				className="group relative flex w-full max-w-3xl flex-col md:flex-row overflow-hidden rounded-xl bg-card border border-border shadow-2xl"
				role="article"
				aria-label={`Complaint receipt ${referenceNumber}`}
			>
				<div className="relative flex-1 p-6 md:p-8 overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-card z-0" />
					<div className="relative z-10 flex flex-col justify-between h-full space-y-6">
						<div className="flex justify-between items-start">
							<Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
								<ShieldCheck className="w-3 h-3 mr-1" /> ROUTED · {priority.toUpperCase()}
							</Badge>
							<Ticket className="w-6 h-6 text-muted-foreground" />
						</div>

						<div className="space-y-2">
							<p className="text-xs text-muted-foreground uppercase tracking-widest">Reference</p>
							<motion.h2
								className="font-mono text-3xl md:text-4xl font-bold text-card-foreground tracking-wide"
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.2 }}
							>
								{referenceNumber}
							</motion.h2>
							<p className="text-sm text-card-foreground/90">{subject}</p>
							<p className="text-muted-foreground text-sm tracking-widest uppercase">
								{departmentName}
							</p>
						</div>

						<div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
							<div>
								<p className="text-xs text-muted-foreground uppercase mb-1">Date</p>
								<p className="text-card-foreground font-medium flex items-center">
									<Calendar className="w-3 h-3 mr-2 text-primary" />
									{stamp.date}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground uppercase mb-1">Time</p>
								<p className="text-card-foreground font-medium flex items-center">
									<Clock className="w-3 h-3 mr-2 text-primary" />
									{stamp.time}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground uppercase mb-1">Location</p>
								<p className="text-card-foreground font-medium flex items-center truncate">
									<MapPin className="w-3 h-3 mr-2 text-primary shrink-0" />
									<span className="truncate">{location}</span>
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="relative hidden w-8 flex-col items-center justify-center bg-card md:flex">
					<div className="absolute -top-3 w-6 h-6 rounded-full bg-background z-20 border-b border-border" />
					<div className="h-full border-l-2 border-dashed border-border mx-auto" />
					<div className="absolute -bottom-3 w-6 h-6 rounded-full bg-background z-20 border-t border-border" />
				</div>

				<div className="relative flex h-8 w-full items-center justify-center bg-card md:hidden">
					<div className="absolute -left-3 h-6 w-6 rounded-full bg-background z-20 border-r border-border" />
					<div className="w-full border-t-2 border-dashed border-border my-auto" />
					<div className="absolute -right-3 h-6 w-6 rounded-full bg-background z-20 border-l border-border" />
				</div>

				<motion.div
					className="relative w-full md:w-36 bg-muted/50 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border"
					whileHover={{ x: 5 }}
					transition={{ type: "spring", stiffness: 300 }}
				>
					<div
						className="flex md:flex-col justify-center space-x-1 md:space-x-0 md:space-y-1 h-12 md:h-24 w-full opacity-70"
						role="img"
						aria-label="Barcode"
					>
						{[...Array(12)].map((_, i) => (
							<div
								key={i}
								className={`bg-foreground ${i % 3 === 0 || i % 2 === 0 ? "w-1 h-full md:w-full md:h-1" : "w-2 h-full md:w-full md:h-2"}`}
							/>
						))}
					</div>
					<p className="mt-4 text-xs text-muted-foreground text-center font-mono">
						{referenceNumber.split("-").pop()}
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
}
