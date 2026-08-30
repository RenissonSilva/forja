import { Profile } from "./Profile";

const baseProps = {
  id: "profile-1",
  name: "Rafael Lima",
  avatarUri: null,
  heightCm: 178,
  weeklyGoalDays: 4,
  remindersEnabled: true,
};

describe("Profile.create", () => {
  it("creates a valid profile, trimming the name", () => {
    const result = Profile.create({ ...baseProps, name: "  Rafael Lima  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Rafael Lima");
      expect(result.value.createdAt).toEqual(result.value.updatedAt);
    }
  });

  it("rejects an empty name", () => {
    const result = Profile.create({ ...baseProps, name: "   " });
    expect(result.ok).toBe(false);
  });

  it("rejects an invalid height", () => {
    const result = Profile.create({ ...baseProps, heightCm: 30 });
    expect(result.ok).toBe(false);
  });

  it.each([0, 8, 1.5])("rejects an invalid weekly goal (%s)", (weeklyGoalDays) => {
    const result = Profile.create({ ...baseProps, weeklyGoalDays });
    expect(result.ok).toBe(false);
  });
});

describe("Profile#update", () => {
  it("applies a partial update and bumps updatedAt", () => {
    const created = Profile.create(baseProps);
    if (!created.ok) throw new Error("fixture should be valid");

    const later = new Date(created.value.createdAt.getTime() + 1000);
    const updated = created.value.update({ heightCm: 180 }, later);

    expect(updated.ok).toBe(true);
    if (updated.ok) {
      expect(updated.value.heightCm).toBe(180);
      expect(updated.value.name).toBe(created.value.name);
      expect(updated.value.updatedAt).toEqual(later);
    }
  });

  it("rejects an update that would leave the profile invalid", () => {
    const created = Profile.create(baseProps);
    if (!created.ok) throw new Error("fixture should be valid");

    const updated = created.value.update({ heightCm: 999 });
    expect(updated.ok).toBe(false);
  });
});
