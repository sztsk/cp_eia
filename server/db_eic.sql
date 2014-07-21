-- phpMyAdmin SQL Dump
-- version 3.5.1
-- http://www.phpmyadmin.net
--
-- 主机: localhost
-- 生成日期: 2014 年 07 月 20 日 13:43
-- 服务器版本: 5.5.24-log
-- PHP 版本: 5.4.3

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- 数据库: `db_eic`
--

-- --------------------------------------------------------

--
-- 表的结构 `tb_product`
--

DROP TABLE IF EXISTS `tb_product`;
CREATE TABLE IF NOT EXISTS `tb_product` (
  `pro_id` int(11) NOT NULL AUTO_INCREMENT,
  `pro_name` varchar(255) NOT NULL COMMENT '产品名称',
  `pro_name_en` varchar(255) DEFAULT NULL COMMENT '产品英文名',
  `pro_vars` text COMMENT '产品参数',
  `pro_imgs` text COMMENT '产品图片列表',
  `pro_jd` varchar(255) DEFAULT NULL COMMENT '产品京东链接',
  `pro_tb` varchar(255) DEFAULT NULL COMMENT '产品淘宝链接',
  `pro_info` text COMMENT '产品信息',
  `pro_status` int(11) DEFAULT '1' COMMENT '产品状态，1是正常，0是删除',
  `pro_time` datetime NOT NULL COMMENT '产品添加时间',
  `pro_user` varchar(200) DEFAULT NULL COMMENT '上传者',
  `pro_attr` text COMMENT '产品属性列表',
  `pro_cate` int(11) DEFAULT NULL COMMENT '产品分类',
  PRIMARY KEY (`pro_id`),
  UNIQUE KEY `pro_id` (`pro_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='产品表' AUTO_INCREMENT=10 ;

--
-- 转存表中的数据 `tb_product`
--

INSERT INTO `tb_product` (`pro_id`, `pro_name`, `pro_name_en`, `pro_vars`, `pro_imgs`, `pro_jd`, `pro_tb`, `pro_info`, `pro_status`, `pro_time`, `pro_user`, `pro_attr`, `pro_cate`) VALUES
(1, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '1.jpg,2.jpg,3.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(2, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '2.jpg,3.jpg,4.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(3, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '3.jpg,4.jpg,5.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(4, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '4.jpg,5.jpg,6.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(5, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '5.jpg,6.jpg,7.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(6, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '6.jpg,7.jpg,8.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(7, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '7.jpg,8.jpg,9.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(8, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '8.jpg,9.jpg,1.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1),
(9, '玉米餐具', 'Meal Plate with Lid', 'Size : 245*175*40\r\nCapacity : -\r\nQuantity : in 8pcs / ct 32pcs\r\nInbox : 430*280*200 / 4kg\r\nC/T box : 580*450*420 / 17kg\r\nMeasurement : 0.10962CBM', '9.jpg,1.jpg,2.jpg', 'http://www.jd.com/', 'http://www.taobao.com/', '不含环境荷尔蒙（BPA）\r\n不含重金属等有害物质\r\n坚固，耐用的设计\r\n生产过程中二氧化碳排放量降至最小\r\n生物降解', 1, '2014-07-20 00:00:00', NULL, '32\r\n12\r\n32\r\n32', 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
