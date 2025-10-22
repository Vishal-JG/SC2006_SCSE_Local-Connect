from db import get_db
from models.user import User
from datetime import datetime


class Provider:
    """Provider wrapper for the Providers table.

    Supports creating a provider for an existing user_id or creating atomically from
    user details (email/display_name/phone + business info) using User._insert_row.
    """

    def __init__(self, provider_id, user_id, business_name=None, description=None, approved=False):
        self.provider_id = provider_id
        self.user_id = user_id
        self.business_name = business_name
        self.description = description
        self.approved = bool(approved)

    def to_dict(self):
        return {
            'provider_id': self.provider_id,
            'user_id': self.user_id,
            'business_name': self.business_name,
            'description': self.description,
            'approved': self.approved,
        }

    @staticmethod
    def from_row(row):
        if row is None:
            return None
        return Provider(
            provider_id=row['provider_id'],
            user_id=row['user_id'],
            business_name=row.get('business_name'),
            description=row.get('description'),
            approved=row.get('approved')
        )

    @staticmethod
    def create_for_user(user_id, business_name, description, approved=False):
        """Create a provider record for an existing user_id."""
        db = get_db()
        db.execute(
            "INSERT INTO Providers (user_id, business_name, description, approved) VALUES (?, ?, ?, ?)",
            (user_id, business_name, description, int(bool(approved)))
        )
        db.commit()
        row = db.execute("SELECT * FROM Providers WHERE user_id = ?", (user_id,)).fetchone()
        return Provider.from_row(row)

    @staticmethod
    def create_from_user(email, display_name=None, phone=None, business_name=None, business_description=None, user_id=None):
        """Atomically create a User (if needed) and Provider entry. Returns Provider instance."""
        if not business_name or not business_description:
            raise ValueError('business_name and business_description required')

        db = get_db()
        try:
            user = User._insert_row(db, email, display_name, phone, role='provider', user_id=user_id)
            db.execute(
                "INSERT INTO Providers (user_id, business_name, description, approved) VALUES (?, ?, ?, 0)",
                (user.user_id, business_name, business_description)
            )
            db.commit()
            row = db.execute("SELECT * FROM Providers WHERE user_id = ?", (user.user_id,)).fetchone()
            return Provider.from_row(row)
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def get_by_user_id(user_id):
        db = get_db()
        row = db.execute("SELECT * FROM Providers WHERE user_id = ?", (user_id,)).fetchone()
        return Provider.from_row(row)

    @staticmethod
    def list_all():
        db = get_db()
        rows = db.execute("SELECT * FROM Providers ORDER BY provider_id DESC").fetchall()
        return [Provider.from_row(r) for r in rows]
