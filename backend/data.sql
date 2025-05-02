-- \i C:/Users/Ravi2005/Sem6/DBIS/Project/backend/data.sql

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
(1, 'TVs'),
(1, 'Cameras'); 

-- Vehicles (category_id = 2)
INSERT INTO Subcategories (category_id, name) VALUES
(2, 'Cars'), -- 5
(2, 'MotorBikes'),
(2, 'Bicycle');

-- Furniture (category_id = 3)
INSERT INTO Subcategories (category_id, name) VALUES
(3, 'Beds'), -- 8
(3, 'Chairs'),
(3, 'Cupboards');

-- Real Estate (category_id = 4)
INSERT INTO Subcategories (category_id, name) VALUES
(4, 'Apartments'),  -- 11
(4, 'Houses');

-- Fashion (category_id = 5)
INSERT INTO Subcategories (category_id, name) VALUES
(5, 'Men'),   --13
(5, 'Women'),
(5, 'Kids');

-- Books & Music (category_id = 6)
INSERT INTO Subcategories (category_id, name) VALUES
(6, 'Books'), --16
(6, 'Sports Equipment');

INSERT INTO Attributes (name, data_type) VALUES
-- Electronics attributes
('Electronics Brand', 'enum'),          -- 1
('RAM', 'enum'),                        -- 2
('Storage', 'enum'),                    -- 3
('Laptop Processor','enum'),            -- 4
('Lens Resolution', 'number'),          -- 5
('Camera Category','enum'),             -- 6
('TV Size','number'),                   -- 7
('TV display','enum'),                  -- 8

-- Vehicle attributes
('Vehicle Company', 'enum'),            -- 9
('Model Year', 'number'),               -- 10
('KM Driven', 'number'),                -- 11
('Fuel Type', 'enum'),                  -- 12
('Transmission', 'enum'),               -- 13
('Vehicle Color', 'enum'),              -- 14

-- Furniture attributes
('Furniture Brand', 'enum'),            -- 15
('Material', 'enum'),                   -- 16
('Furniture Color', 'enum'),            -- 17
('Furniture Condition', 'enum'),        -- 18

-- Real Estate attributes
('BHK', 'enum'),                        -- 19
('Area (sqft)', 'number'),              -- 20
('Floor', 'enum'),                      -- 21
('Facing', 'enum'),                     -- 22

-- Fashion attributes
('Fashion Brand','enum'),               -- 23
('Size', 'number'),                     -- 24
('Type', 'enum'),                       -- 25
('Fabric Material', 'enum'),            -- 26

-- Books & Sports attributes
('Author', 'enum'),                     -- 27
('Book Publisher', 'enum'),             -- 28
('Sports Name','enum'),                 -- 29
('Sports Equipment Brand','enum');      -- 30


INSERT INTO Attribute_Options (attribute_id, value) VALUES
-- Electronics attributes
(1, 'Samsung'), (1, 'Apple'), (1, 'Sony'), (1, 'Asus'), (1, 'OnePlus'), (1, 'Xiaomi'),
(2, '4GB'), (2, '6GB'), (2, '8GB'), (2, '12GB'), (2, '16GB'), (2, '32GB'),
(3, '64GB'), (3, '128GB'), (3, '256GB'), (3, '512GB'), (3, '1TB'), (3, '2TB'),
(4, 'i3'), (4, 'i5'), (4, 'i7'), (4, 'Ryzen 5'), (4, 'Ryzen 7'), (4, 'M1'),
(6, 'DSLR'), (6, 'Mirrorless'), (6, 'Point & Shoot'), (6, 'Instant'), (6, 'CCTV'), (6, 'Action Camera'),
(8, 'LED'), (8, 'OLED'), (8, 'QLED'), (8, 'LCD'), (8, 'Plasma'), (8, 'CRT'),                                    -- 36

-- Vehicle attributes
(9, 'Toyota'), (9, 'Honda'), (9, 'Ford'), (9, 'Tata'), (9, 'Hyundai'), (9, 'Maruthi'),
(12, 'Petrol'), (12, 'Diesel'), (12, 'CNG'), (12, 'Electric'), (12, 'Hybrid'), (12, 'Other'),
(13, 'Manual'), (13, 'Automatic'), (13, 'CVT'), (13, 'Tiptronic'), (13, 'Dual-Clutch'), (13, 'Semi-Auto'),
(14, 'Black'), (14, 'White'), (14, 'Red'), (14, 'Blue'), (14, 'Silver'), (14, 'Grey'),                          -- 60

-- Furniture attributes
(15, 'Ikea'), (15, 'Urban Ladder'), (15, 'Godrej'), (15, 'Home Centre'), (15, 'Nilkamal'), (15, 'Pepperfry'),
(16, 'Wood'), (16, 'Metal'), (16, 'Plastic'), (16, 'Glass'), (16, 'Leather'), (16, 'Fabric'),
(17, 'Brown'), (17, 'Black'), (17, 'Beige'), (17, 'White'), (17, 'Grey'), (17, 'Cream'),
(18, 'New'), (18, 'Like New'), (18, 'Used'), (18, 'Good'), (18, 'Fair'), (18, 'Old'),                           -- 84

-- Real Estate attributes
(19, '1 BHK'), (19, '2 BHK'), (19, '3 BHK'), (19, '4 BHK'), (19, 'Studio'), (19, 'Duplex'),
(21, 'Ground'), (21, '1st'), (21, '2nd'), (21, '3rd'), (21, 'Top'), (21, 'Basement'),
(22, 'East'), (22, 'West'), (22, 'North'), (22, 'South'), (22, 'North-East'), (22, 'South-West'),               -- 102

-- Fashion attributes
(23, 'Nike'), (23, 'Zara'), (23, 'Levis'), (23, 'H&M'), (23, 'Gucci'), (23, 'Adidas'),
(25, 'T-Shirt'), (25, 'Jeans'), (25, 'Jacket'), (25, 'Dress'), (25, 'Kurta'), (25, 'Shoes'),
(26, 'Cotton'), (26, 'Silk'), (26, 'Wool'), (26, 'Polyester'), (26, 'Linen'), (26, 'Rayon'),                    --120

-- Books & Sports attributes
(27, 'J.K. Rowling'), (27, 'Rick Riordan'), (27, 'Agatha Christie'), (27, 'Jane Austen'), (27, 'Mark Twain'), (27, 'Stephen King'),
(28, 'Hyperion'), (28, 'HarperCollins'), (28, 'Random House'), (28, 'Simon & Schuster'), (28, 'Bloomsbury'), (28, 'Scholastic'),
(29, 'Cricket'), (29, 'Football'), (29, 'Basketball'), (29, 'Tennis'), (29, 'Badminton'), (29, 'Hockey'),
(30, 'Nike'), (30, 'Adidas'), (30, 'Puma'), (30, 'Yonex'), (30, 'Nivia'), (30, 'MRF');                         -- 144


-- Electronics (category_id = 1)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(1, 1, true, 1);  -- Brand (required)

INSERT INTO Category_Attributes (subcategory_id, attribute_id, is_required, display_order) VALUES

-- Mobiles (subcategory_id = 1)
(1, 2, true, 1),  
(1, 3, true, 2),  
-- Laptops (subcategory_id = 2)
(2, 2, true, 1),  
(2, 3, true, 2),  
(2, 4, false, 3),  
-- TV (subcategory_id = 3)
(3, 7, true, 1),
(3, 8, true, 2),
-- Camera (subcategory_id = 4)
(4, 5, true, 1),
(4, 6, true, 2);

-- Vehicles (category_id = 2)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(2, 9, true, 1),   
(2, 10, true, 2),   
(2, 11, true, 3),   
(2, 14, false, 6); 

-- Cars (subcategory_id = 5)
INSERT INTO Category_Attributes (subcategory_id, attribute_id, is_required, display_order) VALUES
(5, 12, true, 4),  
(5, 13, false, 5);

-- Furniture (category_id = 3)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(3, 15, true, 1),  
(3, 16, true, 2), 
(3, 17, false, 3),  
(3, 18, false, 4);

-- Real Estate (category_id = 4)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(4, 19, true, 1),  
(4, 20, true, 2), 
(4, 21, false, 3), 
(4, 22, false, 4);

-- Fashion (category_id = 5)
INSERT INTO Category_Attributes (category_id, attribute_id, is_required, display_order) VALUES
(5, 23, true, 1), 
(5, 24, true, 2),  
(5, 25, true, 3), 
(5, 26, true, 4); 

-- Books & Sports (category_id = 6)
INSERT INTO Category_Attributes (subcategory_id, attribute_id, is_required, display_order) VALUES
(16, 27, true, 1), 
(16, 28, true, 1), 
(17, 29, true, 2), 
(17, 30, true, 2);

-- Skip 'user_id' column to allow auto-increment
INSERT INTO users (username, email, password_hash, phone_number) VALUES
('TATA_MOTORS', 'tatamotors@gmail.com', '$2b$10$/im302pQA5.YCqbgEeLvnu7GFxByrBmcLWrsnSVxmZTk069e.wtvO', NULL),
('RK_BOOK_STORE', 'rkbook@gmail.com', '$2b$10$qqds/OjPaylQgYmjZScIxuMroQeEdVo7gwz0RC9GV91WYmgRs68YK', NULL),
('RK_SPORTS', 'rksports@gmail.com', '$2b$10$EMmDsX3NWpXr4s/MO2PaBOv65DnGc502VUhRl28r8r9YB003cQCUq', NULL),
('PAVAN_BIKES', 'pavanbikes@gmail.com', '$2b$10$cMyYpxd523QuqVyzvet14OJmVrM4INgtcnaZd0D44qz2RpQUtLYha', NULL),
('CHARAN_ELECTRONICS', 'charanelectronics@gmail.com', '$2b$10$3PgGTFYzMBar.dZldsLA2OoAAuMfbDPAD577ftfDigueTR0Cszz36', NULL),
('JOHN_FURNITURES', 'johnfurnitures@gmail.com', '$2b$10$kaQwCA04C3X3svcdhQDwbOic14u9vDC/HQX.tVOsKWq8kGePZ8Ka2', NULL);

INSERT INTO listings (name, category_id, subcategory_id, user_id, price, description) VALUES 
('MARUTHI SUZUKI ALTO 700', 2, 5, 1, 300000.00, ' Good Condition, No accidents yet, Servicing done every 3 months'),
('MRF Champ Kashmir Willow Cricket Bat', 6, 17, 3, 1890.00, 'I am not playing cricket anymore, so I might as well give to someone'),
('TATA NEXON', 2, 5, 1, 900000.00, 'Leather seats, New tires and in good condition'),
('PERCY JACKSON AND THE LIGHTNING THIEF', 6, 16, 2, 200.00, 'I accidentally received 2 copies, so looking for someone to buy and enter a new Fantacy world'),
('ASUS TUF GAMING LAPTOP F5061ACB', 1, 2, 5, 30000.00, 'Using for 2 years, Only for coding, I got a new laptop'),
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
(listing_id, attribute_id, number_value, option_id) VALUES
-- MARUTHI SUZUKI ALTO 700 (listing_id = 1)
(1, 9, NULL, 42 ),
(1, 10, NULL, 43),   
(1, 11, 20000, NULL),   
(1, 12, NULL, 49),

-- MRF Champ Kashmir Willow Cricket Bat (listing_id = 2)
(2, 29, NULL,133),   
(2, 30, NULL,144 ), 

-- TATA NEXON (listing_id = 3)
(3, 9, NULL,40 ), 
(3, 10, NULL, 43),  
(3, 11, 20000, NULL),  
(3, 12, NULL, 49),
(3, 13, NULL, 56), 

-- PERCY JACKSON BOOK (listing_id = 4)
(4, 27,NULL, 122), 
(4, 28,NULL, 127 ),

-- ASUS LAPTOP (listing_id = 5)
(5, 1, NULL, 4),
(5, 2, NULL, 11),
(5, 3, NULL, 17),
(5, 4, NULL, 23),

-- REAL ESTATE LISTING (listing_id = 6)
(6, 19, NULL, 86),
(6, 20, 700 , NULL),
(6, 22, NULL, 99);


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