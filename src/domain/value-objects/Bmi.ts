import { Height } from "./Height";
import { Weight } from "./Weight";

export type BmiClassification = "abaixo" | "saudavel" | "sobrepeso" | "obesidade";

export class Bmi {
  private constructor(
    readonly value: number,
    readonly classification: BmiClassification,
  ) {}

  static calculate(weight: Weight, height: Height): Bmi {
    const raw = weight.kg / (height.meters * height.meters);
    const value = Math.round(raw * 10) / 10;
    return new Bmi(value, Bmi.classify(value));
  }

  private static classify(value: number): BmiClassification {
    if (value < 18.5) return "abaixo";
    if (value < 25) return "saudavel";
    if (value < 30) return "sobrepeso";
    return "obesidade";
  }
}
