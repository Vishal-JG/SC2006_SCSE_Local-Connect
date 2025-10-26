from backend.db import get_db
from datetime import datetime

class Service:
    """Service model wrapper for the Listings table.
    
    A service is something a provider offers. Fields:
      - listing_id (primary key)
      - provider_id (foreign key to Providers)
      - category_id (foreign key to Categories, optional)
      - title
      - description
      - price
      - status ('pending', 'approved', 'rejected')
      - image_url (URL to service image)
      - location
      - lat
      - long
      - created_at
    """

    def __init__(self, listing_id, provider_id, title, price, category_id=None, description=None,
                 status='pending', image_url=None, location=None, latitude=None, longitude=None, created_at=None):
        self.listing_id = listing_id
        self.provider_id = provider_id
        self.category_id = category_id
        self.title = title
        self.description = description
        self.price = float(price)
        self.status = status
        self.image_url = image_url
        self.location = location
        self.latitude = latitude
        self.longitude = longitude
        self.created_at = created_at

    def to_dict(self):
        return {
            "listing_id": self.listing_id,
            "provider_id": self.provider_id,
            "category_id": self.category_id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "status": self.status,
            "image_url": self.image_url,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            "created_at": (
                self.created_at.isoformat()
                if hasattr(self.created_at, "isoformat")
                else self.created_at
            ),
        }

    @staticmethod
    def from_row(row):
        if row is None:
            return None
        return Service(
            listing_id=row["listing_id"],
            provider_id=row["provider_id"],
            category_id=row["category_id"],
            title=row["title"],
            description=row["description"],
            price=row["price"],
            status=row["status"],
            image_url=row["image_url"],
            location=row['location'] if 'location' in row.keys() else None,
            latitude=row['latitude'] if 'latitude' in row.keys() else None,
            longitude=row['longitude'] if 'longitude' in row.keys() else None,
            created_at=row["created_at"],
        )

    @staticmethod
    def create(provider_id, title, price, category_id=None, description=None, image_url=None, location=None, latitude=None, longitude=None, status='pending'):
        db = get_db()
        db.execute(
            """INSERT INTO Listings 
            (provider_id, category_id, title, description, price, status, image_url, location, latitude, longitude, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))""",
            (provider_id, category_id, title, description, float(price), status, image_url, location, latitude, longitude)
        )
        db.commit()
        listing_id = db.execute("SELECT last_insert_rowid()").fetchone()[0]
        return Service.get_by_id(listing_id)

    @staticmethod
    def get_by_id(listing_id):
        """Get a service by listing_id."""
        db = get_db()
        row = db.execute("SELECT * FROM Listings WHERE listing_id = ?", (listing_id,)).fetchone()
        return Service.from_row(row)

    @staticmethod
    def get_by_provider(provider_id):
        """Get all services for a specific provider."""
        db = get_db()
        rows = db.execute(
            "SELECT * FROM Listings WHERE provider_id = ? ORDER BY created_at DESC",
            (provider_id,),
        ).fetchall()
        return [Service.from_row(r) for r in rows]

    @staticmethod
    def list_all(status=None):
        """List all services, optionally filtered by status."""
        db = get_db()
        if status:
            rows = db.execute(
                "SELECT * FROM Listings WHERE status = ? ORDER BY created_at DESC",
                (status,),
            ).fetchall()
        else:
            rows = db.execute(
                "SELECT * FROM Listings ORDER BY created_at DESC"
            ).fetchall()
        return [Service.from_row(r) for r in rows]

    @staticmethod
    def update(listing_id, title=None, description=None, price=None, category_id=None,
               status=None, image_url=None, location=None, latitude=None, longitude=None):
        """Update a service listing. Only updates provided fields."""
        db = get_db()
        service = Service.get_by_id(listing_id)
        if not service:
            return None

        updates = []
        params = []

        if title is not None:
            updates.append("title = ?")
            params.append(title)
        if description is not None:
            updates.append("description = ?")
            params.append(description)
        if price is not None:
            updates.append("price = ?")
            params.append(float(price))
        if category_id is not None:
            updates.append("category_id = ?")
            params.append(category_id)
        if status is not None:
            updates.append("status = ?")
            params.append(status)
        if image_url is not None:
            updates.append("image_url = ?")
            params.append(image_url)
        if location is not None:
            updates.append("location = ?")
            params.append(location)
        if latitude is not None:
            updates.append("latitude = ?")
            params.append(latitude)
        if longitude is not None:
            updates.append("longitude = ?")
            params.append(longitude)
        if updates:
            params.append(listing_id)
            db.execute(f"UPDATE Listings SET {', '.join(updates)} WHERE listing_id = ?", params)
            db.commit()

        return Service.get_by_id(listing_id)

    @staticmethod
    def delete(listing_id):
        """Delete a service listing."""
        db = get_db()
        result = db.execute("DELETE FROM Listings WHERE listing_id = ?", (listing_id,))
        db.commit()
        return result.rowcount > 0
