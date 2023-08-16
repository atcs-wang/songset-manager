CREATE TABLE `songsets`.`setlist` (
  `setlist_id` INT NOT NULL AUTO_INCREMENT,
  `setname` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `creator_id` VARCHAR(255) NULL,
  `band_id` INT NOT NULL, 
  `archived` TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (`setlist_id`),
  INDEX `creator_id_idx` (`creator_id`),
  CONSTRAINT `fk_setlist_creator_id`
    FOREIGN KEY (`creator_id`)
    REFERENCES `songsets`.`user` (`user_id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  INDEX `band_id_idx` (`band_id`) ,
  CONSTRAINT `fk_setlist_band_id`
    FOREIGN KEY (`band_id`)
    REFERENCES `songsets`.`band` (`band_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

