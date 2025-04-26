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

-- First, insert all possible attributes with unique names
INSERT INTO Attributes (name, data_type) VALUES
-- Electronics attributes
('Brand', 'enum'),
('Model', 'text'),
('Electronics Condition', 'enum'),
('RAM', 'text'),
('Storage', 'text'),
('Screen Size', 'text'),

-- Vehicle attributes
('Make', 'enum'),
('Model Year', 'number'),
('KM Driven', 'number'),
('Fuel Type', 'enum'),
('Transmission', 'enum'),
('Vehicle Color', 'enum'),

-- Furniture attributes
('Material', 'enum'),
('Furniture Color', 'enum'),
('Furniture Condition', 'enum'),
('Age', 'number'),

-- Real Estate attributes
('BHK', 'enum'),
('Area (sqft)', 'number'),
('Furnishing', 'enum'),
('Floor', 'number'),
('Total Floors', 'number'),
('Facing', 'enum'),

-- Fashion attributes
('Size', 'enum'),
('Fashion Color', 'enum'),
('Fabric Material', 'enum'),
('Fashion Condition', 'enum'),

-- Books & Sports attributes
('Author/Brand', 'text'),
('Book Condition', 'enum'),
('Edition/Model', 'text');

-- Insert attribute options for enum types using the actual attribute IDs
-- Electronics options (attributes 1-6)
INSERT INTO Attribute_Options (attribute_id, value) VALUES
(1, 'Samsung'), (1, 'Apple'), (1, 'Xiaomi'), (1, 'OnePlus'), (1, 'Sony'),
(3, 'New'), (3, 'Like New'), (3, 'Good'), (3, 'Fair'), (3, 'Poor'),

-- Vehicle options (attributes 7-12)
(7, 'Maruti'), (7, 'Hyundai'), (7, 'Honda'), (7, 'Toyota'), (7, 'Tata'),
(10, 'Petrol'), (10, 'Diesel'), (10, 'Electric'), (10, 'CNG'), (10, 'Hybrid'),
(11, 'Manual'), (11, 'Automatic'),
(12, 'White'), (12, 'Black'), (12, 'Red'), (12, 'Blue'), (12, 'Silver'),

-- Furniture options (attributes 13-16)
(13, 'Wood'), (13, 'Metal'), (13, 'Plastic'), (13, 'Leather'), (13, 'Fabric'),
(14, 'Brown'), (14, 'Black'), (14, 'White'), (14, 'Grey'), (14, 'Beige'),
(15, 'New'), (15, 'Used - Like New'), (15, 'Used - Good'), (15, 'Used - Fair'),

-- Real Estate options (attributes 17-22)
(17, '1 BHK'), (17, '2 BHK'), (17, '3 BHK'), (17, '4 BHK'), (17, '4+ BHK'),
(19, 'Furnished'), (19, 'Semi-Furnished'), (19, 'Unfurnished'),
(22, 'North'), (22, 'South'), (22, 'East'), (22, 'West'), (22, 'North-East'), (22, 'North-West'),

-- Fashion options (attributes 23-26)
(23, 'S'), (23, 'M'), (23, 'L'), (23, 'XL'), (23, 'XXL'),
(24, 'Red'), (24, 'Blue'), (24, 'Black'), (24, 'White'), (24, 'Green'),
(25, 'Cotton'), (25, 'Silk'), (25, 'Wool'), (25, 'Polyester'), (25, 'Denim'),
(26, 'New'), (26, 'Used - Like New'), (26, 'Used - Good'),

-- Books & Sports options (attributes 27-29)
(28, 'New'), (28, 'Like New'), (28, 'Good'), (28, 'Fair'), (28, 'Poor');

-- Now assign attributes to categories and subcategories using the correct IDs
-- Electronics (category_id = 1)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(1, 1, true, 1),  -- Brand (required)
(1, 2, true, 2),  -- Model (required)
(1, 3, true, 3),  -- Electronics Condition (required)
(1, 4, false, 4), -- RAM
(1, 5, false, 5), -- Storage
(1, 6, false, 6); -- Screen Size

-- Mobiles (subcategory_id = 1)
INSERT INTO Category_Attributes (subcategory_id, attribute_id, is_required, display_order) VALUES
(1, 4, true, 1);  -- RAM (required for mobiles)

-- Vehicles (category_id = 2)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(2, 7, true, 1),   -- Make (required)
(2, 8, true, 2),   -- Model Year (required)
(2, 9, true, 3),   -- KM Driven (required)
(2, 10, true, 4),  -- Fuel Type (required)
(2, 11, false, 5), -- Transmission
(2, 12, false, 6); -- Vehicle Color

-- Cars (subcategory_id = 6)
INSERT INTO Category_Attributes (subcategory_id, attribute_id, is_required, display_order) VALUES
(6, 11, true, 1);  -- Transmission (required for cars)

-- Furniture (category_id = 3)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(3, 13, true, 1),  -- Material (required)
(3, 14, false, 2), -- Furniture Color
(3, 15, true, 3),  -- Furniture Condition (required)
(3, 16, false, 4); -- Age

-- Real Estate (category_id = 4)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(4, 17, true, 1),  -- BHK (required)
(4, 18, true, 2),  -- Area (required)
(4, 19, true, 3),  -- Furnishing (required)
(4, 20, false, 4), -- Floor
(4, 21, false, 5), -- Total Floors
(4, 22, false, 6); -- Facing

-- Apartments (subcategory_id = 16)
INSERT INTO Category_Attributes (subcategory_id, attribute_id, is_required, display_order) VALUES
(16, 20, true, 1), -- Floor (required for apartments)
(16, 21, true, 2); -- Total Floors (required for apartments)

-- Fashion (category_id = 5)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(5, 23, true, 1),  -- Size (required)
(5, 24, true, 2),  -- Fashion Color (required)
(5, 25, false, 3), -- Fabric Material
(5, 26, true, 4);  -- Fashion Condition (required)

-- Books & Sports (category_id = 6)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(6, 27, false, 1), -- Author/Brand
(6, 28, true, 2),  -- Book Condition (required)
(6, 29, false, 3); -- Edition/Model

-- Skip 'user_id' column to allow auto-increment
INSERT INTO users (username, email, password_hash, phone_number) VALUES
('TATA_MOTORS', 'tatamotors@gmail.com', '$2b$10$/im302pQA5.YCqbgEeLvnu7GFxByrBmcLWrsnSVxmZTk069e.wtvO', NULL),
('RK_BOOK_STORE', 'rkbook@gmail.com', '$2b$10$qqds/OjPaylQgYmjZScIxuMroQeEdVo7gwz0RC9GV91WYmgRs68YK', NULL),
('RK_SPORTS', 'rksports@gmail.com', '$2b$10$EMmDsX3NWpXr4s/MO2PaBOv65DnGc502VUhRl28r8r9YB003cQCUq', NULL),
('PAVAN_BIKES', 'pavanbikes@gmail.com', '$2b$10$cMyYpxd523QuqVyzvet14OJmVrM4INgtcnaZd0D44qz2RpQUtLYha', NULL),
('CHARAN_ELECTRONICS', 'charanelectronics@gmail.com', '$2b$10$3PgGTFYzMBar.dZldsLA2OoAAuMfbDPAD577ftfDigueTR0Cszz36', NULL),
('JOHN_FURNITURES', 'johnfurnitures@gmail.com', '$2b$10$kaQwCA04C3X3svcdhQDwbOic14u9vDC/HQX.tVOsKWq8kGePZ8Ka2', NULL);

INSERT INTO listings (name, category_id, subcategory_id, user_id, price, description) VALUES 
('MARUTHI SUZUKI ALTO 700', 2, 6, 1, 300000.00, 'Distance - 20000km\nManufactured date - 24/05/2020\nColour - Grey'),
('MRF Champ Kashmir Willow Cricket Bat', 6, 24, 3, 1890.00, 'Size - 5\nColour - Multi colour\nMaterial - Willow-wood'),
('TATA NEXON', 2, 6, 1, 900000.00, 'Distance - 10000km\nManufactured date - 23/01/2022\nColour - White'),
('PERCY JACKSON AND THE LIGHTNING THIEF', 6, 22, 2, 200.00, 'Printed on - 22/07/2020\nCondition - Readable\nNo Scribles and No torn pages'),
('ASUS TUF GAMING LAPTOP F5061ACB', 1, 2, 5, 30000.00, 'Processor - Ryzen 7000\nCores - 8\nUsed for - 2yrs\nDisplay - OLED'),
('2BHK FLAT with Sea View IN VIZAG', 4, 15, 6, 2500000.00,'Very good location, near to super market, hospital. Friendly neighbours and great sea view');

INSERT INTO listing_images (listing_id, image_url, is_primary) VALUES
(1,'/images/alto1.jpg','t'),
(2,'/images/mrfbat1.jpg','t'),
(3,'/images/tatanexon1.jpg','t'),
(4,'/images/pjo1.jpg','t'),
(5,'/images/asusl1.jpg','t'),
(6,'/images/flat1.jpg','t');

-- Insert all listing attributes in one batch
INSERT INTO Listing_Attributes 
(listing_id, attribute_id, text_value, number_value, boolean_value, option_id) VALUES
-- MARUTHI SUZUKI ALTO 700 (listing_id = 1)
(1, 7, NULL, NULL, NULL, 31),   -- Make: Maruti
(1, 8, NULL, 2020, NULL, NULL),  -- Model Year: 2020
(1, 9, NULL, 20000, NULL, NULL), -- KM Driven: 20000
(1, 10, NULL, NULL, NULL, 40),   -- Fuel Type: Petrol
(1, 11, NULL, NULL, NULL, 42),    -- Transmission: Manual
(1, 12, 'Grey', NULL, NULL, NULL),-- Color: Grey

-- MRF Champ Kashmir Willow Cricket Bat (listing_id = 2)
(2, 27, 'MRF', NULL, NULL, NULL), -- Brand: MRF
(2, 28, NULL, NULL, NULL, 78),    -- Condition: New
(2, 29, 'Champ Kashmir Willow', NULL, NULL, NULL), -- Model

-- TATA NEXON (listing_id = 3)
(3, 7, NULL, NULL, NULL, 35),     -- Make: Tata
(3, 8, NULL, 2022, NULL, NULL),   -- Model Year: 2022
(3, 9, NULL, 10000, NULL, NULL),  -- KM Driven: 10000
(3, 10, NULL, NULL, NULL, 41),    -- Fuel Type: Diesel
(3, 11, NULL, NULL, NULL, 43),    -- Transmission: Automatic
(3, 12, NULL, NULL, NULL, 47),    -- Color: White

-- PERCY JACKSON BOOK (listing_id = 4)
(4, 27, 'Rick Riordan', NULL, NULL, NULL), -- Author
(4, 28, 'Readable', NULL, NULL, NULL),     -- Condition
(4, 29, 'First', NULL, NULL, NULL),        -- Edition

-- ASUS LAPTOP (listing_id = 5)
(5, 1, NULL, NULL, NULL, 2),       -- Brand: ASUS
(5, 2, 'TUF GAMING F5061ACB', NULL, NULL, NULL), -- Model
(5, 3, NULL, NULL, NULL, 8),       -- Condition: Good
(5, 4, '16GB', NULL, NULL, NULL),  -- RAM
(5, 5, '512GB SSD', NULL, NULL, NULL), -- Storage
(5, 6, NULL, 15.6, NULL, NULL),    -- Screen Size

-- REAL ESTATE LISTING (listing_id = 6)
(6, 17, NULL, NULL, NULL, 43),     -- BHK: 1 BHK
(6, 18, NULL, 700.00, NULL, NULL), -- Area: 700 sqft
(6, 19, NULL, NULL, NULL, 47),     -- Furnishing: Semi-Furnished
(6, 20, NULL, 1.00, NULL, NULL),   -- Floor: 1
(6, 21, NULL, 2.00, NULL, NULL),   -- Total Floors: 2
(6, 22, NULL, NULL, NULL, 54);     -- Facing: North

-- Insert a conversation (RK_BOOK_STORE is the buyer, TATA_MOTORS is the seller)
INSERT INTO Conversations (buyer_id, seller_id, listing_id)
VALUES (2, 1, 1);

-- Insert messages in that conversation
-- Assume the inserted conversation_id is 1
INSERT INTO Messages (conversation_id, sender_id, receiver_id, message_text) VALUES
(1, 2, 1, 'Hi, is the Maruthi Suzuki Alto still available?'),
(1, 1, 2, 'Yes, it is still available.'),
(1, 2, 1, 'Great! Can I come for a test drive tomorrow?'),
(1, 1, 2, 'Sure, let me know what time works for you.');