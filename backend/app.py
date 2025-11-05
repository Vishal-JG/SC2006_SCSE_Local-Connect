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
from backend.db import get_db
import os

from backend.db import init_app, init_db, seed_db_command # import db initializer and init function
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

def create_user_if_not_exists(firebase_uid, email, display_name):
    db = get_db()
    user = db.execute("SELECT * FROM Users WHERE user_id = ?", (firebase_uid,)).fetchone()
    if not user:
        db.execute(
            "INSERT INTO Users (user_id, email, display_name, role) VALUES (?, ?, ?, ?)",
            (firebase_uid, email, display_name, 'customer')
        )
        db.commit()
        user = db.execute("SELECT * FROM Users WHERE user_id = ?", (firebase_uid,)).fetchone()
    return user

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
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')
        display_name = decoded_token.get('name', 'Unnamed User')
        if not firebase_uid or not email:
            return jsonify({'error': 'Invalid Firebase token'}), 400

        user = create_user_if_not_exists(firebase_uid, email, display_name)
        if not user:
            return jsonify({'error': 'Failed to create or find user'}), 500

        # Return successful login response after user creation/fetch
        return jsonify({
            'success': True,
            'email': email,
            'display_name': display_name
        }), 200

    except Exception as e:
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
        # Verify Firebase ID token
        decoded_token = auth.verify_id_token(token)
        firebase_uid = decoded_token.get('uid')
        email = decoded_token.get('email')

        if not firebase_uid:
            return jsonify({'error': 'Invalid Firebase token'}), 400

        # Fetch from local DB
        conn = get_db()
        cursor = conn.execute(
            "SELECT email, display_name, role, created_at FROM Users WHERE email = ?", 
            (email,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'success': True,
            'user': {
                'email': user['email'],
                'display_name': user['display_name'],
                'role': user['role'],
                'created_at': user['created_at']
            }
        }), 200

    except Exception as e:
        print("Error verifying user:", e)
        return jsonify({'success': False, 'error': str(e)}), 401

if __name__ == '__main__':
    # app = create_app()
    app.run(debug=True)
