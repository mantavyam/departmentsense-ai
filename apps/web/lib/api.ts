"use client";

import type { Complaint, Department, Role } from "@/lib/mock-data";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type SessionUser = {
	id: string;
	name: string;
	email: string;
	role: Role;
	departmentId: string | null;
};

type LoginResponse = { token: string; user: SessionUser };

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
		let detail = res.statusText;
		try {
			const body = await res.json();
			if (typeof body?.detail === "string") detail = body.detail;
		} catch {
			detail = await res.text().catch(() => res.statusText);
		}
		throw new ApiError(res.status, detail);
	}
	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

type LoginPayload =
	| { role: "citizen" | "admin"; email: string; password: string }
	| { role: "dept-head"; email: string; verificationCode: string };

export const api = {
	checkDeptHeadEmail(email: string): Promise<void> {
		return request<void>("/api/auth/dept-head/check-email", {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	},

	signup(payload: { name: string; email: string; password: string }): Promise<LoginResponse> {
		return request<LoginResponse>("/api/auth/signup", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	login(payload: LoginPayload): Promise<LoginResponse> {
		return request<LoginResponse>("/api/auth/login", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	listDepartments(): Promise<Department[]> {
		return request<Department[]>("/api/departments");
	},

	createDepartment(payload: {
		name: string;
		description?: string;
		headName?: string;
		officerAddress?: string;
		officerContact?: string;
		officerEmail?: string;
		icon?: string;
		color?: string;
	}): Promise<Department> {
		return request<Department>("/api/departments", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	updateDepartment(id: string, payload: Partial<{
		name: string;
		description: string;
		headName: string;
		officerAddress: string;
		officerContact: string;
		officerEmail: string;
		icon: string;
		color: string;
	}>): Promise<Department> {
		return request<Department>(`/api/departments/${id}`, {
			method: "PATCH",
			body: JSON.stringify(payload),
		});
	},

	deleteDepartment(id: string): Promise<void> {
		return request<void>(`/api/departments/${id}`, { method: "DELETE" });
	},

	generateDepartmentCode(id: string): Promise<{ departmentId: string; verificationCode: string }> {
		return request<{ departmentId: string; verificationCode: string }>(
			`/api/departments/${id}/generate-code`,
			{ method: "POST" }
		);
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
		return `${BASE.replace(/^http/, "ws")}/ws/complaints/${referenceNumber}`;
	},
};

export { ApiError };
