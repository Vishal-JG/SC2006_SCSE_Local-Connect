"""
Standalone Service Model Test - No Flask dependencies
Tests Service model logic directly using SQLite
"""
import sqlite3
from datetime import datetime


class Service:
    """Service model for testing."""
    
    def __init__(self, listing_id, provider_id, title, price, category_id=None, description=None, status='pending', created_at=None):
        self.listing_id = listing_id
        self.provider_id = provider_id
        self.category_id = category_id
        self.title = title
        self.description = description
        self.price = float(price)
        self.status = status
        self.created_at = created_at

    def to_dict(self):
        return {
            'listing_id': self.listing_id,
            'provider_id': self.provider_id,
            'category_id': self.category_id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'status': self.status,
            'created_at': str(self.created_at) if self.created_at else None,
        }

    @staticmethod
    def from_row(row):
        if row is None:
            return None
        return Service(
            listing_id=row[0],
            provider_id=row[1],
            category_id=row[2],
            title=row[3],
            description=row[4],
            price=row[5],
            status=row[6],
            created_at=row[7]
        )

    @staticmethod
    def create(db, provider_id, title, price, category_id=None, description=None, status='pending'):
        if not title or price is None:
            raise ValueError('title and price are required')
        
        cursor = db.execute(
            """INSERT INTO Listings (provider_id, category_id, title, description, price, status, created_at)
               VALUES (?, ?, ?, ?, ?, ?, datetime('now'))""",
            (provider_id, category_id, title, description, float(price), status)
        )
        db.commit()
        listing_id = cursor.lastrowid
        
        # Fetch the created service
        row = db.execute("SELECT * FROM Listings WHERE listing_id = ?", (listing_id,)).fetchone()
        return Service.from_row(row)

    @staticmethod
    def get_by_id(db, listing_id):
        row = db.execute("SELECT * FROM Listings WHERE listing_id = ?", (listing_id,)).fetchone()
        return Service.from_row(row)

    @staticmethod
    def get_by_provider(db, provider_id):
        rows = db.execute("SELECT * FROM Listings WHERE provider_id = ? ORDER BY created_at DESC", (provider_id,)).fetchall()
        return [Service.from_row(r) for r in rows]

    @staticmethod
    def list_all(db, status=None):
        if status:
            rows = db.execute("SELECT * FROM Listings WHERE status = ? ORDER BY created_at DESC", (status,)).fetchall()
        else:
            rows = db.execute("SELECT * FROM Listings ORDER BY created_at DESC").fetchall()
        return [Service.from_row(r) for r in rows]

    @staticmethod
    def update(db, listing_id, title=None, description=None, price=None, category_id=None, status=None):
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
        
        if updates:
            params.append(listing_id)
            db.execute(f"UPDATE Listings SET {', '.join(updates)} WHERE listing_id = ?", params)
            db.commit()
        
        return Service.get_by_id(db, listing_id)

    @staticmethod
    def delete(db, listing_id):
        cursor = db.execute("DELETE FROM Listings WHERE listing_id = ?", (listing_id,))
        db.commit()
        return cursor.rowcount > 0


def setup_test_db():
    """Create test database schema."""
    conn = sqlite3.connect(':memory:')
    
    conn.executescript("""
        CREATE TABLE Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            display_name TEXT,
            phone TEXT,
            role TEXT CHECK(role IN ('customer', 'provider', 'admin')) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE Providers (
            provider_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            business_name TEXT,
            description TEXT,
            approved BOOLEAN DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES Users(user_id)
        );

        CREATE TABLE Listings (
            listing_id INTEGER PRIMARY KEY AUTOINCREMENT,
            provider_id INTEGER NOT NULL,
            category_id INTEGER,
            title TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (provider_id) REFERENCES Providers(provider_id)
        );
    """)
    
    return conn


def run_tests():
    """Run all service model tests."""
    print("\n" + "=" * 70)
    print(" SERVICE MODEL TEST SUITE (Standalone)")
    print("=" * 70)
    
    conn = setup_test_db()
    
    try:
        # Setup test data
        print("\n[SETUP] Creating test provider...")
        cursor = conn.execute(
            "INSERT INTO Users (email, display_name, role) VALUES (?, ?, ?)",
            ('provider@test.com', 'Test Provider', 'provider')
        )
        user_id = cursor.lastrowid
        
        cursor = conn.execute(
            "INSERT INTO Providers (user_id, business_name, description, approved) VALUES (?, ?, ?, ?)",
            (user_id, 'Test Business', 'We provide great services', 1)
        )
        provider_id = cursor.lastrowid
        conn.commit()
        print(f"        ✓ Provider created with ID: {provider_id}\n")
        
        # Test 1: Create service
        print("TEST 1: Create Service")
        print("-" * 70)
        service = Service.create(
            conn,
            provider_id=provider_id,
            title="House Cleaning",
            price=50.00,
            description="Professional house cleaning service",
            status='pending'
        )
        print(f"  Created: {service.title}")
        print(f"  ID: {service.listing_id}, Price: ${service.price}, Status: {service.status}")
        assert service.listing_id is not None, "Service ID should be set"
        assert service.title == "House Cleaning", "Title mismatch"
        assert service.price == 50.00, "Price mismatch"
        print("  ✅ PASSED\n")
        
        # Test 2: Get service by ID
        print("TEST 2: Get Service by ID")
        print("-" * 70)
        retrieved = Service.get_by_id(conn, service.listing_id)
        print(f"  Retrieved: {retrieved.title} (ID: {retrieved.listing_id})")
        assert retrieved is not None, "Service should be retrieved"
        assert retrieved.title == "House Cleaning", "Retrieved title mismatch"
        print("  ✅ PASSED\n")
        
        # Test 3: Update service
        print("TEST 3: Update Service")
        print("-" * 70)
        updated = Service.update(
            conn,
            service.listing_id,
            title="Premium House Cleaning",
            price=75.00,
            status='approved'
        )
        print(f"  Updated: {updated.title}")
        print(f"  New Price: ${updated.price}, New Status: {updated.status}")
        assert updated.title == "Premium House Cleaning", "Updated title mismatch"
        assert updated.price == 75.00, "Updated price mismatch"
        assert updated.status == 'approved', "Updated status mismatch"
        print("  ✅ PASSED\n")
        
        # Test 4: Create second service
        print("TEST 4: Create Multiple Services")
        print("-" * 70)
        service2 = Service.create(
            conn,
            provider_id=provider_id,
            title="Lawn Mowing",
            price=30.00,
            description="Weekly lawn maintenance",
            status='approved'
        )
        print(f"  Created second service: {service2.title} (${service2.price})")
        print("  ✅ PASSED\n")
        
        # Test 5: Get services by provider
        print("TEST 5: Get Services by Provider")
        print("-" * 70)
        provider_services = Service.get_by_provider(conn, provider_id)
        print(f"  Found {len(provider_services)} services for provider {provider_id}")
        for svc in provider_services:
            print(f"    - {svc.title} (${svc.price})")
        assert len(provider_services) == 2, "Should have 2 services"
        print("  ✅ PASSED\n")
        
        # Test 6: List all services
        print("TEST 6: List All Services")
        print("-" * 70)
        all_services = Service.list_all(conn)
        print(f"  Total services: {len(all_services)}")
        assert len(all_services) == 2, "Should have 2 total services"
        print("  ✅ PASSED\n")
        
        # Test 7: List by status
        print("TEST 7: Filter Services by Status")
        print("-" * 70)
        approved = Service.list_all(conn, status='approved')
        print(f"  Approved services: {len(approved)}")
        assert len(approved) == 2, "Should have 2 approved services"
        
        pending = Service.list_all(conn, status='pending')
        print(f"  Pending services: {len(pending)}")
        assert len(pending) == 0, "Should have 0 pending services"
        print("  ✅ PASSED\n")
        
        # Test 8: Delete service
        print("TEST 8: Delete Service")
        print("-" * 70)
        deleted = Service.delete(conn, service2.listing_id)
        print(f"  Deleted service {service2.listing_id}: {deleted}")
        assert deleted == True, "Delete should return True"
        
        remaining = Service.list_all(conn)
        print(f"  Remaining services: {len(remaining)}")
        assert len(remaining) == 1, "Should have 1 remaining service"
        print("  ✅ PASSED\n")
        
        # Test 9: to_dict serialization
        print("TEST 9: Serialization (to_dict)")
        print("-" * 70)
        service_dict = service.to_dict()
        print(f"  Keys: {list(service_dict.keys())}")
        assert 'listing_id' in service_dict, "Should have listing_id"
        assert 'title' in service_dict, "Should have title"
        assert 'price' in service_dict, "Should have price"
        print(f"  Sample data: {service_dict['title']} - ${service_dict['price']}")
        print("  ✅ PASSED\n")
        
        # Test 10: Validation
        print("TEST 10: Input Validation")
        print("-" * 70)
        try:
            Service.create(conn, provider_id=provider_id, title=None, price=50)
            print("  ❌ FAILED - Should have raised ValueError for missing title")
            return False
        except ValueError:
            print("  ✓ Correctly raised ValueError for missing title")
        
        try:
            Service.create(conn, provider_id=provider_id, title="Test", price=None)
            print("  ❌ FAILED - Should have raised ValueError for missing price")
            return False
        except ValueError:
            print("  ✓ Correctly raised ValueError for missing price")
        
        print("  ✅ PASSED\n")
        
        print("=" * 70)
        print(" ✅ ALL TESTS PASSED (10/10)")
        print("=" * 70)
        return True
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        print("=" * 70)
        return False
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        print("=" * 70)
        return False
    finally:
        conn.close()


if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
