CREATE TABLE `analysis_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int NOT NULL,
	`userId` int NOT NULL,
	`riskLevel` enum('low','moderate','high','very_high') NOT NULL,
	`confidencePercentage` decimal(5,2) NOT NULL,
	`detectedEntities` json,
	`diagnosticSummary` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysis_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reportType` enum('uploaded','manual') NOT NULL,
	`fileUrl` text,
	`fileKey` text,
	`extractedText` text,
	`rawData` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `medical_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_reportId_medical_reports_id_fk` FOREIGN KEY (`reportId`) REFERENCES `medical_reports`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analysis_results` ADD CONSTRAINT `analysis_results_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medical_reports` ADD CONSTRAINT `medical_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;