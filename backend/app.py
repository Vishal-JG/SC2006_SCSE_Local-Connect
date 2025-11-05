import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger
from backend.controllers.external_api_controller import external_bp #import external api
from backend.controllers.review_controller import review_bp
from backend.controllers.admin_controller import admin_bp
from backend.controllers.chatbot_controller import chatbot_bp
from backend.controllers.service_controller import service_bp
from backend.controllers.bookmark_controller import bookmark_bp
from backend.controllers.booking_controller import booking_bp
from backend.models.user import User
from backend.db import get_db
import os

from backend.db import init_app, init_db, seed_db_command # import db initializer and init function
import time
from dotenv import load_dotenv

load_dotenv()

key_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

print("Firebase key_path from env:", key_path)
print("File exists?", os.path.exists(key_path))
cred = credentials.Certificate(key_path)  
firebase_admin.initialize_app(cred)

app = Flask(__name__)
# ensure instance path and database config exist before initializing DB
app.config['DATABASE'] = os.path.join(app.instance_path, 'localconnectusers.sqlite')
os.makedirs(app.instance_path, exist_ok=True)

init_app(app)

with app.app_context():
    # Ensure tables are created before seeding
    init_db()
    app.cli.add_command(seed_db_command)
app.config["GOOGLE_MAPS_API_KEY"] = os.getenv("GOOGLE_MAPS_API_KEY")  
CORS(app, supports_credentials=True)

# Configure Swagger/OpenAPI documentation
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api/docs"
}
swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "SC2006 Local Connect API",
        "description": "API documentation for Local Connect service marketplace backend",
        "version": "1.0.0",
        "contact": {
            "name": "SC2006 Team"
        }
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Firebase JWT token. Format: 'Bearer <token>'"
        }
    },
    "security": [{"Bearer": []}],
    "basePath": "/",
    "schemes": ["http", "https"]
}
Swagger(app, config=swagger_config, template=swagger_template)

app.register_blueprint(external_bp, url_prefix="/api") #register blueprint of external api
app.register_blueprint(review_bp, url_prefix="/api")
app.register_blueprint(admin_bp, url_prefix="/api")
app.register_blueprint(chatbot_bp, url_prefix="/api")
app.register_blueprint(service_bp, url_prefix="/api")
app.register_blueprint(bookmark_bp, url_prefix="/api")
app.register_blueprint(booking_bp, url_prefix="/api")
@app.route('/')
def index():
    return jsonify({'message': 'Flask backend is running!'})

def create_user_if_not_exists(firebase_uid, email, display_name, role='customer', business_name=None, business_description=None):
    """
    Ensure a user exists in the DB.
    - If the email is in ADMIN_EMAILS, assign 'admin' regardless of frontend input.
    - If the email is in PROVIDER_EMAILS, assign 'provider' regardless of frontend input.
    - If frontend provides 'provider', create as provider (with business details if any).
    - Otherwise, default to 'customer'.
    """
    db = get_db()
    existing_user = User.get_by_id(firebase_uid)
    if existing_user:
        return existing_user

    # ---------------------------
    # Admin & Provider whitelist logic
    # ---------------------------
    admin_emails = os.getenv("ADMIN_EMAILS", "").split(",")
    admin_emails = [a.strip().lower() for a in admin_emails if a.strip()]

    provider_emails = os.getenv("PROVIDER_EMAILS", "").split(",")
    provider_emails = [p.strip().lower() for p in provider_emails if p.strip()]

    email_lower = email.lower()

    try:
        # Backend-only admin creation
        if email_lower in admin_emails:
            print(f"[User Creation] Creating admin user: {email_lower}")
            user = User.create_admin(
                email=email,
                display_name=display_name,
                user_id=firebase_uid
            )

        # Backend-only provider creation
        elif email_lower in provider_emails:
            print(f"[User Creation] Creating provider user (predefined email): {email_lower}")
            user = User.create_provider(
                email=email,
                display_name=display_name,
                user_id=firebase_uid,
                business_name=business_name,
                business_description=business_description
            )

        # Frontend-requested provider creation
        elif role == 'provider':
            print(f"[User Creation] Creating provider user: {email_lower}")
            user = User.create_provider(
                email=email,
                display_name=display_name,
                user_id=firebase_uid,
                business_name=business_name,
                business_description=business_description
            )

        # Default: customer
        else:
            print(f"[User Creation] Creating customer user: {email_lower}")
            user = User.create_consumer(
                email=email,
                display_name=display_name,
                user_id=firebase_uid
            )

        db.commit()
        return user

    except Exception as e:
        db.rollback()
        print("[User Creation] Error:", e)
        return None



@app.route('/api/login', methods=['POST'])
def api_login():
    """
    User Login
    ---
    tags:
      - Authentication
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: "Firebase JWT token (format: Bearer TOKEN)"
    responses:
      200:
        description: Login successful, user created or found
        schema:
          type: object
          properties:
            success:
              type: boolean
            email:
              type: string
            display_name:
              type: string
      400:
        description: Invalid Firebase token
      401:
        description: Missing or invalid Authorization token
      500:
        description: Server error
    """
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not token:
        return jsonify({'error': 'Missing Authorization token'}), 401

    try:
        # Retry verify briefly to mitigate rare clock skew or propagation timing issues
        last_err = None
        for attempt in range(3):
            try:
                decoded_token = auth.verify_id_token(token)
                break
            except Exception as ve:
                last_err = ve
                # For first two attempts, sleep briefly then retry
                if attempt < 2:
                    time.sleep(0.3)
                else:
                    raise ve
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')

        if not firebase_uid or not email:
            return jsonify({'error': 'Invalid Firebase token'}), 400

        # --- Get optional role/business info from frontend ---
        data = request.get_json(silent=True) or {}
        role = data.get('role', 'customer')  # 'customer' by default
        business_name = data.get('business_name')
        business_description = data.get('business_description')
        
        # Priority order for display_name:
        # 1. Explicitly provided in request body (signup)
        # 2. From Firebase token
        # 3. From Firebase Auth user record
        # 4. Fallback to 'Unnamed User'
        display_name = data.get('display_name')
        if not display_name:
            display_name = decoded_token.get('name') or decoded_token.get('display_name') or decoded_token.get('displayName')
        
        if not display_name:
            try:
                firebase_user = auth.get_user(firebase_uid)
                display_name = firebase_user.display_name or 'Unnamed User'
            except:
                display_name = 'Unnamed User'

        # --- Create or fetch user ---
        user = create_user_if_not_exists(
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name,
            role=role,
            business_name=business_name,
            business_description=business_description
        )

        if not user:
            return jsonify({'error': 'Failed to create or find user'}), 500

        # Return successful login response
        return jsonify({
            'success': True,
            'email': email,
            'display_name': display_name,
            'role': user.role
        }), 200

    except Exception as e:
        print("[api_login] Login error:", repr(e))
        return jsonify({'success': False, 'error': str(e)}), 401

    
@app.route('/api/logout', methods=['POST'])
def api_logout():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    try:
        decoded_token = auth.verify_id_token(token)
        print(f"User logged out: {decoded_token['uid']}")
        return jsonify({'message': 'Logout logged'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401

@app.route('/api/hello', methods=['GET'])
def hello():
    """
    Health Check
    ---
    tags:
      - System
    responses:
      200:
        description: Backend is running
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Hello from Flask backend!"
    """
    return jsonify({'message': 'Hello from Flask backend!'})

@app.route('/api/data', methods=['POST'])
def data():
    json_data = request.json
    print(json_data)
    return jsonify({'received': json_data})

@app.route('/api/users/me', methods=['GET'])
def get_user_profile():
    """
    Get Current User Profile
    Return the current user's profile information from Firebase + DB.
    ---
    tags:
      - Users
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
        description: User profile retrieved successfully
        schema:
          type: object
          properties:
            success:
              type: boolean
            user:
              type: object
              properties:
                email:
                  type: string
                display_name:
                  type: string
                role:
                  type: string
                created_at:
                  type: string
      401:
        description: Missing or invalid token
      404:
        description: User not found
    """
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not token:
        return jsonify({'error': 'Missing Authorization token'}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token.get('uid')

        if not firebase_uid:
            return jsonify({'error': 'Invalid Firebase token'}), 400

        user = User.get_by_id(firebase_uid)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 200

    except Exception as e:
        print("Error verifying user:", e)
        return jsonify({'success': False, 'error': str(e)}), 401

@app.route('/api/users/delete', methods=['DELETE'])
def delete_user_account():
    """Allow a user to delete their own account."""
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not token:
        return jsonify({'error': 'Missing Authorization token'}), 401

    try:
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token.get('uid')

        if not firebase_uid:
            return jsonify({'error': 'Invalid Firebase token'}), 400

        db = get_db()
        
        # Check if user exists
        user = User.get_by_id(firebase_uid)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Delete user from database
        result = db.execute("DELETE FROM Users WHERE user_id = ?", (firebase_uid,))
        db.commit()

        if result.rowcount == 0:
            return jsonify({'error': 'Failed to delete user'}), 500

        # Also delete the user from Firebase Authentication
        try:
            auth.delete_user(firebase_uid)
            print(f"[delete_user_account] Deleted Firebase user: {firebase_uid}")
        except Exception as firebase_err:
            print(f"[delete_user_account] Warning: Could not delete Firebase user: {firebase_err}")
            # Continue anyway since DB deletion succeeded

        return jsonify({
            'success': True,
            'message': 'Account deleted successfully'
        }), 200

    except Exception as e:
        print("[delete_user_account] Error:", repr(e))
        return jsonify({'success': False, 'error': str(e)}), 401

if __name__ == '__main__':
    # app = create_app()
    app.run(debug=True)
