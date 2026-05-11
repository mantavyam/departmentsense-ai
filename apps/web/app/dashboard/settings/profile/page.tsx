import { AppShell } from "@/components/dashboard/app-shell";
import { GlassProfileSettingsCard } from "@/components/uitripled/profile-settings";

export default function ProfileSettingsPage() {
	return (
		<AppShell>
			<div className="mx-auto max-w-3xl">
				<h1 className="mb-6 font-heading text-3xl tracking-tight">Profile</h1>
				<GlassProfileSettingsCard />
			</div>
		</AppShell>
	);
}
