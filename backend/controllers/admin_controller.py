from flask import Blueprint, request, jsonify
from app import db
from models.review import Review
from models.user import User

admin_bp = Blueprint("admin_bp", __name__)

## Only admin should access (add @jwt_required() when ready)
@admin_bp.route("/admin/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify([user.to_dict() for user in users])

@admin_bp.route("/admin/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user_id} deleted"})

@admin_bp.route("/admin/services/<int:listing_id>", methods=["DELETE"])
def delete_service(listing_id):
    listing = ServiceListing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
    db.session.delete(listing)
    db.session.commit()
    return jsonify({"message": f"Listing {listing_id} deleted"})

@admin_bp.route("/admin/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": f"Review {review_id} deleted"})