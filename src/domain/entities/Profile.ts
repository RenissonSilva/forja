import {
  InvalidHeightError,
  InvalidProfileNameError,
  InvalidWeeklyGoalError,
} from "../errors/ProfileErrors";
import { Height } from "../value-objects/Height";
import { Result, err, ok } from "@shared/result";

export interface ProfileProps {
  id: string;
  name: string;
  avatarUri: string | null;
  heightCm: number;
  weeklyGoalDays: number;
  remindersEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ProfileValidationError =
  InvalidProfileNameError | InvalidHeightError | InvalidWeeklyGoalError;

export class Profile {
  private constructor(private readonly props: ProfileProps) {}

  static create(
    props: Omit<ProfileProps, "id" | "createdAt" | "updatedAt"> & { id: string; now?: Date },
  ): Result<Profile, ProfileValidationError> {
    const nameResult = Profile.validateName(props.name);
    if (!nameResult.ok) return nameResult;

    const heightResult = Height.create(props.heightCm);
    if (!heightResult.ok) return heightResult;

    const goalResult = Profile.validateWeeklyGoal(props.weeklyGoalDays);
    if (!goalResult.ok) return goalResult;

    const now = props.now ?? new Date();
    return ok(
      new Profile({
        id: props.id,
        name: nameResult.value,
        avatarUri: props.avatarUri,
        heightCm: props.heightCm,
        weeklyGoalDays: props.weeklyGoalDays,
        remindersEnabled: props.remindersEnabled,
        createdAt: now,
        updatedAt: now,
      }),
    );
  }

  static restore(props: ProfileProps): Profile {
    return new Profile(props);
  }

  update(
    changes: Partial<
      Pick<ProfileProps, "name" | "avatarUri" | "heightCm" | "weeklyGoalDays" | "remindersEnabled">
    >,
    now: Date = new Date(),
  ): Result<Profile, ProfileValidationError> {
    const name = changes.name ?? this.props.name;
    const heightCm = changes.heightCm ?? this.props.heightCm;
    const weeklyGoalDays = changes.weeklyGoalDays ?? this.props.weeklyGoalDays;

    const nameResult = Profile.validateName(name);
    if (!nameResult.ok) return nameResult;

    const heightResult = Height.create(heightCm);
    if (!heightResult.ok) return heightResult;

    const goalResult = Profile.validateWeeklyGoal(weeklyGoalDays);
    if (!goalResult.ok) return goalResult;

    return ok(
      new Profile({
        ...this.props,
        name: nameResult.value,
        avatarUri: changes.avatarUri !== undefined ? changes.avatarUri : this.props.avatarUri,
        heightCm,
        weeklyGoalDays,
        remindersEnabled: changes.remindersEnabled ?? this.props.remindersEnabled,
        updatedAt: now,
      }),
    );
  }

  private static validateName(name: string): Result<string, InvalidProfileNameError> {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 60) {
      return err(new InvalidProfileNameError());
    }
    return ok(trimmed);
  }

  private static validateWeeklyGoal(days: number): Result<number, InvalidWeeklyGoalError> {
    if (!Number.isInteger(days) || days < 1 || days > 7) {
      return err(new InvalidWeeklyGoalError(days));
    }
    return ok(days);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get avatarUri(): string | null {
    return this.props.avatarUri;
  }

  get heightCm(): number {
    return this.props.heightCm;
  }

  get weeklyGoalDays(): number {
    return this.props.weeklyGoalDays;
  }

  get remindersEnabled(): boolean {
    return this.props.remindersEnabled;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toProps(): ProfileProps {
    return { ...this.props };
  }
}
