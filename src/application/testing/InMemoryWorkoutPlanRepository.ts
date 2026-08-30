import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class InMemoryWorkoutPlanRepository implements WorkoutPlanRepository {
  private readonly items = new Map<string, WorkoutPlan>();

  async findAllByProfile(profileId: string): Promise<WorkoutPlan[]> {
    return [...this.items.values()].filter((plan) => plan.profileId === profileId);
  }

  async findById(id: string): Promise<WorkoutPlan | null> {
    return this.items.get(id) ?? null;
  }

  async findMarkedToday(profileId: string): Promise<WorkoutPlan | null> {
    return (
      [...this.items.values()].find((plan) => plan.profileId === profileId && plan.isMarkedToday) ??
      null
    );
  }

  async save(plan: WorkoutPlan): Promise<void> {
    this.items.set(plan.id, plan);
  }

  async delete(id: string): Promise<void> {
    this.items.delete(id);
  }
}
