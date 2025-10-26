import firebase_admin
from firebase_admin import credentials, auth
from flask import Flask, request, jsonify
from flask_cors import CORS
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
CORS(app)  # enable CORS for all routes
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

@app.route('/api/login', methods=['POST'])
def api_login():
    token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    if not token:
        return jsonify({'error': 'Missing Authorization token'}), 401

    try:
        # Verify Firebase token
        decoded_token = auth.verify_id_token(token)
        email = decoded_token.get('email')
        display_name = decoded_token.get('name', 'Unnamed User')
        firebase_uid = decoded_token.get('uid')

        if not email:
            return jsonify({'error': 'Email missing from Firebase token'}), 400

        print(f"User logged in via Firebase: {email} ({firebase_uid})")

        # Check if user exists
        conn = get_db()
        cursor = conn.execute("SELECT * FROM Users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            # Create new user if not found
            conn.execute(
                """
                INSERT INTO Users (email, display_name, role)
                VALUES (?, ?, ?)
                """,
                (email, display_name, 'customer'),
            )
            conn.commit()
            print(f"Created new user record for {email}")

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'email': email,
            'display_name': display_name
        }), 200

    except Exception as e:
        print("Login error:", str(e))
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
    return jsonify({'message': 'Hello from Flask backend!'})

@app.route('/api/data', methods=['POST'])
def data():
    json_data = request.json
    print(json_data)
    return jsonify({'received': json_data})

@app.route('/api/users/me', methods=['GET'])
def get_user_profile():
    """Return the current user's profile information from Firebase + DB."""
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
