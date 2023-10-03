DROP TABLE IF EXISTS `user_privilege`;

CREATE TABLE `user_privilege` (
    `privilege` varchar(10) NOT NULL,
    PRIMARY KEY (`privilege`)
);

insert into user_privilege (privilege) 
values ('User'), ('Admin');


DROP TABLE IF EXISTS `user`;

-- user_id is the auth token's sub property
CREATE TABLE `user` (
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `username` varchar(45) DEFAULT NULL UNIQUE,
  `privilege` varchar(10) NULL DEFAULT 'User',
  PRIMARY KEY (`user_id`) ,
  KEY `privilege_idx` (`privilege`),
  CONSTRAINT `fk_user_privilege` FOREIGN KEY (`privilege`) REFERENCES `user_privilege` (`privilege`) ON DELETE RESTRICT ON UPDATE CASCADE
);



