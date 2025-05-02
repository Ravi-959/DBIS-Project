-- Drop tables in reverse order of dependency
DROP TABLE IF EXISTS Listing_Attributes CASCADE;
DROP TABLE IF EXISTS listing_images CASCADE;
DROP TABLE IF EXISTS Messages CASCADE;
DROP TABLE IF EXISTS Conversations CASCADE;
DROP TABLE IF EXISTS Listings CASCADE;
DROP TABLE IF EXISTS Category_Attributes CASCADE;
DROP TABLE IF EXISTS Attribute_Options CASCADE;
DROP TABLE IF EXISTS Attributes CASCADE;
DROP TABLE IF EXISTS Subcategories CASCADE;
DROP TABLE IF EXISTS Categories CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone_number VARCHAR(15)
);

CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Subcategories (
    subcategory_id SERIAL PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE
);

CREATE TABLE Listings (
    listing_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    subcategory_id INT NOT NULL,
    user_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES Subcategories(subcategory_id) ON DELETE CASCADE
);


-- only keep attributes for number and enum and add location

-- Table for defining filterable attributes
CREATE TABLE Attributes (
    attribute_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('number', 'enum'))
);

-- Table for predefined options (for enum type attributes)
CREATE TABLE Attribute_Options (
    option_id SERIAL PRIMARY KEY,
    attribute_id INT NOT NULL,
    value VARCHAR(100) NOT NULL,
    FOREIGN KEY (attribute_id) REFERENCES Attributes(attribute_id) ON DELETE CASCADE,
    UNIQUE (attribute_id, value)
);

-- Table linking categories to attributes
CREATE TABLE Category_Attributes (
    category_attribute_id SERIAL PRIMARY KEY,
    category_id INT,
    subcategory_id INT,
    attribute_id INT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES Subcategories(subcategory_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES Attributes(attribute_id) ON DELETE CASCADE,
    CHECK (category_id IS NOT NULL OR subcategory_id IS NOT NULL)
);

-- Table storing the actual attribute values for listings
CREATE TABLE Listing_Attributes (
    listing_attribute_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL,
    attribute_id INT NOT NULL,
    number_value DECIMAL(20, 2),
    option_id INT,
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id) ON DELETE CASCADE,
    FOREIGN KEY (attribute_id) REFERENCES Attributes(attribute_id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES Attribute_Options(option_id) ON DELETE CASCADE,
    CHECK (
        (number_value is NULL) OR (option_id is NULL)
    )
);

-- Conversation table to track chat threads between users
CREATE TABLE Conversations (
    conversation_id SERIAL PRIMARY KEY,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    listing_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id) ON DELETE CASCADE,
    UNIQUE (buyer_id, seller_id, listing_id) -- prevent duplicate conversation for same listing
);


CREATE TABLE Messages (
    message_id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES Conversations(conversation_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE listing_images (
  image_id SERIAL PRIMARY KEY,
  listing_id INTEGER REFERENCES listings(listing_id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  FOREIGN KEY (listing_id) REFERENCES Listings(listing_id)
);