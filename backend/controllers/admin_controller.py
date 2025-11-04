from flask import Blueprint, request, jsonify, current_app
from backend.db import get_db

admin_bp = Blueprint("admin_bp", __name__)

# -----------------------------
# List all users
# -----------------------------
@admin_bp.route("/admin/users", methods=["GET"])
def list_users():
    """
    List All Users
    ---
    tags:
      - Admin
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
        description: List of all users
        schema:
          type: array
          items:
            type: object
      401:
        description: Unauthorized
      403:
        description: Not authorized (admin only)
    """
    db = get_db()
    users = db.execute("SELECT * FROM Users").fetchall()
    return jsonify([dict(u) for u in users])

# -----------------------------
# Delete a user
# -----------------------------
@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """
    Delete a User
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: user_id
        in: path
        type: integer
        required: true
        description: ID of the user to delete
    responses:
      200:
        description: User deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: User not found
      401:
        description: Unauthorized
      403:
        description: Not authorized (admin only)
    """
    db = get_db()
    result = db.execute("DELETE FROM Users WHERE user_id = ?", (user_id,))
    db.commit()
    if result.rowcount == 0:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"message": f"User {user_id} deleted"})

# -----------------------------
# Delete a service listing
# -----------------------------
@admin_bp.route("/admin/services/<int:listing_id>", methods=["DELETE"])
def delete_service(listing_id):
    """
    Delete a Service Listing
    ---
    tags:
      - Admin
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
        description: ID of the listing to delete
    responses:
      200:
        description: Listing deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Listing not found
      401:
        description: Unauthorized
      403:
        description: Not authorized (admin only)
    """
    db = get_db()
    result = db.execute("DELETE FROM Listings WHERE listing_id = ?", (listing_id,))
    db.commit()
    if result.rowcount == 0:
        return jsonify({"error": "Listing not found"}), 404
    return jsonify({"message": f"Listing {listing_id} deleted"})

# -----------------------------
# Delete a review
# -----------------------------
@admin_bp.route("/admin/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    """
    Delete a Review
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
      - name: review_id
        in: path
        type: integer
        required: true
        description: ID of the review to delete
    responses:
      200:
        description: Review deleted successfully
        schema:
          type: object
          properties:
            message:
              type: string
      404:
        description: Review not found
      401:
        description: Unauthorized
      403:
        description: Not authorized (admin only)
    """
    db = get_db()
    result = db.execute("DELETE FROM Reviews WHERE review_id = ?", (review_id,))
    db.commit()
    if result.rowcount == 0:
        return jsonify({"error": "Review not found"}), 404
    return jsonify({"message": f"Review {review_id} deleted"})
