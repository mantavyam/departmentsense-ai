import type React from "react";

export const LogoIcon = (_props: React.ComponentProps<"svg">) => null;

export const Logo = ({ className, ...props }: React.ComponentProps<"span">) => (
	<span
		className={`font-heading text-lg font-semibold tracking-tight ${className ?? ""}`}
		{...props}
	>
		DepartmentSense
	</span>
);
