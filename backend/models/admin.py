from backend.db import get_db
from models.user import User


class Admin:
    """Admin wrapper - thin layer over User with role='admin'.
    
    Admins don't have a separate table; this provides a domain-specific API.
    """

    def __init__(self, user):
        """Wrap a User instance."""
        if not isinstance(user, User):
            raise TypeError("Admin requires a User instance")
        if user.role != 'admin':
            raise ValueError("User must have role='admin'")
        self.user = user

    @property
    def user_id(self):
        return self.user.user_id

    @property
    def email(self):
        return self.user.email

    @property
    def display_name(self):
        return self.user.display_name

    @property
    def phone(self):
        return self.user.phone

    @property
    def created_at(self):
        return self.user.created_at

    def to_dict(self):
        data = self.user.to_dict()
        data['type'] = 'admin'
        return data

    @staticmethod
    def create(email, display_name=None, phone=None, user_id=None):
        """Create a new admin user."""
        db = get_db()
        user = User._insert_row(db, email, display_name, phone, role='admin', user_id=user_id)
        db.commit()
        return Admin(user)

    @staticmethod
    def get_by_id(user_id):
        """Get admin by user_id."""
        user = User.get_by_id(user_id)
        if user and user.role == 'admin':
            return Admin(user)
        return None

    @staticmethod
    def get_by_email(email):
        """Get admin by email."""
        user = User.get_by_email(email)
        if user and user.role == 'admin':
            return Admin(user)
        return None

    @staticmethod
    def list_all():
        """List all admin users."""
        db = get_db()
        rows = db.execute("SELECT * FROM Users WHERE role = 'admin' ORDER BY created_at DESC").fetchall()
        users = [User.from_row(r) for r in rows]
        return [Admin(u) for u in users if u]
