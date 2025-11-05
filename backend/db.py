import sqlite3
from datetime import datetime
import click
from flask import current_app, g


def get_db():
    if 'db' not in g:
        print("Connecting to database:", current_app.config['DATABASE'])  
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))


@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()
    click.echo('Initialized the database.')


# Register a converter so SQLite timestamps convert to datetime objects automatically
sqlite3.register_converter(
    "timestamp", lambda v: datetime.fromisoformat(v.decode())
) 
@click.command('seed-db')
def seed_db_command():
    db = get_db()

    # Clear all tables first
    db.executescript("""
    DELETE FROM Provider_Analytics;
    DELETE FROM Listing_Status;
    DELETE FROM Admin_Actions;
    DELETE FROM Bookmarks;
    DELETE FROM Reviews;
    DELETE FROM Bookings;
    DELETE FROM Listings;
    DELETE FROM Providers;
    DELETE FROM Categories;
    DELETE FROM Users;
    """)
    
    # Seed Users
    db.executescript("""
    INSERT INTO Users (user_id, email, display_name, phone, role) VALUES
    ('uid2', 'ben@example.com', 'Ben Lim', '92345678', 'customer'),
    ('uid3', 'chefjason@example.com', 'Chef Jason', '93456789', 'provider'),
    ('uid4', 'movermax@example.com', 'Mover Max', '94567890', 'provider'),
    ('uid5', 'sparkz@example.com', 'Sparkz Electrical', '95678901', 'provider'),
    ('uid6', 'cleanqueen@example.com', 'Clean Queen', '96789012', 'provider'),
    ('uid7', 'autopro@example.com', 'AutoPro SG', '97890123', 'provider'),
    ('uid8', 'fixitbob@example.com', 'Fix-It Bob', '98901234', 'provider'),
    ('uid9', 'glamsalon@example.com', 'Glam Salon', '99012345', 'provider'),
    ('uid10', 'techgenius@example.com', 'Tech Genius', '90123456', 'provider'),
    ('uid11', 'tutoramy@example.com', 'Tutor Amy', '91122334', 'provider'),
    ('uid12', 'pipeworks@example.com', 'PipeWorks Plumbing', '92233445', 'provider'),
    ('adminuid', 'admin@example.com', 'Admin User', '90001111', 'admin');
    """)

    # Seed Providers (user_id references Users)
    db.executescript("""
    INSERT INTO Providers (user_id, business_name, description, approved) VALUES
    (3, 'Jason’s Gourmet Kitchen', 'Private chef offering customized meals.', 1),
    (4, 'MoverMax Logistics', 'Affordable package delivery.', 1),
    (5, 'Sparkz Electrical', 'Licensed electricians.', 1),
    (6, 'Clean Queen Services', 'Professional home cleaning.', 1),
    (7, 'AutoPro SG', 'Full-service auto mechanic workshop.', 1),
    (8, 'Fix-It Bob', 'Handyman services.', 1),
    (9, 'Glam Salon', 'Haircuts and styling.', 1),
    (10, 'Tech Genius', 'Tech support and troubleshooting.', 1),
    (11, 'Tutor Amy', 'Private tutoring.', 1),
    (12, 'PipeWorks Plumbing', '24/7 plumbing repairs.', 1);
    """)

    # Seed Categories
    db.executescript("""
    INSERT INTO Categories (name) VALUES
    ('Personal Chef'),
    ('Package Delivery'),
    ('Electrician Services'),
    ('Home Cleaning'),
    ('Auto Mechanic'),
    ('Handyman Repairs'),
    ('Beauty Salon'),
    ('Tech Support'),
    ('Private Tutoring'),
    ('Plumbing Services');
    """)

    # Seed Listings
    db.executescript("""
    INSERT INTO Listings (provider_id, category_id, title, description, price, status, image_url, location, latitude, longitude) VALUES
    (1, 1, 'Private Chef Experience', 'Enjoy premium dining at home.', 120.00, 'approved', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80', 'Orchard Road', 1.3048, 103.8318),
    (2, 2, 'Parcel Delivery', 'Quick parcel deliveries anywhere in the city.', 20.00, 'approved', 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80', 'Jurong East', 1.3331, 103.7436),
    (3, 3, 'Expert Plumbing', 'Pipeline and drain fixes.', 60.00, 'approved', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', 'Clementi', 1.3151, 103.7640),
    (4, 4, 'Home Cleaning', 'Detailed cleaning for all rooms.', 110.00, 'approved', 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (5, 5, 'General Auto Repair', 'Vehicle engine and diagnostics.', 180.00, 'approved', 'https://images.unsplash.com/photo-1645445522156-9ac06bc7a767?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', 'Woodlands', 1.4360, 103.7865),
    (6, 6, 'Handyman Service', 'Furniture assembly and minor repairs.', 70.00, 'approved', 'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (7, 7, 'Salon at Home', 'Professional hair styling and treatment.', 85.00, 'approved', 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80', 'Hougang', 1.3721, 103.8922),
    (8, 8, 'Computer Repair', 'Device and software troubleshooting.', 80.00, 'approved', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (9, 9, 'Math Tutoring', 'Private home tutoring.', 50.00, 'approved', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (10, 10, '24-hr Plumbing', 'Emergency fix for leaks and clogs.', 100.00, 'approved', 'https://images.unsplash.com/photo-1482062364825-616fd23b8fc1?auto=format&fit=crop&w=400&q=80', 'Marina Bay Sands', 1.2834, 103.8607),
    (11, 1, 'Private Dinner for Four', 'Gourmet meal prepared at your request.', 200.00, 'approved', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=400&q=80', 'Tampines', 1.3544, 103.9303),
    (12, 2, 'Same-Day Delivery', 'Fast and efficient parcel delivery.', 30.00, 'approved', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80', 'Bukit Timah', 1.3327, 103.7811),
    (13, 3, 'Drain Cleaning', 'Clearing blocked drains professionally.', 80.00, 'approved', 'https://images.unsplash.com/photo-1505695715220-3a366d958259?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170', 'Woodlands', 1.4364, 103.7866),
    (14, 4, 'Office Cleaning', 'Professional cleaning for offices.', 150.00, 'approved', 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (15, 5, 'Car Battery Replacement', 'Replace old or dead batteries.', 120.00, 'approved', 'https://images.unsplash.com/photo-1504215680853-026ed2a45def?auto=format&fit=crop&w=400&q=80', 'Bukit Batok', 1.3483, 103.7491),
    (16, 6, 'Furniture Repair', 'Fix scratches, dents, and loose joints.', 90.00, 'approved', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=958', NULL, NULL, NULL),
    (17, 7, 'Haircut & Styling', 'Fresh styles for any occasion.', 75.00, 'approved', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80', 'Bishan', 1.3504, 103.8467),
    (18, 8, 'Network Setup', 'Setup and configure your home network.', 90.00, 'approved', 'https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (19, 9, 'English Tutoring', 'Improve reading and writing skills.', 55.00, 'approved', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (20, 10, 'Pipe Leak Repair', 'Fix pipe leaks quickly and efficiently.', 110.00, 'approved', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80', 'Central Business District', 1.2821, 103.8515),
    -- Continue similar entries to make up 40 rows --
    (21, 1, 'Gourmet Breakfast Delivery', 'Start your day with a gourmet breakfast.', 50.00, 'approved', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (22, 2, 'Overnight Parcel Delivery', 'Parcel delivery by next morning.', 40.00, 'approved', 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=400&q=80', 'Queenstown', 1.2956, 103.8198),
    (23, 3, 'Bathroom Plumbing', 'Fix taps, showers, and toilets.', 70.00, 'approved', 'https://images.unsplash.com/photo-1454988501794-2992f706932e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1174', 'Ang Mo Kio', 1.3695, 103.8392),
    (24, 4, 'Carpet Cleaning', 'Professional carpet cleaning service.', 130.00, 'approved', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (25, 5, 'Tire Replacement', 'Replace worn-out tires safely.', 160.00, 'approved', 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=400&q=80', 'Choa Chu Kang', 1.3938, 103.7443),
    (26, 6, 'Kitchen Furniture Assembly', 'Assembly of kitchen furniture and cabinets.', 80.00, 'approved', 'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1174', NULL, NULL, NULL),
    (27, 7, 'Hair Treatment', 'Deep conditioning and scalp treatments.', 95.00, 'approved', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'Pasir Ris', 1.3744, 103.9493),
    (28, 8, 'Laptop Repair', 'Fix hardware and software issues.', 100.00, 'approved', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (29, 9, 'Science Tutoring', 'Private tutoring for science subjects.', 60.00, 'approved', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (30, 10, 'Emergency Drain Cleaning', 'Quick service for clogged drains.', 120.00, 'approved', 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=400&q=80', 'Bedok', 1.3240, 103.9272),
    (31, 1, 'Custom Cake Delivery', 'Order and have cakes delivered.', 80.00, 'approved', 'https://images.unsplash.com/photo-1447078806655-40579c2520d6?auto=format&fit=crop&w=400&q=80', 'Bukit Merah', 1.2805, 103.8198),
    (32, 2, 'Express Courier', 'Fast same-day courier services.', 35.00, 'approved', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80', 'Geylang', 1.3208, 103.8868),
    (33, 3, 'Garden Plumbing Repair', 'Fix outdoor water systems.', 85.00, 'approved', 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=400&q=80', 'Punggol', 1.4020, 103.9090),
    (34, 4, 'Window Cleaning', 'Professional window and glass cleaning.', 105.00, 'approved', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (35, 5, 'Car Detailing', 'Full exterior and interior cleaning.', 200.00, 'approved', 'https://images.unsplash.com/photo-1511918984145-48de785d4c4e?auto=format&fit=crop&w=400&q=80', 'Yishun', 1.4300, 103.8350),
    (36, 6, 'Door Repair', 'Fix broken locks and hinges.', 75.00, 'approved', 'https://images.unsplash.com/photo-1520880867055-1e30d1cb001c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (37, 7, 'Hair Coloring', 'Professional dye jobs.', 120.00, 'approved', 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=400&q=80', 'Toa Payoh', 1.3321, 103.8489),
    (38, 8, 'Hardware Upgrade', 'Increase your device performance.', 110.00, 'approved', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (39, 9, 'Language Tutoring', 'Learn new languages with an expert.', 65.00, 'approved', 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (40, 10, 'Pipe Installation', 'New pipe installation for homes.', 140.00, 'approved', 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=400&q=80', 'Tiong Bahru', 1.2869, 103.8287);
    """)

    # Seed Bookings - Realistic growth pattern for provider_id 1 (listings 1, 11, 21, 31)
    # Data spans May-November 2025 with increasing booking volume (business growth)
    db.executescript("""
    INSERT INTO Bookings (listing_id, user_id, booking_date, status) VALUES
    -- MAY 2025 - Starting slow (3 bookings)
    (1, 'uid2', '2025-05-10 18:00:00', 'completed'),
    (21, 'uid4', '2025-05-18 08:30:00', 'completed'),
    (31, 'uid5', '2025-05-28 15:00:00', 'completed'),
    
    -- JUNE 2025 - Growing (6 bookings)
    (1, 'uid4', '2025-06-05 19:00:00', 'completed'),
    (11, 'uid2', '2025-06-10 19:00:00', 'completed'),
    (21, 'uid6', '2025-06-15 08:00:00', 'completed'),
    (31, 'uid7', '2025-06-20 15:30:00', 'completed'),
    (1, 'uid8', '2025-06-25 18:30:00', 'completed'),
    (11, 'uid9', '2025-06-28 19:30:00', 'completed'),
    
    -- JULY 2025 - Steady growth (8 bookings)
    (1, 'uid5', '2025-07-03 18:00:00', 'completed'),
    (11, 'uid4', '2025-07-08 19:00:00', 'completed'),
    (21, 'uid2', '2025-07-12 08:00:00', 'completed'),
    (21, 'uid10', '2025-07-15 08:30:00', 'completed'),
    (31, 'uid6', '2025-07-20 15:00:00', 'completed'),
    (1, 'uid7', '2025-07-23 18:30:00', 'completed'),
    (11, 'uid8', '2025-07-26 19:30:00', 'completed'),
    (21, 'uid9', '2025-07-30 08:00:00', 'completed'),
    
    -- AUGUST 2025 - Peak season (12 bookings)
    (1, 'uid2', '2025-08-02 18:00:00', 'completed'),
    (1, 'uid4', '2025-08-06 19:00:00', 'completed'),
    (11, 'uid5', '2025-08-10 19:00:00', 'completed'),
    (21, 'uid6', '2025-08-12 08:30:00', 'completed'),
    (31, 'uid7', '2025-08-15 15:30:00', 'completed'),
    (1, 'uid8', '2025-08-18 18:30:00', 'completed'),
    (11, 'uid9', '2025-08-20 19:30:00', 'completed'),
    (21, 'uid10', '2025-08-22 08:00:00', 'completed'),
    (31, 'uid2', '2025-08-25 15:00:00', 'completed'),
    (1, 'uid4', '2025-08-27 18:00:00', 'completed'),
    (11, 'uid6', '2025-08-29 19:00:00', 'completed'),
    (21, 'uid8', '2025-08-31 08:30:00', 'completed'),
    
    -- SEPTEMBER 2025 - High demand (14 bookings)
    (1, 'uid5', '2025-09-02 18:30:00', 'completed'),
    (11, 'uid7', '2025-09-05 19:30:00', 'completed'),
    (1, 'uid9', '2025-09-08 18:00:00', 'completed'),
    (21, 'uid10', '2025-09-10 08:00:00', 'completed'),
    (31, 'uid2', '2025-09-12 15:30:00', 'completed'),
    (11, 'uid4', '2025-09-15 19:00:00', 'completed'),
    (1, 'uid6', '2025-09-18 18:30:00', 'completed'),
    (21, 'uid8', '2025-09-20 08:30:00', 'completed'),
    (31, 'uid9', '2025-09-22 15:00:00', 'completed'),
    (11, 'uid10', '2025-09-24 19:30:00', 'completed'),
    (1, 'uid2', '2025-09-26 18:00:00', 'completed'),
    (21, 'uid4', '2025-09-28 08:00:00', 'completed'),
    (11, 'uid5', '2025-09-29 19:00:00', 'completed'),
    (31, 'uid7', '2025-09-30 15:30:00', 'completed'),
    
    -- OCTOBER 2025 - Sustained high demand (15 bookings)
    (1, 'uid8', '2025-10-02 18:30:00', 'completed'),
    (11, 'uid9', '2025-10-04 19:30:00', 'completed'),
    (21, 'uid10', '2025-10-06 08:00:00', 'completed'),
    (31, 'uid2', '2025-10-08 15:00:00', 'completed'),
    (1, 'uid4', '2025-10-10 18:00:00', 'completed'),
    (11, 'uid6', '2025-10-12 19:00:00', 'completed'),
    (21, 'uid7', '2025-10-14 08:30:00', 'completed'),
    (1, 'uid8', '2025-10-16 18:30:00', 'completed'),
    (31, 'uid9', '2025-10-18 15:30:00', 'completed'),
    (11, 'uid10', '2025-10-20 19:30:00', 'completed'),
    (1, 'uid2', '2025-10-22 18:00:00', 'completed'),
    (21, 'uid4', '2025-10-24 08:00:00', 'completed'),
    (11, 'uid5', '2025-10-26 19:00:00', 'completed'),
    (31, 'uid6', '2025-10-28 15:00:00', 'completed'),
    (1, 'uid7', '2025-10-30 18:30:00', 'completed'),
    
    -- NOVEMBER 2025 - Current month (5 bookings so far)
    (11, 'uid8', '2025-11-01 19:00:00', 'completed'),
    (21, 'uid9', '2025-11-02 08:30:00', 'completed'),
    (1, 'uid10', '2025-11-03 18:00:00', 'completed'),
    (31, 'uid2', '2025-11-04 15:30:00', 'completed'),
    (11, 'uid4', '2025-11-05 19:30:00', 'completed'),
    
    -- Other providers' bookings
    (2, 'uid2', '2025-10-22 09:00:00', 'completed'),
    (4, 'uid2', '2025-10-22 09:00:00', 'completed'),
    (10, 'uid2', '2025-10-22 14:00:00', 'pending');
    """)

    # Seed Reviews - Realistic mix of ratings (not all 5 stars)
    # About 60% 5-star, 25% 4-star, 10% 3-star, 5% 2-star for more realistic data
    db.executescript("""
    INSERT INTO Reviews (booking_id, user_id, listing_id, rating, comment) VALUES
    -- MAY 2025 Reviews
    (1, 'uid2', 1, 5, 'Amazing chef experience, highly recommend!'),
    (2, 'uid4', 21, 4, 'Good breakfast, arrived on time.'),
    (3, 'uid5', 31, 5, 'Beautiful custom cake for my event!'),
    
    -- JUNE 2025 Reviews
    (4, 'uid4', 1, 5, 'Outstanding culinary skills, will book again!'),
    (5, 'uid2', 11, 5, 'Perfect dinner party, everyone loved it!'),
    (6, 'uid6', 21, 5, 'Best breakfast I ever had!'),
    (7, 'uid7', 31, 4, 'Nice cake, good presentation.'),
    (8, 'uid8', 1, 3, 'Good service but arrived a bit late.'),
    (9, 'uid9', 11, 5, 'Gourmet quality, worth every penny!'),
    
    -- JULY 2025 Reviews
    (10, 'uid5', 1, 4, 'Very good service, delicious food!'),
    (11, 'uid4', 11, 5, 'Amazing experience for our anniversary!'),
    (12, 'uid2', 21, 5, 'Fresh and delicious breakfast items!'),
    (13, 'uid10', 21, 4, 'Started my day well.'),
    (14, 'uid6', 31, 5, 'The cake was absolutely stunning!'),
    (15, 'uid7', 1, 5, 'Best private chef in Singapore!'),
    (16, 'uid8', 11, 4, 'Excellent meal, great presentation.'),
    (17, 'uid9', 21, 5, 'Amazing quality breakfast!'),
    
    -- AUGUST 2025 Reviews (Peak season)
    (18, 'uid2', 1, 5, 'Absolutely fantastic dining experience!'),
    (19, 'uid4', 1, 5, 'The meal was perfectly prepared!'),
    (20, 'uid5', 11, 5, 'Best dining experience ever!'),
    (21, 'uid6', 21, 4, 'Very tasty breakfast.'),
    (22, 'uid7', 31, 5, 'Perfect for our celebration!'),
    (23, 'uid8', 1, 4, 'Great food, professional service.'),
    (24, 'uid9', 11, 4, 'Wonderful food, highly recommended.'),
    (25, 'uid10', 21, 5, 'Gourmet breakfast exceeded expectations!'),
    (26, 'uid2', 31, 5, 'Best custom cake ever!'),
    (27, 'uid4', 1, 3, 'Food was okay, expected more variety.'),
    (28, 'uid6', 11, 5, 'Chef Jason is incredible!'),
    (29, 'uid8', 21, 5, 'Delicious and beautifully presented!'),
    
    -- SEPTEMBER 2025 Reviews (High volume)
    (30, 'uid5', 1, 5, 'Delicious food, exceeded expectations!'),
    (31, 'uid7', 11, 5, 'Perfect for special occasions!'),
    (32, 'uid9', 1, 4, 'Great meal, would recommend.'),
    (33, 'uid10', 21, 4, 'Good breakfast, nice variety.'),
    (34, 'uid2', 31, 4, 'Beautiful cake, tasted amazing.'),
    (35, 'uid4', 11, 5, 'Amazing dinner service!'),
    (36, 'uid6', 1, 5, 'Top-notch chef skills!'),
    (37, 'uid8', 21, 5, 'Perfect morning start!'),
    (38, 'uid9', 31, 5, 'Everyone at the party loved it!'),
    (39, 'uid10', 11, 4, 'Solid dinner experience.'),
    (40, 'uid2', 1, 5, 'Will definitely book again!'),
    (41, 'uid4', 21, 3, 'Breakfast was good but a bit cold.'),
    (42, 'uid5', 11, 5, 'Exceptional quality and taste!'),
    (43, 'uid7', 31, 5, 'Stunning cake design!'),
    
    -- OCTOBER 2025 Reviews (Sustained demand)
    (44, 'uid8', 1, 4, 'Professional and delicious.'),
    (45, 'uid9', 11, 5, 'Outstanding dinner party!'),
    (46, 'uid10', 21, 5, 'Best breakfast service!'),
    (47, 'uid2', 31, 5, 'Perfect cake for our event!'),
    (48, 'uid4', 1, 5, 'Incredible culinary experience!'),
    (49, 'uid6', 11, 5, 'Highly recommend for special events!'),
    (50, 'uid7', 21, 4, 'Great breakfast options.'),
    (51, 'uid8', 1, 2, 'Food was good but service was slow.'),
    (52, 'uid9', 31, 4, 'Nice cake, good taste.'),
    (53, 'uid10', 11, 5, 'Fantastic dinner experience!'),
    (54, 'uid2', 1, 5, 'Chef Jason never disappoints!'),
    (55, 'uid4', 21, 5, 'Delicious gourmet breakfast!'),
    (56, 'uid5', 11, 4, 'Good quality dinner service.'),
    (57, 'uid6', 31, 5, 'Amazing custom design!'),
    (58, 'uid7', 1, 5, 'Five stars all the way!'),
    
    -- NOVEMBER 2025 Reviews (Current)
    (59, 'uid8', 11, 5, 'Excellent dinner as always!'),
    (60, 'uid9', 21, 4, 'Fresh breakfast, arrived early.'),
    (61, 'uid10', 1, 5, 'Best chef service in town!'),
    (62, 'uid2', 31, 5, 'Cake was absolutely perfect!'),
    (63, 'uid4', 11, 5, 'Outstanding service and food!'),

    -- Other listings (sample reviews for remaining services)
    (64, 'uid2', 2, 5, 'Parcel arrived super fast.'),
    (65, 'uid2', 4, 4, 'Good delivery service.'),
    (66, 'uid2', 4, 5, 'Home cleaning was thorough and quick.');

    """)

    # Seed Bookmarks
    db.executescript("""
    INSERT INTO Bookmarks (user_id, listing_id) VALUES
    (1, 4),
    (1, 10),
    (2, 1);
    """)

    # Seed Provider Analytics
    db.executescript("""
    INSERT INTO Provider_Analytics (provider_id, total_services, average_rating, total_bookings) VALUES
    (1, 1, 5.0, 1),
    (4, 1, 4.0, 1),
    (12, 1, 0, 1);
    """)

    db.commit()
    click.echo("✅ Database seeded successfully with full demo data!")


def init_app(app):
    # Register functions with Flask app
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
    app.cli.add_command(seed_db_command)
