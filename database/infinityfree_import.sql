-- ========================================================
-- SCRIPT DE IMPORTACIÓN PARA INFINITYFREE / CPANEL
-- Proyecto: WAR OF BOSS
--
-- INSTRUCCIONES:
-- 1. En InfinityFree vPanel ve a 'MySQL Databases' y crea tu base de datos (ej. if0_xxxxxxxx_warofboss).
-- 2. Entra a phpMyAdmin desde el vPanel.
-- 3. Haz clic en el nombre de tu base de datos a la izquierda.
-- 4. Ve a la pestaña 'Importar' (Import) y selecciona este archivo.
-- ========================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Estructura de tabla para `admin_config`
--

DROP TABLE IF EXISTS `admin_config`;
CREATE TABLE `admin_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Datos iniciales para `admin_config`
--

INSERT INTO `admin_config` (`id`, `clave`, `valor`) VALUES
(1, 'admin_token', '1beee0952aec0ce98e040f1f1a5433c637cd9aa1d182d4a2ddb1d4e669cd1b94'),
(3, 'admin_password_hash', '$2y$12$.TXfJLSia3npv3j5Q0c1QuSWUkjIEnpFib4NPD/pCngSC/sgY03oK');

--
-- Estructura de tabla para `admin_login_attempts`
--

DROP TABLE IF EXISTS `admin_login_attempts`;
CREATE TABLE `admin_login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `direccion_ip` varchar(45) NOT NULL,
  `fecha_intento` datetime NOT NULL DEFAULT current_timestamp(),
  `exitoso` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_ip_fecha` (`direccion_ip`,`fecha_intento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para `registros_metricas`
--

DROP TABLE IF EXISTS `registros_metricas`;
CREATE TABLE `registros_metricas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tipo` enum('visita','descarga') NOT NULL,
  `direccion_ip` varchar(45) NOT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tipo_fecha` (`tipo`,`fecha_registro`),
  KEY `idx_fecha_registro` (`fecha_registro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
