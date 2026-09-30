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
import { ReorderWorkoutPlansUseCase } from "@application/workout-plans/ReorderWorkoutPlans.usecase";
import { CompleteWorkoutSessionUseCase } from "@application/attendance/CompleteWorkoutSession.usecase";
import { GetWeeklyAttendanceUseCase } from "@application/attendance/GetWeeklyAttendance.usecase";
import { GetMonthlyAttendanceUseCase } from "@application/attendance/GetMonthlyAttendance.usecase";
import { GetMonthlyGoalProgressUseCase } from "@application/attendance/GetMonthlyGoalProgress.usecase";
import { GetMuscleGroupStatsUseCase } from "@application/attendance/GetMuscleGroupStats.usecase";
import { RegisterWeightEntryUseCase } from "@application/progress/RegisterWeightEntry.usecase";
import { GetWeightHistoryUseCase } from "@application/progress/GetWeightHistory.usecase";
import { GetBmiHistoryUseCase } from "@application/progress/GetBmiHistory.usecase";
import { RegisterMeasurementsUseCase } from "@application/progress/RegisterMeasurements.usecase";
import { GetMeasurementsHistoryUseCase } from "@application/progress/GetMeasurementsHistory.usecase";
import { LogExercisePerformanceUseCase } from "@application/progress/LogExercisePerformance.usecase";
import { GetExercisePerformanceHistoryUseCase } from "@application/progress/GetExercisePerformanceHistory.usecase";
import { GetExerciseProgressUseCase } from "@application/progress/GetExerciseProgress.usecase";
import { SignUpWithEmailUseCase } from "@application/auth/SignUpWithEmail.usecase";
import { SignInWithEmailUseCase } from "@application/auth/SignInWithEmail.usecase";
import { SignInWithGoogleUseCase } from "@application/auth/SignInWithGoogle.usecase";
import { SignOutUseCase } from "@application/auth/SignOut.usecase";
import { GetCurrentUserUseCase } from "@application/auth/GetCurrentUser.usecase";
import { GetExerciseDetailsUseCase } from "@application/exercise-info/GetExerciseDetails.usecase";
import { ListExerciseInfoIndexUseCase } from "@application/exercise-info/ListExerciseInfoIndex.usecase";

import type { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseAttendanceRepository } from "@infrastructure/repositories/SupabaseAttendanceRepository";
import { SupabaseAuthRepository } from "@infrastructure/repositories/SupabaseAuthRepository";
import { SupabaseExerciseRepository } from "@infrastructure/repositories/SupabaseExerciseRepository";
import { SupabaseProfileRepository } from "@infrastructure/repositories/SupabaseProfileRepository";
import { SupabaseWeightEntryRepository } from "@infrastructure/repositories/SupabaseWeightEntryRepository";
import { SupabaseBodyMeasurementRepository } from "@infrastructure/repositories/SupabaseBodyMeasurementRepository";
import { SupabaseExerciseLogRepository } from "@infrastructure/repositories/SupabaseExerciseLogRepository";
import { SupabaseWorkoutPlanRepository } from "@infrastructure/repositories/SupabaseWorkoutPlanRepository";
import { AsyncStorageCache } from "@infrastructure/cache/AsyncStorageCache";
import { ExerciseDbHttpClient } from "@infrastructure/http/ExerciseDbHttpClient";
import { RemoteExerciseInfoRepository } from "@infrastructure/repositories/RemoteExerciseInfoRepository";
import { CachedExerciseInfoRepository } from "@infrastructure/repositories/CachedExerciseInfoRepository";
import { MyMemoryTranslatorRepository } from "@infrastructure/translation/MyMemoryTranslatorRepository";
import { EXERCISE_INFO_CONFIG } from "@infrastructure/config/exerciseInfoConfig";

/** Composition root: wires repositories (Infrastructure) into use cases (Application). */
export function buildContainer(client: SupabaseClient) {
  const authRepository = new SupabaseAuthRepository();
  const profileRepository = new SupabaseProfileRepository(client);
  const exerciseRepository = new SupabaseExerciseRepository(client);
  const workoutPlanRepository = new SupabaseWorkoutPlanRepository(client);
  const attendanceRepository = new SupabaseAttendanceRepository(client);
  const weightEntryRepository = new SupabaseWeightEntryRepository(client);
  const bodyMeasurementRepository = new SupabaseBodyMeasurementRepository(client);
  const exerciseLogRepository = new SupabaseExerciseLogRepository(client);

  const asyncStorageCache = new AsyncStorageCache();
  const exerciseInfoRepository = new CachedExerciseInfoRepository(
    new RemoteExerciseInfoRepository(
      new ExerciseDbHttpClient(EXERCISE_INFO_CONFIG.baseUrl, EXERCISE_INFO_CONFIG.requestTimeoutMs),
    ),
    asyncStorageCache,
  );
  const translatorRepository = new MyMemoryTranslatorRepository(
    EXERCISE_INFO_CONFIG.translateBaseUrl,
    asyncStorageCache,
    EXERCISE_INFO_CONFIG.translateContactEmail,
  );

  return {
    auth: {
      signUp: new SignUpWithEmailUseCase(authRepository),
      signIn: new SignInWithEmailUseCase(authRepository),
      signInWithGoogle: new SignInWithGoogleUseCase(authRepository),
      signOut: new SignOutUseCase(authRepository),
      getCurrentUser: new GetCurrentUserUseCase(authRepository),
      onAuthStateChange: authRepository.onAuthStateChange.bind(authRepository),
    },
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
      reorder: new ReorderWorkoutPlansUseCase(workoutPlanRepository),
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
      getMuscleGroupStats: new GetMuscleGroupStatsUseCase(
        attendanceRepository,
        workoutPlanRepository,
        exerciseRepository,
      ),
    },
    progress: {
      registerWeight: new RegisterWeightEntryUseCase(weightEntryRepository),
      getWeightHistory: new GetWeightHistoryUseCase(weightEntryRepository),
      getBmiHistory: new GetBmiHistoryUseCase(weightEntryRepository, profileRepository),
      registerMeasurements: new RegisterMeasurementsUseCase(bodyMeasurementRepository),
      getMeasurementsHistory: new GetMeasurementsHistoryUseCase(bodyMeasurementRepository),
      logExercisePerformance: new LogExercisePerformanceUseCase(exerciseLogRepository),
      getExercisePerformanceHistory: new GetExercisePerformanceHistoryUseCase(
        exerciseLogRepository,
      ),
      getExerciseProgress: new GetExerciseProgressUseCase(
        exerciseLogRepository,
        exerciseRepository,
      ),
    },
    exerciseInfo: {
      getDetails: new GetExerciseDetailsUseCase(exerciseInfoRepository, translatorRepository),
      listIndex: new ListExerciseInfoIndexUseCase(exerciseInfoRepository),
    },
  };
}

export type AppContainer = ReturnType<typeof buildContainer>;
