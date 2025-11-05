from flask import Blueprint, request, jsonify

chatbot_bp = Blueprint("chatbot_bp", __name__)

# Simple rule-based responses (Limited by only replying to first keyword)
FAQ_RESPONSES = {
    # General info
    "hours": "Our platform is available 24/7 online. However, support hours are 9am to 6pm, Monday to Friday.",
    "location": "We are based in Singapore, but our platform connects you with local businesses and freelancers across all neighbourhoods.",
    "contact": "You can reach our support team via the Contact page or email us at support@localconnect.sg.",
    "about": "We help customers discover nearby small businesses and freelancers, such as tutors, handymen, babysitters, and more. Local businesses can also create a page to attract new customers.",
    
    # For customers
    "find business": "To find local businesses, go to the 'Explore' section of our site or use the search bar to look for what you need (e.g., 'gardener near me').",
    "how to find": "Simply type what service or business you’re looking for in the search bar — for example, 'home tutor' or 'flower shop'.",
    "nearby": "Our system can automatically suggest businesses near your location if you allow location access.",
    "recommendations": "We show you verified local businesses with good reviews from your area.",

    # For businesses / freelancers
    "register": "You can register your business by signing up and creating a profile page under 'For Businesses'. It only takes a few minutes.",
    "how to register": "Visit the 'Join as a Business' page and fill in your details. Once approved, your page will be visible to customers searching nearby.",
    "set up page": "After signing up, you can add your logo, description, photos, and contact info on your business page.",
    "promote": "We offer free listings and optional featured promotions to increase your visibility to local customers.",
    "freelancer": "Yes! Freelancers such as tutors, gardeners, babysitters, and home service providers can also sign up and create a listing.",

    # Technical / account
    "login": "To log in, click the 'Login' button at the top right of the homepage.",
    "forgot password": "You can reset your password by clicking 'Forgot Password' on the login page.",
    "delete account": "If you wish to delete your account, please contact our support team at support@localconnect.sg.",

    # Policies / safety
    "privacy": "We take your privacy seriously. You can read our full Privacy Policy on the website.",
    "safety": "All businesses are encouraged to verify their details. Customers should always review profiles and ratings before booking.",
    "reviews": "You can leave a review on a business profile after using their services to help others make informed choices.",

    # Default
    "default": "I'm sorry, I didn't quite get that. Could you please rephrase your question or ask about finding or registering a business?"
}


@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    """
    Chatbot FAQ Response
    ---
    tags:
      - Chatbot
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            message:
              type: string
              example: "How do I find a business?"
    responses:
      200:
        description: Chatbot response
        schema:
          type: object
          properties:
            reply:
              type: string
    """
    data = request.json
    user_msg = data.get("message", "").lower()
    
    # Basic keyword matching
    response = FAQ_RESPONSES["default"]
    for keyword, reply in FAQ_RESPONSES.items():
        if keyword in user_msg:
            response = reply
            break

    return jsonify({"reply": response})
