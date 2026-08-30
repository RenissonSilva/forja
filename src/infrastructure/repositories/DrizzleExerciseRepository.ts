import { eq } from "drizzle-orm";
import { Exercise } from "@domain/entities/Exercise";
import { ExerciseRepository } from "@domain/repositories/ExerciseRepository";
import { Database } from "../database/database";
import { exercises } from "../database/schema";
import { ExerciseMapper } from "../mappers/ExerciseMapper";

export class DrizzleExerciseRepository implements ExerciseRepository {
  constructor(private readonly db: Database) {}

  async findAll(): Promise<Exercise[]> {
    const rows = await this.db.select().from(exercises);
    return rows.map(ExerciseMapper.toDomain);
  }

  async findById(id: string): Promise<Exercise | null> {
    const [row] = await this.db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    return row ? ExerciseMapper.toDomain(row) : null;
  }

  async save(exercise: Exercise): Promise<void> {
    const row = ExerciseMapper.toRow(exercise);
    await this.db
      .insert(exercises)
      .values(row)
      .onConflictDoUpdate({ target: exercises.id, set: row });
  }
}
