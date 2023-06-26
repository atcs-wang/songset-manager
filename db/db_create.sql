CREATE TABLE `user` (
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `nickname` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`) 
);

CREATE TABLE `key` (
  `key` varchar(15) NOT NULL,
  PRIMARY KEY (`key`)
);

CREATE TABLE `category` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `song_count` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` varchar(255) NOT NULL ,
  PRIMARY KEY (`category_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_category_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `song` (
  `song_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `artist` varchar(45) DEFAULT NULL,
  `key` varchar(15)  DEFAULT NULL,
  `notes` varchar(256) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` varchar(255) NOT NULL,
  PRIMARY KEY (`song_id`),
  KEY `user_id_idx` (`user_id`),
  CONSTRAINT `fk_song_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `key_idx` (`key`),
  CONSTRAINT `fk_song_key` FOREIGN KEY (`key`) REFERENCES `key` (`key`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `song_category_xref` (
  `song_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`song_id`,`category_id`),
  KEY `category_id_idx` (`category_id`),
  CONSTRAINT `category_id` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  KEY `song_id_idx` (`song_id`),
  CONSTRAINT `song_id` FOREIGN KEY (`song_id`) REFERENCES `song` (`song_id`) ON DELETE CASCADE ON UPDATE CASCADE
);




