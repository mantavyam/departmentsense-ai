"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser, type Role } from "@/lib/mock-data";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string;
};

type RoleContextValue = {
  user: SessionUser | null;
  role: Role | null;
  setRole: (role: Role) => void;
  signOut: () => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = "departmentsense.role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "admin" || stored === "dept-head" || stored === "citizen") {
      setUser(currentUser[stored]);
    }
  }, []);

  const setRole = (role: Role) => {
    const next = currentUser[role];
    setUser(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, role);
  };

  const signOut = () => {
    setUser(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RoleContext.Provider value={{ user, role: user?.role ?? null, setRole, signOut }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
