CREATE TABLE `album` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `picasa_userId` varchar(100) NOT NULL,
  `picasa_albumId` varchar(100) NOT NULL,
  `picasa_authKey` varchar(50) DEFAULT NULL,
  `category` varchar(50) NOT NULL,
  `subcategory` varchar(50) NOT NULL,
  `authorname` varchar(100) NOT NULL,
  `authoruri` varchar(255) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `summary` text NOT NULL,
  `icon` varchar(1024) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UniqueAlbum` (`picasa_userId`,`picasa_albumId`),
  KEY `Category` (`category`),
  KEY `Subcategory` (`subcategory`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=latin1;
