-- CreateTable
CREATE TABLE `band` (
    `band_id` INTEGER NOT NULL AUTO_INCREMENT,
    `creator_id` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(45) NULL,

    INDEX `creator_id_idx`(`creator_id`),
    PRIMARY KEY (`band_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `band_member` (
    `band_id` INTEGER NOT NULL,
    `nickname` VARCHAR(45) NOT NULL,
    `user_id` VARCHAR(255) NULL,
    `role` VARCHAR(10) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `band_id_idx`(`band_id`),
    INDEX `role_idx`(`role`),
    INDEX `user_id_idx`(`user_id`),
    UNIQUE INDEX `uniq_band_user`(`band_id`, `user_id`),
    PRIMARY KEY (`band_id`, `nickname`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `band_role` (
    `role` VARCHAR(10) NOT NULL,
    `descr` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setlist` (
    `setlist_id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(45) NULL,
    `creator_id` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `band_id` INTEGER NOT NULL,
    `archived` TINYINT NOT NULL DEFAULT 0,
    `date` DATE NULL,
    `descr` VARCHAR(100) NULL,

    INDEX `band_id_idx`(`band_id`),
    INDEX `creator_id_idx`(`creator_id`),
    INDEX `date_idx`(`date`),
    PRIMARY KEY (`setlist_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `setlist_song` (
    `setlist_id` INTEGER NOT NULL,
    `setlist_order` INTEGER NOT NULL,
    `song_id` INTEGER NOT NULL,
    `note` VARCHAR(100) NULL,

    INDEX `setlist_id_idx`(`setlist_id`),
    INDEX `song_id_idx`(`song_id`),
    PRIMARY KEY (`setlist_id`, `setlist_order`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `song` (
    `song_id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(45) NOT NULL,
    `artist` VARCHAR(100) NULL,
    `key` VARCHAR(30) NULL,
    `tempo` VARCHAR(15) NULL,
    `tags` VARCHAR(100) NULL,
    `notes` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `creator_id` VARCHAR(255) NULL,
    `band_id` INTEGER NOT NULL,
    `archived` BOOLEAN NOT NULL DEFAULT false,

    INDEX `band_id_idx`(`band_id`),
    INDEX `creator_id_idx`(`creator_id`),
    PRIMARY KEY (`song_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `user_id` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `username` VARCHAR(45) NULL,
    `privilege` VARCHAR(10) NULL DEFAULT 'User',

    UNIQUE INDEX `nickname`(`username`),
    INDEX `privilege_idx`(`privilege`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_privilege` (
    `privilege` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`privilege`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `band` ADD CONSTRAINT `fk_band_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `band_member` ADD CONSTRAINT `fk_bm_band_id` FOREIGN KEY (`band_id`) REFERENCES `band`(`band_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `band_member` ADD CONSTRAINT `fk_bm_role` FOREIGN KEY (`role`) REFERENCES `band_role`(`role`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `band_member` ADD CONSTRAINT `fk_bm_user_id` FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `setlist` ADD CONSTRAINT `fk_setlist_band_id` FOREIGN KEY (`band_id`) REFERENCES `band`(`band_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `setlist` ADD CONSTRAINT `fk_setlist_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `setlist_song` ADD CONSTRAINT `fk_setlist_song_setlist_id` FOREIGN KEY (`setlist_id`) REFERENCES `setlist`(`setlist_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `setlist_song` ADD CONSTRAINT `fk_setlist_song_song_id` FOREIGN KEY (`song_id`) REFERENCES `song`(`song_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song` ADD CONSTRAINT `fk_song_band_id` FOREIGN KEY (`band_id`) REFERENCES `band`(`band_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `song` ADD CONSTRAINT `fk_song_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `fk_user_privilege` FOREIGN KEY (`privilege`) REFERENCES `user_privilege`(`privilege`) ON DELETE RESTRICT ON UPDATE CASCADE;

