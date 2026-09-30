import {
  InvalidDurationError,
  InvalidLoadError,
  InvalidRepsError,
  InvalidSetsError,
} from "../errors/WorkoutPlanErrors";
import { MAX_DURATION_SECONDS } from "@shared/duration";
import { Result, err, ok } from "@shared/result";
import { DateKey } from "@shared/date-utils";

/**
 * What was actually performed in one set — reps and load can differ from set to
 * set. Timed sets (core, cardio) carry `durationSeconds` instead, and their reps are ignored.
 */
export interface ExerciseSetLog {
  reps: number;
  loadKg: number;
  durationSeconds?: number;
}

export interface ExerciseLogProps {
  id: string;
  profileId: string;
  exerciseId: string;
  date: DateKey;
  sets: ExerciseSetLog[];
}

export type ExerciseLogValidationError =
  InvalidSetsError | InvalidRepsError | InvalidDurationError | InvalidLoadError;

/** Epley formula: turns load × reps into one comparable number. A single rep already is the 1RM. */
export function estimateOneRepMaxKg({ reps, loadKg }: ExerciseSetLog): number {
  return reps === 1 ? loadKg : loadKg * (1 + reps / 30);
}

export class ExerciseLog {
  private constructor(private readonly props: ExerciseLogProps) {}

  static create(props: ExerciseLogProps): Result<ExerciseLog, ExerciseLogValidationError> {
    if (props.sets.length < 1 || props.sets.length > 20) {
      return err(new InvalidSetsError(props.sets.length));
    }
    for (const set of props.sets) {
      if (set.durationSeconds !== undefined) {
        const duration = set.durationSeconds;
        if (!Number.isInteger(duration) || duration < 1 || duration > MAX_DURATION_SECONDS) {
          return err(new InvalidDurationError(duration));
        }
      } else if (!Number.isInteger(set.reps) || set.reps < 1 || set.reps > 100) {
        return err(new InvalidRepsError(set.reps));
      }
      if (!Number.isFinite(set.loadKg) || set.loadKg < 0 || set.loadKg > 500) {
        return err(new InvalidLoadError(set.loadKg));
      }
    }

    return ok(new ExerciseLog({ ...props, sets: props.sets.map((set) => ({ ...set })) }));
  }

  static restore(props: ExerciseLogProps): ExerciseLog {
    return new ExerciseLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get exerciseId(): string {
    return this.props.exerciseId;
  }

  get date(): DateKey {
    return this.props.date;
  }

  get setDetails(): readonly ExerciseSetLog[] {
    return this.props.sets;
  }

  get sets(): number {
    return this.props.sets.length;
  }

  /** Whether the sets were timed (core, cardio) rather than counted in reps. */
  get isTimed(): boolean {
    return this.props.sets.some((set) => set.durationSeconds !== undefined);
  }

  /** Reps of the top set (heaviest load, then most reps). */
  get reps(): number {
    return this.topSet.reps;
  }

  /** Heaviest load lifted in the session — the reference for load progression. */
  get loadKg(): number {
    return this.topSet.loadKg;
  }

  get volumeKg(): number {
    return this.props.sets.reduce((total, set) => total + set.reps * set.loadKg, 0);
  }

  get totalReps(): number {
    return this.props.sets.reduce((total, set) => total + set.reps, 0);
  }

  /** Longest set, in seconds — zero when the sets weren't timed. */
  get durationSeconds(): number {
    return this.topSet.durationSeconds ?? 0;
  }

  get totalDurationSeconds(): number {
    return this.props.sets.reduce((total, set) => total + (set.durationSeconds ?? 0), 0);
  }

  /** Set with the highest estimated 1RM — the best effort once load and reps are weighed together. */
  get bestSet(): ExerciseSetLog {
    return this.props.sets.reduce((best, set) =>
      estimateOneRepMaxKg(set) > estimateOneRepMaxKg(best) ? set : best,
    );
  }

  get estimatedOneRepMaxKg(): number {
    return estimateOneRepMaxKg(this.bestSet);
  }

  /** Heaviest load, then most reps — or, for timed sets, the longest one, then the heaviest. */
  get topSet(): ExerciseSetLog {
    if (this.isTimed) {
      return this.props.sets.reduce((best, set) => {
        const duration = set.durationSeconds ?? 0;
        const bestDuration = best.durationSeconds ?? 0;
        return duration > bestDuration || (duration === bestDuration && set.loadKg > best.loadKg)
          ? set
          : best;
      });
    }
    return this.props.sets.reduce((best, set) =>
      set.loadKg > best.loadKg || (set.loadKg === best.loadKg && set.reps > best.reps)
        ? set
        : best,
    );
  }

  toProps(): ExerciseLogProps {
    return { ...this.props, sets: this.props.sets.map((set) => ({ ...set })) };
  }
}
