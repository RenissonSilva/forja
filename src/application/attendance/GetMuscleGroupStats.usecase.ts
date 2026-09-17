import { MUSCLE_GROUPS, MuscleGroup } from "@domain/entities/Exercise";
import { AttendanceRepository } from "@domain/repositories/AttendanceRepository";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { WorkoutPlanRepository } from "@domain/repositories/WorkoutPlanRepository";

export interface MuscleGroupStat {
  muscleGroup: MuscleGroup;
  count: number;
}

export class GetMuscleGroupStatsUseCase {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly workoutPlanRepository: WorkoutPlanRepository,
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async execute(input: { profileId: string }): Promise<MuscleGroupStat[]> {
    const attendances = await this.attendanceRepository.findAllByProfile(input.profileId);
    const workoutPlanIds = [
      ...new Set(attendances.flatMap((a) => (a.workoutPlanId ? [a.workoutPlanId] : []))),
    ];
    if (workoutPlanIds.length === 0) {
      return MUSCLE_GROUPS.map((muscleGroup) => ({ muscleGroup, count: 0 }));
    }

    const [plans, exercises] = await Promise.all([
      Promise.all(workoutPlanIds.map((id) => this.workoutPlanRepository.findById(id))),
      this.exerciseRepository.findAll(),
    ]);

    const muscleGroupByExerciseId = new Map(exercises.map((e) => [e.id, e.muscleGroup]));
    const muscleGroupsByPlanId = new Map<string, Set<MuscleGroup>>();
    plans.forEach((plan, index) => {
      if (!plan) return;
      const groups = new Set(
        plan.exercises
          .map((exercise) => muscleGroupByExerciseId.get(exercise.exerciseId))
          .filter((group): group is MuscleGroup => group !== undefined),
      );
      muscleGroupsByPlanId.set(workoutPlanIds[index]!, groups);
    });

    const counts = new Map<MuscleGroup, number>(MUSCLE_GROUPS.map((group) => [group, 0]));
    for (const attendance of attendances) {
      if (!attendance.workoutPlanId) continue;
      const groups = muscleGroupsByPlanId.get(attendance.workoutPlanId);
      if (!groups) continue;
      for (const group of groups) {
        counts.set(group, (counts.get(group) ?? 0) + 1);
      }
    }

    return MUSCLE_GROUPS.map((muscleGroup) => ({
      muscleGroup,
      count: counts.get(muscleGroup) ?? 0,
    })).sort((a, b) => b.count - a.count);
  }
}
