import { WorkoutPlan } from "../entities/WorkoutPlan";

export interface WorkoutPlanRepository {
  findAllByProfile(profileId: string): Promise<WorkoutPlan[]>;
  findById(id: string): Promise<WorkoutPlan | null>;
  findMarkedToday(profileId: string): Promise<WorkoutPlan | null>;
  /** Upserts the whole aggregate (plan + its exercises) transactionally. */
  save(plan: WorkoutPlan): Promise<void>;
  delete(id: string): Promise<void>;
  /** Persists the new display order for a profile's plans, given their ids in the desired order. */
  reorderAll(profileId: string, orderedWorkoutPlanIds: string[]): Promise<void>;
}
