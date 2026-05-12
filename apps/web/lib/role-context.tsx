"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api";
import type { Role } from "@/lib/mock-data";

type SessionUser = {
	id: string;
	name: string;
	email: string;
	role: Role;
	departmentId?: string;
};

type SignInArgs =
	| { role: "citizen" | "admin"; email: string; password: string }
	| { role: "dept-head"; email: string; verificationCode: string };

type SignUpArgs = { name: string; email: string; password: string };

type RoleContextValue = {
	user: SessionUser | null;
	role: Role | null;
	token: string | null;
	loading: boolean;
	error: string | null;
	signIn: (args: SignInArgs) => Promise<void>;
	signUp: (args: SignUpArgs) => Promise<void>;
	signOut: () => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);
const SESSION_KEY = "departmentsense.session";

type StoredSession = { token: string; user: SessionUser };

export function RoleProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<StoredSession | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const stored = localStorage.getItem(SESSION_KEY);
		if (!stored) return;
		try {
			setSession(JSON.parse(stored) as StoredSession);
		} catch {
			localStorage.removeItem(SESSION_KEY);
		}
	}, []);

	const persist = (token: string, user: { id: string; name: string; email: string; role: Role; departmentId: string | null }) => {
		const next: StoredSession = {
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				departmentId: user.departmentId ?? undefined,
			},
		};
		setSession(next);
		if (typeof window !== "undefined") localStorage.setItem(SESSION_KEY, JSON.stringify(next));
	};

	const signIn = async (args: SignInArgs) => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.login(args);
			persist(res.token, res.user);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Login failed";
			setError(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const signUp = async (args: SignUpArgs) => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.signup(args);
			persist(res.token, res.user);
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Sign up failed";
			setError(msg);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const signOut = () => {
		setSession(null);
		if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
	};

	return (
		<RoleContext.Provider
			value={{
				user: session?.user ?? null,
				role: session?.user.role ?? null,
				token: session?.token ?? null,
				loading,
				error,
				signIn,
				signUp,
				signOut,
			}}
		>
			{children}
		</RoleContext.Provider>
	);
}

export function useRole(): RoleContextValue {
	const ctx = useContext(RoleContext);
	if (!ctx) throw new Error("useRole must be used within RoleProvider");
	return ctx;
}
