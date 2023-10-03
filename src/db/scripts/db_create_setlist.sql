CREATE TABLE `setlist` (
  `setlist_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator_id` varchar(255) DEFAULT NULL,
  `band_id` int NOT NULL,
  `archived` tinyint NOT NULL DEFAULT '0',
  `date` date DEFAULT NULL,
  `descr` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`setlist_id`),
  KEY `creator_id_idx` (`creator_id`),
  KEY `band_id_idx` (`band_id`),
  KEY `date_idx` (`date`),
  CONSTRAINT `fk_setlist_band_id` FOREIGN KEY (`band_id`) REFERENCES `band` (`band_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_setlist_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE `setlist_song` (
  `setlist_id` int NOT NULL,
  `setlist_order` int NOT NULL,
  `song_id` int NOT NULL,
  `note` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`setlist_id`, `setlist_order`),
  KEY `song_id_idx` (`song_id`),
  KEY `setlist_id_idx` (`setlist_id`),
  CONSTRAINT `fk_setlist_song_song_id` FOREIGN KEY (`song_id`) REFERENCES `song` (`song_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_setlist_song_setlist_id` FOREIGN KEY (`setlist_id`) REFERENCES `setlist` (`setlist_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

