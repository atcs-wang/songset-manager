-- user_id is the auth token's sub property
CREATE TABLE `user` (
  `user_id` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `nickname` varchar(45) DEFAULT NULL UNIQUE,
  `privilege` int(11) NULL,
  PRIMARY KEY (`user_id`) ,
  KEY `privilege_idx` (`privilege`),
  CONSTRAINT `privilege` FOREIGN KEY (`privilege`) REFERENCES `user_privilege` (`privilege`) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE `user_privilege` (
    `privilege` int(11) NOT NULL,
    'desc' varchar(255) NOT NULL,
    PRIMARY KEY (`privilege`)
);

insert into user_privilege (privilege, desc) 
values (1, 'superadmin');


