"""
Booking Controller
Handles all booking-related API endpoints and logic.
"""
from flask import Blueprint, request, jsonify, current_app
from backend.models.booking import Booking
from backend.models.user import User
import firebase_admin
import traceback

# Create a Blueprint for booking routes
booking_bp = Blueprint('booking', __name__)


def verify_token():
    """
    Extract and verify Firebase token from Authorization header.
    
    Returns:
        tuple: (user_id, error_response, status_code)
    """
    auth_header = request.headers.get('Authorization')
    print("verify_token() Authorization header:", auth_header)
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, jsonify({'success': False, 'error': 'Authorization header missing'}), 401
    
    token = auth_header.split('Bearer ')[1]
    try:
        decoded_token = firebase_admin.auth.verify_id_token(token)
        return decoded_token['uid'], None, None
    except Exception as e:
        return None, jsonify({'success': False, 'error': f'Invalid token: {str(e)}'}), 401


def get_user_role(user_id):
    """
    Get the role of a user from the database.
    
    Returns:
        str: The user's role (admin, provider, customer)
    """
    
    #Debug
    print(f"Looking up user with id: {user_id}")
    user = User.get_by_id(user_id)
    print(f"DB query returned: {user}")

    if not user:
        raise ValueError("User not found")
    user = User.get_by_id(user_id)
    return user.role if user else None

@booking_bp.route('/bookings', methods=['POST'])
#@login_required
def create_booking():
    print("=== HEADERS RECEIVED ===")
    for k, v in request.headers:
        print(f"{k}: {v}")
    """
    Create a new booking.
    
    Request body:
    {
        "listing_id": 123,
        "booking_date": "2023-12-25T14:30:00"
    }
    
    Returns:
        201: Booking created successfully
        400: Bad request (invalid parameters)
        401: Unauthorized
        500: Server error
    """
    try:
        # Verify authentication
        user_id, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        data = request.get_json()
        
        # Validate required fields
        if not data or 'listing_id' not in data or 'booking_date' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required fields: listing_id, booking_date'
            }), 400
            
        listing_id = data['listing_id']
        booking_date = data['booking_date']
        
        # Create the booking
        booking = Booking.create(
            user_id=user_id,
            listing_id=listing_id,
            booking_date=booking_date
        )
        
        return jsonify({
            'success': True,
            'message': 'Booking created successfully',
            'booking': booking.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error creating booking: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'An error occurred while creating the booking'
        }), 500


@booking_bp.route('/bookings', methods=['GET'])
#@login_required
def get_user_bookings():
    """
    Get bookings for the current user.
    
    Query parameters:
    - status: Filter by status (optional)
    - role: 'customer' or 'provider' (default: 'customer')
    
    Returns:
        200: List of bookings
        401: Unauthorized
        500: Server error
    """
    try:
        # Verify authentication
        user_id, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        status = request.args.get('status')
        role = request.args.get('role', 'customer')
        
        if role == 'provider':
            # Get provider_id first
            from backend.models.provider import Provider
            provider = Provider.get_by_user_id(user_id)
            
            if not provider:
                return jsonify({
                    'success': False,
                    'error': 'User is not a service provider'
                }), 403
                
            # get_by_provider now returns dicts with service details
            bookings = Booking.get_by_provider(provider.provider_id, status)
        else:
            # Default to customer role - returns Booking objects
            bookings = Booking.get_by_user(user_id, status)
            bookings = [booking.to_dict() for booking in bookings]
            
        return jsonify({
            'success': True,
            'bookings': bookings  # Already dicts for provider, converted for customer
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching bookings: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'An error occurred while fetching bookings'
        }), 500


@booking_bp.route('/bookings/<int:booking_id>', methods=['GET'])
#@login_required
def get_booking_details(booking_id):
    """
    Get detailed information about a specific booking.
    Includes service and provider details.
    
    URL parameters:
    - booking_id: ID of the booking to retrieve
    
    Returns:
        200: Booking details
        401: Unauthorized
        403: Not authorized to view this booking
        404: Booking not found
        500: Server error
    """
    try:
        # Verify authentication
        user_id, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        # Get the booking with full details
        booking_details = Booking.get_with_details(booking_id)
        
        if not booking_details:
            return jsonify({
                'success': False,
                'error': 'Booking not found'
            }), 404
            
        # Check authorization (must be either the customer or the service provider)
        # Get the provider's user_id from the booking details
        from backend.models.provider import Provider
        provider = Provider.get_by_listing_id(booking_details['listing_id'])
        
        if not provider or (booking_details['user_id'] != user_id and provider.user_id != user_id):
            return jsonify({
                'success': False,
                'error': 'Not authorized to view this booking'
            }), 403
            
        return jsonify({
            'success': True,
            'booking': booking_details
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching booking details: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'An error occurred while fetching booking details'
        }), 500


@booking_bp.route('/bookings/<int:booking_id>/status', methods=['PUT'])
#@login_required
def update_booking_status(booking_id):
    """
    Update the status of a booking.
    
    URL parameters:
    - booking_id: ID of the booking to update
    
    Request body:
    {
        "status": "confirmed" | "cancelled" | "completed"
    }
    
    Returns:
        200: Status updated successfully
        400: Bad request (invalid status)
        401: Unauthorized
        403: Not authorized to update this booking
        404: Booking not found
        500: Server error
    """
    try:
        # Verify authentication
        user_id, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        data = request.get_json()
        
        # Validate required fields
        if not data or 'status' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: status'
            }), 400
            
        new_status = data['status']
        
        # Get the current booking
        booking = Booking.get_by_id(booking_id)
        
        if not booking:
            return jsonify({
                'success': False,
                'error': 'Booking not found'
            }), 404
            
        # Check authorization - need to determine if user is the provider for this booking's listing
        from backend.models.provider import Provider
        from backend.models.service import Service
        from backend.db import get_db
        
        # Get listing to find its provider_id
        listing = Service.get_by_id(booking.listing_id)
        if not listing:
            return jsonify({
                'success': False,
                'error': 'Associated service not found'
            }), 404
        
        # Get provider profile for current user
        provider = Provider.get_by_user_id(user_id)
        is_provider_for_this_listing = (provider and provider.provider_id == listing.provider_id)
        
        # Authorization rules:
        # 1. Customers can only cancel their own bookings
        # 2. Providers can confirm, cancel, or complete bookings for their services
        if booking.user_id == user_id:
            # Customer can only cancel
            if new_status != Booking.STATUS_CANCELLED:
                return jsonify({
                    'success': False,
                    'error': 'Customers can only cancel bookings'
                }), 403
                
        elif is_provider_for_this_listing:
            # Provider can confirm, cancel, or complete
            if new_status not in [Booking.STATUS_CONFIRMED, Booking.STATUS_CANCELLED, Booking.STATUS_COMPLETED]:
                return jsonify({
                    'success': False,
                    'error': 'Invalid status transition for providers'
                }), 400
                
        else:
            # Neither the customer nor the provider
            return jsonify({
                'success': False,
                'error': 'Not authorized to update this booking'
            }), 403
            
        # Update booking status
        updated_booking = Booking.update_status(booking_id, new_status)
        
        return jsonify({
            'success': True,
            'message': f'Booking status updated to {new_status}',
            'booking': updated_booking.to_dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
        
    except Exception as e:
        current_app.logger.error(f"Error updating booking status: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'An error occurred while updating booking status'
        }), 500


@booking_bp.route('/bookings/<int:booking_id>', methods=['DELETE'])
#@login_required
def delete_booking(booking_id):
    """
    Delete a booking.
    Only pending bookings can be deleted, and only by the customer who created them.
    
    URL parameters:
    - booking_id: ID of the booking to delete
    
    Returns:
        200: Booking deleted successfully
        401: Unauthorized
        403: Not authorized to delete this booking
        404: Booking not found or not eligible for deletion
        500: Server error
    """
    try:
        # Verify authentication
        user_id, error_response, status_code = verify_token()
        if error_response:
            return error_response, status_code
        
        # Get the current booking
        booking = Booking.get_by_id(booking_id)
        
        if not booking:
            return jsonify({
                'success': False,
                'error': 'Booking not found'
            }), 404
            
        # Only the customer who created the booking can delete it
        if booking.user_id != user_id:
            return jsonify({
                'success': False,
                'error': 'Not authorized to delete this booking'
            }), 403
            
        # Try to delete the booking (will only work if it's pending)
        success = Booking.delete(booking_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Booking cannot be deleted. Only pending bookings can be deleted.'
            }), 400
            
        return jsonify({
            'success': True,
            'message': 'Booking deleted successfully'
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error deleting booking: {e}")
        current_app.logger.error(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': 'An error occurred while deleting the booking'
        }), 500
