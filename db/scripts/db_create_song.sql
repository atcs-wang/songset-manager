-- For now, keys are just text. 
-- Possibly add fixecd set of keys with options

-- CREATE TABLE `key` (
--   `key` varchar(15) NOT NULL,
--   PRIMARY KEY (`key`)
-- );

-- insert into `key` (key) 
-- values ("C major"), ("Db major"), ("D major"), ("Eb major"), ("E major"), ("F major"), ("F# major"), ("G major"), ("Ab major"), ("A major"), ("Bb major"), ("B major"),
-- ("C minor"), ("C# minor"), ("D minor"), ("D# minor"), ("E minor"), ("F minor"), ("F# minor"), ("G minor"), ("G# minor"), ("A minor"), ("Bb minor"), ("B major");

DROP TABLE IF EXISTS `song`;

CREATE TABLE `song` (
  `song_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `artist` varchar(100) DEFAULT NULL,
  `key` varchar(30)  DEFAULT NULL,
  `tempo` varchar(15)  DEFAULT NULL,
  `tags` varchar(100) DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator_id` varchar(255) NULL,
  `band_id` int NOT NULL,
  PRIMARY KEY (`song_id`),
  KEY `creator_id_idx` (`creator_id`),
  CONSTRAINT `fk_song_creator_id` FOREIGN KEY (`creator_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  -- KEY `key_idx` (`key`),
  -- CONSTRAINT `fk_song_key` FOREIGN KEY (`key`) REFERENCES `key` (`key`) ON DELETE SET NULL ON UPDATE CASCADE
  KEY `band_id_idx` (`band_id`),
  CONSTRAINT `fk_song_band_id` FOREIGN KEY (`band_id`) REFERENCES `band` (`band_id`) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Design decision -  Just keep tags as denormalized comma separated values in a single field under song, since tags are short.




