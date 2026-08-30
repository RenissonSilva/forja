import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export function startOfMonthDate(date: Date): Date {
  return startOfMonth(date);
}

export function endOfMonthDate(date: Date): Date {
  return endOfMonth(date);
}

/** Weeks/months in this app always start on Monday (matches the FORJA mockups). */
const WEEK_OPTS = { weekStartsOn: 1 as const };

export type DateKey = string;

export function toDateKey(date: Date): DateKey {
  return format(date, "yyyy-MM-dd");
}

export function fromDateKey(key: DateKey): Date {
  return parseISO(key);
}

export function todayKey(): DateKey {
  return toDateKey(new Date());
}

export function isSameDateKey(a: DateKey, b: DateKey): boolean {
  return a === b;
}

/** The 7 dates (Monday to Sunday) of the week containing `date`. */
export function weekDates(date: Date): Date[] {
  const start = startOfWeek(date, WEEK_OPTS);
  return eachDayOfInterval({ start, end: addDays(start, 6) });
}

/**
 * Full calendar grid for the month containing `date`: complete Monday-Sunday
 * weeks, including the leading/trailing days from adjacent months.
 */
export function monthGridDates(date: Date): Date[] {
  const gridStart = startOfWeek(startOfMonth(date), WEEK_OPTS);
  const gridEnd = endOfWeek(endOfMonth(date), WEEK_OPTS);
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function isInSameMonth(date: Date, reference: Date): boolean {
  return date.getMonth() === reference.getMonth() && date.getFullYear() === reference.getFullYear();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}
