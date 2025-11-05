"""
Bookmark Model
Represents a bookmark (saved service) by a user.
Maps to the Bookmarks table in the database.
"""
from datetime import datetime
from backend.db import get_db


class Bookmark:
    """
    Model for managing bookmarks (saved services by users).
    
    Attributes:
        bookmark_id: Unique identifier for the bookmark
        user_id: ID of the user who bookmarked
        listing_id: ID of the service/listing bookmarked
        created_at: Timestamp when bookmark was created
    """
    
    def __init__(self, bookmark_id, user_id, listing_id, created_at=None):
        self.bookmark_id = bookmark_id
        self.user_id = user_id
        self.listing_id = listing_id
        self.created_at = created_at or datetime.now()
    
    def to_dict(self):
        """Convert bookmark to dictionary representation."""
        return {
            'bookmark_id': self.bookmark_id,
            'user_id': self.user_id,
            'listing_id': self.listing_id,
            'created_at': self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at
        }
    
    @staticmethod
    def from_row(row):
        """Create Bookmark instance from database row."""
        if row is None:
            return None
        return Bookmark(
            bookmark_id=row['bookmark_id'],
            user_id=row['user_id'],
            listing_id=row['listing_id'],
            created_at=row['created_at']
        )
    
    @staticmethod
    def create(user_id, listing_id):
        """
        Create a new bookmark.
        
        Args:
            user_id: ID of the user bookmarking
            listing_id: ID of the service/listing to bookmark
            
        Returns:
            Bookmark: The created bookmark object
            
        Raises:
            ValueError: If bookmark already exists (UNIQUE constraint)
        """
        db = get_db()
        try:
            cursor = db.execute(
                """
                INSERT INTO Bookmarks (user_id, listing_id)
                VALUES (?, ?)
                """,
                (user_id, listing_id)
            )
            db.commit()
            bookmark_id = cursor.lastrowid
            
            # Fetch the created bookmark
            return Bookmark.get_by_id(bookmark_id)
        except Exception as e:
            db.rollback()
            # Handle UNIQUE constraint violation
            if 'UNIQUE constraint failed' in str(e):
                raise ValueError("This service is already bookmarked")
            raise
    
    @staticmethod
    def get_by_id(bookmark_id):
        """Get bookmark by ID."""
        db = get_db()
        row = db.execute(
            "SELECT * FROM Bookmarks WHERE bookmark_id = ?",
            (bookmark_id,)
        ).fetchone()
        return Bookmark.from_row(row)
    
    @staticmethod
    def get_by_user_and_listing(user_id, listing_id):
        """
        Check if a specific bookmark exists for a user and listing.
        
        Returns:
            Bookmark or None: The bookmark if it exists, None otherwise
        """
        db = get_db()
        row = db.execute(
            "SELECT * FROM Bookmarks WHERE user_id = ? AND listing_id = ?",
            (user_id, listing_id)
        ).fetchone()
        return Bookmark.from_row(row)
    
    @staticmethod
    def get_by_user(user_id):
        """
        Get all bookmarks for a specific user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            list[Bookmark]: List of bookmark objects
        """
        db = get_db()
        rows = db.execute(
            "SELECT * FROM Bookmarks WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        ).fetchall()
        return [Bookmark.from_row(row) for row in rows]
    
    @staticmethod
    def get_with_service_details(user_id):
        """
        Get all bookmarks for a user with full service details.
        
        Returns a list of dictionaries containing both bookmark and service information.
        This is useful for displaying bookmarked services in the UI.
        
        Args:
            user_id: ID of the user
            
        Returns:
            list[dict]: List of dictionaries with bookmark and service details
        """
        db = get_db()
        rows = db.execute(
            """
            SELECT 
                b.bookmark_id,
                b.user_id,
                b.listing_id,
                b.created_at as bookmarked_at,
                l.title,
                l.description,
                l.price,
                l.status,
                l.image_url,
                l.category_id,
                l.provider_id,
                p.business_name,
                p.description as provider_description,
                c.name as category_name
            FROM Bookmarks b
            JOIN Listings l ON b.listing_id = l.listing_id
            JOIN Providers p ON l.provider_id = p.provider_id
            LEFT JOIN Categories c ON l.category_id = c.category_id
            WHERE b.user_id = ? AND l.status = 'approved'
            ORDER BY b.created_at DESC
            """,
            (user_id,)
        ).fetchall()
        
        return [dict(row) for row in rows]
    
    @staticmethod
    def delete(bookmark_id):
        """
        Delete a bookmark.
        
        Args:
            bookmark_id: ID of the bookmark to delete
            
        Returns:
            bool: True if deleted, False if not found
        """
        db = get_db()
        cursor = db.execute(
            "DELETE FROM Bookmarks WHERE bookmark_id = ?",
            (bookmark_id,)
        )
        db.commit()
        return cursor.rowcount > 0
    
    @staticmethod
    def delete_by_user_and_listing(user_id, listing_id):
        """
        Delete a bookmark by user and listing IDs.
        Useful for "unbookmark" action.
        
        Args:
            user_id: ID of the user
            listing_id: ID of the service/listing
            
        Returns:
            bool: True if deleted, False if not found
        """
        db = get_db()
        cursor = db.execute(
            "DELETE FROM Bookmarks WHERE user_id = ? AND listing_id = ?",
            (user_id, listing_id)
        )
        db.commit()
        return cursor.rowcount > 0
    
    @staticmethod
    def is_bookmarked(user_id, listing_id):
        """
        Check if a service is bookmarked by a user.
        
        Returns:
            bool: True if bookmarked, False otherwise
        """
        bookmark = Bookmark.get_by_user_and_listing(user_id, listing_id)
        return bookmark is not None
