from flask import Blueprint, request, jsonify, current_app
from db import get_db

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
