export const DEFAULT_TIME_ZONE = "Asia/Singapore";

function fmt(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-SG", { timeZone, ...options }).format(
    date,
  );
}

/** "Saturday, 20 August 2022, 6:30 pm" */
export const formatDateTimeLong = (d: Date, tz: string) =>
  fmt(d, tz, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

/** "Saturday, 20 August 2022" */
export const formatDateLong = (d: Date, tz: string) =>
  fmt(d, tz, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** "20 Aug 2022" */
export const formatDateShort = (d: Date, tz: string) =>
  fmt(d, tz, { day: "numeric", month: "short", year: "numeric" });

/** "20 Aug 2022 • 6 pm" */
export const formatDateAndHour = (d: Date, tz: string) =>
  `${formatDateShort(d, tz)} • ${fmt(d, tz, { hour: "numeric" })}`;

/** "20/08/2022, 18:30:05" */
export const formatTimestamp = (d: Date, tz: string) =>
  fmt(d, tz, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

/** Offset of `timeZone` from UTC at `instant`, in ms (e.g. +8h for Asia/Singapore). */
export function timeZoneOffsetMs(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).formatToParts(instant);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Date-only values (from <input type="date">) are stored as midnight UTC. */
export function isDateOnly(d: Date): boolean {
  return (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  );
}

/** Format a date-only value as its calendar date, regardless of time zone. */
export const formatCalendarDate = (d: Date, tz: string) =>
  isDateOnly(d) ? formatDateLong(d, "UTC") : formatDateLong(d, tz);

/** The last millisecond of the calendar day `d` (a date-only value) in `timeZone`. */
export function endOfCalendarDay(d: Date, timeZone: string): Date {
  const utcEnd = Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    23,
    59,
    59,
    999,
  );
  return new Date(utcEnd - timeZoneOffsetMs(new Date(utcEnd), timeZone));
}

function calendarDayNumber(d: Date, timeZone: string): number {
  // en-CA formats as YYYY-MM-DD.
  const [y, m, day] = new Intl.DateTimeFormat("en-CA", { timeZone })
    .format(d)
    .split("-")
    .map(Number);
  return Date.UTC(y, m - 1, day) / 86_400_000;
}

/** Whole calendar days from `now` until `target` in `timeZone` (0 = same day, negative = past). */
export function calendarDaysUntil(
  target: Date,
  timeZone: string,
  now = new Date(),
): number {
  return calendarDayNumber(target, timeZone) - calendarDayNumber(now, timeZone);
}

/** "128 days to go", "Tomorrow", "Today", or null once the day has passed. */
export function countdownLabel(days: number): string | null {
  if (days < 0) return null;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days to go`;
}

/** "6:30 pm" */
export const formatTime = (d: Date, tz: string) =>
  fmt(d, tz, { hour: "numeric", minute: "2-digit" });

/** An instant as a `<input type="datetime-local">` value ("2027-08-20T18:30") in `timeZone`. */
export function toDateTimeLocalInput(d: Date, timeZone: string): string {
  return new Date(d.getTime() + timeZoneOffsetMs(d, timeZone))
    .toISOString()
    .slice(0, 16);
}

/**
 * Parse a `<input type="datetime-local">` value as wall-clock time in `timeZone`. Returns null for
 * malformed input.
 */
export function fromDateTimeLocalInput(
  value: string,
  timeZone: string,
): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  if (new Date(wall).toISOString().slice(0, 16) !== value) return null;
  // The offset depends on the instant, so correct once more in case the first guess crossed a DST
  // change.
  let instant = wall - timeZoneOffsetMs(new Date(wall), timeZone);
  instant = wall - timeZoneOffsetMs(new Date(instant), timeZone);
  return new Date(instant);
}
