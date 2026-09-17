import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export class InMemoryWorkoutPlanRepository implements WorkoutPlanRepository {
  private readonly items = new Map<string, WorkoutPlan>();

  async findAllByProfile(profileId: string): Promise<WorkoutPlan[]> {
    return [...this.items.values()]
      .filter((plan) => plan.profileId === profileId)
      .sort((a, b) => a.order - b.order);
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

  async reorderAll(profileId: string, orderedWorkoutPlanIds: string[]): Promise<void> {
    orderedWorkoutPlanIds.forEach((id, index) => {
      const plan = this.items.get(id);
      if (plan && plan.profileId === profileId) {
        this.items.set(id, plan.reorder(index));
      }
    });
  }
}
