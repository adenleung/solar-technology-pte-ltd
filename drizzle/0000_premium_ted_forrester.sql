CREATE TABLE `enquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`fingerprint` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`location` text NOT NULL,
	`building_type` text NOT NULL,
	`roof_information` text NOT NULL,
	`product_interest` text NOT NULL,
	`requirements` text NOT NULL,
	`configuration` text,
	`drawing_key` text,
	`drawing_name` text,
	`consent_version` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `enquiries_reference_unique` ON `enquiries` (`reference`);--> statement-breakpoint
CREATE TABLE `submission_windows` (
	`key` text PRIMARY KEY NOT NULL,
	`hour` integer NOT NULL,
	`count` integer NOT NULL
);
