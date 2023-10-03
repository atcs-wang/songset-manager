-- Users create and join bands in various roles

DROP TABLE IF EXISTS `band`;

CREATE TABLE `band` (
  `band_id` int NOT NULL AUTO_INCREMENT,
  `creator_id` varchar(255) NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`band_id`),
  KEY `creator_id_idx` (`creator_id`),
  CONSTRAINT `fk_band_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE

);


DROP TABLE IF EXISTS `band_role`;

CREATE TABLE `band_role` (
    `role` varchar(10) NOT NULL,
    `descr` varchar(100) NOT NULL,
    PRIMARY KEY (`role`)
);

insert into band_role (role, descr) 
values ('owner', 'can add/update/delete members and songs/sets'), ('core', 'can add/update/delete songs/sets'), ('readonly', 'can only view songs/sets');

DROP TABLE IF EXISTS `band_member`;

CREATE TABLE `band_member` (
  `band_id` int NOT NULL,
  `nickname` varchar(45) NOT NULL,
  `user_id` varchar(255) NULL, -- band members can but don't have to be associated with actual users
  `role` varchar(10) NULL, 
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`band_id`,`nickname`),
  UNIQUE KEY `uniq_band_user` (`band_id`,`user_id`),
  KEY `role_idx` (`role`),
  CONSTRAINT `fk_bm_role` FOREIGN KEY (`role`) REFERENCES `band_role` (`role`) ON DELETE SET NULL ON UPDATE CASCADE,
  KEY `band_id_idx` (`band_id`),
  CONSTRAINT `fk_bm_band_id` FOREIGN KEY (`band_id`) REFERENCES `band` (`band_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_bm_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
);

