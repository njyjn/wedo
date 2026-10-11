export type TableWithGuests = {
  id: number;
  isVip: boolean;
  guests: {
    firstName: string;
    lastName: string;
    isChild: boolean;
    isAttending: boolean | null;
  }[];
};

function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote when needed, and neutralise spreadsheet formula injection.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Seating chart: one column per table (sorted by id). Row 1 is the attending headcount,
 * row 2 the table name, then one attending guest per row.
 */
export function seatingChartCsv(tables: TableWithGuests[]): string {
  const columns = [...tables]
    .sort((a, b) => a.id - b.id)
    .map((t) => {
      const attending = t.guests.filter((g) => g.isAttending);
      return [
        attending.length,
        (t.isVip ? "VIP " : "") + t.id,
        ...attending.map((g) =>
          [g.firstName, g.lastName, g.isChild ? "(C)" : ""].join(" ").trim(),
        ),
      ];
    });
  const rowCount = Math.max(0, ...columns.map((c) => c.length));
  const rows = Array.from({ length: rowCount }, (_, i) =>
    columns.map((c) => escapeCell(c[i])).join(","),
  );
  return rows.join("\r\n") + "\r\n";
}
