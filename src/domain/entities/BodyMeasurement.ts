import { InvalidMeasurementError } from "../errors/ProfileErrors";
import { MeasurementValue } from "../value-objects/MeasurementValue";
import { Result, err, ok } from "@shared/result";
import { DateKey } from "@shared/date-utils";

export const MEASUREMENT_TYPES = [
  "cintura",
  "abdomen",
  "quadril",
  "biceps",
  "coxas",
  "peitoral",
  "panturrilhas",
  "antebraco",
] as const;

export type MeasurementType = (typeof MEASUREMENT_TYPES)[number];

export interface BodyMeasurementProps {
  id: string;
  profileId: string;
  date: DateKey;
  type: MeasurementType;
  valueCm: number;
}

export class BodyMeasurement {
  private constructor(private readonly props: BodyMeasurementProps) {}

  static create(props: BodyMeasurementProps): Result<BodyMeasurement, InvalidMeasurementError> {
    const valueResult = MeasurementValue.create(props.valueCm);
    if (!valueResult.ok) return err(valueResult.error);
    return ok(new BodyMeasurement(props));
  }

  static restore(props: BodyMeasurementProps): BodyMeasurement {
    return new BodyMeasurement(props);
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

  get type(): MeasurementType {
    return this.props.type;
  }

  get valueCm(): number {
    return this.props.valueCm;
  }

  toProps(): BodyMeasurementProps {
    return { ...this.props };
  }
}
