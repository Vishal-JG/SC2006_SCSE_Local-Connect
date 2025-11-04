from flask import Blueprint, jsonify, current_app, request
from backend.db import get_db
import firebase_admin
from firebase_admin import auth, credentials

review_bp = Blueprint("review_bp", __name__)


def verify_token(token):
    """
    Verify Firebase ID token and return user_id.
    Returns: (user_id, error_response)
    """
    if not token:
        return None, jsonify({"error": "Missing token"}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        user_id = decoded_token["uid"]  # Firebase UID
        return user_id, None
    except Exception as e:
        return None, jsonify({"error": "Invalid or expired token"}), 401
# -----------------------------
# GET: All reviews for a service/listing
# -----------------------------
@review_bp.route("/services/<int:listing_id>/reviews", methods=["GET"])
def get_reviews(listing_id):
    """
    Get All Reviews for a Service
    ---
    tags:
      - Reviews
    parameters:
      - name: listing_id
        in: path
        type: integer
        required: true
        description: ID of the service
    responses:
      200:
        description: List of reviews
        schema:
          type: array
          items:
            type: object
            properties:
              review_id:
                type: integer
              rating:
                type: number
              comment:
                type: string
              created_at:
                type: string
              reviewer:
                type: string
    """
    db = get_db()
    print("Current config keys:", current_app.config.keys())
    reviews = db.execute("""
        SELECT r.review_id, r.rating, r.comment, r.created_at, u.display_name AS reviewer
        FROM Reviews r
        JOIN Users u ON r.user_id = u.user_id
        WHERE r.listing_id = ?
        ORDER BY r.created_at DESC
    """, (listing_id,)).fetchall()
    return jsonify([dict(r) for r in reviews]), 200


# -----------------------------
# POST: Add a new review
# -----------------------------
# Python Flask backend

@review_bp.route("/services/<int:listing_id>/reviews", methods=["POST"])
def add_review(listing_id):
    """
    Add a New Review
    ---
    tags:
      - Reviews
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
        description: ID of the service to review
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            booking_id:
              type: integer
              example: 1
            rating:
              type: number
              example: 5
            comment:
              type: string
              example: "Great service!"
    responses:
      201:
        description: Review added successfully
        schema:
          type: object
          properties:
            message:
              type: string
            review:
              type: object
      400:
        description: Missing required fields or invalid booking
      401:
        description: Unauthorized
      500:
        description: Server error
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    user_id, error_response = verify_token(token)
    if error_response:
        return error_response  # 401 Unauthorized if invalid token

    data = request.get_json()
    booking_id = data.get("booking_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not all([booking_id, rating]):
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db()

    booking = db.execute(
        "SELECT * FROM Bookings WHERE booking_id = ? AND user_id = ? AND listing_id = ?",
        (booking_id, user_id, listing_id)
    ).fetchone()
    if not booking:
        return jsonify({"error": "Invalid booking for this user or service"}), 400

    try:
        cursor = db.execute(
            """
            INSERT INTO Reviews (booking_id, user_id, listing_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)
            """,
            (booking_id, user_id, listing_id, rating, comment)
        )
        db.commit()

        review_id = cursor.lastrowid
        review = db.execute(
            """
            SELECT r.review_id, r.rating, r.comment, r.created_at,
                   u.display_name AS reviewer, r.user_id
            FROM Reviews r
            JOIN Users u ON r.user_id = u.user_id
            WHERE r.review_id = ?
            """,
            (review_id,)
        ).fetchone()

        return jsonify(dict(review)), 201

    except Exception as e:
        current_app.logger.error(f"Error adding review: {e}")
        return jsonify({"error": "Failed to add review"}), 500

# -----------------------------
# PUT: Update a review
# -----------------------------
@review_bp.route("/reviews/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    """
    Update a Review
    ---
    tags:
      - Reviews
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
        description: ID of the review to update
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            rating:
              type: number
              example: 4
            comment:
              type: string
              example: "Updated review comment"
    responses:
      200:
        description: Review updated successfully
        schema:
          type: object
          properties:
            message:
              type: string
      400:
        description: Nothing to update
      401:
        description: Unauthorized
      404:
        description: Review not found
      500:
        description: Server error
    """
    data = request.get_json()
    rating = data.get("rating")
    comment = data.get("comment")

    if rating is None and comment is None:
        return jsonify({"error": "Nothing to update"}), 400

    db = get_db()
    review = db.execute("SELECT * FROM Reviews WHERE review_id = ?", (review_id,)).fetchone()
    if review is None:
        return jsonify({"error": "Review not found"}), 404

    # Build update dynamically based on provided fields
    updates = []
    params = []
    if rating is not None:
        updates.append("rating = ?")
        params.append(rating)
    if comment is not None:
        updates.append("comment = ?")
        params.append(comment)
    params.append(review_id)

    db.execute(f"UPDATE Reviews SET {', '.join(updates)} WHERE review_id = ?", tuple(params))
    db.commit()

    updated_review = db.execute("SELECT * FROM Reviews WHERE review_id = ?", (review_id,)).fetchone()
    return jsonify({"message": "Review updated successfully", "review": dict(updated_review)}), 200


# -----------------------------
# DELETE: Remove a review
# -----------------------------
@review_bp.route("/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    """
    Delete a Review
    ---
    tags:
      - Reviews
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
    """
    db = get_db()
    result = db.execute("DELETE FROM Reviews WHERE review_id = ?", (review_id,))
    db.commit()

    if result.rowcount == 0:
        return jsonify({"error": "Review not found"}), 404

    return jsonify({"message": "Review deleted successfully"}), 200

# -----------------------------
# Get Average Ratings for Listings
# -----------------------------
@review_bp.route("/reviews/averages", methods=["GET"])
def get_average_ratings():
    """
    Get Average Ratings for All Listings
    ---
    tags:
      - Reviews
    responses:
      200:
        description: Average ratings per listing
        schema:
          type: array
          items:
            type: object
            properties:
              listing_id:
                type: integer
              avg_rating:
                type: number
              review_count:
                type: integer
    """
    """
    Returns average rating per listing_id for all listings that have reviews.
    Example response:
    [
      {"listing_id": 1, "avg_rating": 4.8, "review_count": 5},
      {"listing_id": 3, "avg_rating": 4.2, "review_count": 2}
    ]
    """
    db = get_db()
    rows = db.execute("""
        SELECT
            listing_id,
            ROUND(AVG(rating), 1) AS avg_rating,
            COUNT(*) AS review_count
        FROM Reviews
        GROUP BY listing_id
    """).fetchall()

    return jsonify([dict(r) for r in rows]), 200
# -----------------------------
# Get All Reviews for Specific Listing
# -----------------------------
@review_bp.route("/services/<int:listing_id>/all-reviews", methods=["GET"])
def get_all_reviews(listing_id):
    """
    Fetch all reviews for a given service (listing), optionally including reviewer name.
    """
    db = get_db()
    
    # Fetch all reviews for this listing
    reviews = db.execute("""
        SELECT r.review_id,
               r.rating,
               r.comment,
               r.created_at,
               u.display_name AS reviewer
        FROM Reviews r
        LEFT JOIN Users u ON r.user_id = u.user_id
        WHERE r.listing_id = ?
        ORDER BY r.created_at DESC
    """, (listing_id,)).fetchall()
    
    # Convert sqlite Row objects to dictionary
    reviews_list = [dict(r) for r in reviews]
    
    return jsonify(reviews_list), 200
