// Only supports strings
import { clsx } from "clsx/lite";

import { getData } from "@/getData";

export default async function Home() {
	const res = await getData();
	return (
		<div className="py-3">
			<div className="flex flex-col items-center justify-center">
				<div className="text-2xl font-bold">
					<div className="text-yellow-500 inline-block">{res.goldPosition}</div>{" "}
					/ {res.totalItems}
				</div>
			</div>
			<div className="pt-3">
				{res.data.map((x) => {
					const value = Intl.NumberFormat("en", {
						notation: "compact",
						maximumFractionDigits: 2,
					}).format(x.value);

					const isGold = x.id === "wow-gold";

					return (
						<div
							key={x.id}
							className={clsx(
								"py-1 px-2 m-1 border-[1px] rounded-md border-slate-500",
								isGold && "border-yellow-500",
							)}
						>
							<div className={isGold ? "text-yellow-500" : ""}>
								{x.place}. {x.name}: {value} per USD
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
