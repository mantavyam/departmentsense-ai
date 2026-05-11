import { Kbd, KbdGroup } from "@workspace/ui/components/kbd";
import { SidebarTrigger } from "@workspace/ui/components/sidebar";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@workspace/ui/components/tooltip";

export function CustomSidebarTrigger() {
	return (
		<Tooltip delayDuration={1000}>
			<TooltipTrigger asChild>
				<SidebarTrigger />
			</TooltipTrigger>
			<TooltipContent className="px-2 py-1" side="right">
				Toggle Sidebar{" "}
				<KbdGroup>
					<Kbd>⌘</Kbd>
					<Kbd>b</Kbd>
				</KbdGroup>
			</TooltipContent>
		</Tooltip>
	);
}