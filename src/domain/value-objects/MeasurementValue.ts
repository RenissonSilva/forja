import { InvalidMeasurementError } from "../errors/ProfileErrors";
import { Result, err, ok } from "@shared/result";

const MIN_CM = 10;
const MAX_CM = 300;

export class MeasurementValue {
  private constructor(readonly cm: number) {}

  static create(cm: number): Result<MeasurementValue, InvalidMeasurementError> {
    if (!Number.isFinite(cm) || cm < MIN_CM || cm > MAX_CM) {
      return err(new InvalidMeasurementError(cm));
    }
    return ok(new MeasurementValue(cm));
  }
}
