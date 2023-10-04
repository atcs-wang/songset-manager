/*
  Warnings:

  - The primary key for the `band_role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `role` on the `band_role` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Enum(EnumId(1))`.
  - The primary key for the `user_privilege` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `privilege` on the `user_privilege` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Enum(EnumId(3))`.
  - Made the column `role` on table `band_member` required. This step will fail if there are existing NULL values in that column.
  - Made the column `privilege` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `band_member` DROP FOREIGN KEY `fk_bm_role`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `fk_user_privilege`;

-- AlterTable
ALTER TABLE `band_member` MODIFY `role` ENUM('core', 'owner', 'readonly') NOT NULL DEFAULT 'readonly';

-- AlterTable
ALTER TABLE `band_role` DROP PRIMARY KEY,
    MODIFY `role` ENUM('core', 'owner', 'readonly') NOT NULL,
    ADD PRIMARY KEY (`role`);

-- AlterTable
ALTER TABLE `user` MODIFY `privilege` ENUM('Admin', 'User') NOT NULL DEFAULT 'User';

-- AlterTable
ALTER TABLE `user_privilege` DROP PRIMARY KEY,
    MODIFY `privilege` ENUM('Admin', 'User') NOT NULL,
    ADD PRIMARY KEY (`privilege`);

-- AddForeignKey
ALTER TABLE `band_member` ADD CONSTRAINT `fk_bm_role` FOREIGN KEY (`role`) REFERENCES `band_role`(`role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `fk_user_privilege` FOREIGN KEY (`privilege`) REFERENCES `user_privilege`(`privilege`) ON DELETE RESTRICT ON UPDATE CASCADE;
