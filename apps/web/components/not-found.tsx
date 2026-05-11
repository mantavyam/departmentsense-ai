import { Button } from "@workspace/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@workspace/ui/components/empty";
import { RiHomeLine, RiCompassLine } from "@remixicon/react";

export function NotFoundPage() {
	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
			<Empty>
				<EmptyHeader>
					<EmptyTitle className="mask-b-from-20% mask-b-to-80% font-extrabold text-9xl">
						404
					</EmptyTitle>
					<EmptyDescription className="-mt-8 text-nowrap text-foreground/80">
						The page you're looking for might have been <br />
						moved or doesn't exist.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<div className="flex gap-2">
						<Button render={<a href="#" />} nativeButton={false}><RiHomeLine data-icon="inline-start" />Go Home
                        							</Button>

						<Button variant="outline" render={<a href="#" />} nativeButton={false}><RiCompassLine data-icon="inline-start" />{" "}Explore
                        							</Button>
					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}
