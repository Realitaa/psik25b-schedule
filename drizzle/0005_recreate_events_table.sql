CREATE TABLE `__new_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`schedule_id` integer NOT NULL REFERENCES `schedules`(`id`) ON DELETE cascade,
	`author_id` integer REFERENCES `users`(`id`) ON DELETE set null,
	`preset_id` integer REFERENCES `event_presets`(`id`) ON DELETE set null,
	`title` text NOT NULL,
	`description` text,
	`type` text,
	`color` text,
	`icon` text,
	`end_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_events` (`id`, `schedule_id`, `author_id`, `preset_id`, `title`, `description`, `type`, `color`, `icon`, `end_date`, `created_at`)
SELECT
	`id`,
	`schedule_id`,
	`author_id`,
	`preset_id`,
	`title`,
	`description`,
	`type`,
	`color`,
	`icon`,
	`end_date`,
	`created_at`
FROM `events`;
--> statement-breakpoint
DROP TABLE `events`;
--> statement-breakpoint
ALTER TABLE `__new_events` RENAME TO `events`;
