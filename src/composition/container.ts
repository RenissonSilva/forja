import { CreateProfileUseCase } from "@application/profile/CreateProfile.usecase";
import { UpdateProfileUseCase } from "@application/profile/UpdateProfile.usecase";
import { GetProfileUseCase } from "@application/profile/GetProfile.usecase";
import { ListExercisesUseCase } from "@application/exercises/ListExercises.usecase";
import { CreateCustomExerciseUseCase } from "@application/exercises/CreateCustomExercise.usecase";
import { CreateWorkoutPlanUseCase } from "@application/workout-plans/CreateWorkoutPlan.usecase";
import { UpdateWorkoutPlanUseCase } from "@application/workout-plans/UpdateWorkoutPlan.usecase";
import { DeleteWorkoutPlanUseCase } from "@application/workout-plans/DeleteWorkoutPlan.usecase";
import { ListWorkoutPlansUseCase } from "@application/workout-plans/ListWorkoutPlans.usecase";
import { GetWorkoutPlanUseCase } from "@application/workout-plans/GetWorkoutPlan.usecase";
import { AddExerciseToPlanUseCase } from "@application/workout-plans/AddExerciseToPlan.usecase";
import { UpdateWorkoutPlanExerciseUseCase } from "@application/workout-plans/UpdateWorkoutPlanExercise.usecase";
import { RemoveExerciseFromPlanUseCase } from "@application/workout-plans/RemoveExerciseFromPlan.usecase";
import { MarkWorkoutPlanAsTodayUseCase } from "@application/workout-plans/MarkWorkoutPlanAsToday.usecase";
import { CompleteWorkoutSessionUseCase } from "@application/attendance/CompleteWorkoutSession.usecase";
import { GetWeeklyAttendanceUseCase } from "@application/attendance/GetWeeklyAttendance.usecase";
import { GetMonthlyAttendanceUseCase } from "@application/attendance/GetMonthlyAttendance.usecase";
import { GetMonthlyGoalProgressUseCase } from "@application/attendance/GetMonthlyGoalProgress.usecase";
import { RegisterWeightEntryUseCase } from "@application/progress/RegisterWeightEntry.usecase";
import { GetWeightHistoryUseCase } from "@application/progress/GetWeightHistory.usecase";
import { GetBmiHistoryUseCase } from "@application/progress/GetBmiHistory.usecase";

import { Database } from "@infrastructure/database/database";
import { DrizzleAttendanceRepository } from "@infrastructure/repositories/DrizzleAttendanceRepository";
import { DrizzleExerciseRepository } from "@infrastructure/repositories/DrizzleExerciseRepository";
import { DrizzleProfileRepository } from "@infrastructure/repositories/DrizzleProfileRepository";
import { DrizzleWeightEntryRepository } from "@infrastructure/repositories/DrizzleWeightEntryRepository";
import { DrizzleWorkoutPlanRepository } from "@infrastructure/repositories/DrizzleWorkoutPlanRepository";

/** Composition root: wires repositories (Infrastructure) into use cases (Application). */
export function buildContainer(db: Database) {
  const profileRepository = new DrizzleProfileRepository(db);
  const exerciseRepository = new DrizzleExerciseRepository(db);
  const workoutPlanRepository = new DrizzleWorkoutPlanRepository(db);
  const attendanceRepository = new DrizzleAttendanceRepository(db);
  const weightEntryRepository = new DrizzleWeightEntryRepository(db);

  return {
    profile: {
      create: new CreateProfileUseCase(profileRepository, weightEntryRepository),
      update: new UpdateProfileUseCase(profileRepository),
      get: new GetProfileUseCase(profileRepository),
    },
    exercises: {
      list: new ListExercisesUseCase(exerciseRepository),
      createCustom: new CreateCustomExerciseUseCase(exerciseRepository),
    },
    workoutPlans: {
      create: new CreateWorkoutPlanUseCase(workoutPlanRepository),
      update: new UpdateWorkoutPlanUseCase(workoutPlanRepository),
      delete: new DeleteWorkoutPlanUseCase(workoutPlanRepository),
      list: new ListWorkoutPlansUseCase(workoutPlanRepository),
      get: new GetWorkoutPlanUseCase(workoutPlanRepository),
      addExercise: new AddExerciseToPlanUseCase(workoutPlanRepository, exerciseRepository),
      updateExercise: new UpdateWorkoutPlanExerciseUseCase(workoutPlanRepository),
      removeExercise: new RemoveExerciseFromPlanUseCase(workoutPlanRepository),
      markAsToday: new MarkWorkoutPlanAsTodayUseCase(workoutPlanRepository),
    },
    attendance: {
      completeSession: new CompleteWorkoutSessionUseCase(
        attendanceRepository,
        workoutPlanRepository,
      ),
      getWeekly: new GetWeeklyAttendanceUseCase(attendanceRepository),
      getMonthly: new GetMonthlyAttendanceUseCase(attendanceRepository),
      getMonthlyGoalProgress: new GetMonthlyGoalProgressUseCase(
        attendanceRepository,
        profileRepository,
      ),
    },
    progress: {
      registerWeight: new RegisterWeightEntryUseCase(weightEntryRepository),
      getWeightHistory: new GetWeightHistoryUseCase(weightEntryRepository),
      getBmiHistory: new GetBmiHistoryUseCase(weightEntryRepository, profileRepository),
    },
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;
