import {
  durationDigits,
  durationDigitsToSeconds,
  formatDuration,
  maskDurationDigits,
} from "./duration";

describe("formatDuration", () => {
  it.each([
    [0, "00:00"],
    [45, "00:45"],
    [90, "01:30"],
    [5999, "99:59"],
  ])("formats %s seconds as %s", (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text);
  });
});

describe("duration mask", () => {
  it("fills digits from the right as they are typed", () => {
    expect(maskDurationDigits(durationDigits("1")!)).toBe("00:01");
    expect(maskDurationDigits(durationDigits("00:013")!)).toBe("00:13");
    expect(maskDurationDigits(durationDigits("00:130")!)).toBe("01:30");
  });

  it("shifts back when a digit is erased", () => {
    expect(maskDurationDigits(durationDigits("01:3")!)).toBe("00:13");
  });

  it("ignores a fifth digit", () => {
    expect(durationDigits("12:345")).toBeNull();
  });

  it("carries seconds over 59 into minutes", () => {
    expect(durationDigitsToSeconds("190")).toBe(150);
  });

  it("reads an empty field as zero", () => {
    expect(durationDigitsToSeconds(durationDigits("")!)).toBe(0);
  });

  it("caps at 99:59", () => {
    expect(durationDigitsToSeconds("9999")).toBe(5999);
  });
});
