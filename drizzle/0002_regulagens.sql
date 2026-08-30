ALTER TABLE `workout_plan_exercises` DROP COLUMN `seat_adjustment`;--> statement-breakpoint
ALTER TABLE `workout_plan_exercises` ADD `seat_height` real;--> statement-breakpoint
ALTER TABLE `workout_plan_exercises` ADD `seat_distance` real;--> statement-breakpoint
ALTER TABLE `workout_plan_exercises` ADD `seat_incline` real;--> statement-breakpoint
ALTER TABLE `workout_plan_exercises` ADD `seat_lock` real;
