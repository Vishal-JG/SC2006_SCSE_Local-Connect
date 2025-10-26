from backend.db import get_db
from datetime import datetime


class User:
    """Lightweight User model wrapper around the existing SQLite schema.

    Fields expected in `Users` table (from schema.sql):
      - user_id (INTEGER PRIMARY KEY)
      - email
      - display_name
      - phone
      - role
      - created_at
    """

    def __init__(self, user_id, email, display_name=None, phone=None, role='customer', created_at=None):
        self.user_id = user_id
        self.email = email
        self.display_name = display_name
        self.phone = phone
        self.role = role
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'email': self.email,
            'display_name': self.display_name,
            'phone': self.phone,
            'role': self.role,
            'created_at': self.created_at.isoformat() if hasattr(self.created_at, 'isoformat') else self.created_at,
        }

    @staticmethod
    def from_row(row):
        if row is None:
            return None
        return User(
            user_id=row['user_id'],
            email=row['email'],
            display_name=row['display_name'] if 'display_name' in row.keys() else None,
            phone=row['phone'] if 'phone' in row.keys() else None,
            role=row['role'] if 'role' in row.keys() else None,
            created_at=row['created_at'] if 'created_at' in row.keys() else None
        )

    @staticmethod
    def create(email, display_name=None, phone=None, role='customer', user_id=None):
        db = get_db()
        return User._insert_row(db, email, display_name, phone, role, user_id)

    @staticmethod
    def _insert_row(db, email, display_name=None, phone=None, role='customer', user_id=None):
        """Insert a user row using the provided DB connection. Caller manages commit/rollback."""
        created_at = datetime.utcnow().isoformat()
        if user_id:
            db.execute(
                "INSERT INTO Users (user_id, email, display_name, phone, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                (user_id, email, display_name, phone, role, created_at)
            )
            row = db.execute("SELECT * FROM Users WHERE user_id = ?", (user_id,)).fetchone()
        else:
            db.execute(
                "INSERT INTO Users (email, display_name, phone, role, created_at) VALUES (?, ?, ?, ?, ?)",
                (email, display_name, phone, role, created_at)
            )
            row = db.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
        return User.from_row(row)

    @staticmethod
    def get_by_id(user_id):
        db = get_db()
        row = db.execute("SELECT * FROM Users WHERE user_id = ?", (user_id,)).fetchone()
        return User.from_row(row)

    @staticmethod
    def get_by_email(email):
        db = get_db()
        row = db.execute("SELECT * FROM Users WHERE email = ?", (email,)).fetchone()
        return User.from_row(row)

    @staticmethod
    def list_all():
        db = get_db()
        rows = db.execute("SELECT * FROM Users ORDER BY created_at DESC").fetchall()
        return [User.from_row(r) for r in rows]

    # ----------------------
    # Convenience factories
    # ----------------------
    @staticmethod
    def create_admin(email, display_name=None, phone=None, user_id=None):
        return User.create(email=email, display_name=display_name, phone=phone, role='admin', user_id=user_id)

    @staticmethod
    def create_provider(email, display_name=None, phone=None, business_name=None, business_description=None, user_id=None):
        # create base user
        user = User.create(email=email, display_name=display_name, phone=phone, role='provider', user_id=user_id)
        # create provider-specific row in Providers table
        if user:
            db = get_db()
            db.execute(
                "INSERT OR IGNORE INTO Providers (user_id, business_name, description, approved) VALUES (?, ?, ?, 0)",
                (user.user_id, business_name, business_description)
            )
            db.commit()
        return user

    @staticmethod
    def create_consumer(email, display_name=None, phone=None, user_id=None):
        return User.create(email=email, display_name=display_name, phone=phone, role='customer', user_id=user_id)
