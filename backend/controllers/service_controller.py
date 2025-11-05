from flask import Blueprint, request, jsonify
from backend.db import get_db
from backend.models.service import Service
from backend.models.provider import Provider
import firebase_admin

service_bp = Blueprint("service_bp", __name__)

def verify_token():
    """Helper to verify Firebase token and return user_id."""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None, jsonify({'error': 'Authorization header missing'}), 401
    
    token = auth_header.split('Bearer ')[-1]
    try:
        decoded_token = firebase_admin.auth.verify_id_token(token)
        return decoded_token['uid'], None, None
    except Exception as e:
        return None, jsonify({'error': 'Invalid token'}), 401


def get_user_role(user_id):
    """Get the role of a user from the database."""
    db = get_db()
    row = db.execute("SELECT role FROM Users WHERE user_id = ?", (user_id,)).fetchone()
    return row['role'] if row else None


# =====================
# Provider routes
# =====================

@service_bp.route("/provider/services", methods=["POST"])
def provider_add_service():
    """
    Provider Add New Service
    ---
    tags:
      - Provider Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - title
            - price
          properties:
            title:
              type: string
              example: "Private Chef Service"
            description:
              type: string
              example: "Gourmet meals prepared in your home"
            price:
              type: number
              example: 150.00
            category_id:
              type: integer
              example: 1
    responses:
      201:
        description: Service created successfully
        schema:
          type: object
          properties:
            message:
              type: string
            service:
              type: object
      400:
        description: Missing required fields
      403:
        description: User is not a provider
      404:
        description: Provider profile not found
      500:
        description: Server error
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    # Verify user is a provider
    role = get_user_role(user_id)
    if role != 'provider':
        return jsonify({'error': 'Only providers can add services'}), 403
    
    # Get provider_id from user_id
    provider = Provider.get_by_user_id(user_id)
    if not provider:
        return jsonify({'error': 'Provider profile not found'}), 404
    
    data = request.get_json() or {}
    title = data.get('title')
    price = data.get('price')
    description = data.get('description')
    category_id = data.get('category_id')
    image_url = data.get('image_url')
    location = data.get('location')
    latitude = data.get('latitude')
    longitude = data.get('longitude')
    
    if not title or price is None:
        return jsonify({'error': 'title and price are required'}), 400
    
    try:
        service = Service.create(
            provider_id=provider.provider_id,
            title=title,
            price=price,
            description=description,
            category_id=category_id,
            image_url=image_url,
            location=location,
            latitude=latitude,
            longitude=longitude,
            status='pending'  # New services start as pending
        )
        return jsonify({'message': 'Service created', 'service': service.to_dict()}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@service_bp.route("/provider/services", methods=["GET"])
def provider_list_services():
    """
    Provider List Own Services
    ---
    tags:
      - Provider Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
    responses:
      200:
        description: List of provider's services
        schema:
          type: array
          items:
            type: object
            properties:
              listing_id:
                type: integer
              title:
                type: string
              price:
                type: number
              status:
                type: string
      403:
        description: User is not a provider
      404:
        description: Provider profile not found
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'provider':
        return jsonify({'error': 'Only providers can access this endpoint'}), 403
    
    provider = Provider.get_by_user_id(user_id)
    if not provider:
        return jsonify({'error': 'Provider profile not found'}), 404
    
    services = Service.get_by_provider(provider.provider_id)
    return jsonify([s.to_dict() for s in services])


@service_bp.route("/provider/services/<int:listing_id>", methods=["PUT", "PATCH"])
def provider_update_service(listing_id):
    """
    Provider Update Own Service
    ---
    tags:
      - Provider Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service to update
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            title:
              type: string
            description:
              type: string
            price:
              type: number
            category_id:
              type: integer
    responses:
      200:
        description: Service updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
            service:
              type: object
      403:
        description: Not authorized or not a provider
      404:
        description: Service not found
      500:
        description: Server error
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'provider':
        return jsonify({'error': 'Only providers can update services'}), 403
    
    provider = Provider.get_by_user_id(user_id)
    if not provider:
        return jsonify({'error': 'Provider profile not found'}), 404
    
    # Verify the service belongs to this provider
    service = Service.get_by_id(listing_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    if service.provider_id != provider.provider_id:
        return jsonify({'error': 'You can only update your own services'}), 403
    
    data = request.get_json() or {}

    # Handle status update
    # Only allow provider to mark service as "completed"
    new_status = data.get('status')
    if new_status:
        if new_status != "completed":
            return jsonify({'error': 'Providers can only mark services as completed'}), 403
        
        # Update only the status field
        updated_service = Service.update(
            listing_id=listing_id,
            status="completed"
        )
        
        if updated_service:
            return jsonify({
                'message': f'Service "{service.title}" marked as completed',
                'service': updated_service.to_dict()
            })
        return jsonify({'error': 'Failed to update service status'}), 500
    
    updated_service = Service.update(
        listing_id=listing_id,
        title=data.get('title'),
        description=data.get('description'),
        price=data.get('price'),
        category_id=data.get('category_id'),
        image_url=data.get('image_url') # to accept and forward image URL
        # Note: providers cannot change status themselves # CHANGED ABOVE
    )
    
    if updated_service:
        return jsonify({'message': 'Service updated', 'service': updated_service.to_dict()})
    return jsonify({'error': 'Failed to update service'}), 500


@service_bp.route("/provider/services/<int:listing_id>", methods=["DELETE"])
def provider_delete_service(listing_id):
    """
    Provider Delete Own Service
    ---
    tags:
      - Provider Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service to delete
    responses:
      200:
        description: Service deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Service deleted"
      403:
        description: Not authorized or not a provider
      404:
        description: Service or provider not found
      500:
        description: Failed to delete service
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'provider':
        return jsonify({'error': 'Only providers can delete services'}), 403
    
    provider = Provider.get_by_user_id(user_id)
    if not provider:
        return jsonify({'error': 'Provider profile not found'}), 404
    
    service = Service.get_by_id(listing_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    if service.provider_id != provider.provider_id:
        return jsonify({'error': 'You can only delete your own services'}), 403
    
    if Service.delete(listing_id):
        return jsonify({'message': 'Service deleted'})
    return jsonify({'error': 'Failed to delete service'}), 500


# =====================
# Consumer routes
# =====================

@service_bp.route("/services", methods=["GET"])
def list_services():
    """
    List All Approved Services (Consumer View)
    ---
    tags:
      - Consumer Services
    parameters:
      - name: status
        in: query
        type: string
        required: false
        default: approved
        description: Filter services by status
    responses:
      200:
        description: List of services
        schema:
          type: array
          items:
            type: object
            properties:
              listing_id:
                type: integer
              provider_id:
                type: integer
              title:
                type: string
              description:
                type: string
              price:
                type: number
              category_id:
                type: integer
              status:
                type: string
              created_at:
                type: string
    """
    # Optional: verify token if you want to restrict to logged-in users
    # For now, make it public or only show approved services
    status_filter = request.args.get('status', 'approved')
    services = Service.list_all(status=status_filter)
    return jsonify([s.to_dict() for s in services])


@service_bp.route("/services/<int:listing_id>", methods=["GET"])
def get_service(listing_id):
    """
    Get Service Details (Consumer View)
    ---
    tags:
      - Consumer Services
    parameters:
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service to retrieve
    responses:
      200:
        description: Service details
        schema:
          type: object
          properties:
            listing_id:
              type: integer
            provider_id:
              type: integer
            title:
              type: string
            description:
              type: string
            price:
              type: number
            category_id:
              type: integer
            status:
              type: string
            created_at:
              type: string
      404:
        description: Service not found
    """
    service = Service.get_by_id(listing_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    return jsonify(service.to_dict())


# =====================
# Admin routes
# =====================

@service_bp.route("/admin/services/<int:listing_id>", methods=["DELETE"])
def admin_delete_service(listing_id):
    """
    Admin Delete Any Service
    ---
    tags:
      - Admin Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service to delete
    responses:
      200:
        description: Service deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      403:
        description: Not authorized (admin only)
      404:
        description: Service not found
      500:
        description: Failed to delete service
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'admin':
        return jsonify({'error': 'Only admins can delete any service'}), 403
    
    service = Service.get_by_id(listing_id)
    if not service:
        return jsonify({'error': 'Service not found'}), 404
    
    if Service.delete(listing_id):
        return jsonify({'message': f'Service {listing_id} deleted by admin'})
    return jsonify({'error': 'Failed to delete service'}), 500


@service_bp.route("/admin/services/<int:listing_id>/approve", methods=["POST"])
def admin_approve_service(listing_id):
    """
    Admin Approve Pending Service
    ---
    tags:
      - Admin Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service to approve
    responses:
      200:
        description: Service approved successfully
        schema:
          type: object
          properties:
            message:
              type: string
            service:
              type: object
      403:
        description: Not authorized (admin only)
      404:
        description: Service not found
      500:
        description: Failed to approve service
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'admin':
        return jsonify({'error': 'Only admins can approve services'}), 403
    
    service = Service.update(listing_id, status='approved')
    if service:
        return jsonify({'message': 'Service approved', 'service': service.to_dict()})
    return jsonify({'error': 'Service not found'}), 404


@service_bp.route("/admin/services/<int:listing_id>/reject", methods=["POST"])
def admin_reject_service(listing_id):
    """
    Admin Reject Pending Service
    ---
    tags:
      - Admin Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service to reject
    responses:
      200:
        description: Service rejected successfully
        schema:
          type: object
          properties:
            message:
              type: string
            service:
              type: object
      403:
        description: Not authorized (admin only)
      404:
        description: Service not found
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'admin':
        return jsonify({'error': 'Only admins can reject services'}), 403
    
    service = Service.update(listing_id, status='rejected')
    if service:
        return jsonify({'message': 'Service rejected', 'service': service.to_dict()})
    return jsonify({'error': 'Service not found'}), 404


@service_bp.route("/admin/services", methods=["GET"])
def admin_list_all_services():
    """
    Admin List All Services (All Statuses)
    ---
    tags:
      - Admin Services
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: status
        in: query
        type: string
        required: false
        description: Filter by status (pending, approved, rejected)
    responses:
      200:
        description: List of all services
        schema:
          type: array
          items:
            type: object
            properties:
              listing_id:
                type: integer
              provider_id:
                type: integer
              title:
                type: string
              description:
                type: string
              price:
                type: number
              category_id:
                type: integer
              status:
                type: string
              created_at:
                type: string
      403:
        description: Not authorized (admin only)
    """
    user_id, error_response, status_code = verify_token()
    if error_response:
        return error_response, status_code
    
    role = get_user_role(user_id)
    if role != 'admin':
        return jsonify({'error': 'Only admins can view all services'}), 403
    
    status_filter = request.args.get('status')  # optional filter
    services = Service.list_all(status=status_filter)
    return jsonify([s.to_dict() for s in services])
