import click
from flask import current_app
from db import get_db

@click.command('seed-db')
def seed_db_command():
    """Seed the database with full demo data."""
    db = get_db()

    # ----------------------------
    # Clear existing rows
    # ----------------------------
    db.executescript("""
    DELETE FROM Reviews;
    DELETE FROM Bookings;
    DELETE FROM Bookmarks;
    DELETE FROM Provider_Analytics;
    DELETE FROM Listings;
    DELETE FROM Providers;
    DELETE FROM Categories;
    DELETE FROM Users;
    """)

    # ----------------------------
    # Seed categories
    # ----------------------------
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

    # ----------------------------
    # Seed users
    # ----------------------------
    db.executescript("""
    INSERT INTO Users (email, display_name, phone, role) VALUES
    ('alice@example.com', 'Alice Tan', '91234567', 'customer'),
    ('ben@example.com', 'Ben Lim', '92345678', 'customer'),
    ('chefjason@example.com', 'Chef Jason', '93456789', 'provider'),
    ('movermax@example.com', 'Mover Max', '94567890', 'provider'),
    ('sparkz@example.com', 'Sparkz Electrical', '95678901', 'provider'),
    ('cleanqueen@example.com', 'Clean Queen', '96789012', 'provider'),
    ('autopro@example.com', 'AutoPro SG', '97890123', 'provider'),
    ('fixitbob@example.com', 'Fix-It Bob', '98901234', 'provider'),
    ('glamsalon@example.com', 'Glam Salon', '99012345', 'provider'),
    ('techgenius@example.com', 'Tech Genius', '90123456', 'provider'),
    ('tutoramy@example.com', 'Tutor Amy', '91122334', 'provider'),
    ('pipeworks@example.com', 'PipeWorks Plumbing', '92233445', 'provider'),
    ('admin@example.com', 'Admin User', '90001111', 'admin');
    """)

    # ----------------------------
    # Seed providers
    # ----------------------------
    db.executescript("""
    INSERT INTO Providers (user_id, business_name, description, approved) VALUES
    (3, 'Jason’s Gourmet Kitchen', 'Private chef offering customized meals for events and homes.', 1),
    (4, 'MoverMax Logistics', 'Affordable package delivery across Singapore.', 1),
    (5, 'Sparkz Electrical', 'Licensed electricians for home and office repairs.', 1),
    (6, 'Clean Queen Services', 'Professional home cleaning and sanitization.', 1),
    (7, 'AutoPro SG', 'Full-service auto mechanic workshop.', 1),
    (8, 'Fix-It Bob', 'Handyman services for furniture, doors, and minor repairs.', 1),
    (9, 'Glam Salon', 'Haircuts, facials, and styling for men and women.', 1),
    (10, 'Tech Genius', 'On-site or remote tech support and troubleshooting.', 1),
    (11, 'Tutor Amy', 'Private tutoring in English and Math for primary students.', 1),
    (12, 'PipeWorks Plumbing', '24/7 plumbing repairs and leak detection.', 1);
    """)

    # ----------------------------
    # Seed listings
    # ----------------------------
    db.executescript("""
    INSERT INTO Listings (provider_id, category_id, title, description, price, status) VALUES
    (1, 1, 'Private Dinner for Two', 'Enjoy a gourmet 3-course meal prepared in your home.', 150.00, 'approved'),
    (2, 2, 'Standard Package Delivery', 'Fast and affordable delivery service islandwide.', 25.00, 'approved'),
    (3, 3, 'Electrical Troubleshooting', 'Fix short circuits, faulty switches, or lighting issues.', 60.00, 'approved'),
    (4, 4, 'Home Deep Cleaning', 'Thorough cleaning for kitchens, bathrooms, and floors.', 120.00, 'approved'),
    (5, 5, 'Car Engine Tune-Up', 'Comprehensive check and tune-up for smooth performance.', 180.00, 'approved'),
    (6, 6, 'Furniture Assembly & Repairs', 'Expert handyman to fix or assemble furniture at home.', 70.00, 'approved'),
    (7, 7, 'Hair Styling & Treatment', 'Professional salon services for all hair types.', 90.00, 'approved'),
    (8, 8, 'Computer & Network Support', 'On-site troubleshooting for software and network issues.', 80.00, 'approved'),
    (9, 9, 'Math & English Tutoring', '1-hour personalized lessons for primary students.', 50.00, 'approved'),
    (10, 10, 'Emergency Plumbing', 'Quick response for pipe leaks and clogged drains.', 100.00, 'approved');
    """)

    # ----------------------------
    # Sample bookings
    # ----------------------------
    db.executescript("""
    INSERT INTO Bookings (listing_id, user_id, booking_date, status) VALUES
    (1, 1, '2025-10-21 18:00:00', 'confirmed'),
    (4, 2, '2025-10-22 09:00:00', 'completed'),
    (10, 1, '2025-10-22 14:00:00', 'pending');
    """)

    # ----------------------------
    # Sample reviews
    # ----------------------------
    db.executescript("""
    INSERT INTO Reviews (booking_id, user_id, listing_id, rating, comment) VALUES
    (1, 1, 1, 5, 'Chef Jason was amazing! Food was delicious.'),
    (2, 2, 4, 4, 'Great cleaning service, would book again.');
    """)

    # ----------------------------
    # Sample bookmarks
    # ----------------------------
    db.executescript("""
    INSERT INTO Bookmarks (user_id, listing_id) VALUES
    (1, 4),
    (1, 10),
    (2, 1);
    """)

    # ----------------------------
    # Provider analytics
    # ----------------------------
    db.executescript("""
    INSERT INTO Provider_Analytics (provider_id, total_services, average_rating, total_bookings) VALUES
    (1, 1, 5.0, 1),
    (4, 1, 4.0, 1),
    (12, 1, 0, 1);
    """)

    db.commit()
    click.echo("✅ Database seeded successfully with full demo data!")
