import { InvalidWeightError } from "../errors/ProfileErrors";
import { Result, err, ok } from "@shared/result";

const MIN_KG = 20;
const MAX_KG = 400;

export class Weight {
  private constructor(readonly kg: number) {}

  static create(kg: number): Result<Weight, InvalidWeightError> {
    if (!Number.isFinite(kg) || kg < MIN_KG || kg > MAX_KG) {
      return err(new InvalidWeightError(kg));
    }
    return ok(new Weight(kg));
  }
}
