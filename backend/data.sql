INSERT INTO Categories (name) VALUES 
('Electronics'),
('Vehicles'),
('Furniture'),
('Real Estate'),
('Fashion'),
('Books & Sports');

-- Electronics (category_id = 1)
INSERT INTO Subcategories (category_id, name) VALUES
(1, 'Mobiles'),
(1, 'Laptops'),
(1, 'Tablets'),
(1, 'TVs'),
(1, 'Cameras');

-- Vehicles (category_id = 2)
INSERT INTO Subcategories (category_id, name) VALUES
(2, 'Cars'),
(2, 'MotorBikes'),
(2, 'Bicycle'),
(2, 'Trucks');

-- Furniture (category_id = 3)
INSERT INTO Subcategories (category_id, name) VALUES
(3, 'Sofas'),
(3, 'Beds'),
(3, 'Chairs'),
(3, 'Tables'),
(3, 'Cupboards');

-- Real Estate (category_id = 4)
INSERT INTO Subcategories (category_id, name) VALUES
(4, 'Apartments'),
(4, 'Houses'),
(4, 'Commercial'),
(4, 'Plots');

-- Fashion (category_id = 5)
INSERT INTO Subcategories (category_id, name) VALUES
(5, 'Men'),
(5, 'Women'),
(5, 'Kids');

-- Books & Music (category_id = 6)
INSERT INTO Subcategories (category_id, name) VALUES
(6, 'Books'),
(6, 'Musical Instruments'),
(6, 'Sports Equipment');

INSERT INTO users (user_id, username, email, password_hash, phone_number) VALUES
(1, 'TATA_MOTORS', 'tatamotors@gmail.com', '$2b$10$/im302pQA5.YCqbgEeLvnu7GFxByrBmcLWrsnSVxmZTk069e.wtvO', NULL),
(2, 'RK_BOOK_STORE', 'rkbook@gmail.com', '$2b$10$qqds/OjPaylQgYmjZScIxuMroQeEdVo7gwz0RC9GV91WYmgRs68YK', NULL),
(3, 'RK_SPORTS', 'rksports@gmail.com', '$2b$10$EMmDsX3NWpXr4s/MO2PaBOv65DnGc502VUhRl28r8r9YB003cQCUq', NULL),
(4, 'PAVAN_BIKES', 'pavanbikes@gmail.com', '$2b$10$cMyYpxd523QuqVyzvet14OJmVrM4INgtcnaZd0D44qz2RpQUtLYha', NULL),
(5, 'CHARAN_ELECTRONICS', 'charanelectronics@gmail.com', '$2b$10$3PgGTFYzMBar.dZldsLA2OoAAuMfbDPAD577ftfDigueTR0Cszz36', NULL),
(6, 'JOHN_FURNITURES', 'johnfurnitures@gmail.com', '$2b$10$kaQwCA04C3X3svcdhQDwbOic14u9vDC/HQX.tVOsKWq8kGePZ8Ka2', NULL);

INSERT INTO listings (listing_id, name, category_id, subcategory_id, user_id, price, description) VALUES 
(1, 'MARUTHI SUZUKI ALTO 700', 2, 6, 1, 300000.00, 'Distance - 20000km\nManufactured date - 24/05/2020\nColour - Grey'),
(2, 'MRF Champ Kashmir Willow Cricket Bat', 6, 24, 3, 1890.00, 'Size - 5\nColour - Multi colour\nMaterial - Willow-wood'),
(3, 'TATA NEXON', 2, 6, 1, 900000.00, 'Distance - 10000km\nManufactured date - 23/01/2022\nColour - White'),
(4, 'PERCY JACKSON AND THE LIGHTNING THIEF', 6, 22, 2, 200.00, 'Printed on - 22/07/2020\nCondition - Readable\nNo Scribles and No torn pages'),
(5, 'ASUS TUF GAMING LAPTOP F5061ACB', 1, 2, 5, 30000.00, 'Processor - Ryzen 7000\nCores - 8\nUsed for - 2yrs\nDisplay - OLED');

INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES
(1,'/images/alto1.jpg','t'),
(2,'/images/mrfbat1.jpg','t'),
(3,'/images/tatanexon1.jpg','t'),
(4,'/images/pjo1.jpg','t'),
(5,'/images/asusl1.jpg','t');
