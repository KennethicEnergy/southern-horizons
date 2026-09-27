const dateFmt = new Intl.DateTimeFormat("en-PH", { dateStyle: "long", timeZone: "Asia/Manila" });
const dateTimeFmt = new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" });

export const formatDate = (d: Date | string) => dateFmt.format(new Date(d));
export const formatDateTime = (d: Date | string) => dateTimeFmt.format(new Date(d));

export type EventPhase = "upcoming" | "ongoing" | "past";

/** Event phase is computed from dates, never set by hand. */
export function eventPhase(start: Date | null, end: Date | null, now = new Date()): EventPhase | null {
  if (!start) return null;
  const finish = end ?? start;
  if (now < start) return "upcoming";
  if (now > finish) return "past";
  return "ongoing";
}

/** Date → "YYYY-MM-DDTHH:mm" in Philippine time, for <input type="datetime-local">. */
export function toManilaInputValue(d: Date | string | null | undefined): string {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(d));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
