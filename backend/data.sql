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