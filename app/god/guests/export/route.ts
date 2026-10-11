import { requireAdmin } from "@/lib/auth";
import { seatingChartCsv } from "@/lib/csv";
import prisma from "@/lib/prisma";

export async function GET() {
  await requireAdmin("/god/guests");
  const tables = await prisma.table.findMany({
    select: {
      id: true,
      isVip: true,
      guests: {
        select: {
          firstName: true,
          lastName: true,
          isChild: true,
          isAttending: true,
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      },
    },
  });
  return new Response(seatingChartCsv(tables), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="seating-chart.csv"',
      "Cache-Control": "no-store",
    },
  });
}
