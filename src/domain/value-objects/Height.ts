import { InvalidHeightError } from "../errors/ProfileErrors";
import { Result, err, ok } from "@shared/result";

const MIN_CM = 100;
const MAX_CM = 250;

export class Height {
  private constructor(readonly cm: number) {}

  static create(cm: number): Result<Height, InvalidHeightError> {
    if (!Number.isFinite(cm) || cm < MIN_CM || cm > MAX_CM) {
      return err(new InvalidHeightError(cm));
    }
    return ok(new Height(cm));
  }

  get meters(): number {
    return this.cm / 100;
  }
}
