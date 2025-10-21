DROP TABLE IF EXISTS Provider_Analytics;
DROP TABLE IF EXISTS Listing_Status;
DROP TABLE IF EXISTS Admin_Actions;
DROP TABLE IF EXISTS Bookmarks;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Listings;
DROP TABLE IF EXISTS Providers;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    phone TEXT,
    role TEXT CHECK(role IN ('customer', 'provider', 'admin')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Providers (
    provider_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    business_name TEXT,
    description TEXT,
    approved BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE Listings (
    listing_id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    category_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES Providers(provider_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

CREATE TABLE Bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    booking_date DATETIME NOT NULL,
    status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id)
);

CREATE TABLE Bookmarks (
    bookmark_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id),
    UNIQUE(user_id, listing_id)
);

CREATE TABLE Admin_Actions (
    action_id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    listing_id INTEGER,
    target_user_id INTEGER,
    action TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Users(user_id),
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id),
    FOREIGN KEY (target_user_id) REFERENCES Users(user_id)
);

CREATE TABLE Listing_Status (
    status_id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    changed_by INTEGER,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (listing_id) REFERENCES Listings(listing_id),
    FOREIGN KEY (changed_by) REFERENCES Users(user_id)
);

CREATE TABLE Provider_Analytics (
    analytics_id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    total_services INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES Providers(provider_id)
);
