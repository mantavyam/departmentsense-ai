"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Complaint, Department, Role } from "@/lib/mock-data";

export function useComplaints(role: Role | null, opts: { departmentId?: string; citizenEmail?: string } = {}) {
	const [data, setData] = useState<Complaint[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!role) {
			setData([]);
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		api
			.listComplaints({ role, departmentId: opts.departmentId, citizenEmail: opts.citizenEmail })
			.then((rows) => {
				if (!cancelled) {
					setData(rows);
					setError(null);
				}
			})
			.catch((err) => {
				if (!cancelled) setError(err.message);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [role, opts.departmentId, opts.citizenEmail]);

	return { data, loading, error, setData };
}

export function useDepartments() {
	const [data, setData] = useState<Department[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		api
			.listDepartments()
			.then((rows) => {
				if (!cancelled) setData(rows);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return { data, loading };
}

export function useComplaint(id: string | undefined) {
	const [data, setData] = useState<Complaint | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!id) return;
		let cancelled = false;
		setLoading(true);
		api
			.getComplaint(id)
			.then((c) => {
				if (!cancelled) setData(c);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [id]);

	return { data, loading };
}
