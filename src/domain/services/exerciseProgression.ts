import { ExerciseLog } from "../entities/ExerciseLog";

/**
 * How an exercise's evolution is measured. Timed ones (core, cardio) progress by
 * time; weighted exercises by load (heaviest set, estimated 1RM, volume);
 * bodyweight ones — no load ever logged — by reps.
 */
export type ProgressionMetric =
  | "load"
  | "estimatedOneRepMax"
  | "volume"
  | "reps"
  | "totalReps"
  | "duration"
  | "totalDuration";

const WEIGHTED_METRICS: readonly ProgressionMetric[] = ["load", "estimatedOneRepMax", "volume"];
const BODYWEIGHT_METRICS: readonly ProgressionMetric[] = ["reps", "totalReps"];
const TIMED_METRICS: readonly ProgressionMetric[] = ["duration", "totalDuration"];

export interface ExerciseRecord {
  metric: ProgressionMetric;
  value: number;
  /** Session that first reached the value. */
  session: ExerciseLog;
}

export interface ExerciseProgress {
  exerciseId: string;
  /** Oldest first. */
  sessions: ExerciseLog[];
  /** Metrics that make sense for this exercise; the first one is the headline. */
  metrics: readonly ProgressionMetric[];
  /** All-time best per metric, in the same order as `metrics`. */
  records: ExerciseRecord[];
  /** Metrics on which a session (keyed by log id) beat every earlier one. The first session sets none. */
  recordsBySessionId: ReadonlyMap<string, ProgressionMetric[]>;
}

export interface ProgressChange {
  absolute: number;
  /** Null when the starting value is zero. */
  percent: number | null;
}

export function metricValue(session: ExerciseLog, metric: ProgressionMetric): number {
  switch (metric) {
    case "load":
      return session.loadKg;
    case "estimatedOneRepMax":
      return session.estimatedOneRepMaxKg;
    case "volume":
      return session.volumeKg;
    case "reps":
      return session.reps;
    case "totalReps":
      return session.totalReps;
    case "duration":
      return session.durationSeconds;
    case "totalDuration":
      return session.totalDurationSeconds;
  }
}

/** Groups the log history per exercise, in order of first appearance. */
export function buildExerciseProgress(logs: readonly ExerciseLog[]): ExerciseProgress[] {
  const sessionsByExerciseId = new Map<string, ExerciseLog[]>();
  for (const log of logs) {
    const sessions = sessionsByExerciseId.get(log.exerciseId) ?? [];
    sessions.push(log);
    sessionsByExerciseId.set(log.exerciseId, sessions);
  }

  return [...sessionsByExerciseId].map(([exerciseId, sessions]) =>
    progressOf(
      exerciseId,
      sessions.sort((a, b) => a.date.localeCompare(b.date)),
    ),
  );
}

/** Change from the first to the last of the given sessions; null with fewer than two. */
export function progressChange(
  sessions: readonly ExerciseLog[],
  metric: ProgressionMetric,
): ProgressChange | null {
  const first = sessions[0];
  const last = sessions[sessions.length - 1];
  if (!first || !last || first === last) return null;

  const start = metricValue(first, metric);
  const absolute = metricValue(last, metric) - start;
  return { absolute, percent: start > 0 ? (absolute / start) * 100 : null };
}

function progressOf(exerciseId: string, sessions: ExerciseLog[]): ExerciseProgress {
  const metrics = sessions.some((session) => session.isTimed)
    ? TIMED_METRICS
    : sessions.some((session) => session.loadKg > 0)
      ? WEIGHTED_METRICS
      : BODYWEIGHT_METRICS;
  const best = new Map<ProgressionMetric, ExerciseRecord>();
  const recordsBySessionId = new Map<string, ProgressionMetric[]>();

  for (const session of sessions) {
    const beaten: ProgressionMetric[] = [];
    for (const metric of metrics) {
      const value = metricValue(session, metric);
      const current = best.get(metric);
      if (current && value <= current.value) continue;
      if (current) beaten.push(metric);
      best.set(metric, { metric, value, session });
    }
    if (beaten.length > 0) recordsBySessionId.set(session.id, beaten);
  }

  return {
    exerciseId,
    sessions,
    metrics,
    records: metrics.map((metric) => best.get(metric)!),
    recordsBySessionId,
  };
}
