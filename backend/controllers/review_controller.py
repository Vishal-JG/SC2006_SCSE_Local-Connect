import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Now you can import
from models.review import Review
from app import db
from flask import Blueprint, request, jsonify


review_bp = Blueprint("review_bp", __name__)

@review_bp.route("/services/<int:listing_id>/reviews", methods=["GET"])
def get_reviews(listing_id):
    reviews = Review.query.filter_by(serviceID=listing_id).all()
    return jsonify([r.to_dict() for r in reviews])

@review_bp.route("/services/<int:listing_id>/reviews", methods=["POST"])
def add_review(listing_id):
    data = request.get_json()
    review = Review(
        serviceID=listing_id,
        consumerID=data["consumerID"],
        rating=data["rating"],
        comment=data.get("comment", "")
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({"message": "Review added", "review": review.to_dict()})

# DELETE review
@review_bp.route("/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"error": "Review not found"}), 404
    db.session.delete(review)
    db.session.commit()
    return jsonify({"message": "Review deleted"})
