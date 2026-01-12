-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: elitehome
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `elitehome`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `elitehome` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `elitehome`;

--
-- Table structure for table `apartments`
--

DROP TABLE IF EXISTS `apartments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apartments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('rent','sale') DEFAULT 'rent',
  `employee` varchar(255) DEFAULT NULL,
  `owner_name` varchar(100) DEFAULT NULL,
  `number` varchar(50) DEFAULT NULL,
  `description` text,
  `status` enum('rented','empty') DEFAULT 'empty',
  `household` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `owner_id` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `apartments_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apartments`
--

LOCK TABLES `apartments` WRITE;
/*!40000 ALTER TABLE `apartments` DISABLE KEYS */;
INSERT INTO `apartments` VALUES (12,'rent','waleed','malek','2005','ljls jnckj jcljs jncjl','rented','','2025-10-21 12:11:07',NULL,1200.00),(13,'sale','mohamad','malek','600','acuhku skjhcb jahdck ajcnk','rented','airco','2025-10-21 14:37:39',NULL,1500.00),(14,'rent','hadi','malek','400','gjhgv jhgjhv hgjhv','empty','wc','2025-10-21 16:02:32',NULL,1000.00),(15,'rent','saly','malek','654','fcfhc gvjg jfj ft yugyf ygy','rented','wifi','2025-10-21 16:07:22',NULL,1800.00),(16,'sale','khaled','basem','G174','ncj jncsjd cnjsdnb dvhldvn ijvils','empty','X','2025-10-22 16:19:33',NULL,0.00);
/*!40000 ALTER TABLE `apartments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `apartments_backup`
--

DROP TABLE IF EXISTS `apartments_backup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `apartments_backup` (
  `id` int NOT NULL DEFAULT '0',
  `type` enum('huur','verkoop') NOT NULL,
  `medewerker` varchar(100) NOT NULL,
  `nummer` varchar(50) NOT NULL,
  `beschrijving` text,
  `status` enum('leeg','verhuurd') DEFAULT 'leeg',
  `huishouden` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `apartments_backup`
--

LOCK TABLES `apartments_backup` WRITE;
/*!40000 ALTER TABLE `apartments_backup` DISABLE KEYS */;
INSERT INTO `apartments_backup` VALUES (3,'verkoop','saly','220','tfcfgdxdfx','leeg','cfch','2025-09-18 16:45:41'),(5,'verkoop','saly','230','rent apartment','verhuurd','✅ airco\nwc','2025-09-22 07:41:00'),(6,'verkoop','saly','55','dsc','leeg','✅ wc','2025-09-22 08:01:10'),(9,'verkoop','doaa','100','not used','verhuurd','✅ airco','2025-09-24 09:52:22');
/*!40000 ALTER TABLE `apartments_backup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `finances`
--

DROP TABLE IF EXISTS `finances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `finances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apartment_id` int NOT NULL,
  `owner_name` varchar(100) NOT NULL,
  `tenant_name` varchar(100) NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL,
  `paid_amount` decimal(10,2) NOT NULL,
  `expenses` decimal(10,2) DEFAULT '0.00',
  `expense_description` text,
  `proof` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `currency` varchar(3) DEFAULT '₺',
  PRIMARY KEY (`id`),
  KEY `fk_finances_apartment` (`apartment_id`),
  CONSTRAINT `fk_finances_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `finances`
--

LOCK TABLES `finances` WRITE;
/*!40000 ALTER TABLE `finances` DISABLE KEYS */;
INSERT INTO `finances` VALUES (4,13,'hadi','ahmad','2022-07-26','2027-07-26',700000.00,5999.00,'jchkhc  ukheukhcu ukhkc',NULL,'2025-10-21 14:39:45','₺'),(5,14,'malek','huda','2023-11-25','2024-11-05',60000.00,4000.00,'ghghg hjjg gvgh gg hgj ','1761062745456-Fistiko_(4).png','2025-10-21 16:05:45','₺'),(6,15,'malek','kamel','2024-07-14','2024-08-14',50000.00,0.00,'x',NULL,'2025-10-21 16:09:16','₺'),(28,16,'basem','gamil','2024-12-12','2025-05-15',500000.00,3999.00,'kbkjc vnkj jhnckjdc jkcn,',NULL,'2025-10-22 16:36:34','₺'),(29,15,'malek','samer','2024-07-15','2024-08-15',500.00,19.00,'hxbhb bxhkabx xbhkb',NULL,'2025-10-22 16:45:45','₺'),(30,16,'basem','xander','2023-05-12','2023-07-03',500.00,7.00,'kwdkb ekuhck wehn kjefhk',NULL,'2025-10-22 16:49:45','₺');
/*!40000 ALTER TABLE `finances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `apartment_id` int NOT NULL,
  `employee_name` varchar(255) NOT NULL,
  `item` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `proof` varchar(255) DEFAULT NULL,
  `currency` varchar(3) DEFAULT '₺',
  PRIMARY KEY (`id`),
  KEY `apartment_id` (`apartment_id`),
  CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` VALUES (12,12,'mohamad','food',2000.00,'hdkuwe uhdke uhdku jhedkj','2025-10-21 14:42:46',NULL,'₺'),(13,14,'hadi','Purchased',4400.00,'jggj hgvgv hgjgv','2025-10-21 16:03:12','1761062592323.png','₺'),(14,12,'kerem','iron',6593.00,'bhhb hjbvjvvvvvhjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj','2025-10-21 16:17:48',NULL,'₺'),(15,16,'kerem','Purchased',20.00,'dh dd dh dgdfgsrgs gaqegq2','2025-10-22 16:37:59',NULL,'₺'),(16,16,'kerem','iron',10.00,'dcj knxjb sxnkja','2025-10-22 16:44:12',NULL,'₺');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `apartment_tag` varchar(255) DEFAULT NULL,
  `apartment_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,'apartment nummer 55','sdcsvsv svsc ecsdvc wdecvw ewfw wefw','55',NULL,'2025-10-21 08:47:03');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','owner','tenant','staff') DEFAULT 'staff',
  `is_blocked` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'test','$2b$10$nzAF1b2wSATOl50EjADScuL9JNTDpLwMypw63MKu6rV1aH5SlaNWe','staff',0,'2025-09-15 11:15:44'),(2,'Doaa','$2b$10$yifIh/81WtCVVRjwcDNfiOyDSpz1ky6zhS7xraB4U4LcJ05Q0bfPC','staff',1,'2025-09-15 14:06:08'),(3,'Kerem','$2b$10$UWx.rAWnQZUgwCyf67s2o.h162YwHqjQ/rK4wca.DgcN6fLEovUea','admin',0,'2025-10-20 09:31:42'),(4,'malek','$2b$10$/Qai9UYwBVUInevHZ0AQLuYtNwXwx8Osg0pn.CnYBad7/gXdy/B2u','owner',0,'2025-10-21 16:31:34'),(5,'owner','$2b$10$lKU/fs2hYa7DJ4IygG5nZORQ0NjKUJ4WQxmklxt2Y9QosEwck82.S','owner',0,'2025-10-22 10:47:17');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'elitehome'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-07 10:03:30
