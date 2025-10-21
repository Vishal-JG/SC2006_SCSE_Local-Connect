"""
Bookmark Controller
Handles API endpoints for bookmark management.
Customers can bookmark/unbookmark services.
"""
from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import auth
from backend.models.bookmark import Bookmark
from backend.models.user import User


bookmark_bp = Blueprint('bookmark', __name__)


def verify_token():
    """
    Extract and verify Firebase token from Authorization header.
    
    Returns:
        str: The user_id from the verified token
        
    Raises:
        ValueError: If token is missing or invalid
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        raise ValueError("Missing or invalid Authorization header")
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")


def get_user_role(user_id):
    """
    Get the role of a user from the database.
    
    Returns:
        str: The user's role (admin, provider, customer)
        
    Raises:
        ValueError: If user not found
    """
    user = User.get_by_id(user_id)
    if not user:
        raise ValueError("User not found")
    return user.role


# ---------------------------
# Customer Bookmark Routes
# ---------------------------

@bookmark_bp.route('/bookmarks', methods=['GET'])
def get_bookmarks():
    """
    Get all bookmarks for the authenticated user with service details.
    
    Returns:
        JSON response with list of bookmarked services
    """
    try:
        # Verify authentication
        user_id = verify_token()
        
        # Get user role (optional - could allow all roles to bookmark)
        role = get_user_role(user_id)
        
        # Get bookmarks with service details
        bookmarks = Bookmark.get_with_service_details(user_id)
        
        return jsonify({
            'success': True,
            'bookmarks': bookmarks,
            'count': len(bookmarks)
        }), 200
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bookmark_bp.route('/bookmarks', methods=['POST'])
def add_bookmark():
    """
    Add a bookmark for a service.
    
    Request body:
        {
            "listing_id": int
        }
    
    Returns:
        JSON response with created bookmark
    """
    try:
        # Verify authentication
        user_id = verify_token()
        
        # Get request data
        data = request.get_json()
        listing_id = data.get('listing_id')
        
        if not listing_id:
            return jsonify({'success': False, 'error': 'listing_id is required'}), 400
        
        # Create bookmark
        bookmark = Bookmark.create(user_id, listing_id)
        
        return jsonify({
            'success': True,
            'message': 'Service bookmarked successfully',
            'bookmark': bookmark.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bookmark_bp.route('/bookmarks/<int:bookmark_id>', methods=['DELETE'])
def remove_bookmark(bookmark_id):
    """
    Remove a bookmark by bookmark_id.
    Only the owner can remove their bookmark.
    
    Returns:
        JSON response confirming deletion
    """
    try:
        # Verify authentication
        user_id = verify_token()
        
        # Check if bookmark exists and belongs to user
        bookmark = Bookmark.get_by_id(bookmark_id)
        if not bookmark:
            return jsonify({'success': False, 'error': 'Bookmark not found'}), 404
        
        if bookmark.user_id != user_id:
            return jsonify({'success': False, 'error': 'Unauthorized to delete this bookmark'}), 403
        
        # Delete bookmark
        success = Bookmark.delete(bookmark_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Bookmark removed successfully'
            }), 200
        else:
            return jsonify({'success': False, 'error': 'Failed to remove bookmark'}), 500
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bookmark_bp.route('/bookmarks/listing/<int:listing_id>', methods=['DELETE'])
def remove_bookmark_by_listing(listing_id):
    """
    Remove a bookmark by listing_id (alternative endpoint for "unbookmark" action).
    This is useful when you know the listing_id but not the bookmark_id.
    
    Returns:
        JSON response confirming deletion
    """
    try:
        # Verify authentication
        user_id = verify_token()
        
        # Delete bookmark
        success = Bookmark.delete_by_user_and_listing(user_id, listing_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Bookmark removed successfully'
            }), 200
        else:
            return jsonify({'success': False, 'error': 'Bookmark not found'}), 404
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@bookmark_bp.route('/bookmarks/check/<int:listing_id>', methods=['GET'])
def check_bookmark(listing_id):
    """
    Check if a service is bookmarked by the authenticated user.
    Useful for UI to show bookmark status.
    
    Returns:
        JSON response with bookmark status
    """
    try:
        # Verify authentication
        user_id = verify_token()
        
        # Check if bookmarked
        is_bookmarked = Bookmark.is_bookmarked(user_id, listing_id)
        
        return jsonify({
            'success': True,
            'is_bookmarked': is_bookmarked,
            'listing_id': listing_id
        }), 200
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
