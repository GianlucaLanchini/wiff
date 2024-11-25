CREATE DATABASE  IF NOT EXISTS `fame_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `fame_db`;
-- MySQL dump 10.13  Distrib 8.0.29, for Linux (x86_64)
--
-- Host: localhost    Database: fame_db
-- ------------------------------------------------------
-- Server version	8.0.32-0ubuntu0.22.04.2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `diagrams`
--

DROP TABLE IF EXISTS `diagrams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagrams` (
  `id_diagram` int NOT NULL AUTO_INCREMENT,
  `name_diagram` varchar(45) NOT NULL,
  `content_diagram` longtext NOT NULL,
  `is_call_activity` tinyint NOT NULL,
  PRIMARY KEY (`id_diagram`),
  UNIQUE KEY `id_diagram_UNIQUE` (`id_diagram`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagrams`
--

LOCK TABLES `diagrams` WRITE;
/*!40000 ALTER TABLE `diagrams` DISABLE KEYS */;
/*!40000 ALTER TABLE `diagrams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instances`
--

DROP TABLE IF EXISTS `instances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instances` (
  `id_instance` int NOT NULL AUTO_INCREMENT,
  `name_instance` varchar(45) NOT NULL,
  `address_instance` varchar(45) NOT NULL,
  `diagram_instance` int NOT NULL,
  PRIMARY KEY (`id_instance`),
  UNIQUE KEY `id_instance_UNIQUE` (`id_instance`),
  KEY `diagram_instance_idx` (`diagram_instance`),
  CONSTRAINT `diagram_instance` FOREIGN KEY (`diagram_instance`) REFERENCES `diagrams` (`id_diagram`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instances`
--

LOCK TABLES `instances` WRITE;
/*!40000 ALTER TABLE `instances` DISABLE KEYS */;
/*!40000 ALTER TABLE `instances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `msgs`
--

DROP TABLE IF EXISTS `msgs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `msgs` (
  `id_msgs` int NOT NULL AUTO_INCREMENT,
  `name_msgs` varchar(45) NOT NULL,
  `cat_msgs` varchar(45) NOT NULL,
  `payload_msgs` longtext NOT NULL,
  PRIMARY KEY (`id_msgs`),
  UNIQUE KEY `id_msgs_UNIQUE` (`id_msgs`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `msgs`
--

LOCK TABLES `msgs` WRITE;
/*!40000 ALTER TABLE `msgs` DISABLE KEYS */;
INSERT INTO `msgs` VALUES (1,'Float64','std_msgs','{\"data\":\"float64\"}'),(2,'Float32','std_msgs','{\"data\":\"float32\"}'),(3,'Int16','std_msgs','{\"data\":\"int16\"}'),(4,'String','std_msgs','{\"data\":\"string\"}'),(5,'Bool','std_msgs','{\"data\":\"bool\"}'),(6,'ColorRGBA','std_msgs','{\"r\":\"id_msgs:2\",\"g\":\"id_msgs:2\",\"b\":\"id_msgs:2\",\"a\":\"id_msgs:2\"}'),(7,'UInt32','std_msgs','{\"data\":\"uint32\"}'),(8,'Time','std_msgs','{\"data\":\"time\"}'),(9,'Header','std_msgs','{\"seq\":\"id_msgs:7\",\"stamp\":\"id_msgs:8\",\"frame_id\":\"id_msgs:4\"}'),(10,'Vector3','geometry_msgs','{\"x\":\"id_msgs:1\",\"y\":\"id_msgs:1\",\"z\":\"id_msgs:1\"}'),(11,'Vector3Stamped','geometry_msgs','{\"header\":\"id_msgs:9\",\"vector\":\"id_msgs:10\"}'),(12,'Point','geometry_msgs','{\"x\":\"id_msgs:1\",\"y\":\"id_msgs:1\",\"z\":\"id_msgs:1\"}'),(13,'Quaternion','geometry_msgs','{\"x\":\"id_msgs:1\",\"y\":\"id_msgs:1\",\"z\":\"id_msgs:1\",\"w\":\"id_msgs:1\"}'),(14,'Pose','geometry_msgs','{\"position\":\"id_msgs:12\",\"orientation\":\"id_msgs:13\"}'),(15,'Twist','geometry_msgs','{\"linear\":\"id_msgs:10\",\"angular\":\"id_msgs:10\"}'),(16,'Wrench','geometry_msgs','{\"force\":\"id_msgs:10\",\"torque\":\"id_msgs:10\"}');
/*!40000 ALTER TABLE `msgs` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-15 23:59:24
