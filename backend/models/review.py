from app import db
from datetime import datetime

class Review(db.Model):
    reviewID = db.Column(db.Integer, primary_key=True)
    serviceID = db.Column(db.Integer, nullable=False)
    consumerID = db.Column(db.Integer, nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "reviewID": self.reviewID,
            "serviceID": self.serviceID,
            "consumerID": self.consumerID,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def __repr__(self):
        return f"<Review {self.reviewID} - Service {self.serviceID} by Consumer {self.consumerID}>"
