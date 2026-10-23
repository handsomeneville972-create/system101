import {
  analyticsFor,
  parseRange,
  RANGE_DAYS,
} from "@/lib/data/analytics";
import { getUser } from "@/lib/auth";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const range = parseRange(url.searchParams.get("range") ?? undefined);
  const app = url.searchParams.get("app") || null;

  const data = await analyticsFor(app, RANGE_DAYS[range]);
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  const rows = [
    "date,views,clicks,unique_visitors",
    ...data.daily.map(
      (day) => `${day.day},${day.views},${day.clicks},${day.uniques}`
    ),
  ];
  const csv = `\uFEFF${rows.join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="app-analytics-${range}.csv"`,
      "cache-control": "no-store",
    },
  });
}
