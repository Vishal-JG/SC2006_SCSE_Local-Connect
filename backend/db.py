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
    INSERT INTO Users (email, display_name, phone, role) VALUES
    ('jesmondtay1914@gmail.com', 'Jesmond Tay', '91234567', 'customer'),
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
    (1, 1, 'Private Dinner for Two', 'Enjoy a gourmet 3-course meal prepared in your home.', 150.00, 'approved', 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=400&q=80', 'Orchard Road', 1.3048, 103.8318),
    (2, 2, 'Standard Package Delivery', 'Fast and affordable delivery service islandwide.', 25.00, 'approved', 'https://images.unsplash.com/photo-1612831455540-5efb7b8f7a3f?auto=format&fit=crop&w=400&q=80', 'Jurong East', 1.3331, 103.7436),
    (3, 3, 'Electrical Troubleshooting', 'Fix short circuits, faulty switches, or lighting issues.', 60.00, 'approved', 'https://images.unsplash.com/photo-1581090700227-5f9d8e0f8b8f?auto=format&fit=crop&w=400&q=80', 'Clementi', 1.3151, 103.7640),
    (4, 4, 'Home Deep Cleaning', 'Thorough cleaning for kitchens, bathrooms, and floors.', 120.00, 'approved', 'https://images.unsplash.com/photo-1581579186485-90577b0f5e7a?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (5, 5, 'Car Engine Tune-Up', 'Comprehensive check and tune-up for smooth performance.', 180.00, 'approved', 'https://images.unsplash.com/photo-1581092339885-07f0c4d44d27?auto=format&fit=crop&w=400&q=80', 'Woodlands', 1.4360, 103.7865),
    (6, 6, 'Furniture Assembly & Repairs', 'Expert handyman to fix or assemble furniture at home.', 70.00, 'approved', 'https://images.unsplash.com/photo-1596495577886-d920f4e5f013?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (7, 7, 'Hair Styling & Treatment', 'Professional salon services for all hair types.', 90.00, 'approved', 'https://images.unsplash.com/photo-1588776814546-b1b1d8b62239?auto=format&fit=crop&w=400&q=80', 'Hougang', 1.3721, 103.8922),
    (8, 8, 'Computer & Network Support', 'On-site troubleshooting for software and network issues.', 80.00, 'approved', 'https://images.unsplash.com/photo-1555529771-0f0f7f3a9b0a?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (9, 9, 'Math & English Tutoring', '1-hour personalized lessons for primary students.', 50.00, 'approved', 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=400&q=80', NULL, NULL, NULL),
    (10, 10, 'Emergency Plumbing', 'Quick response for pipe leaks and clogged drains.', 100.00, 'approved', 'https://images.unsplash.com/photo-1588776814512-7d1f5e7f3b55?auto=format&fit=crop&w=400&q=80', 'Marina Bay Sands', 1.2834, 103.8607);
    """)

    # Seed Bookings
    db.executescript("""
    INSERT INTO Bookings (listing_id, user_id, booking_date, status) VALUES
    (1, 1, '2025-10-21 18:00:00', 'confirmed'),
    (4, 2, '2025-10-22 09:00:00', 'completed'),
    (10, 1, '2025-10-22 14:00:00', 'pending');
    """)

    # Seed Reviews
    db.executescript("""
    INSERT INTO Reviews (booking_id, user_id, listing_id, rating, comment) VALUES
    (1, 1, 1, 5, 'Chef Jason was amazing!'),
    (2, 2, 4, 4, 'Great cleaning service!');
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
