import { and, eq, inArray } from "drizzle-orm";
import { WorkoutPlan } from "@domain/entities/WorkoutPlan";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";
import { Database } from "../database/database";
import { workoutPlanExercises, workoutPlans } from "../database/schema";
import { WorkoutPlanMapper } from "../mappers/WorkoutPlanMapper";

export class DrizzleWorkoutPlanRepository implements WorkoutPlanRepository {
  constructor(private readonly db: Database) {}

  async findAllByProfile(profileId: string): Promise<WorkoutPlan[]> {
    const planRows = await this.db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.profileId, profileId));
    if (planRows.length === 0) return [];

    const planIds = planRows.map((row) => row.id);
    const exerciseRows = await this.db
      .select()
      .from(workoutPlanExercises)
      .where(inArray(workoutPlanExercises.workoutPlanId, planIds));

    const exerciseRowsByPlanId = new Map<string, typeof exerciseRows>();
    for (const row of exerciseRows) {
      const existing = exerciseRowsByPlanId.get(row.workoutPlanId);
      if (existing) existing.push(row);
      else exerciseRowsByPlanId.set(row.workoutPlanId, [row]);
    }

    return planRows.map((planRow) =>
      WorkoutPlanMapper.toDomain(planRow, exerciseRowsByPlanId.get(planRow.id) ?? []),
    );
  }

  async findById(id: string): Promise<WorkoutPlan | null> {
    const [planRow] = await this.db
      .select()
      .from(workoutPlans)
      .where(eq(workoutPlans.id, id))
      .limit(1);
    if (!planRow) return null;

    const exerciseRows = await this.db
      .select()
      .from(workoutPlanExercises)
      .where(eq(workoutPlanExercises.workoutPlanId, id));

    return WorkoutPlanMapper.toDomain(planRow, exerciseRows);
  }

  async findMarkedToday(profileId: string): Promise<WorkoutPlan | null> {
    const [planRow] = await this.db
      .select()
      .from(workoutPlans)
      .where(and(eq(workoutPlans.profileId, profileId), eq(workoutPlans.isMarkedToday, true)))
      .limit(1);
    if (!planRow) return null;

    const exerciseRows = await this.db
      .select()
      .from(workoutPlanExercises)
      .where(eq(workoutPlanExercises.workoutPlanId, planRow.id));

    return WorkoutPlanMapper.toDomain(planRow, exerciseRows);
  }

  async save(plan: WorkoutPlan): Promise<void> {
    const planRow = WorkoutPlanMapper.toPlanRow(plan);
    const exerciseRows = WorkoutPlanMapper.toExerciseRows(plan);

    await this.db.transaction(async (tx) => {
      await tx
        .insert(workoutPlans)
        .values(planRow)
        .onConflictDoUpdate({ target: workoutPlans.id, set: planRow });

      await tx.delete(workoutPlanExercises).where(eq(workoutPlanExercises.workoutPlanId, plan.id));
      if (exerciseRows.length > 0) {
        await tx.insert(workoutPlanExercises).values(exerciseRows);
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workoutPlans).where(eq(workoutPlans.id, id));
  }
}
