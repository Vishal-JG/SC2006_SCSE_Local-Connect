from flask import Blueprint, request, jsonify, current_app
from db import get_db

review_bp = Blueprint("review_bp", __name__)

# -----------------------------
# GET: All reviews for a service/listing
# -----------------------------
@review_bp.route("/services/<int:listing_id>/reviews", methods=["GET"])
def get_reviews(listing_id):
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
@review_bp.route("/services/<int:listing_id>/reviews", methods=["POST"])
def add_review(listing_id):
    data = request.get_json()
    user_id = data.get("user_id")
    booking_id = data.get("booking_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    if not all([user_id, booking_id, rating]):
        return jsonify({"error": "Missing required fields"}), 400

    db = get_db()
    db.execute("""
        INSERT INTO Reviews (booking_id, user_id, listing_id, rating, comment)
        VALUES (?, ?, ?, ?, ?)
    """, (booking_id, user_id, listing_id, rating, comment))
    db.commit()

    return jsonify({"message": "Review added successfully"}), 201


# -----------------------------
# PUT: Update a review
# -----------------------------
@review_bp.route("/reviews/<int:review_id>", methods=["PUT"])
def update_review(review_id):
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
    db = get_db()
    result = db.execute("DELETE FROM Reviews WHERE review_id = ?", (review_id,))
    db.commit()

    if result.rowcount == 0:
        return jsonify({"error": "Review not found"}), 404

    return jsonify({"message": "Review deleted successfully"}), 200
