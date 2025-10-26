"""
Booking Model
Represents a booking made by a customer for a service.
Maps to the Bookings table in the database.
"""
from datetime import datetime
from backend.db import get_db


class Booking:
    """
    Model for managing bookings made by customers.
    
    Attributes:
        booking_id: Unique identifier for the booking
        listing_id: ID of the service being booked
        user_id: ID of the customer making the booking
        booking_date: Date/time when the service is requested
        status: Status of the booking ('pending', 'confirmed', 'cancelled', 'completed')
        created_at: Timestamp when booking was created
    """
    
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'
    
    def __init__(self, booking_id, listing_id, user_id, booking_date, status=STATUS_PENDING, created_at=None):
        self.booking_id = booking_id
        self.listing_id = listing_id
        self.user_id = user_id
        
        # Convert string to datetime if necessary
        if isinstance(booking_date, str):
            self.booking_date = datetime.fromisoformat(booking_date)
        else:
            self.booking_date = booking_date
            
        self.status = status
        self.created_at = created_at or datetime.now()
    
    def to_dict(self):
        """Convert booking to dictionary representation."""
        return {
            'booking_id': self.booking_id,
            'listing_id': self.listing_id,
            'user_id': self.user_id,
            'booking_date': self.booking_date.isoformat() if isinstance(self.booking_date, datetime) else self.booking_date,
            'status': self.status,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
    
    @staticmethod
    def from_row(row):
        """Create Booking instance from database row."""
        if row is None:
            return None
        # Use bracket-access, not .get()
        return Booking(
            booking_id=row['booking_id'],
            listing_id=row['listing_id'],
            user_id=row['user_id'],
            booking_date=row['booking_date'],
            status=row['status'] if 'status' in row.keys() else Booking.STATUS_PENDING,
            created_at=row['created_at'] if 'created_at' in row.keys() else None
        )
        
    @staticmethod
    def create(user_id, listing_id, booking_date):
        """
        Create a new booking.
        
        Args:
            user_id: ID of the customer making the booking
            listing_id: ID of the service being booked
            booking_date: Date/time when the service is requested
            
        Returns:
            Booking: The created booking object
            
        Raises:
            ValueError: If booking_date is invalid or listing doesn't exist
        """
        db = get_db()
        
        # Validate booking date is in the future
        if isinstance(booking_date, str):
            try:
                booking_datetime = datetime.fromisoformat(booking_date)
            except ValueError:
                raise ValueError("Invalid booking date format. Use ISO format (YYYY-MM-DDTHH:MM:SS).")
        else:
            booking_datetime = booking_date
            
        now = datetime.now()
        if booking_datetime < now:
            raise ValueError("Booking date must be in the future.")
        
        # Check if listing exists and is approved
        listing = db.execute("SELECT * FROM Listings WHERE listing_id = ? AND status = 'approved'", 
                            (listing_id,)).fetchone()
        if not listing:
            raise ValueError("Service not found or not approved for booking.")
            
        # Create the booking
        cursor = db.execute(
            """
            INSERT INTO Bookings (listing_id, user_id, booking_date, status, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            """,
            (listing_id, user_id, booking_datetime.isoformat(), Booking.STATUS_PENDING)
        )
        db.commit()
        booking_id = cursor.lastrowid
        
        # Fetch the created booking
        return Booking.get_by_id(booking_id)
    
    @staticmethod
    def get_by_id(booking_id):
        """Get booking by ID."""
        db = get_db()
        row = db.execute(
            "SELECT * FROM Bookings WHERE booking_id = ?",
            (booking_id,)
        ).fetchone()
        return Booking.from_row(row)
    
    @staticmethod
    def get_by_user(user_id, status=None):
        """
        Get all bookings made by a specific user.
        
        Args:
            user_id: ID of the user
            status: Optional status filter
            
        Returns:
            list[Booking]: List of booking objects
        """
        db = get_db()
        
        if status:
            rows = db.execute(
                """
                SELECT * FROM Bookings 
                WHERE user_id = ? AND status = ?
                ORDER BY booking_date DESC
                """,
                (user_id, status)
            ).fetchall()
        else:
            rows = db.execute(
                """
                SELECT * FROM Bookings 
                WHERE user_id = ?
                ORDER BY booking_date DESC
                """,
                (user_id,)
            ).fetchall()
            
        return [Booking.from_row(row) for row in rows]
    
    @staticmethod
    def get_by_provider(provider_id, status=None):
        """
        Get all bookings for services offered by a specific provider.
        
        Args:
            provider_id: ID of the provider
            status: Optional status filter
            
        Returns:
            list[Booking]: List of booking objects
        """
        db = get_db()
        
        if status:
            rows = db.execute(
                """
                SELECT b.* FROM Bookings b
                JOIN Listings l ON b.listing_id = l.listing_id
                WHERE l.provider_id = ? AND b.status = ?
                ORDER BY b.booking_date DESC
                """,
                (provider_id, status)
            ).fetchall()
        else:
            rows = db.execute(
                """
                SELECT b.* FROM Bookings b
                JOIN Listings l ON b.listing_id = l.listing_id
                WHERE l.provider_id = ?
                ORDER BY b.booking_date DESC
                """,
                (provider_id,)
            ).fetchall()
            
        return [Booking.from_row(row) for row in rows]
    
    @staticmethod
    def get_with_details(booking_id):
        """
        Get booking with service and provider details.
        
        Args:
            booking_id: ID of the booking
            
        Returns:
            dict: Dictionary with booking, service, and provider details
        """
        db = get_db()
        row = db.execute(
            """
            SELECT 
                b.*,
                l.title,
                l.description as service_description,
                l.price,
                p.business_name,
                p.description as provider_description,
                u.display_name as customer_name,
                u.email as customer_email,
                pu.display_name as provider_name,
                pu.email as provider_email
            FROM Bookings b
            JOIN Listings l ON b.listing_id = l.listing_id
            JOIN Providers p ON l.provider_id = p.provider_id
            JOIN Users u ON b.user_id = u.user_id
            JOIN Users pu ON p.user_id = pu.user_id
            WHERE b.booking_id = ?
            """,
            (booking_id,)
        ).fetchone()
        
        if not row:
            return None
        
        return dict(row)
    
    @staticmethod
    def update_status(booking_id, status):
        """
        Update the status of a booking.
        
        Args:
            booking_id: ID of the booking to update
            status: New status ('pending', 'confirmed', 'cancelled', 'completed')
            
        Returns:
            Booking: Updated booking object, or None if not found
        """
        if status not in [Booking.STATUS_PENDING, Booking.STATUS_CONFIRMED, 
                          Booking.STATUS_CANCELLED, Booking.STATUS_COMPLETED]:
            raise ValueError("Invalid booking status.")
            
        db = get_db()
        db.execute(
            "UPDATE Bookings SET status = ? WHERE booking_id = ?",
            (status, booking_id)
        )
        db.commit()
        
        return Booking.get_by_id(booking_id)
    
    @staticmethod
    def delete(booking_id):
        """
        Delete a booking.
        Only allowed for pending bookings.
        
        Args:
            booking_id: ID of the booking to delete
            
        Returns:
            bool: True if deleted, False if not found or not allowed
        """
        db = get_db()
        
        # Only allow deletion of pending bookings
        booking = Booking.get_by_id(booking_id)
        if not booking or booking.status != Booking.STATUS_PENDING:
            return False
        
        cursor = db.execute(
            "DELETE FROM Bookings WHERE booking_id = ? AND status = ?",
            (booking_id, Booking.STATUS_PENDING)
        )
        db.commit()
        
        return cursor.rowcount > 0
