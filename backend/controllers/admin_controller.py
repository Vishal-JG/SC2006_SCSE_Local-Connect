from flask import Blueprint, request, jsonify, current_app
from backend.db import get_db

admin_bp = Blueprint("admin_bp", __name__)

# -----------------------------
# List all users
# -----------------------------
@admin_bp.route("/admin/users", methods=["GET"])
def list_users():
    db = get_db()
    users = db.execute("SELECT * FROM Users").fetchall()
    return jsonify([dict(u) for u in users])

# -----------------------------
# Delete a user
# -----------------------------
@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
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
    db = get_db()
    result = db.execute("DELETE FROM Reviews WHERE review_id = ?", (review_id,))
    db.commit()
    if result.rowcount == 0:
        return jsonify({"error": "Review not found"}), 404
    return jsonify({"message": f"Review {review_id} deleted"})

# -----------------------------
# GET all reviews
# -----------------------------
@admin_bp.route("/admin/reviews", methods=["GET"])
def get_all_reviews():
    db = get_db()
    reviews = db.execute("""
        SELECT r.review_id AS id, u.display_name AS reviewer, l.title AS service, r.comment, r.rating
        FROM Reviews r
        JOIN Users u ON r.user_id = u.user_id
        JOIN Listings l ON r.listing_id = l.listing_id
    """).fetchall()
    return jsonify([dict(r) for r in reviews])

# -----------------------------
# GET all existing listings (approved)
# -----------------------------
@admin_bp.route("/admin/services/existing", methods=["GET"])
def get_existing_listings():
    db = get_db()
    listings = db.execute("""
        SELECT * FROM Listings WHERE status = 'approved'
    """).fetchall()
    return jsonify([dict(l) for l in listings])

# -----------------------------
# GET all pending listings
# -----------------------------
@admin_bp.route("/admin/services/pending", methods=["GET"])
def get_pending_listings():
    db = get_db()
    listings = db.execute("""
        SELECT * FROM Listings WHERE status = 'pending'
    """).fetchall()
    return jsonify([dict(l) for l in listings])