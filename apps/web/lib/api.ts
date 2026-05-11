"use client";

import type {
	Complaint,
	Department,
	Role,
} from "@/lib/mock-data";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type LoginResponse = {
	token: string;
	user: {
		id: string;
		name: string;
		email: string;
		role: Role;
		departmentId: string | null;
	};
};

class ApiError extends Error {
	constructor(public status: number, message: string) {
		super(message);
	}
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init?.headers ?? {}),
		},
	});
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new ApiError(res.status, text);
	}
	return res.json() as Promise<T>;
}

export const api = {
	login(role: Role, verificationCode?: string): Promise<LoginResponse> {
		return request<LoginResponse>("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ role, verificationCode }),
		});
	},

	listDepartments(): Promise<Department[]> {
		return request<Department[]>("/api/departments");
	},

	listComplaints(params: {
		role?: Role;
		departmentId?: string;
		citizenEmail?: string;
		status?: string;
		priority?: string;
	} = {}): Promise<Complaint[]> {
		const qs = new URLSearchParams();
		Object.entries(params).forEach(([k, v]) => {
			if (v) qs.set(k, v);
		});
		const suffix = qs.toString() ? `?${qs.toString()}` : "";
		return request<Complaint[]>(`/api/complaints${suffix}`);
	},

	getComplaint(id: string): Promise<Complaint> {
		return request<Complaint>(`/api/complaints/${id}`);
	},

	createComplaint(payload: {
		citizenName: string;
		citizenEmail: string;
		subject: string;
		body: string;
		language: string;
		location: string;
	}): Promise<Complaint> {
		return request<Complaint>("/api/complaints", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	updateStatus(id: string, status: string): Promise<Complaint> {
		return request<Complaint>(`/api/complaints/${id}/status`, {
			method: "PATCH",
			body: JSON.stringify({ status }),
		});
	},

	updateFeedback(
		id: string,
		feedback: "UNSATISFIED" | "AVERAGE" | "SATISFIED"
	): Promise<Complaint> {
		return request<Complaint>(`/api/complaints/${id}/feedback`, {
			method: "PATCH",
			body: JSON.stringify({ feedback }),
		});
	},

	ticketPdfUrl(id: string): string {
		return `${BASE}/api/pdf/ticket/${id}`;
	},

	classificationPdfUrl(id: string): string {
		return `${BASE}/api/pdf/classification/${id}`;
	},

	wsUrl(referenceNumber: string): string {
		const wsBase = BASE.replace(/^http/, "ws");
		return `${wsBase}/ws/complaints/${referenceNumber}`;
	},
};

export { ApiError };
