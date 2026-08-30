import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import { env } from "../config/env";
import * as schema from "./schema";

export const expoDb = SQLite.openDatabaseSync(env.DB_NAME, { enableChangeListener: true });
// SQLite ignores FOREIGN KEY ... ON DELETE CASCADE unless enabled per-connection.
expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { schema });

export type Database = typeof db;
