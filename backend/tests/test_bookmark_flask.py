"""
Bookmark Model Test Suite
Tests all bookmark functionality using Flask app context and real models.
"""
import os
import sys
import tempfile

# Add parent directory to path to import modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from models.bookmark import Bookmark
from db import init_app


def create_test_app():
    """Create Flask app configured for testing."""
    # Set root_path to backend directory so Flask can find schema.sql
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    app = Flask(__name__, instance_relative_config=False, root_path=backend_dir)
    
    # Create a temporary database file
    db_fd, db_path = tempfile.mkstemp()
    
    app.config.update({
        'TESTING': True,
        'DATABASE': db_path,
    })
    
    # Initialize the database
    init_app(app)
    
    with app.app_context():
        # Create tables using schema.sql
        from db import init_db
        init_db()
    
    return app, db_fd, db_path


def setup_test_data(app):
    """Create test data in the database."""
    with app.app_context():
        from db import get_db
        db = get_db()
        
        # Create customer user
        cursor = db.execute(
            "INSERT INTO Users (email, display_name, role) VALUES (?, ?, ?)",
            ('customer@test.com', 'Test Customer', 'customer')
        )
        customer_id = cursor.lastrowid
        
        # Create provider user
        cursor = db.execute(
            "INSERT INTO Users (email, display_name, role) VALUES (?, ?, ?)",
            ('provider@test.com', 'Test Provider', 'provider')
        )
        provider_user_id = cursor.lastrowid
        
        # Create provider
        cursor = db.execute(
            "INSERT INTO Providers (user_id, business_name, description, approved) VALUES (?, ?, ?, ?)",
            (provider_user_id, 'Test Business', 'Great services', 1)
        )
        provider_id = cursor.lastrowid
        
        # Create category
        cursor = db.execute(
            "INSERT INTO Categories (name) VALUES (?)",
            ('Cleaning',)
        )
        category_id = cursor.lastrowid
        
        # Create approved service
        cursor = db.execute(
            "INSERT INTO Listings (provider_id, category_id, title, description, price, status) VALUES (?, ?, ?, ?, ?, ?)",
            (provider_id, category_id, 'House Cleaning', 'Professional cleaning', 50.0, 'approved')
        )
        listing_id_1 = cursor.lastrowid
        
        # Create second approved service
        cursor = db.execute(
            "INSERT INTO Listings (provider_id, category_id, title, description, price, status) VALUES (?, ?, ?, ?, ?, ?)",
            (provider_id, category_id, 'Office Cleaning', 'Commercial cleaning', 100.0, 'approved')
        )
        listing_id_2 = cursor.lastrowid
        
        # Create pending service (should not show in bookmarks)
        cursor = db.execute(
            "INSERT INTO Listings (provider_id, category_id, title, description, price, status) VALUES (?, ?, ?, ?, ?, ?)",
            (provider_id, category_id, 'Pending Service', 'Not yet approved', 75.0, 'pending')
        )
        listing_id_pending = cursor.lastrowid
        
        db.commit()
        
        return {
            'customer_id': customer_id,
            'provider_id': provider_id,
            'listing_id_1': listing_id_1,
            'listing_id_2': listing_id_2,
            'listing_id_pending': listing_id_pending
        }


def run_tests():
    """Run all bookmark tests."""
    app, db_fd, db_path = create_test_app()
    
    print("=" * 70)
    print(" BOOKMARK MODEL TEST SUITE (Flask Integration)")
    print("=" * 70)
    
    try:
        # Setup test data
        print("\n[SETUP] Creating test data...")
        test_data = setup_test_data(app)
        customer_id = test_data['customer_id']
        listing_id_1 = test_data['listing_id_1']
        listing_id_2 = test_data['listing_id_2']
        listing_id_pending = test_data['listing_id_pending']
        print(f"        ✓ Created customer (ID: {customer_id})")
        print(f"        ✓ Created provider (ID: {test_data['provider_id']})")
        print(f"        ✓ Created 3 services (2 approved, 1 pending)\n")
        
        # All tests must run within app context
        with app.app_context():
            # TEST 1: Create Bookmark
            print("TEST 1: Create Bookmark")
            print("-" * 70)
            bookmark = Bookmark.create(customer_id, listing_id_1)
            print(f"  Created bookmark: ID={bookmark.bookmark_id}, User={bookmark.user_id}, Listing={bookmark.listing_id}")
            assert bookmark.bookmark_id is not None
            assert bookmark.user_id == customer_id
            assert bookmark.listing_id == listing_id_1
            print("  ✅ PASSED\n")
            
            # TEST 2: Get Bookmark by ID
            print("TEST 2: Get Bookmark by ID")
            print("-" * 70)
            retrieved = Bookmark.get_by_id(bookmark.bookmark_id)
            print(f"  Retrieved: ID={retrieved.bookmark_id}, User={retrieved.user_id}")
            assert retrieved is not None
            assert retrieved.bookmark_id == bookmark.bookmark_id
            print("  ✅ PASSED\n")
            
            # TEST 3: Prevent Duplicate Bookmarks (UNIQUE constraint)
            print("TEST 3: Prevent Duplicate Bookmarks")
            print("-" * 70)
            try:
                Bookmark.create(customer_id, listing_id_1)
                print("  ❌ FAILED - Should have raised ValueError")
                assert False
            except ValueError as e:
                print(f"  ✓ Correctly raised ValueError: {e}")
                assert "already bookmarked" in str(e)
            print("  ✅ PASSED\n")
            
            # TEST 4: Get Bookmark by User and Listing
            print("TEST 4: Get Bookmark by User and Listing")
            print("-" * 70)
            found = Bookmark.get_by_user_and_listing(customer_id, listing_id_1)
            print(f"  Found bookmark: ID={found.bookmark_id}")
            assert found is not None
            assert found.listing_id == listing_id_1
            print("  ✅ PASSED\n")
            
            # TEST 5: is_bookmarked Check
            print("TEST 5: is_bookmarked Check")
            print("-" * 70)
            is_bookmarked_1 = Bookmark.is_bookmarked(customer_id, listing_id_1)
            is_bookmarked_2 = Bookmark.is_bookmarked(customer_id, listing_id_2)
            print(f"  Service 1 bookmarked: {is_bookmarked_1}")
            print(f"  Service 2 bookmarked: {is_bookmarked_2}")
            assert is_bookmarked_1 == True
            assert is_bookmarked_2 == False
            print("  ✅ PASSED\n")
            
            # TEST 6: Create Multiple Bookmarks
            print("TEST 6: Create Multiple Bookmarks")
            print("-" * 70)
            bookmark2 = Bookmark.create(customer_id, listing_id_2)
            print(f"  Created second bookmark: ID={bookmark2.bookmark_id}, Listing={listing_id_2}")
            assert bookmark2.bookmark_id is not None
            print("  ✅ PASSED\n")
            
            # TEST 7: Get All Bookmarks for User
            print("TEST 7: Get All Bookmarks for User")
            print("-" * 70)
            user_bookmarks = Bookmark.get_by_user(customer_id)
            print(f"  Found {len(user_bookmarks)} bookmarks for user {customer_id}")
            assert len(user_bookmarks) == 2
            for bm in user_bookmarks:
                print(f"    - Bookmark ID={bm.bookmark_id}, Listing={bm.listing_id}")
            print("  ✅ PASSED\n")
            
            # TEST 8: Get Bookmarks with Service Details
            print("TEST 8: Get Bookmarks with Service Details (JOIN query)")
            print("-" * 70)
            details = Bookmark.get_with_service_details(customer_id)
            print(f"  Found {len(details)} bookmarks with details")
            assert len(details) == 2  # Only approved services
            for detail in details:
                print(f"    - {detail['title']} by {detail['business_name']} (${detail['price']})")
                assert 'title' in detail
                assert 'business_name' in detail
                assert 'price' in detail
            print("  ✅ PASSED\n")
            
            # TEST 9: Bookmark Pending Service (should work, but not show in details)
            print("TEST 9: Bookmark Pending Service")
            print("-" * 70)
            bookmark_pending = Bookmark.create(customer_id, listing_id_pending)
            print(f"  Created bookmark for pending service: ID={bookmark_pending.bookmark_id}")
            
            # Check total bookmarks (should be 3)
            all_bookmarks = Bookmark.get_by_user(customer_id)
            print(f"  Total bookmarks: {len(all_bookmarks)}")
            assert len(all_bookmarks) == 3
            
            # Check bookmarks with details (should still be 2 - only approved)
            details = Bookmark.get_with_service_details(customer_id)
            print(f"  Bookmarks with details (approved only): {len(details)}")
            assert len(details) == 2
            print("  ✅ PASSED\n")
            
            # TEST 10: Delete Bookmark by ID
            print("TEST 10: Delete Bookmark by ID")
            print("-" * 70)
            success = Bookmark.delete(bookmark.bookmark_id)
            print(f"  Deleted bookmark {bookmark.bookmark_id}: {success}")
            assert success == True
            
            # Verify deletion
            deleted = Bookmark.get_by_id(bookmark.bookmark_id)
            assert deleted is None
            print("  ✓ Bookmark successfully deleted")
            print("  ✅ PASSED\n")
            
            # TEST 11: Delete by User and Listing
            print("TEST 11: Delete by User and Listing")
            print("-" * 70)
            success = Bookmark.delete_by_user_and_listing(customer_id, listing_id_2)
            print(f"  Deleted bookmark for listing {listing_id_2}: {success}")
            assert success == True
            
            # Verify is_bookmarked is now False
            is_still_bookmarked = Bookmark.is_bookmarked(customer_id, listing_id_2)
            assert is_still_bookmarked == False
            print("  ✓ Bookmark successfully removed")
            print("  ✅ PASSED\n")
            
            # TEST 12: Delete Non-existent Bookmark
            print("TEST 12: Delete Non-existent Bookmark")
            print("-" * 70)
            success = Bookmark.delete(99999)
            print(f"  Delete non-existent bookmark: {success}")
            assert success == False
            print("  ✅ PASSED\n")
            
            # TEST 13: Serialization (to_dict)
            print("TEST 13: Serialization (to_dict)")
            print("-" * 70)
            remaining = Bookmark.get_by_user(customer_id)
            if remaining:
                bm_dict = remaining[0].to_dict()
                print(f"  Keys: {list(bm_dict.keys())}")
                assert 'bookmark_id' in bm_dict
                assert 'user_id' in bm_dict
                assert 'listing_id' in bm_dict
                assert 'created_at' in bm_dict
                print(f"  Sample: Bookmark {bm_dict['bookmark_id']} for listing {bm_dict['listing_id']}")
            print("  ✅ PASSED\n")
        
        print("=" * 70)
        print(" ✅ ALL TESTS PASSED (13/13)")
        print("=" * 70)
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        # Clean up temporary database
        os.close(db_fd)
        os.unlink(db_path)
        print(f"\n[CLEANUP] Removed temporary database: {db_path}")


if __name__ == '__main__':
    run_tests()
