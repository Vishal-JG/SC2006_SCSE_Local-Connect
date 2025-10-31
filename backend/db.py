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

    # Seed Bookings
    db.executescript("""
    INSERT INTO Bookings (listing_id, user_id, booking_date, status) VALUES
    (1, 'o8D1NE4esoWkurIzw9EuogMnwKI2', '2025-10-21 18:00:00', 'confirmed'),
    (4, 2, '2025-10-22 09:00:00', 'completed'),
    (10, 1, '2025-10-22 14:00:00', 'pending');
    """)

    # Seed Reviews
    db.executescript("""
    INSERT INTO Reviews (booking_id, user_id, listing_id, rating, comment) VALUES
    -- Listing 1
    (1, 1, 1, 5, 'Amazing chef experience, highly recommend!'),
    (2, 2, 1, 4, 'Very good service, delicious food!'),

    -- Listing 2
    (3, 1, 2, 5, 'Parcel arrived super fast.'),
    (4, 3, 2, 4, 'Good delivery, but package was slightly late.'),

    -- Listing 3
    (5, 2, 3, 4, 'Plumber was professional and fixed the leak.'),
    (6, 4, 3, 5, 'Excellent service, would hire again.'),

    -- Listing 4
    (7, 1, 4, 5, 'Home cleaning was thorough and quick.'),
    (8, 3, 4, 4, 'Good cleaning, but missed a few spots.'),

    -- Listing 5
    (9, 2, 5, 5, 'Mechanic fixed my car efficiently.'),
    (10, 4, 5, 4, 'Good service, a bit pricey.'),

    -- Listing 6
    (11, 1, 6, 4, 'Handyman did a great job.'),
    (12, 3, 6, 5, 'Very satisfied with the repairs.'),

    -- Listing 7
    (13, 2, 7, 5, 'Salon at home was amazing!'),
    (14, 4, 7, 4, 'Good hair styling, took a bit long.'),

    -- Listing 8
    (15, 1, 8, 5, 'Computer repair was quick and effective.'),
    (16, 3, 8, 4, 'Device works perfectly now.'),

    -- Listing 9
    (17, 2, 9, 5, 'Tutoring really helped my child improve.'),
    (18, 4, 9, 4, 'Good explanations, very patient tutor.'),

    -- Listing 10
    (19, 1, 10, 5, 'Plumber arrived quickly and solved the issue.'),
    (20, 3, 10, 4, 'Good service, slightly expensive.'),

    -- Listing 11
    (21, 2, 11, 5, 'Dinner was perfect!'),
    (22, 4, 11, 4, 'Loved the food, service was good.'),

    -- Listing 12
    (23, 1, 12, 5, 'Same-day delivery was flawless.'),
    (24, 3, 12, 4, 'Good speed, package safe.'),

    -- Listing 13
    (25, 2, 13, 4, 'Drain cleaning took less time than expected.'),
    (26, 4, 13, 5, 'Very satisfied, highly recommend.'),

    -- Listing 14
    (27, 1, 14, 5, 'Office cleaning was professional.'),
    (28, 3, 14, 4, 'Good cleaning, missed a corner.'),

    -- Listing 15
    (29, 2, 15, 5, 'Battery replaced quickly.'),
    (30, 4, 15, 4, 'Car is running fine now.'),

    -- Listing 16
    (31, 1, 16, 4, 'Furniture repaired well.'),
    (32, 3, 16, 5, 'Excellent workmanship.'),

    -- Listing 17
    (33, 2, 17, 5, 'Haircut perfect!'),
    (34, 4, 17, 4, 'Very happy with the styling.'),

    -- Listing 18
    (35, 1, 18, 4, 'Network setup was smooth.'),
    (36, 3, 18, 5, 'Internet works perfectly now.'),

    -- Listing 19
    (37, 2, 19, 5, 'English tutoring helped my child a lot.'),
    (38, 4, 19, 4, 'Good teaching, patient tutor.'),

    -- Listing 20
    (39, 1, 20, 5, 'Pipe leak repaired fast.'),
    (40, 3, 20, 4, 'Great service, affordable price.'),

    -- Listing 21
    (41, 2, 21, 5, 'Breakfast delivered fresh and on time.'),
    (42, 4, 21, 4, 'Very tasty breakfast, will order again.'),

    -- Listing 22
    (43, 1, 22, 5, 'Overnight delivery was perfect.'),
    (44, 3, 22, 4, 'Parcel arrived safe and on time.'),

    -- Listing 23
    (45, 2, 23, 4, 'Bathroom plumbing fixed efficiently.'),
    (46, 4, 23, 5, 'Good service, plumber was friendly.'),

    -- Listing 24
    (47, 1, 24, 5, 'Carpet cleaned very well.'),
    (48, 3, 24, 4, 'Nice job, but slight odor remained.'),

    -- Listing 25
    (49, 2, 25, 5, 'Tires replaced professionally.'),
    (50, 4, 25, 4, 'Good service, a bit long wait.'),

    -- Listing 26
    (51, 1, 26, 4, 'Furniture assembled correctly.'),
    (52, 3, 26, 5, 'Perfect assembly, very satisfied.'),

    -- Listing 27
    (53, 2, 27, 5, 'Hair treatment worked wonders.'),
    (54, 4, 27, 4, 'Hair feels soft and healthy.'),

    -- Listing 28
    (55, 1, 28, 5, 'Laptop repaired quickly.'),
    (56, 3, 28, 4, 'Good service, fixed my device.'),

    -- Listing 29
    (57, 2, 29, 5, 'Science tutoring really helped.'),
    (58, 4, 29, 4, 'Excellent explanations, patient tutor.'),

    -- Listing 30
    (59, 1, 30, 5, 'Emergency drain cleared fast.'),
    (60, 3, 30, 4, 'Good work, resolved issue quickly.'),

    -- Listing 31
    (61, 2, 31, 5, 'Cake arrived fresh and delicious.'),
    (62, 4, 31, 4, 'Very happy with delivery.'),

    -- Listing 32
    (63, 1, 32, 5, 'Express courier was excellent.'),
    (64, 3, 32, 4, 'Package delivered quickly.'),

    -- Listing 33
    (65, 2, 33, 5, 'Garden plumbing fixed perfectly.'),
    (66, 4, 33, 4, 'Good service, professional plumber.'),

    -- Listing 34
    (67, 1, 34, 5, 'Windows are sparkling clean.'),
    (68, 3, 34, 4, 'Great cleaning, some streaks left.'),

    -- Listing 35
    (69, 2, 35, 5, 'Car detailing was amazing.'),
    (70, 4, 35, 4, 'Very thorough cleaning, nice job.'),

    -- Listing 36
    (71, 1, 36, 5, 'Door repair was quick.'),
    (72, 3, 36, 4, 'Good service, fixed door perfectly.'),

    -- Listing 37
    (73, 2, 37, 5, 'Hair coloring turned out great.'),
    (74, 4, 37, 4, 'Nice job, exactly the color I wanted.'),

    -- Listing 38
    (75, 1, 38, 5, 'Hardware upgrade boosted performance.'),
    (76, 3, 38, 4, 'Great improvement, works smoothly.'),

    -- Listing 39
    (77, 2, 39, 5, 'Language tutoring is excellent.'),
    (78, 4, 39, 4, 'Very patient and knowledgeable tutor.'),

    -- Listing 40
    (79, 1, 40, 5, 'Pipe installation was fast and clean.'),
    (80, 3, 40, 4, 'Good work, pipes installed properly.');

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
