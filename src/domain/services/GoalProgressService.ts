/** Weeks-per-month approximation used across the app (matches the FORJA design: 4 dias/semana -> meta de 16/mês). */
const WEEKS_PER_MONTH = 4;

export class GoalProgressService {
  static monthlyGoal(weeklyGoalDays: number): number {
    return weeklyGoalDays * WEEKS_PER_MONTH;
  }

  static progressPercentage(completed: number, goal: number): number {
    if (goal <= 0) return 0;
    return Math.min(100, Math.round((completed / goal) * 100));
  }

  static remaining(completed: number, goal: number): number {
    return Math.max(0, goal - completed);
  }
}
