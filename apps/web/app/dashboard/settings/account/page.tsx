import { AppShell } from "@/components/dashboard/app-shell";
import { GlassAccountSettingsCard } from "@/components/uitripled/account-settings";

export default function AccountSettingsPage() {
	return (
		<AppShell>
			<div className="mx-auto max-w-3xl">
				<h1 className="mb-6 font-heading text-3xl tracking-tight">Account preferences</h1>
				<GlassAccountSettingsCard />
			</div>
		</AppShell>
	);
}
