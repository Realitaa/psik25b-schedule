CREATE UNIQUE INDEX IF NOT EXISTS `academic_years_unique_idx` ON `academic_years` (`year_start`, `year_end`, `semester`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` integer NOT NULL,
	`type` text DEFAULT 'regular' NOT NULL,
	`parent_schedule_id` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`skipped_until` text,
	`is_online` integer DEFAULT false NOT NULL,
	`building` text,
	`floor` text,
	`room` text,
	`day` text NOT NULL,
	`time_start` text NOT NULL,
	`time_end` text NOT NULL,
	`end_date` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE set null
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `event_presets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text NOT NULL,
	`icon` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);--> statement-breakpoint
ALTER TABLE `events` ADD `schedule_id` integer REFERENCES schedules(id) ON DELETE cascade;--> statement-breakpoint
ALTER TABLE `events` ADD `preset_id` integer REFERENCES event_presets(id) ON DELETE set null;--> statement-breakpoint
ALTER TABLE `events` ADD `type` text;--> statement-breakpoint
ALTER TABLE `events` ADD `color` text;--> statement-breakpoint
ALTER TABLE `events` ADD `icon` text;--> statement-breakpoint
INSERT OR IGNORE INTO `schedules` (`id`, `subject_id`, `type`, `status`, `is_online`, `building`, `floor`, `room`, `day`, `time_start`, `time_end`, `end_date`, `created_at`)
SELECT
	`id`,
	`id` AS `subject_id`,
	CASE WHEN `is_replacement` = 1 THEN 'one_off' ELSE 'regular' END AS `type`,
	'active' AS `status`,
	COALESCE(`is_online`, 0) AS `is_online`,
	`building`,
	`floor`,
	`room`,
	COALESCE(`day`, 'Senin') AS `day`,
	COALESCE(`time_start`, '08:00') AS `time_start`,
	COALESCE(`time_end`, '10:30') AS `time_end`,
	`end_date`,
	`created_at`
FROM `subjects`
WHERE `day` IS NOT NULL OR `time_start` IS NOT NULL;--> statement-breakpoint
UPDATE `events`
SET `schedule_id` = `subject_id`
WHERE `schedule_id` IS NULL AND `subject_id` IS NOT NULL;--> statement-breakpoint
UPDATE `events`
SET `type` = 'Informasi', `color` = '#3b82f6', `icon` = 'i-lucide-info'
WHERE `type` IS NULL;--> statement-breakpoint
INSERT INTO `event_presets` (`name`, `color`, `icon`)
SELECT 'Informasi', '#3b82f6', 'i-lucide-info'
WHERE NOT EXISTS (SELECT 1 FROM `event_presets` WHERE `name` = 'Informasi');--> statement-breakpoint
INSERT INTO `event_presets` (`name`, `color`, `icon`)
SELECT 'Tugas', '#f59e0b', 'i-lucide-file-text'
WHERE NOT EXISTS (SELECT 1 FROM `event_presets` WHERE `name` = 'Tugas');--> statement-breakpoint
INSERT INTO `event_presets` (`name`, `color`, `icon`)
SELECT 'Ujian', '#ef4444', 'i-lucide-clipboard-check'
WHERE NOT EXISTS (SELECT 1 FROM `event_presets` WHERE `name` = 'Ujian');
