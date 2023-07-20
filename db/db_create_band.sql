-- Users create and join bands in various roles
CREATE TABLE `band` (
  `band_id` int(11) NOT NULL AUTO_INCREMENT,
  `creator_id` varchar(255) NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`band_id`),
  KEY `creator_id_idx` (`creator_id`),
  CONSTRAINT `fk_band_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE

);

CREATE TABLE `user_band_role` (
  `band_id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` int(11) NULL, 
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`band_id`,`user_id`),
  KEY `role_idx` (`role`),
  CONSTRAINT `fk_ubr_role` FOREIGN KEY (`role`) REFERENCES `band_role` (`role`) ON DELETE SET NULL ON UPDATE CASCADE,
  KEY `band_id_idx` (`band_id`),
  CONSTRAINT `fk_ubr_band_id` FOREIGN KEY (`band_id`) REFERENCES `band` (`band_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_ubruser_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `band_role` (
    `role` int(11) NOT NULL,
    'desc' varchar(255) NOT NULL,
    PRIMARY KEY (`role`)
);

insert into band_role (role, desc) 
values (1, 'owner - can add/update/delete user roles and songs/sets'), (2, 'full member - can add/update/delete songs/sets'), (3, 'readonly member - can only view songs/sets');