import { InvalidWeightError } from "../errors/ProfileErrors";
import { Weight } from "../value-objects/Weight";
import { Result, err, ok } from "@shared/result";
import { DateKey } from "@shared/date-utils";

export interface WeightEntryProps {
  id: string;
  profileId: string;
  date: DateKey;
  weightKg: number;
}

export class WeightEntry {
  private constructor(private readonly props: WeightEntryProps) {}

  static create(props: WeightEntryProps): Result<WeightEntry, InvalidWeightError> {
    const weightResult = Weight.create(props.weightKg);
    if (!weightResult.ok) return err(weightResult.error);
    return ok(new WeightEntry(props));
  }

  static restore(props: WeightEntryProps): WeightEntry {
    return new WeightEntry(props);
  }

  get id(): string {
    return this.props.id;
  }

  get profileId(): string {
    return this.props.profileId;
  }

  get date(): DateKey {
    return this.props.date;
  }

  get weightKg(): number {
    return this.props.weightKg;
  }

  toProps(): WeightEntryProps {
    return { ...this.props };
  }
}
